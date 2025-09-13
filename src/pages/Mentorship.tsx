import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageCircle, 
  Star, 
  Clock, 
  Users, 
  Plus,
  Search,
  Calendar,
  Video,
  User,
  Bot
} from "lucide-react";

export const Mentorship = () => {
  const [activeTab, setActiveTab] = useState("find-mentor");

  const mentors = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "Senior Software Engineer",
      company: "Google",
      expertise: ["Software Development", "Career Growth", "Leadership"],
      rating: 4.9,
      sessions: 127,
      availability: "Available",
      price: "Free",
      bio: "Passionate about helping junior developers grow their careers in tech.",
      avatar: "/placeholder-avatar.jpg"
    },
    {
      id: 2,
      name: "Michael Rodriguez",
      role: "Product Manager",
      company: "Meta",
      expertise: ["Product Strategy", "Team Management", "Analytics"],
      rating: 4.8,
      sessions: 89,
      availability: "Busy",
      price: "$50/session",
      bio: "10+ years experience in product management at top tech companies.",
      avatar: "/placeholder-avatar.jpg"
    },
    {
      id: 3,
      name: "Emily Johnson",
      role: "Startup Founder",
      company: "TechFlow",
      expertise: ["Entrepreneurship", "Fundraising", "Business Strategy"],
      rating: 4.7,
      sessions: 65,
      availability: "Available",
      price: "$75/session",
      bio: "Successfully raised $10M+ for multiple startups. Here to help aspiring entrepreneurs.",
      avatar: "/placeholder-avatar.jpg"
    }
  ];

  const myMentorships = [
    {
      id: 1,
      mentorName: "David Kim",
      nextSession: "Dec 18, 2024 at 3:00 PM",
      totalSessions: 5,
      lastTopic: "Career transition strategies",
      status: "active",
      avatar: "/placeholder-avatar.jpg"
    },
    {
      id: 2,
      mentorName: "Lisa Wang",
      nextSession: "Dec 22, 2024 at 10:00 AM",
      totalSessions: 3,
      lastTopic: "Technical interview preparation",
      status: "active",
      avatar: "/placeholder-avatar.jpg"
    }
  ];

  const aiInsights = [
    {
      title: "Career Path Recommendations",
      description: "Based on your profile and goals, here are suggested career directions and skills to focus on.",
      action: "View Recommendations"
    },
    {
      title: "Mentor Matching",
      description: "AI-powered matching with mentors who align with your career objectives and learning style.",
      action: "Find Matches"
    },
    {
      title: "Session Summaries",
      description: "Get AI-generated summaries and action items from your mentorship sessions.",
      action: "View Summaries"
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mentorship</h1>
          <p className="text-muted-foreground">Connect with experienced professionals and grow your career</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Schedule Session
          </Button>
          <Button variant="gradient" className="gap-2">
            <Plus className="h-4 w-4" />
            Become a Mentor
          </Button>
        </div>
      </div>

      {/* Mentorship Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="find-mentor">Find Mentors</TabsTrigger>
          <TabsTrigger value="my-mentorships">My Mentorships</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          <TabsTrigger value="become-mentor">Become Mentor</TabsTrigger>
        </TabsList>

        <TabsContent value="find-mentor" className="space-y-6 mt-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search mentors by expertise, company, or role..."
              className="pl-10 h-12"
            />
          </div>

          {/* Mentors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <Card key={mentor.id} className="hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={mentor.avatar} alt={mentor.name} />
                      <AvatarFallback className="text-lg">
                        {mentor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{mentor.name}</h3>
                      <p className="text-sm text-muted-foreground">{mentor.role}</p>
                      <p className="text-sm text-muted-foreground">{mentor.company}</p>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{mentor.rating}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{mentor.sessions} sessions</span>
                      </div>
                    </div>
                    
                    <Badge 
                      variant={mentor.availability === "Available" ? "secondary" : "outline"}
                      className={mentor.availability === "Available" ? "bg-success/10 text-success border-success/20" : ""}
                    >
                      {mentor.availability}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{mentor.bio}</p>

                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-2">Expertise</p>
                    <div className="flex flex-wrap gap-1">
                      {mentor.expertise.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-primary">{mentor.price}</span>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>60 min sessions</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="gradient" className="flex-1" size="sm">
                      Book Session
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-mentorships" className="space-y-6 mt-6">
          {myMentorships.length > 0 ? (
            <div className="space-y-4">
              {myMentorships.map((mentorship) => (
                <Card key={mentorship.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={mentorship.avatar} alt={mentorship.mentorName} />
                          <AvatarFallback>
                            {mentorship.mentorName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <h3 className="font-semibold">{mentorship.mentorName}</h3>
                          <p className="text-sm text-muted-foreground">
                            Next session: {mentorship.nextSession}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {mentorship.totalSessions} sessions completed
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Last topic: {mentorship.lastTopic}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <MessageCircle className="h-4 w-4" />
                          Chat
                        </Button>
                        <Button variant="gradient" size="sm" className="gap-2">
                          <Video className="h-4 w-4" />
                          Join Session
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Mentorships</h3>
              <p className="text-muted-foreground mb-4">Start your mentorship journey today.</p>
              <Button variant="gradient" onClick={() => setActiveTab("find-mentor")}>
                Find a Mentor
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {aiInsights.map((insight, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  
                  <h3 className="font-semibold mb-2">{insight.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{insight.description}</p>
                  
                  <Button variant="outline" className="w-full">
                    {insight.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="become-mentor" className="mt-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Become a Mentor</CardTitle>
              <CardDescription>
                Share your expertise and help fellow alumni grow their careers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Areas of Expertise</label>
                  <Textarea 
                    placeholder="List your areas of expertise, skills, and domains you can mentor in..."
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Why do you want to mentor?</label>
                  <Textarea 
                    placeholder="Share your motivation and what you hope to achieve through mentoring..."
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Availability</label>
                  <Input 
                    placeholder="e.g., 2-3 hours per week, weekends preferred"
                    className="mt-2"
                  />
                </div>
              </div>
              
              <Button variant="gradient" className="w-full">
                Submit Mentor Application
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};