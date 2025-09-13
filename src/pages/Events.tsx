import { useState } from "react";
import { Calendar, MapPin, Users, Clock, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Events = () => {
  const events = [
    {
      id: 1,
      title: "Alumni Tech Meetup 2024",
      description: "Join fellow tech alumni for networking, insights, and career opportunities in the Bay Area.",
      date: "2024-12-15",
      time: "18:00",
      location: "San Francisco, CA",
      venue: "Google Campus",
      type: "Networking",
      category: "Technology",
      organizer: "Sarah Chen",
      attendees: 45,
      capacity: 100,
      rsvpDeadline: "2024-12-10",
      predictedAttendance: 78,
      image: "/placeholder-event.jpg",
      tags: ["Tech", "Networking", "Career"],
      rsvped: false
    },
    {
      id: 2,
      title: "Career Guidance Workshop",
      description: "Interactive workshop on career transitions, skill development, and industry insights.",
      date: "2024-12-20",
      time: "14:00",
      location: "Virtual",
      venue: "Zoom Meeting",
      type: "Workshop",
      category: "Professional Development",
      organizer: "Michael Rodriguez",
      attendees: 128,
      capacity: 200,
      rsvpDeadline: "2024-12-18",
      predictedAttendance: 165,
      image: "/placeholder-event.jpg",
      tags: ["Career", "Workshop", "Skills"],
      rsvped: true
    },
    {
      id: 3,
      title: "Annual Alumni Gala",
      description: "Celebrate achievements and strengthen connections at our flagship annual event.",
      date: "2025-01-15",
      time: "19:00",
      location: "New York, NY",
      venue: "The Plaza Hotel",
      type: "Formal",
      category: "Social",
      organizer: "Alumni Association",
      attendees: 234,
      capacity: 500,
      rsvpDeadline: "2025-01-05",
      predictedAttendance: 420,
      image: "/placeholder-event.jpg",
      tags: ["Gala", "Formal", "Celebration"],
      rsvped: false
    },
    {
      id: 4,
      title: "Startup Pitch Competition",
      description: "Alumni entrepreneurs showcase their ventures and compete for funding opportunities.",
      date: "2025-02-10",
      time: "10:00",
      location: "Austin, TX",
      venue: "Capital Factory",
      type: "Competition",
      category: "Entrepreneurship",
      organizer: "David Kim",
      attendees: 67,
      capacity: 150,
      rsvpDeadline: "2025-02-05",
      predictedAttendance: 95,
      image: "/placeholder-event.jpg",
      tags: ["Startup", "Competition", "Funding"],
      rsvped: false
    }
  ];

  const [selectedTab, setSelectedTab] = useState("upcoming");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">Discover and attend alumni events worldwide</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="gradient" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Event Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="my-events">My Events</TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
          <TabsTrigger value="hosting">Hosting</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-all duration-200">
                <div className="aspect-video bg-gradient-primary rounded-t-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-white/90 text-black">
                      {event.category}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold mb-1">{event.title}</h3>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {event.time}
                      </div>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{event.venue}, {event.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{event.attendees} attending • {event.capacity - event.attendees} spots left</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {event.organizer.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">Organized by {event.organizer}</span>
                    </div>
                  </div>

                  {/* Predicted Attendance */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Predicted Attendance</span>
                      <span className="font-medium">{event.predictedAttendance}/{event.capacity}</span>
                    </div>
                    <Progress value={(event.predictedAttendance/event.capacity) * 100} className="h-2" />
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {event.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* RSVP Button */}
                  <div className="flex gap-2">
                    {event.rsvped ? (
                      <Button variant="success" className="flex-1" disabled>
                        ✓ RSVP'd
                      </Button>
                    ) : (
                      <Button variant="gradient" className="flex-1">
                        RSVP Now
                      </Button>
                    )}
                    <Button variant="outline">
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-events" className="mt-6">
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Events Yet</h3>
            <p className="text-muted-foreground mb-4">You haven't RSVP'd to any events yet.</p>
            <Button variant="gradient">Browse Events</Button>
          </div>
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          <div className="text-center py-12">
            <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Past Events</h3>
            <p className="text-muted-foreground">Your event history will appear here.</p>
          </div>
        </TabsContent>

        <TabsContent value="hosting" className="mt-6">
          <div className="text-center py-12">
            <Plus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Start Hosting</h3>
            <p className="text-muted-foreground mb-4">Create events to bring alumni together.</p>
            <Button variant="gradient">Create Your First Event</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};