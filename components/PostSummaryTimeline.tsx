"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, Image as ImageIcon, Calendar, MapPin, Heart, Sparkles, Eye } from "lucide-react";

interface PostSummary {
  id: string;
  title: string;
  summary: string;
  sentiment: string;
  keyTopics: string[];
  confidence: number;
  category: string;
  createdAt: string;
  imageUrl?: string;
  originalContent: string;
  feeling?: string;
  eventTitle?: string;
  placeName?: string;
  likesCount: number;
  commentsCount: number;
}

interface PostSummaryTimelineProps {
  userId: string;
}

export default function PostSummaryTimeline({ userId }: PostSummaryTimelineProps) {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserPostSummaries();
  }, [userId]);

  const fetchUserPostSummaries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/posts/user/${userId}/summaries`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch post summaries");
      }

      const data = await response.json();
      setPosts(data);
    } catch (err) {
      setError("Failed to load post timeline");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "photo":
        return <ImageIcon className="h-4 w-4" />;
      case "event":
        return <Calendar className="h-4 w-4" />;
      case "location":
        return <MapPin className="h-4 w-4" />;
      case "feeling":
        return <Heart className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return "bg-green-100 text-green-800 border-green-200";
      case "negative":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No posts found for this user</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post, index) => (
        <div key={post.id} className="flex items-start gap-4">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
              {index + 1}
            </div>
            {index < posts.length - 1 && (
              <div className="w-0.5 h-16 bg-gray-200 mt-2"></div>
            )}
          </div>
          <div className="flex-1 pb-8">
            <h3 className="font-semibold text-lg">{post.title}</h3>
            <p className="text-gray-600 text-sm">{post.summary}</p>
            
            {/* Metadata */}
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <Badge variant="outline" className="text-xs">
                {post.category}
              </Badge>
              <span>{formatDate(post.createdAt)}</span>
              <div className={`px-2 py-1 rounded-full border ${getSentimentColor(post.sentiment)}`}>
                {post.sentiment}
              </div>
            </div>

            {/* Key Topics */}
            {post.keyTopics.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {post.keyTopics.map((topic, topicIndex) => (
                  <Badge 
                    key={topicIndex} 
                    variant="secondary" 
                    className="text-xs px-2 py-1"
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
            )}

            {/* Engagement Stats */}
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {post.likesCount} likes
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {post.commentsCount} comments
              </div>
              {post.eventTitle && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {post.eventTitle}
                </div>
              )}
              {post.placeName && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {post.placeName}
                </div>
              )}
              {post.feeling && (
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  Feeling {post.feeling}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}