import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Edit, 
  MapPin, 
  Building, 
  Calendar, 
  Mail, 
  Phone, 
  Linkedin, 
  Github,
  Star,
  Award,
  BookOpen,
  Users,
  TrendingUp,
  Heart,
  MessageSquare,
  Share
} from "lucide-react";

export const Profile = () => {
  const profile = {
    name: "John Doe",
    role: "Senior Software Engineer",
    company: "Google",
    location: "San Francisco, CA",
    batch: "2020",
    college: "MIT",
    email: "john.doe@email.com",
    phone: "+1 (555) 123-4567",
    linkedin: "linkedin.com/in/johndoe",
    github: "github.com/johndoe",
    bio: "Passionate software engineer with 4+ years of experience in full-stack development. Love mentoring junior developers and contributing to open source projects.",
    skills: ["React", "Node.js", "Python", "Machine Learning", "AWS", "Docker"],
    achievements: [
      { title: "Top Performer 2023", organization: "Google", year: "2023" },
      { title: "Best Capstone Project", organization: "MIT", year: "2020" },
      { title: "Hackathon Winner", organization: "TechCrunch Disrupt", year: "2022" }
    ],
    mentoring: true,
    completionScore: 85,
    connections: 234,
    posts: 12,
    profileViews: 156
  };

  const posts = [
    {
      id: 1,
      content: "Just finished an amazing mentoring session with a junior developer. It's incredible to see the next generation of engineers grow!",
      time: "2 hours ago",
      likes: 15,
      comments: 3
    },
    {
      id: 2,
      content: "Excited to announce that our team's project just got featured in Google's developer showcase!",
      time: "1 day ago",
      likes: 28,
      comments: 7
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile Header */}
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-hero relative">
          <Button variant="ghost" className="absolute top-4 right-4 text-white hover:bg-white/20">
            <Edit className="h-4 w-4 mr-2" />
            Edit Cover
          </Button>
        </div>
        
        <CardContent className="relative pt-0 pb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 md:-mt-12">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarImage src="/placeholder-avatar.jpg" alt={profile.name} />
              <AvatarFallback className="text-2xl">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 md:ml-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold">{profile.name}</h1>
                    <p className="text-lg text-muted-foreground">{profile.role}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {profile.company}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {profile.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {profile.college} • Class of {profile.batch}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="gradient">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar */}
        <div className="space-y-6">
          {/* Profile Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Profile Completion</span>
                <span className="font-medium">{profile.completionScore}%</span>
              </div>
              <Progress value={profile.completionScore} />
              
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{profile.connections}</div>
                  <div className="text-xs text-muted-foreground">Connections</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{profile.posts}</div>
                  <div className="text-xs text-muted-foreground">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{profile.profileViews}</div>
                  <div className="text-xs text-muted-foreground">Views</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{profile.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{profile.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Linkedin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{profile.linkedin}</span>
              </div>
              <div className="flex items-center gap-3">
                <Github className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{profile.github}</span>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mentoring Status */}
          {profile.mentoring && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Mentoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                    Available for Mentoring
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  I'm available to mentor junior developers in web development and career growth.
                </p>
                <Button variant="outline" className="w-full mt-3" size="sm">
                  Schedule Session
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="about" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="about">
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="posts" className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder-avatar.jpg" alt={profile.name} />
                        <AvatarFallback>
                          {profile.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{profile.name}</h4>
                          <span className="text-sm text-muted-foreground">{post.time}</span>
                        </div>
                        <p className="text-sm mb-3">{post.content}</p>
                        
                        <div className="flex items-center gap-4">
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
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4">
              {profile.achievements.map((achievement, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <Award className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground">{achievement.organization} • {achievement.year}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Connected with 3 new alumni</span>
                      <span className="text-muted-foreground">2 days ago</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>Posted a new story</span>
                      <span className="text-muted-foreground">1 week ago</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span>Profile viewed 15 times</span>
                      <span className="text-muted-foreground">This week</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};