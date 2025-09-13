import { useState } from "react";
import { Search, Filter, MapPin, Building, Calendar, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Directory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const alumni = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "Senior Software Engineer",
      company: "Google",
      location: "San Francisco, CA",
      batch: "2018",
      college: "MIT",
      skills: ["React", "Node.js", "Python", "Machine Learning"],
      mentoring: true,
      avatar: "/placeholder-avatar.jpg",
      rating: 4.9
    },
    {
      id: 2,
      name: "Michael Rodriguez",
      role: "Product Manager",
      company: "Meta",
      location: "New York, NY",
      batch: "2015",
      college: "Stanford",
      skills: ["Product Strategy", "Analytics", "Leadership"],
      mentoring: true,
      avatar: "/placeholder-avatar.jpg",
      rating: 4.8
    },
    {
      id: 3,
      name: "Emily Johnson",
      role: "Data Scientist",
      company: "Netflix",
      location: "Los Angeles, CA",
      batch: "2019",
      college: "UC Berkeley",
      skills: ["Python", "SQL", "Machine Learning", "Statistics"],
      mentoring: false,
      avatar: "/placeholder-avatar.jpg",
      rating: 4.7
    },
    {
      id: 4,
      name: "David Kim",
      role: "Startup Founder",
      company: "TechFlow",
      location: "Austin, TX",
      batch: "2016",
      college: "Harvard",
      skills: ["Entrepreneurship", "Fundraising", "Strategy"],
      mentoring: true,
      avatar: "/placeholder-avatar.jpg",
      rating: 4.9
    },
    {
      id: 5,
      name: "Lisa Wang",
      role: "UX Designer",
      company: "Apple",
      location: "Cupertino, CA",
      batch: "2020",
      college: "MIT",
      skills: ["UI/UX", "Figma", "Design Systems", "Research"],
      mentoring: false,
      avatar: "/placeholder-avatar.jpg",
      rating: 4.6
    },
    {
      id: 6,
      name: "James Wilson",
      role: "Investment Banker",
      company: "Goldman Sachs",
      location: "New York, NY",
      batch: "2017",
      college: "Stanford",
      skills: ["Finance", "Investment", "Analysis", "Strategy"],
      mentoring: true,
      avatar: "/placeholder-avatar.jpg",
      rating: 4.8
    }
  ];

  const [filteredAlumni, setFilteredAlumni] = useState(alumni);

  const filterOptions = {
    colleges: ["MIT", "Stanford", "Harvard", "UC Berkeley", "Caltech"],
    batchYears: ["2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015"],
    skills: ["React", "Python", "Machine Learning", "Product Strategy", "UI/UX", "Finance", "Leadership"],
    locations: ["San Francisco, CA", "New York, NY", "Los Angeles, CA", "Austin, TX", "Cupertino, CA"]
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Alumni Directory</h1>
          <p className="text-muted-foreground">Connect with {alumni.length} alumni worldwide</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Alumni</SheetTitle>
                <SheetDescription>
                  Find alumni based on your preferences
                </SheetDescription>
              </SheetHeader>
              
              <div className="space-y-6 mt-6">
                {/* College Filter */}
                <div>
                  <h3 className="font-medium mb-3">College/University</h3>
                  <div className="space-y-2">
                    {filterOptions.colleges.map(college => (
                      <div key={college} className="flex items-center space-x-2">
                        <Checkbox id={college} />
                        <label htmlFor={college} className="text-sm">{college}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Batch Year Filter */}
                <div>
                  <h3 className="font-medium mb-3">Batch Year</h3>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOptions.batchYears.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Skills Filter */}
                <div>
                  <h3 className="font-medium mb-3">Skills</h3>
                  <div className="space-y-2">
                    {filterOptions.skills.map(skill => (
                      <div key={skill} className="flex items-center space-x-2">
                        <Checkbox id={skill} />
                        <label htmlFor={skill} className="text-sm">{skill}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mentoring Filter */}
                <div>
                  <h3 className="font-medium mb-3">Availability</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="mentoring" />
                    <label htmlFor="mentoring" className="text-sm">Available for mentoring</label>
                  </div>
                </div>

                <Button className="w-full" variant="gradient">
                  Apply Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, company, skills, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12"
        />
      </div>

      {/* Alumni Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAlumni.map((person) => (
          <Card key={person.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={person.avatar} alt={person.name} />
                  <AvatarFallback className="text-lg">
                    {person.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {person.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{person.role}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-muted-foreground">{person.rating}</span>
                  </div>
                </div>
                
                {person.mentoring && (
                  <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                    Mentor
                  </Badge>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building className="h-4 w-4" />
                  {person.company}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {person.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {person.college} • Class of {person.batch}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2">Skills</p>
                <div className="flex flex-wrap gap-1">
                  {person.skills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {person.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{person.skills.length - 3}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="default" className="flex-1" size="sm">
                  Connect
                </Button>
                <Button variant="outline" size="sm">
                  Message
                </Button>
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
};