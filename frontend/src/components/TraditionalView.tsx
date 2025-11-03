import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { MapPin, Calendar, Star, Search, SlidersHorizontal } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const events = [
  {
    id: 1,
    title: 'SoulSearch Palo Alto Enlightenment Expo',
    location: 'Crowne Plaza Palo Alto',
    date: 'Sat, Nov 15, 2025 at 12:00 AM',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=250&fit=crop',
    rating: 4.8,
    reviews: 124,
    tags: ['Psychic', 'Tarot', 'Meditation'],
    category: 'Spiritual & Wellness'
  },
  {
    id: 2,
    title: 'Beyond the Border: Stories of Immigration',
    location: 'Mitchell Park Community Center',
    date: 'Thu, Nov 13, 2025 at 12:00 PM',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=250&fit=crop',
    rating: 4.9,
    reviews: 89,
    tags: ['Culture', 'Community', 'Education'],
    category: 'Arts & Culture'
  },
  {
    id: 3,
    title: 'Palo Alto Farmers Market',
    location: 'Gilman Street',
    date: 'Every Saturday, 8:00 AM - 12:00 PM',
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=250&fit=crop',
    rating: 4.7,
    reviews: 312,
    tags: ['Food', 'Local', 'Organic'],
    category: 'Food & Drink'
  }
];

export function TraditionalView() {
  return (
    <div className="space-y-6">
      {/* Analysis */}
      <Card className="p-6 bg-white">
        <h3 className="text-slate-900 mb-3">Strengths & Weaknesses</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-green-700 mb-2">✓ Strengths</h4>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>• Visual browsing enables serendipitous discovery</li>
              <li>• Easy to compare multiple options at a glance</li>
              <li>• Familiar interaction patterns (low learning curve)</li>
              <li>• User maintains full control over exploration</li>
              <li>• Works well for open-ended browsing</li>
            </ul>
          </div>
          <div>
            <h4 className="text-red-700 mb-2">✗ Weaknesses</h4>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>• Information overload with many results</li>
              <li>• Requires manual filtering and sorting</li>
              <li>• Not personalized to individual preferences</li>
              <li>• Time-consuming for specific queries</li>
              <li>• Difficult to express nuanced requirements</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Demo Interface */}
      <Card className="p-6 bg-white">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="things to do, nail salons, massage..." 
                className="pl-10"
                defaultValue="events in Palo Alto"
              />
            </div>
            <Button variant="outline" size="icon">
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
            <Button>Search</Button>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary">All Events</Badge>
            <Badge variant="outline">Today</Badge>
            <Badge variant="outline">This Weekend</Badge>
            <Badge variant="outline">Free</Badge>
            <Badge variant="outline">Indoor</Badge>
          </div>

          {/* Results */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">Showing {events.length} results</p>
              <select className="text-sm border rounded px-3 py-1.5">
                <option>Recommended</option>
                <option>Highest Rated</option>
                <option>Most Reviews</option>
                <option>Distance</option>
              </select>
            </div>

            {events.map(event => (
              <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex gap-4 p-4">
                  <ImageWithFallback 
                    src={event.image}
                    alt={event.title}
                    className="w-32 h-32 object-cover rounded flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-slate-900">{event.title}</h4>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm text-slate-700">{event.rating}</span>
                        <span className="text-xs text-slate-500">({event.reviews})</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {event.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
