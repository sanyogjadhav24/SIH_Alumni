"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  Edit,
  MapPin,
  Building,
  Calendar,
  Mail,
  Phone,
  Globe,
  Star,
  User,
} from "lucide-react";

export default function ProfilePage() {

  const {user} = useAuth();
  const router = useRouter();

  const skills = [
    { name: "React", level: 95 },
    { name: "TypeScript", level: 90 },
    { name: "Node.js", level: 85 },
    { name: "Python", level: 80 },
    { name: "AWS", level: 75 },
    { name: "Team Leadership", level: 88 },
  ];

  const experience = [
    {
      title: "Senior Software Engineer",
      company: "Google",
      period: "Jan 2023 - Present",
      location: "Mountain View, CA",
      description:
        "Leading frontend development for Google Cloud Infrastructure products. Managing a team of 5 engineers and driving technical decisions for scalable React applications.",
      skills: ["React", "TypeScript", "Node.js", "GCP", "Team Leadership"],
    },
    {
      title: "Software Engineer",
      company: "Meta",
      period: "Jun 2020 - Dec 2022",
      location: "Menlo Park, CA",
      description:
        "Developed and maintained React components for Facebook&apos;s main platform.",
      skills: ["React", "JavaScript", "GraphQL"],
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-primary to-primary/90 text-white border-0">
        <CardContent className="p-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-white">
                <AvatarFallback className="bg-white text-primary text-2xl font-bold">
                {user?.profileUrl === ""
                ? `${user?.firstName[0].toUpperCase()}${user?.lastName[0].toUpperCase()}`
                : <img src={user?.profileUrl}></img>}

                  {/* {} */}
                  
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold mb-2">{user?.firstName} {user?.lastName} {"("+user?.role+")"}</h1>
                <p className="text-xl text-primary-foreground/80 mb-2">
                  {user?.universityName.toUpperCase()}
                </p>
                <div className="flex items-center gap-4 text-primary-foreground/80 mb-4">
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    Google
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Mountain View, CA
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Class of {user?.graduationYear}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                Message
              </Button>
              <Button
                variant="outline"
                className="gap-2 border-white text-black hover:bg-white hover:text-primary"
                onClick={()=>{router.push("/dashboard/profile/edit");}}
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Passionate software engineer with 4+ years of experience
                building scalable web applications. Alumni of Computer Science
                Department, Class of 2020. Currently leading the frontend team
                for Google&apos;s Cloud Infrastructure products.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span> {user?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>+91 {user?.contactNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <span>www. {user?.firstName}.dev</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Joined September 2020</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">247</div>
                  <div className="text-sm text-gray-500">Profile Views</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">156</div>
                  <div className="text-sm text-gray-500">Connections</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">23</div>
                  <div className="text-sm text-gray-500">Posts</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">89</div>
                  <div className="text-sm text-gray-500">Endorsements</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills & Endorsements */}
          <Card>
            <CardHeader>
              <CardTitle>Skills & Endorsements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {skills.map((skill, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{skill.name}</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">{skill.level}%</span>
                    </div>
                  </div>
                  <Progress value={skill.level} className="h-2" />
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4">
                View All Skills
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="experience" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="awards">Awards</TabsTrigger>
            </TabsList>

            <TabsContent value="experience" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Work Experience</h3>
                <Button variant="outline" size="sm">
                  Add Experience
                </Button>
              </div>

              <div className="space-y-6">
                {experience.map((exp, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Building className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{exp.title}</h4>
                          <p className="text-gray-600 mb-1">{exp.company}</p>
                          <p className="text-sm text-gray-500 mb-3">
                            {exp.period} • {exp.location}
                          </p>
                          <p className="text-sm text-gray-700 mb-4">
                            {exp.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {exp.skills.map((skill, skillIndex) => (
                              <Badge
                                key={skillIndex}
                                variant="secondary"
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="education" className="space-y-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Education Added
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Add your educational background
                  </p>
                  <Button>Add Education</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Recent Activity
                  </h3>
                  <p className="text-gray-500">
                    Your recent posts and interactions will appear here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="awards" className="space-y-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Awards Added
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Showcase your achievements and awards
                  </p>
                  <Button>Add Award</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
