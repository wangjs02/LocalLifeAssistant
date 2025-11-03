import React, { useState, useEffect } from 'react';
import { MobileSearchView } from './components/MobileSearchView';
import RegistrationModal from './components/RegistrationModal';
import LoginModal from './components/LoginModal';
import { ChatMessage, apiClient } from './api/client';
import { getOrCreateUserId, setUserId } from './utils/userIdManager';
import { updateUsageStats, shouldShowRegistrationPrompt, markRegistrationPrompted, getTrialWarningMessage } from './utils/usageTracker';
import { auth } from './firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';

const App: React.FC = () => {
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const [llmProvider] = useState('openai');
  const [userId, setUserIdState] = useState<string>('');
  const [usageStats, setUsageStats] = useState<any>(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [trialWarning, setTrialWarning] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // Firebase authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [, setAuthLoading] = useState(true);

  useEffect(() => {
    // Prevent browser scroll restoration on page load
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Scroll to top on initial load
    window.scrollTo(0, 0);
  }, []);

  // Firebase authentication state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthLoading(false);

      if (user) {
        // User is signed in, verify token with backend
        try {
          const token = await user.getIdToken();
          const response = await apiClient.verifyToken(token);

          // Update user ID to the authenticated user's ID
          const authenticatedUserId = response.user_id || user.uid;
          setUserIdState(authenticatedUserId);
          setUserId(authenticatedUserId);

          // Update usage stats for registered user
          updateUsageStats({ is_registered: true });

          console.log('User authenticated:', authenticatedUserId);
        } catch (error) {
          console.error('Token verification failed:', error);
          // If token verification fails, sign out
          await auth.signOut();
        }
      } else {
        // User is signed out, use anonymous user ID
        const uid = getOrCreateUserId();
        setUserIdState(uid);
        console.log('User not authenticated, using anonymous ID:', uid);
      }
    });

    return () => unsubscribe();
  }, []);

  // Initialize user ID
  useEffect(() => {
    const uid = getOrCreateUserId();
    setUserIdState(uid);
    console.log('User ID initialized:', uid);
  }, []);

  // Check usage stats for anonymous users
  useEffect(() => {
    if (userId && userId.startsWith('user_')) {
      // Fetch usage stats from backend
      apiClient.getUserUsage(userId).then(stats => {
        setUsageStats(stats);
        updateUsageStats({
          anonymous_user_id: userId,
          interaction_count: stats.interaction_count,
          trial_remaining: stats.trial_remaining,
          is_registered: stats.is_registered
        });
        
        // Show warning if trial is running low
        const warning = getTrialWarningMessage(stats.trial_remaining);
        setTrialWarning(warning);
        
        // Show registration modal if needed
        if (shouldShowRegistrationPrompt()) {
          setShowRegistrationModal(true);
          markRegistrationPrompted();
        }
      }).catch(error => {
        console.error('Failed to fetch usage stats:', error);
      });
    }
  }, [userId]);

  useEffect(() => {
    // Check connection on mount
    apiClient.healthCheck().catch(error => {
      console.error('Connection failed:', error);
    });
  }, []);

  const handleNewMessage = (message: ChatMessage) => {
    setConversationHistory(prev => [...prev, message]);
  };

  const handleRecommendations = (recommendations: any[]) => {
    // Handle recommendations if needed
    console.log('Received recommendations:', recommendations);
  };

  // Initialize conversation
  useEffect(() => {
    if (!userId) return;
    
    const initializeConversation = async () => {
      // Check localStorage for current conversation
      const savedConversationId = localStorage.getItem('current_conversation_id');
      
      if (savedConversationId) {
        try {
          // Try to load existing conversation
          const conversation = await apiClient.getConversation(userId, savedConversationId);
          setCurrentConversationId(savedConversationId);
          setConversationHistory(conversation.messages);
          console.log('Loaded existing conversation:', savedConversationId);
        } catch (error) {
          // Conversation not found, create new one
          console.log('Conversation not found, creating new one');
          const newId = await apiClient.createConversation(userId, { 
            llm_provider: llmProvider 
          });
          setCurrentConversationId(newId);
          localStorage.setItem('current_conversation_id', newId);
        }
      } else {
        // Create new conversation
        const newId = await apiClient.createConversation(userId, { 
          llm_provider: llmProvider 
        });
        setCurrentConversationId(newId);
        localStorage.setItem('current_conversation_id', newId);
        console.log('Created new conversation:', newId);
      }
    };
    
    initializeConversation();
  }, [userId, llmProvider]);

  const handleRegister = async (anonymousUserId: string, _email: string, _password: string, _name: string, idToken: string) => {
    try {
      // The Firebase user is already created, now register with our backend using token
      const response = await apiClient.registerWithToken(anonymousUserId, idToken);

      if (response.success) {
        // Update user ID to registered user
        const registeredUserId = response.user_id;
        setUserIdState(registeredUserId);
        setUserId(registeredUserId);

        // Update usage stats
        updateUsageStats({ is_registered: true });

        // Show success message
        alert('Registration successful! Your conversation history has been preserved.');
      }
    } catch (error) {
      console.error('Backend registration failed:', error);
      // If backend registration fails, we should sign out from Firebase
      await auth.signOut();
      throw error;
    }
  };

  const handleLogin = async (_user: User, token: string) => {
    try {
      // Firebase authentication is already handled, just verify with backend
      const response = await apiClient.verifyToken(token);

      if (response.success) {
        // Load user's conversations
        const conversations = await apiClient.listUserConversations(response.user_id);

        // Load most recent conversation if exists
        if (conversations.length > 0) {
          const mostRecent = conversations[0];
          const conversation = await apiClient.getConversation(response.user_id, mostRecent.conversation_id);
          setCurrentConversationId(mostRecent.conversation_id);
          setConversationHistory(conversation.messages);
          localStorage.setItem('current_conversation_id', mostRecent.conversation_id);
        }

        setShowLoginModal(false);
        alert('Login successful! Welcome back!');
      }
    } catch (error: any) {
      console.error('Login verification failed:', error);
      // If verification fails, sign out from Firebase
      await auth.signOut();
      throw error;
    }
  };


  const handleLogout = async () => {
    try {
      await auth.signOut();
      // Clear conversation and reset to anonymous user
      setConversationHistory([]);
      setCurrentConversationId(null);
      localStorage.removeItem('current_conversation_id');

      // Reset to anonymous user ID
      const anonymousId = getOrCreateUserId();
      setUserIdState(anonymousId);
      setUserId(anonymousId);

      // Update usage stats for anonymous user
      updateUsageStats({ is_registered: false });

      console.log('Signed out, switched to anonymous user:', anonymousId);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const onRefresh = () => {
    // Trigger a refresh by re-initializing conversation or fetching new recommendations
    // This could be implemented to fetch fresh events
    console.log('Refresh requested');
  };

  return (
    <div className={`min-h-screen bg-[#FCFBF9] ${trialWarning ? 'pt-20' : ''}`}>
      {/* Trial Warning Banner */}
      {trialWarning && (
        <div className="fixed top-0 left-0 right-0 bg-amber-50 border-l-4 border-amber-500 p-4 z-40">
          <div className="max-w-7xl mx-auto">
            <p className="text-amber-700">{trialWarning}</p>
          </div>
        </div>
      )}

      <MobileSearchView
        conversationHistory={conversationHistory}
        llmProvider={llmProvider}
        userId={userId}
        conversationId={currentConversationId}
        currentUser={currentUser}
        usageStats={usageStats}
        onNewMessage={handleNewMessage}
        onRecommendations={handleRecommendations}
        onTrialExceeded={() => setShowRegistrationModal(true)}
        onRegister={() => setShowRegistrationModal(true)}
        onLogin={() => setShowLoginModal(true)}
        onLogout={handleLogout}
        onRefresh={onRefresh}
      />

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onRegister={handleRegister}
        trialRemaining={usageStats?.trial_remaining || 0}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />
    </div>
  );
};

export default App;
