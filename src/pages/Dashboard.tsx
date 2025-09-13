import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Calendar, 
  MessageCircle, 
  TrendingUp, 
  Bell,
  BookOpen,
  MapPin,
  Building,
  Star,
  Heart,
  MessageSquare,
  Share
} from "lucide-react";

export const Dashboard = () => {
  const stats = [
    { name: "Alumni Connected", value: "1,234", icon: Users, change: "+12%" },
    { name: "Upcoming Events", value: "8", icon: Calendar, change: "+2" },
    { name: "Active Chats", value: "23", icon: MessageCircle, change: "+5" },
    { name: "Profile Views", value: "156", icon: TrendingUp, change: "+18%" },
  ];

  const recentPosts = [
    {
      id: 1,
      author: "Sarah Chen",
      role: "Software Engineer at Google",
      batch: "Class of 2018",
      time: "2 hours ago",
      content: "Just got promoted to Senior Engineer! Grateful for the mentorship from our alumni network. Special thanks to the career guidance program.",
      likes: 24,
      comments: 8,
      avatar: "/placeholder-avatar.jpg"
    },
    {
      id: 2,
      author: "Michael Rodriguez",
      role: "Entrepreneur",
      batch: "Class of 2015",
      time: "5 hours ago",
      content: "Our startup just raised $2M Series A! Looking to hire talented engineers from our alma mater. DM me if interested.",
      likes: 45,
      comments: 12,
      avatar: "/placeholder-avatar.jpg"
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Alumni Tech Meetup",
      date: "Dec 15, 2024",
      time: "6:00 PM",
      location: "San Francisco",
      attendees: 45,
      type: "Networking"
    },
    {
      id: 2,
      title: "Career Guidance Workshop",
      date: "Dec 20, 2024",
      time: "2:00 PM",
      location: "Virtual",
      attendees: 128,
      type: "Workshop"
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-hero rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, John!</h1>
            <p className="text-white/80 text-lg">Ready to connect with your alumni community?</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-sm text-white/80">Profile Completion</div>
              <div className="text-2xl font-bold">85%</div>
              <Progress value={85} className="mt-2 bg-white/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-sm text-success font-medium">{stat.change}</p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Posts */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Recent Posts
              </CardTitle>
              <CardDescription>Latest updates from your alumni network</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {recentPosts.map((post) => (
                <div key={post.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={post.avatar} alt={post.author} />
                      <AvatarFallback>{post.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{post.author}</h4>
                        <Badge variant="secondary" className="text-xs">{post.batch}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{post.role}</p>
                      <p className="text-sm">{post.content}</p>
                      
                      <div className="flex items-center gap-4 pt-2">
                        <Button variant="ghost" size="sm" className="h-8 gap-2">
                          <Heart className="h-4 w-4" />
                          {post.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 gap-2">
                          <MessageSquare className="h-4 w-4" />
                          {post.comments}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8">
                          <Share className="h-4 w-4" />
                        </Button>
                        <span className="text-xs text-muted-foreground ml-auto">{post.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" className="w-full">
                View All Posts
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{event.title}</h4>
                    <Badge variant="outline" className="text-xs">{event.type}</Badge>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {event.date} at {event.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3" />
                      {event.attendees} attending
                    </div>
                  </div>
                  <Button size="sm" className="w-full mt-3" variant="outline">
                    RSVP
                  </Button>
                </div>
              ))}
              
              <Button variant="ghost" className="w-full">
                View All Events
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="gradient" className="w-full justify-start gap-2">
                <Users className="h-4 w-4" />
                Find Alumni
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <MessageCircle className="h-4 w-4" />
                Start Mentorship
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Calendar className="h-4 w-4" />
                Create Event
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Bell className="h-4 w-4" />
                Post Update
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};