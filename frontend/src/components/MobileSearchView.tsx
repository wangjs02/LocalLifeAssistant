import { useState, useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Send, MapPin, Clock, Star, Heart, Menu, Home, LogIn, UserPlus } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ChatMessage, apiClient, ChatRequest, RecommendationItem } from '../api/client';
import { User } from 'firebase/auth';
import userAvatar from '../assets/aaa119d6f052443a02c6cacfe3a6bde4c7e125dd.png';
import agentAvatar from '../assets/28b344427d43ce95d96c5f4f5f0d2e648a348ff8.png';
import refreshIcon from '../assets/a47e28845d0b6c5332cd5e0d4d81cd9e643f485f.png';
import musicIcon from '../assets/382cfbec3da1f2579083a7efab58820040c8ba6e.png';
import wellnessIcon from '../assets/904b74ed32b4c4f8a2649e74b5c0d245118566c7.png';
import luckyIcon from '../assets/c02b54d00b0d965e7ff647ab9e7b67a0f41ab2f1.png';
import tapIcon from '../assets/0db0406171681fbb83258c4e6844763ffba4aadc.png';

interface ChatMessageWithEvents {
  id: number;
  type: 'user' | 'bot';
  text: string;
  showEvents?: boolean;
  recommendations?: RecommendationItem[];
}

interface MobileSearchViewProps {
  conversationHistory: ChatMessage[];
  llmProvider: string;
  userId: string;
  conversationId: string | null;
  currentUser: User | null;
  usageStats: any;
  onNewMessage: (message: ChatMessage) => void;
  onRecommendations: (recommendations: any[]) => void;
  onTrialExceeded: () => void;
  onRegister: () => void;
  onLogin: () => void;
  onLogout: () => void;
  onRefresh: () => void;
}

const suggestedQuestions = [
  { text: "Live music events this weekend", icon: musicIcon },
  { text: "Wellness and meditation activities", icon: wellnessIcon },
  { text: "Feeling lucky!", icon: luckyIcon }
];

export function MobileSearchView({
  conversationHistory,
  llmProvider,
  userId,
  conversationId,
  currentUser,
  usageStats,
  onNewMessage,
  onRecommendations,
  onTrialExceeded,
  onRegister,
  onLogin,
  onLogout,
  onRefresh
}: MobileSearchViewProps) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessageWithEvents[]>([
    {
      id: 0,
      type: 'bot',
      text: 'Hi! What city, state, or zip code would you like to search for events in?',
      showEvents: false,
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [likedEvents, setLikedEvents] = useState<string[]>([]);
  const [userProfilePic, setUserProfilePic] = useState(userAvatar);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationProvided, setLocationProvided] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [currentRecommendations, setCurrentRecommendations] = useState<RecommendationItem[]>([]);
  const [showRefreshHint, setShowRefreshHint] = useState(false);
  const hasShownRefreshHint = useRef(false);
  const lastUserMessageRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageIdCounter = useRef(1);
  const initialViewportHeight = useRef<number>(0);
  const [currentStatus, setCurrentStatus] = useState<string>('');

  // Sync messages with conversation history - this is the single source of truth
  useEffect(() => {
    if (conversationHistory.length === 0) {
      setMessages([{
        id: 0,
        type: 'bot',
        text: 'Hi! What city, state, or zip code would you like to search for events in?',
        showEvents: false,
      }]);
      setLocationProvided(false);
      setShowSuggestions(false);
      return;
    }

    const syncedMessages: ChatMessageWithEvents[] = [];
    let hasLocation = false;

    conversationHistory.forEach((msg, index) => {
      if (msg.role === 'user') {
        syncedMessages.push({
          id: messageIdCounter.current++,
          type: 'user',
          text: msg.content,
        });
        // Check if first user message might be location
        if (index === 0) {
          hasLocation = true;
        }
      } else if (msg.role === 'assistant') {
        const recommendationMessages = (msg as any).recommendations || [];
        if (recommendationMessages.length > 0) {
          syncedMessages.push({
            id: messageIdCounter.current++,
            type: 'bot',
            text: msg.content || 'I found some great events for you. Here are my top recommendations:',
            showEvents: true,
            recommendations: recommendationMessages,
          });
          setCurrentRecommendations(recommendationMessages);
        } else if (msg.content) {
          syncedMessages.push({
            id: messageIdCounter.current++,
            type: 'bot',
            text: msg.content,
            showEvents: false,
          });
        }
      }
    });

    setMessages(syncedMessages);
    setLocationProvided(hasLocation);
    if (hasLocation && syncedMessages.length === 2) {
      setShowSuggestions(true);
    }
  }, [conversationHistory]);

  // Update user profile pic when logged in
  useEffect(() => {
    if (currentUser?.photoURL) {
      setUserProfilePic(currentUser.photoURL);
    } else if (currentUser) {
      setUserProfilePic(userAvatar);
    } else {
      setUserProfilePic(userAvatar);
    }
  }, [currentUser]);

  // Find the index of the last user message
  const lastUserMessageIndex = messages.length > 0 
    ? messages.map((msg, idx) => ({ msg, idx })).reverse().find(({ msg }) => msg.type === 'user')?.idx ?? -1
    : -1;

  // Detect keyboard open/close on mobile
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    initialViewportHeight.current = window.innerHeight;
    
    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialViewportHeight.current - currentHeight;
      setKeyboardOpen(heightDifference > 150);
    };
    
    window.addEventListener('resize', handleResize);
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  // Scroll the latest user message to the top of the chat window
  useEffect(() => {
    if (lastUserMessageRef.current) {
      setTimeout(() => {
        lastUserMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }, [messages, isTyping]);

  // Auto-focus input after initial message and after location acknowledgment
  useEffect(() => {
    if (!isTyping) {
      if (messages.length === 1 && messages[0].type === 'bot') {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 300);
      } else if (showSuggestions) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 300);
      }
    }
  }, [isTyping, messages.length, showSuggestions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isTyping) {
      inputRef.current?.blur();
      
      // Only update conversationHistory, let useEffect sync to messages
      const userMessageForAPI: ChatMessage = {
        role: 'user',
        content: query.trim(),
        timestamp: new Date().toISOString()
      };
      onNewMessage(userMessageForAPI);
      
      const currentQuery = query.trim();
      setQuery('');
      setIsTyping(true);
      setCurrentStatus('');
      
      const isFirstMessage = !locationProvided;
      
      try {
        const request: ChatRequest = {
          message: currentQuery,
          conversation_history: conversationHistory,
          llm_provider: llmProvider,
          is_initial_response: isFirstMessage,
          user_id: userId,
          conversation_id: conversationId
        };

        let botResponseText = '';
        const recommendations: RecommendationItem[] = [];
        let trialExceeded = false;

        await apiClient.chatStream(
          request,
          (status: string) => {
            setCurrentStatus(status);
          },
          (messageContent: string, metadata?: any) => {
            // Just update the response text, don't add to history yet
            // This prevents duplicates during streaming
            botResponseText = messageContent;
            
            if (metadata?.trial_exceeded) {
              trialExceeded = true;
              onTrialExceeded();
            }
          },
          (recommendation: any) => {
            recommendations.push(recommendation);
            onRecommendations([recommendation]);
          },
          (error: string) => {
            console.error('Streaming error:', error);
            const errorMessage: ChatMessage = {
              role: 'assistant',
              content: `Sorry, I encountered an error: ${error}`,
              timestamp: new Date().toISOString()
            };
            onNewMessage(errorMessage);
          },
          () => {
            // Only add the message once when streaming is complete
            if (botResponseText) {
              const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: botResponseText,
                timestamp: new Date().toISOString()
              } as any;
              // Attach recommendations to the message
              if (recommendations.length > 0) {
                (assistantMessage as any).recommendations = [...recommendations];
              }
              onNewMessage(assistantMessage);
            }
            
            setIsTyping(false);
            setCurrentStatus('');
            
            if (isFirstMessage) {
              setLocationProvided(true);
              setShowSuggestions(true);
            } else {
              setShowSuggestions(false);
              setCurrentRecommendations(recommendations);
              
              if (recommendations.length > 0 && !hasShownRefreshHint.current) {
                setTimeout(() => {
                  setShowRefreshHint(true);
                  hasShownRefreshHint.current = true;
                  setTimeout(() => {
                    setShowRefreshHint(false);
                  }, 5000);
                }, 500);
              }
            }
          }
        );
      } catch (error) {
        console.error('Error sending message:', error);
        setIsTyping(false);
        setCurrentStatus('');
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date().toISOString()
        };
        onNewMessage(errorMessage);
      }
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    // Only update conversationHistory, let useEffect sync to messages
    const userMessageForAPI: ChatMessage = {
      role: 'user',
      content: suggestion,
      timestamp: new Date().toISOString()
    };
    onNewMessage(userMessageForAPI);
    
    setIsTyping(true);
    setShowSuggestions(false);
    setCurrentStatus('');
    
    try {
      const request: ChatRequest = {
        message: suggestion,
        conversation_history: conversationHistory,
        llm_provider: llmProvider,
        is_initial_response: false,
        user_id: userId,
        conversation_id: conversationId
      };

      let botResponseText = '';
      const recommendations: RecommendationItem[] = [];
      let trialExceeded = false;

      await apiClient.chatStream(
        request,
        (status: string) => {
          setCurrentStatus(status);
        },
        (messageContent: string, metadata?: any) => {
          // Just update the response text, don't add to history yet
          botResponseText = messageContent;
          
          if (metadata?.trial_exceeded) {
            trialExceeded = true;
            onTrialExceeded();
          }
        },
        (recommendation: any) => {
          recommendations.push(recommendation);
          onRecommendations([recommendation]);
        },
        (error: string) => {
          console.error('Streaming error:', error);
          setIsTyping(false);
        },
        () => {
          // Only add the message once when streaming is complete
          if (botResponseText) {
            const assistantMessage: ChatMessage = {
              role: 'assistant',
              content: botResponseText,
              timestamp: new Date().toISOString()
            } as any;
            // Attach recommendations to the message
            if (recommendations.length > 0) {
              (assistantMessage as any).recommendations = [...recommendations];
            }
            onNewMessage(assistantMessage);
          }
          
          setIsTyping(false);
          setCurrentStatus('');
          setShowSuggestions(false);
          setCurrentRecommendations(recommendations);
          
          if (recommendations.length > 0 && !hasShownRefreshHint.current) {
            setTimeout(() => {
              setShowRefreshHint(true);
              hasShownRefreshHint.current = true;
              setTimeout(() => {
                setShowRefreshHint(false);
              }, 5000);
            }, 500);
          }
        }
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      setCurrentStatus('');
    }
  };

  const toggleLike = (eventId: string) => {
    setLikedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const formatDate = (dateString: string | undefined) => {
    try {
      if (!dateString || dateString === 'TBD') return 'Date TBD';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString || 'Date TBD';
    }
  };

  const formatPrice = (data: any) => {
    if (data.price) return data.price;
    if (data.is_free) return 'Free';
    return 'Price varies';
  };

  const getEventId = (rec: RecommendationItem): string => {
    return `${rec.type}_${rec.data.name || rec.data.title}_${rec.data.venue_name || ''}`;
  };

  // Get all liked recommendations
  const likedRecommendations = currentRecommendations.filter(rec => 
    likedEvents.includes(getEventId(rec))
  );

  return (
    <div className="h-dvh bg-[#FCFBF9] flex flex-col max-w-md mx-auto">
      {/* Sticky Header Container */}
      <div className="sticky top-0 z-50 bg-[#FCFBF9] flex-shrink-0">
        {/* Status Bar */}
        <div className="h-11 bg-[#FCFBF9] flex items-center justify-between px-4 text-xs text-slate-700">
          <span>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-3 border border-slate-700 rounded-sm" />
            <div className="w-3 h-3 border border-slate-700 rounded-sm" />
          </div>
        </div>

        {/* Header */}
        <div className="bg-[#FCFBF9] px-4 py-2.5 border-b border-slate-200/50 flex items-center gap-2">
          <button 
            onClick={() => setMenuOpen(true)}
            type="button"
            className="p-1.5 hover:bg-slate-200/50 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
          <h1 className="text-lg" style={{ color: '#221A13', fontFamily: 'Aladin, cursive' }}>LocoMoco. Catch the Vibe. Locally</h1>
        </div>
      </div>

      {/* Side Menu */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-[85%] bg-[#FCFBF9] p-0" aria-describedby={undefined}>
          <SheetHeader className="sr-only">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-full">
            {/* Menu Header */}
            <div className="p-6 border-b pt-16">
              {currentUser ? (
                <div>
                  <div className="w-16 h-16 rounded-full bg-slate-200 mb-3 overflow-hidden">
                    <img src={userProfilePic} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <p style={{ color: '#221A13', fontFamily: 'Aladin, cursive' }}>Welcome back, {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}!</p>
                </div>
              ) : (
                <h2 style={{ color: '#221A13', fontFamily: 'Aladin, cursive' }}>Menu</h2>
              )}
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-auto">
              <nav className="py-4">
                <button 
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors text-left"
                >
                  <Home className="w-5 h-5" style={{ color: '#9A8B68' }} />
                  <span style={{ color: '#221A13', fontFamily: 'Aladin, cursive' }}>Home</span>
                </button>

                {!currentUser ? (
                  <>
                    {usageStats && !usageStats.is_registered && (
                      <div className="px-6 py-3">
                        <p className="text-sm" style={{ color: '#5E574E' }}>
                          Trial: {usageStats.trial_remaining || 0} interactions left
                        </p>
                      </div>
                    )}
                    <button 
                      onClick={() => {
                        setMenuOpen(false);
                        onLogin();
                      }}
                      className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors text-left"
                    >
                      <LogIn className="w-5 h-5" style={{ color: '#9A8B68' }} />
                      <span style={{ color: '#221A13', fontFamily: 'Aladin, cursive' }}>Log in</span>
                    </button>
                    <button 
                      onClick={() => {
                        setMenuOpen(false);
                        onRegister();
                      }}
                      className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors text-left"
                    >
                      <UserPlus className="w-5 h-5" style={{ color: '#9A8B68' }} />
                      <span style={{ color: '#221A13', fontFamily: 'Aladin, cursive' }}>Sign up</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="px-6 py-3">
                      <h3 className="text-sm" style={{ color: '#5E574E' }}>Saved Events</h3>
                    </div>
                    {likedRecommendations.length === 0 ? (
                      <div className="px-6 py-4">
                        <p className="text-sm" style={{ color: '#5E574E' }}>No saved events yet</p>
                      </div>
                    ) : (
                      <div className="space-y-2 px-4">
                        {likedRecommendations.map((rec, index) => {
                          const eventData = rec.data;
                          return (
                            <Card key={index} className="p-3 hover:bg-slate-50 cursor-pointer">
                              <div className="flex gap-3">
                                {eventData.image_url && (
                                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                    <ImageWithFallback
                                      src={eventData.image_url}
                                      alt={eventData.name || eventData.title || 'Event'}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm line-clamp-1 mb-1" style={{ color: '#221A13' }}>
                                    {eventData.name || eventData.title}
                                  </h4>
                                  <p className="text-xs line-clamp-1" style={{ color: '#5E574E' }}>
                                    {formatDate(eventData.start_datetime)}
                                  </p>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                    <button 
                      onClick={() => {
                        onLogout();
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors text-left mt-4 border-t"
                    >
                      <LogIn className="w-5 h-5" style={{ color: '#9A8B68' }} />
                      <span style={{ color: '#221A13' }}>Log out</span>
                    </button>
                  </>
                )}
              </nav>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {messages.length > 0 ? (
          <>
            {/* Flexible Spacer - shrinks when keyboard opens */}
            <div className={`bg-[#FCFBF9] transition-all duration-300 ${keyboardOpen ? 'flex-grow-0' : 'flex-1'}`} />
            
            {/* Chat Conversation */}
            <div className="overflow-y-auto bg-[#FCFBF9] px-4 py-4 space-y-4 scrollbar-hide flex-shrink min-h-0">
              {messages.map((message, index) => (
                message.type === 'user' ? (
                  /* User Message */
                  <div 
                    key={message.id} 
                    className="flex justify-end gap-2 items-start"
                    ref={index === lastUserMessageIndex ? lastUserMessageRef : null}
                  >
                    <div className="rounded-xl rounded-tr-sm px-4 py-3 max-w-[80%] border" style={{ backgroundColor: '#E9E6DF', borderColor: '#EDEBE6' }}>
                      <p className="text-[15px]" style={{ color: '#221A13' }}>{message.text}</p>
                    </div>
                    {/* User Avatar */}
                    <div className="w-11 h-11 rounded-full bg-white flex-shrink-0 flex items-center justify-center mt-1 overflow-hidden p-1">
                      <img src={userProfilePic} alt="User" className="w-full h-full object-cover rounded-full" />
                    </div>
                  </div>
                ) : (
                  /* Bot Response with Cards */
                  <div key={message.id} className="flex gap-2 items-start">
                    {/* Bot Avatar */}
                    <div className="w-10 h-10 rounded-full bg-white flex-shrink-0 flex items-center justify-center mt-1 overflow-hidden p-1.5">
                      <img src={agentAvatar} alt="Agent" className="w-full h-full object-cover rounded-full" />
                    </div>
                    
                    {/* Bot Message */}
                    <div className="flex-1 space-y-3 min-w-0">
                      {message.text && (
                        <div className="bg-white rounded-xl rounded-tl-sm px-4 py-3 shadow-sm border" style={{ borderColor: '#FAFAF9' }}>
                          <p className="text-[15px]" style={{ color: '#221A13' }}>{message.text}</p>
                        </div>
                      )}

                      {/* Event Cards - Horizontal Scroll */}
                      {message.showEvents && message.recommendations && message.recommendations.length > 0 && (
                        <div className="overflow-x-auto overflow-y-hidden -mx-1 scrollbar-hide">
                          <div className="flex gap-3 px-1 pb-2">
                            {message.recommendations.map((rec, recIndex) => {
                              const eventData = rec.data;
                              const eventId = getEventId(rec);
                              const isLiked = likedEvents.includes(eventId);
                              const rating = eventData.rating || (rec.relevance_score ? Math.round(rec.relevance_score * 5 * 10) / 10 : 4.5);
                              
                              return (
                                <div
                                  key={recIndex}
                                  className="flex-shrink-0 w-[220px] bg-white rounded-xl shadow-sm transition-all cursor-pointer hover:shadow-md active:shadow-md active:scale-[0.98] p-2 flex flex-col"
                                >
                                  {/* Event Image */}
                                  <div className="relative w-full h-[120px] overflow-hidden rounded mb-3">
                                    {eventData.image_url ? (
                                      <ImageWithFallback
                                        src={eventData.image_url}
                                        alt={eventData.name || eventData.title || 'Event'}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                                        <MapPin className="w-8 h-8 text-slate-400" />
                                      </div>
                                    )}
                                    {/* Star Rating Badge - Top Left */}
                                    <div className="absolute top-2 left-2 bg-white/70 backdrop-blur-sm rounded-md px-1.5 py-0.5 flex items-center gap-0.5">
                                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                      <span className="text-xs" style={{ color: '#221A13' }}>{rating}</span>
                                    </div>
                                    {/* Heart Icon - Top Right */}
                                    <button 
                                      onClick={() => toggleLike(eventId)}
                                      className="absolute top-2 right-2 transition-opacity hover:opacity-80"
                                    >
                                      <Heart 
                                        className={`w-6 h-6 transition-colors drop-shadow-md ${
                                          isLiked 
                                            ? 'fill-red-500 text-red-500' 
                                            : 'fill-white/60 text-white/60'
                                        }`} 
                                      />
                                    </button>
                                  </div>
                                  
                                  {/* Card Content */}
                                  <div className="flex flex-col flex-1 space-y-2">
                                    <h3 style={{ color: '#221A13', fontFamily: 'Abitare Sans, sans-serif' }} className="text-sm font-semibold line-clamp-1">
                                      {eventData.name || eventData.title}
                                    </h3>
                                    
                                    {/* Location */}
                                    {(eventData.venue_name || eventData.venue_city) && (
                                      <div className="flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#B46A55' }} />
                                        <span className="text-xs line-clamp-1" style={{ color: '#5E574E' }}>
                                          {eventData.venue_name || eventData.name}, {eventData.venue_city || ''}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {/* Date/Time */}
                                    {eventData.start_datetime && (
                                      <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#B46A55' }} />
                                        <span className="text-xs" style={{ color: '#5E574E' }}>
                                          {formatDate(eventData.start_datetime)}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {eventData.description && (
                                      <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: '#5E574E' }}>
                                        {eventData.description}
                                      </p>
                                    )}
                                    
                                    {/* Price and Visit Button */}
                                    <div className="flex items-center gap-2 mt-auto pt-2">
                                      <span className="text-sm" style={{ color: '#221A13' }}>
                                        {formatPrice(eventData)}
                                      </span>
                                      {eventData.event_url && (
                                        <a
                                          href={eventData.event_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="ml-auto px-6 text-white rounded py-2 text-xs transition-all active:scale-95 active:opacity-80"
                                          style={{ backgroundColor: '#9A8B68' }}
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          Visit
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-2 items-start">
                  <div className="w-10 h-10 rounded-full bg-white flex-shrink-0 flex items-center justify-center mt-1 overflow-hidden p-1.5">
                    <img src={agentAvatar} alt="Agent" className="w-full h-full object-cover rounded-full" />
                  </div>
                  <div className="bg-white rounded-lg rounded-tl-sm px-4 py-3 shadow-sm border" style={{ borderColor: '#F5F3EF' }}>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms', animationDuration: '1s' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms', animationDuration: '1s' }} />
                    </div>
                    {currentStatus && (
                      <p className="text-xs mt-2" style={{ color: '#5E574E' }}>{currentStatus}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Suggested Questions */}
              {showSuggestions && !isTyping && (
                <div className="flex gap-2 items-start">
                  <div className="w-10 h-10 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    {suggestedQuestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion.text)}
                        className="w-full text-left px-4 py-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-sm border border-[#EDEBE6] flex items-center gap-3"
                        style={{ color: '#221A13' }}
                      >
                        <img src={suggestion.icon} alt="" className="w-7 h-7 flex-shrink-0" />
                        <span>{suggestion.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Empty State - Centered Content */
          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-32 bg-[#FCFBF9]">
            <h2 className="text-slate-900 mb-2 text-center">Discover Local Events</h2>
            <p className="text-slate-600 text-center text-sm mb-8">
              Ask me anything about events, activities, and experiences near you
            </p>
          </div>
        )}

        {/* Input Area - Always at Bottom */}
        <div className="bg-[#FCFBF9] px-4 py-6 flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-3 items-center relative">
            <div className="relative">
              {/* Hint Callout */}
              {showRefreshHint && (
                <div className="absolute bottom-full left-[100%] -translate-x-[40%] mb-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="text-white px-5 py-3 rounded-xl shadow-lg text-sm whitespace-nowrap min-w-[220px]" style={{ backgroundColor: '#76C1B2' }}>
                    <div className="flex items-center gap-2">
                      <img src={tapIcon} alt="Tap" className="w-5 h-5" style={{ filter: 'brightness(0) invert(1)' }} />
                      <span>Tap to refresh all events!</span>
                    </div>
                    {/* Arrow pointing down */}
                    <div className="absolute top-full left-[12%] -mt-px">
                      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px]" style={{ borderTopColor: '#76C1B2' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <button
                type="button"
                onClick={onRefresh}
                disabled={!messages.some(msg => msg.showEvents)}
                className="rounded-full bg-white h-14 w-14 flex items-center justify-center transition-all shadow-sm border-[0.5px] border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 disabled:hover:bg-white active:scale-90 active:shadow-md"
              >
                <img 
                  src={refreshIcon} 
                  alt="Refresh" 
                  className="w-8 h-8 transition-transform active:rotate-180" 
                  style={{ 
                    filter: 'invert(67%) sepia(18%) saturate(1245%) hue-rotate(121deg) brightness(92%) contrast(86%)'
                  }} 
                />
              </button>
            </div>
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
              placeholder={messages.length > 1 ? "Follow up..." : "City, State/ City name/Zipcode"}
              className="flex-1 rounded-xl border-[0.5px] border-slate-200 bg-white shadow-sm h-14 text-base px-6 placeholder:text-[#5E574E]"
              style={{ color: '#221A13' }}
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!query.trim() || isTyping}
              className="rounded-full bg-white hover:bg-slate-50 h-14 w-14 flex items-center justify-center transition-all shadow-sm border-[0.5px] border-slate-200 active:scale-90 active:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-7 h-7" style={{ color: '#9A8B68' }} />
            </button>
          </form>
        </div>
      </div>

      {/* Home Indicator (iOS-style) */}
      <div className="h-8 bg-[#FCFBF9] flex items-center justify-center flex-shrink-0">
        <div className="w-32 h-1 bg-slate-800 rounded-full" />
      </div>
    </div>
  );
}
