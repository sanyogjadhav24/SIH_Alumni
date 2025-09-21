import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  MapPin,
  Building,
  MessageCircle,
  UserPlus,
} from "lucide-react";

export default function DirectoryPage() {
  const alumni = [
    {
      id: 1,
      name: "  Chen",
      role: "Software Engineer",
      company: "Google",
      location: "San Francisco, CA",
      batch: "Class of 2018",
      major: "Computer Science",
      avatar: "/placeholder-avatar.jpg",
      skills: ["React", "Python", "Machine Learning"],
    },
    {
      id: 2,
      name: "Michael Rodriguez",
      role: "Product Manager",
      company: "Meta",
      location: "New York, NY",
      batch: "Class of 2016",
      major: "Business Administration",
      avatar: "/placeholder-avatar.jpg",
      skills: ["Product Strategy", "Analytics", "Leadership"],
    },
    {
      id: 3,
      name: "EmilySakshi Sonawane",
      role: "Data Scientist",
      company: "Netflix",
      location: "Los Angeles, CA",
      batch: "Class of 2019",
      major: "Statistics",
      avatar: "/placeholder-avatar.jpg",
      skills: ["Python", "SQL", "Machine Learning"],
    },
    {
      id: 4,
      name: "David Kim",
      role: "UX Designer",
      company: "Apple",
      location: "Cupertino, CA",
      batch: "Class of 2017",
      major: "Design",
      avatar: "/placeholder-avatar.jpg",
      skills: ["Figma", "User Research", "Prototyping"],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Alumni Directory</h1>
        <p className="text-muted-foreground">
          Connect with fellow alumni from your university
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, company, or skills..."
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Graduation Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2021">2021</SelectItem>
                  <SelectItem value="2020">2020</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Major" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cs">Computer Science</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alumni Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alumni.map((person) => (
          <Card key={person.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={person.avatar} alt={person.name} />
                  <AvatarFallback>
                    {person.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{person.name}</h3>
                  <p className="text-muted-foreground">{person.role}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <Building className="h-3 w-3" />
                    {person.company}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {person.location}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Badge variant="secondary" className="text-xs">
                    {person.batch}
                  </Badge>
                  <span className="text-sm text-muted-foreground ml-2">
                    {person.major}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {person.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Connect
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

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" size="lg">
          Load More Alumni
        </Button>
      </div>
    </div>
  );
}
