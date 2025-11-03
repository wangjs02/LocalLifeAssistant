import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { MapPin, Calendar, Send, User, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';

export function ConversationalView() {
  return (
    <div className="space-y-6">
      {/* Analysis */}
      <Card className="p-6 bg-white">
        <h3 className="text-slate-900 mb-3">Strengths & Weaknesses</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-green-700 mb-2">✓ Strengths</h4>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>• Natural language queries (easier to express needs)</li>
              <li>• Personalized, context-aware recommendations</li>
              <li>• Filters results based on conversation</li>
              <li>• Can ask follow-up questions and refine</li>
              <li>• Reduces cognitive load for specific tasks</li>
            </ul>
          </div>
          <div>
            <h4 className="text-red-700 mb-2">✗ Weaknesses</h4>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>• Difficult to browse or explore casually</li>
              <li>• Sequential presentation limits comparison</li>
              <li>• Requires knowing what to ask</li>
              <li>• Less visual (harder to get a "feel" for options)</li>
              <li>• Can feel rigid if AI misunderstands intent</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Demo Interface */}
      <Card className="p-6 bg-white">
        <div className="space-y-4">
          <h3 className="text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            Chat with Assistant
          </h3>

          {/* Chat Messages */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {/* User Message */}
            <div className="flex gap-3 justify-end">
              <div className="bg-orange-100 rounded-2xl px-4 py-3 max-w-md">
                <p className="text-slate-800">
                  I'm looking for something interesting to do in Palo Alto this weekend. 
                  I'm into spiritual wellness and personal growth.
                </p>
              </div>
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="bg-orange-500 text-white">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            </div>

            {/* AI Response */}
            <div className="flex gap-3">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="bg-slate-700 text-white">AI</AvatarFallback>
              </Avatar>
              <div className="space-y-3 flex-1">
                <div className="bg-slate-100 rounded-2xl px-4 py-3">
                  <p className="text-slate-800">
                    🎉 Great! I found 5 events in Palo Alto that match your interests in 
                    spiritual wellness and personal growth. Here are my top recommendations:
                  </p>
                </div>

                {/* Recommended Event Cards */}
                <div className="space-y-3">
                  <Card className="p-4 bg-white border-2 border-orange-200">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-slate-900">SoulSearch Palo Alto Enlightenment Expo</h4>
                        <Badge className="bg-orange-500 flex-shrink-0">Top Pick</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4" />
                        <span>Crowne Plaza Palo Alto</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span>Sat, Nov 15, 2025 at 12:00 PM</span>
                      </div>
                      <p className="text-sm text-slate-700">
                        Experience psychic & tarot readings, energy healings, chakra balancing, 
                        and more. Perfect match for your spiritual wellness interests!
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="secondary">Psychic</Badge>
                        <Badge variant="secondary">Meditation</Badge>
                        <Badge variant="secondary">Energy Healing</Badge>
                      </div>
                      <Button className="w-full mt-2 bg-orange-500 hover:bg-orange-600">
                        View Details
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-4 bg-white">
                    <div className="space-y-2">
                      <h4 className="text-slate-900">Mindfulness Meditation Workshop</h4>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4" />
                        <span>Palo Alto Art Center</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span>Sun, Nov 16, 2025 at 10:00 AM</span>
                      </div>
                      <p className="text-sm text-slate-700">
                        Learn mindfulness techniques for stress reduction and personal growth.
                      </p>
                      <Button variant="outline" className="w-full mt-2">
                        View Details
                      </Button>
                    </div>
                  </Card>
                </div>

                <div className="bg-slate-100 rounded-2xl px-4 py-3">
                  <p className="text-slate-800 text-sm">
                    Would you like me to show you more events, or would you prefer something 
                    more focused on meditation specifically?
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="flex gap-2 pt-4 border-t">
            <Input 
              placeholder="Ask a follow-up question..." 
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
