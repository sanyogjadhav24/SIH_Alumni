import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, MapPin, Users, Search, Plus, Filter } from "lucide-react";

export default function EventsPage() {
  const events = [
    {
      id: 1,
      title: "Tech Innovation Summit",
      date: "15",
      month: "DEC",
      location: "San Francisco, CA",
      attendees: 124,
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop",
      category: "Technology"
    },
    {
      id: 2,
      title: "Alumni Networking Night",
      date: "20",
      month: "DEC",
      location: "New York, NY",
      attendees: 89,
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=200&fit=crop",
      category: "Networking"
    },
    {
      id: 3,
      title: "Career Development Workshop",
      date: "22",
      month: "DEC",
      location: "Virtual Event",
      attendees: 156,
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=200&fit=crop",
      category: "Workshop"
    },
    {
      id: 4,
      title: "Annual Alumni Gala",
      date: "05",
      month: "JAN",
      location: "Los Angeles, CA",
      attendees: 245,
      image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=200&fit=crop",
      category: "Social"
    },
    {
      id: 5,
      title: "Startup Pitch Competition",
      date: "10",
      month: "JAN",
      location: "Boston, MA",
      attendees: 78,
      image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=200&fit=crop",
      category: "Business"
    },
    {
      id: 6,
      title: "Sports & Recreation Day",
      date: "15",
      month: "JAN",
      location: "Chicago, IL",
      attendees: 67,
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop",
      category: "Sports"
    }
  ];



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground mt-1">
            Discover and join alumni events
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search events..." 
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" size="sm" className="border-gray-300">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button className="bg-primary hover:bg-primary/90" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {events.map((event) => (
          <Card key={event.id} className="overflow-hidden border border-gray-200">
            <div className="bg-gray-100 h-32 relative">
              <div className="absolute top-2 left-2 bg-white rounded px-2 py-1 text-xs font-medium">
                {event.month} {event.date}
              </div>
            </div>
            
            <CardContent className="p-3">
              <h3 className="font-medium text-sm mb-2 text-gray-900">
                {event.title}
              </h3>
              
              <div className="space-y-1 mb-3">
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <MapPin className="h-3 w-3" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Users className="h-3 w-3" />
                  <span>{event.attendees} going</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs h-7 border-gray-300">
                  Details
                </Button>
                <Button size="sm" className="flex-1 text-xs h-7 bg-primary hover:bg-primary/90">
                  RSVP
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
