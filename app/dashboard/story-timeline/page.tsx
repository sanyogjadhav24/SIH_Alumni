import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Clock,
  Filter,
  Download,
  Share,
  Sparkles,
  Calendar,
} from "lucide-react";

export default function StoryTimelinePage() {
  const timelineStories = [
    {
      id: 1,
      title: " 's promotion to VP at Google",
      description: "Part of the The Tech Innovation Wave collection",
      batch: "Class of 2020",
      generatedDate: "2024-12-10",
      author: "AI Assistant",
    },
    {
      id: 2,
      title: "Mike's startup acquisition",
      description: "Part of the The Tech Innovation Wave collection",
      batch: "Class of 2020",
      generatedDate: "2024-12-10",
      author: "AI Assistant",
    },
    {
      id: 3,
      title: "Lisa's patent filing",
      description: "Part of the The Tech Innovation Wave collection",
      batch: "Class of 2020",
      generatedDate: "2024-12-10",
      author: "AI Assistant",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">StoryTimeline</h1>
          <p className="text-gray-500">
            AI-generated visual timelines of alumni stories and achievements
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter by Batch
          </Button>
          <Button className="bg-primary hover:bg-primary/90 gap-2">
            <Sparkles className="h-4 w-4" />
            Generate New Timeline
          </Button>
        </div>
      </div>

      {/* AI Story Generator */}
      <Card className="bg-gradient-to-r from-primary/5 to-purple-50 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">AI Story Generator</h3>
                <p className="text-sm text-gray-600">Beta</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured Timeline */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold mb-2">
                The Tech Innovation Wave
              </h2>
              <p className="text-gray-600 mb-4">
                A collection of breakthrough moments from our alumni in the tech
                industry
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <Badge variant="outline">Class of 2020</Badge>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Generated on 2024-12-10
                </div>
                <div className="flex items-center gap-1">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="bg-primary text-white text-xs">
                      AI
                    </AvatarFallback>
                  </Avatar>
                  AI Assistant
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Timeline Items */}
          <div className="space-y-6">
            {timelineStories.map((story, index) => (
              <div key={story.id} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  {index < timelineStories.length - 1 && (
                    <div className="w-0.5 h-16 bg-gray-200 mt-2"></div>
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <h3 className="font-semibold text-lg">{story.title}</h3>
                  <p className="text-gray-600 text-sm">{story.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-500 mb-4">
              Based on 15 posts from alumni
            </p>
            <Button className="bg-primary hover:bg-primary/90">
              View Full Timeline
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
