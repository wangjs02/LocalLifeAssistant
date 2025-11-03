import { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { MapPin, Calendar, Star, Sparkles, TrendingUp, Users, Clock, Heart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion } from 'motion/react';

const events = [
  {
    id: 1,
    title: 'SoulSearch Palo Alto Enlightenment Expo',
    location: 'Crowne Plaza Palo Alto',
    date: 'Sat, Nov 15, 2025 at 12:00 PM',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=250&fit=crop',
    rating: 4.8,
    reviews: 124,
    tags: ['Psychic', 'Tarot', 'Meditation'],
    aiScore: 98,
    matchReasons: ['Spiritual wellness', 'Weekend availability', 'Popular in your network'],
    trending: true,
    attendees: 45,
    similarUsersLiked: 89
  },
  {
    id: 2,
    title: 'Mindfulness Meditation Workshop',
    location: 'Palo Alto Art Center',
    date: 'Sun, Nov 16, 2025 at 10:00 AM',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=250&fit=crop',
    rating: 4.9,
    reviews: 67,
    tags: ['Meditation', 'Wellness'],
    aiScore: 95,
    matchReasons: ['High rating', 'Beginner-friendly', 'Small group'],
    trending: false,
    attendees: 12,
    similarUsersLiked: 76
  },
  {
    id: 3,
    title: 'Yoga & Sound Healing',
    location: 'Rinconada Park',
    date: 'Sat, Nov 15, 2025 at 9:00 AM',
    image: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=400&h=250&fit=crop',
    rating: 4.7,
    reviews: 89,
    tags: ['Yoga', 'Sound Healing'],
    aiScore: 92,
    matchReasons: ['Outdoor activity', 'Morning time slot', 'Combines practices'],
    trending: true,
    attendees: 28,
    similarUsersLiked: 82
  }
];

export function AIEnhancedView() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* Analysis */}
      <Card className="p-6 bg-white">
        <h3 className="text-slate-900 mb-3">AI-Enhanced Visual Discovery</h3>
        <div className="space-y-3">
          <p className="text-slate-700">
            This approach maintains visual browsing while infusing AI intelligence throughout:
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-slate-900">AI Enhancements</h4>
              <ul className="space-y-1 text-slate-700">
                <li>• <span className="font-medium">Personalized ranking</span> with match scores</li>
                <li>• <span className="font-medium">Transparent reasoning</span> for recommendations</li>
                <li>• <span className="font-medium">Social proof</span> from similar users</li>
                <li>• <span className="font-medium">Smart badges</span> (trending, popular, etc.)</li>
                <li>• <span className="font-medium">Contextual insights</span> on hover/interaction</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-slate-900">User Benefits</h4>
              <ul className="space-y-1 text-slate-700">
                <li>• Visual browsing with intelligent curation</li>
                <li>• Understand <span className="font-medium">why</span> something is recommended</li>
                <li>• Discover patterns in your preferences</li>
                <li>• Quick comparison with AI-surfaced insights</li>
                <li>• Build trust through transparency</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Demo Interface */}
      <Card className="p-6 bg-white">
        <div className="space-y-4">
          {/* AI Insight Header */}
          <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-orange-500 rounded-full p-2 flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-slate-900 mb-1">Personalized for You</h3>
                <p className="text-sm text-slate-700">
                  These events are ranked by AI based on your interests, past attendance, 
                  and what similar users enjoyed. Hover over cards for detailed insights.
                </p>
              </div>
            </div>
          </div>

          {/* Events Grid with AI Enhancements */}
          <div className="grid md:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onHoverStart={() => setHoveredCard(event.id)}
                onHoverEnd={() => setHoveredCard(null)}
              >
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col relative">
                  {/* AI Match Score - Corner Ribbon */}
                  <div className="absolute top-0 right-0 bg-gradient-to-br from-purple-500 to-orange-500 text-white px-3 py-1 rounded-bl-lg z-10 shadow-lg">
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span className="text-xs font-medium">{event.aiScore}% Match</span>
                    </div>
                  </div>

                  {/* Image */}
                  <div className="relative overflow-hidden">
                    <ImageWithFallback 
                      src={event.image}
                      alt={event.title}
                      className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
                    />
                    
                    {/* Overlays */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      {event.trending && (
                        <Badge className="bg-red-500">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                    </div>

                    <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur rounded-full px-2 py-1 flex items-center gap-1 shadow">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-medium">{event.rating}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col">
                    <h4 className="text-slate-900 line-clamp-2">{event.title}</h4>

                    {/* AI Match Reasons */}
                    <div className="space-y-1.5">
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Why this matches:
                      </p>
                      {event.matchReasons.slice(0, hoveredCard === event.id ? 3 : 2).map((reason, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                          <span className="text-xs text-slate-600">{reason}</span>
                        </div>
                      ))}
                    </div>

                    {/* Event Details */}
                    <div className="space-y-1.5 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="line-clamp-1 text-xs">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="line-clamp-1 text-xs">{event.date}</span>
                      </div>
                    </div>

                    {/* Social Proof - AI Enhanced */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        <span>{event.attendees} going</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Heart className="w-3.5 h-3.5 text-pink-500" />
                        <span>{event.similarUsersLiked}% liked</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex gap-1.5 flex-wrap">
                      {event.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Action */}
                    <Button className="w-full mt-auto bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600">
                      View Details
                    </Button>
                  </div>

                  {/* Hover Insight Panel */}
                  {hoveredCard === event.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute inset-0 bg-gradient-to-br from-purple-500/95 to-orange-500/95 backdrop-blur p-4 flex flex-col justify-center text-white"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          <h4 className="font-medium">AI Insights</h4>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p>✓ {event.aiScore}% match based on your profile</p>
                          <p>✓ {event.similarUsersLiked}% of similar users loved this</p>
                          <p>✓ {event.attendees} people in your network are going</p>
                          {event.trending && <p>✓ Trending in Palo Alto right now</p>}
                        </div>
                        <Button variant="secondary" className="w-full mt-2">
                          Learn More
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>

          {/* AI Learning Footer */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-slate-700">
                  <span className="font-medium">Your recommendations improve over time.</span> The more 
                  you interact, the better AI understands your preferences. Click the heart icon on 
                  events you love to help us learn!
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
