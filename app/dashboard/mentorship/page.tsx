import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageCircle,
  Star,
  Users,
  TrendingUp,
  Clock,
  Plus,
} from "lucide-react";

export default function MentorshipPage() {
  const mentors = [
    {
      id: 1,
      name: "  Chen",
      role: "Senior Software Engineer",
      company: "Google",
      expertise: [
        "Career Development",
        "Technical Leadership",
        "Product Management",
      ],
      rating: 4.9,
      sessions: 127,
      avatar: "/placeholder-avatar.jpg",
      price: "Free",
      available: true,
    },
    {
      id: 2,
      name: "Michael Rodriguez",
      role: "VP of Product",
      company: "Meta",
      expertise: ["Product Strategy", "Team Building", "Startup Advice"],
      rating: 4.8,
      sessions: 89,
      avatar: "/placeholder-avatar.jpg",
      price: "$50/hour",
      available: true,
    },
    {
      id: 3,
      name: "EmilySakshi Sonawane",
      role: "Data Science Director",
      company: "Netflix",
      expertise: ["Data Science", "Machine Learning", "Analytics"],
      rating: 4.9,
      sessions: 156,
      avatar: "/placeholder-avatar.jpg",
      price: "Free",
      available: false,
    },
  ];

  const myMentorships = [
    {
      id: 1,
      mentor: "David Kim",
      role: "UX Design Lead at Apple",
      nextSession: "Dec 18, 2024 at 3:00 PM",
      topic: "Portfolio Review",
      avatar: "/placeholder-avatar.jpg",
    },
    {
      id: 2,
      mentor: "Lisa Wang",
      role: "Marketing Director at Spotify",
      nextSession: "Dec 20, 2024 at 2:00 PM",
      topic: "Brand Strategy Discussion",
      avatar: "/placeholder-avatar.jpg",
    },
  ];

  const stats = [
    { label: "Active Mentorships", value: "3", icon: Users },
    { label: "Hours Completed", value: "24", icon: Clock },
    { label: "Average Rating", value: "4.8", icon: Star },
    { label: "Career Growth", value: "+15%", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mentorship</h1>
          <p className="text-muted-foreground">
            Connect with experienced alumni for career guidance
          </p>
        </div>
        <Button className="bg-gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          Become a Mentor
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="find-mentors" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="find-mentors">Find Mentors</TabsTrigger>
          <TabsTrigger value="my-mentorships">My Mentorships</TabsTrigger>
          <TabsTrigger value="mentor-requests">Mentor Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="find-mentors" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <Card
                key={mentor.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={mentor.avatar} alt={mentor.name} />
                      <AvatarFallback>
                        {mentor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{mentor.name}</h3>
                      <p className="text-muted-foreground text-sm">
                        {mentor.role}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {mentor.company}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">
                            {mentor.rating}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ({mentor.sessions} sessions)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-2">Expertise</p>
                      <div className="flex flex-wrap gap-1">
                        {mentor.expertise.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {mentor.price}
                        </span>
                        <Badge
                          variant={mentor.available ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {mentor.available ? "Available" : "Busy"}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        disabled={!mentor.available}
                      >
                        Request Mentorship
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-mentorships" className="space-y-6">
          <div className="grid gap-4">
            {myMentorships.map((mentorship) => (
              <Card key={mentorship.id}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={mentorship.avatar}
                        alt={mentorship.mentor}
                      />
                      <AvatarFallback>
                        {mentorship.mentor
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">{mentorship.mentor}</h3>
                      <p className="text-sm text-muted-foreground">
                        {mentorship.role}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {mentorship.nextSession}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {mentorship.topic}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Reschedule
                      </Button>
                      <Button size="sm">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mentor-requests" className="space-y-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Pending Requests
              </h3>
              <p className="text-muted-foreground mb-4">
                You don&apos;t have any mentor requests at the moment.
              </p>
              <Button className="bg-gradient-primary">Become a Mentor</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
