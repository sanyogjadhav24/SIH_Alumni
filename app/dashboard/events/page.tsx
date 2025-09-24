'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import PostCard from "../../../components/PostCard"
import CreatePost from "../../../components/CreatePost"
import { useAuth } from "../../hooks/useAuth"
import { toast } from 'sonner'
import { Calendar, MapPin, Users, Search, Plus, Filter } from "lucide-react"

interface EventPost {
  _id: string
  content: string
  category: 'event'
  author: {
    _id: string
    firstName: string
    lastName: string
    universityName: string
    role: string
    profileUrl?: string
  }
  eventDetails: {
    title: string
    date: string
    time: string
    venue: string
    description?: string
    registrationLink?: string
  }
  tags: string[]
  likes: any[]
  comments: any[]
  likeCount: number
  commentCount: number
  shareCount: number
  createdAt: string
  updatedAt: string
}

export default function EventsPage() {
  const { user } = useAuth() as any
  const [eventPosts, setEventPosts] = useState<EventPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMorePosts, setHasMorePosts] = useState(true)
  const [showCreateEvent, setShowCreateEvent] = useState(false)

  useEffect(() => {
    fetchEventPosts()
  }, [])

  const fetchEventPosts = async (page = 1, reset = true) => {
    try {
      setIsLoading(true)
      const response = await fetch(`http://localhost:4000/api/posts/category/event?page=${page}&limit=10`)
      const data = await response.json()

      if (response.ok) {
        if (reset) {
          setEventPosts(data.posts)
        } else {
          setEventPosts(prev => [...prev, ...data.posts])
        }
        setHasMorePosts(data.pagination.hasNextPage)
        setCurrentPage(page)
      } else {
        toast.error('Failed to fetch events')
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('Failed to fetch events')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEventCreated = () => {
    setShowCreateEvent(false)
    fetchEventPosts(1, true)
  }

  const handleDeleteEvent = (postId: string) => {
    setEventPosts(eventPosts.filter(post => post._id !== postId))
  }

  const loadMoreEvents = () => {
    if (hasMorePosts && !isLoading) {
      fetchEventPosts(currentPage + 1, false)
    }
  }

  const filteredEvents = eventPosts.filter(event => 
    event.eventDetails.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.eventDetails.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Upcoming and past events based on event date
  const now = new Date()
  const upcomingEvents = filteredEvents.filter(event => new Date(event.eventDetails.date) >= now)
  const pastEvents = filteredEvents.filter(event => new Date(event.eventDetails.date) < now)

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Events</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover and join alumni events happening in your network
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateEvent(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search events by title, venue, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create Event Modal */}
      {showCreateEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Create Event</h2>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowCreateEvent(false)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
              <CreatePost onPostCreated={handleEventCreated} />
            </div>
          </div>
        </div>
      )}

      {/* Event Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Events</p>
                <p className="text-2xl font-bold">{filteredEvents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming</p>
                <p className="text-2xl font-bold">{upcomingEvents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Past Events</p>
                <p className="text-2xl font-bold">{pastEvents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Upcoming Events
          </h2>
          <div className="space-y-6">
            {upcomingEvents.map((event) => (
              <PostCard
                key={event._id}
                post={event}
                currentUserId={user?._id}
                onDelete={handleDeleteEvent}
                showActions={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Past Events
          </h2>
          <div className="space-y-6">
            {pastEvents.map((event) => (
              <PostCard
                key={event._id}
                post={event}
                currentUserId={user?._id}
                onDelete={handleDeleteEvent}
                showActions={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && eventPosts.length === 0 && (
        <div className="text-center py-8">
          <p>Loading events...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredEvents.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No events found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm 
                ? "No events match your search criteria. Try adjusting your search terms."
                : "Be the first to create an event for the community!"
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowCreateEvent(true)}>
                Create First Event
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Load More Button */}
      {hasMorePosts && !searchTerm && (
        <div className="text-center py-4">
          <Button
            onClick={loadMoreEvents}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? 'Loading...' : 'Load More Events'}
          </Button>
        </div>
      )}

      {/* End of events */}
      {!hasMorePosts && eventPosts.length > 0 && !searchTerm && (
        <div className="text-center py-4">
          <p className="text-gray-500 dark:text-gray-400">
            You've reached the end of the events
          </p>
        </div>
      )}
    </div>
  )
}
