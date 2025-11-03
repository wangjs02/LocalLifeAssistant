import { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { MapPin, Calendar, Star, Send, Sparkles, LayoutGrid, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

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
    aiReason: 'Matches your interest in spiritual wellness and personal growth'
  },
  {
    id: 2,
    title: 'Mindfulness Meditation Workshop',
    location: 'Palo Alto Art Center',
    date: 'Sun, Nov 16, 2025 at 10:00 AM',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=250&fit=crop',
    rating: 4.9,
    reviews: 67,
    tags: ['Meditation', 'Wellness', 'Workshop'],
    aiReason: 'Perfect for beginners interested in mindfulness practices'
  },
  {
    id: 3,
    title: 'Yoga & Sound Healing Session',
    location: 'Rinconada Park',
    date: 'Sat, Nov 15, 2025 at 9:00 AM',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=250&fit=crop',
    rating: 4.7,
    reviews: 89,
    tags: ['Yoga', 'Sound Healing', 'Outdoor'],
    aiReason: 'Combines movement with spiritual practice outdoors'
  }
];

export function HybridView() {
  const [viewMode, setViewMode] = useState<'grid' | 'chat'>('grid');

  return (
    <div className="space-y-6">
      {/* Analysis */}
      <Card className="p-6 bg-white">
        <h3 className="text-slate-900 mb-3">The Best of Both Worlds</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-green-700 mb-2">✓ Hybrid Approach Benefits</h4>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>• AI curates and personalizes the visual grid</li>
              <li>• Users can browse AI-filtered results visually</li>
              <li>• Switch between chat and browse modes</li>
              <li>• AI explanations add context to visual results</li>
              <li>• Maintains serendipity within curated sets</li>
            </ul>
          </div>
          <div>
            <h4 className="text-blue-700 mb-2">⚡ Key Innovation</h4>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>• Let AI do the heavy lifting (filtering, ranking)</li>
              <li>• Let humans do what they're good at (visual scanning)</li>
              <li>• Progressive disclosure: start with AI summary, expand to details</li>
              <li>• Context-aware results that adapt to conversation</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Demo Interface */}
      <Card className="p-6 bg-white">
        <div className="space-y-4">
          {/* AI Summary Bar */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="bg-orange-500 rounded-full p-2 flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-slate-800">
                  Based on your interest in <span className="font-medium">spiritual wellness</span>, 
                  I found <span className="font-medium">3 highly-rated events</span> this weekend. 
                  The SoulSearch Expo is your best match with psychic readings and energy healing.
                </p>
                <Button variant="link" className="h-auto p-0 mt-1 text-orange-700">
                  Ask AI a question about these results →
                </Button>
              </div>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center justify-between">
            <h3 className="text-slate-900">Recommended for You</h3>
            <div className="flex gap-2">
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4 mr-2" />
                Grid View
              </Button>
              <Button 
                variant={viewMode === 'chat' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('chat')}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat View
              </Button>
            </div>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event, index) => (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-all group">
                  <div className="relative">
                    <ImageWithFallback 
                      src={event.image}
                      alt={event.title}
                      className="w-full h-40 object-cover"
                    />
                    {index === 0 && (
                      <Badge className="absolute top-2 left-2 bg-orange-500">
                        AI Top Pick
                      </Badge>
                    )}
                    <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 flex items-center gap-1 shadow">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs">{event.rating}</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <h4 className="text-slate-900 line-clamp-2">{event.title}</h4>
                    
                    {/* AI Reason Badge */}
                    <div className="bg-orange-50 border border-orange-200 rounded p-2 flex items-start gap-2">
                      <Sparkles className="w-3 h-3 text-orange-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-700">{event.aiReason}</p>
                    </div>

                    <div className="space-y-1.5 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span className="line-clamp-1">{event.date}</span>
                      </div>
                    </div>

                    <div className="flex gap-1.5 flex-wrap">
                      {event.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {event.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{event.tags.length - 2}
                        </Badge>
                      )}
                    </div>

                    <Button className="w-full bg-orange-500 hover:bg-orange-600">
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Chat View */}
          {viewMode === 'chat' && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="bg-slate-700 text-white">AI</AvatarFallback>
                </Avatar>
                <div className="space-y-3 flex-1">
                  <div className="bg-slate-100 rounded-2xl px-4 py-3">
                    <p className="text-slate-800">
                      Here are the 3 events I'd recommend based on your spiritual wellness interests:
                    </p>
                  </div>

                  {events.map((event, index) => (
                    <Card key={event.id} className={`p-4 ${index === 0 ? 'border-2 border-orange-200' : ''}`}>
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-slate-900">{event.title}</h4>
                          {index === 0 && <Badge className="bg-orange-500 flex-shrink-0">Top Pick</Badge>}
                        </div>
                        <p className="text-sm text-slate-600 italic">{event.aiReason}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span>{event.rating} ({event.reviews} reviews)</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4" />
                          <span>{event.date}</span>
                        </div>
                        <Button variant="outline" className="w-full mt-2">
                          View Details
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Chat Input */}
          <div className="flex gap-2 pt-4 border-t">
            <Input 
              placeholder="Refine results or ask a question..." 
              className="flex-1"
            />
            <Button size="icon" className="bg-orange-500 hover:bg-orange-600">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
