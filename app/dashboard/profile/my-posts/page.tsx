'use client'

import { useEffect, useState } from 'react'
import { useAuth } from "../../../hooks/useAuth"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import PostCard from "../../../../components/PostCard"
import CreatePost from "../../../../components/CreatePost"
import EditPost from "../../../../components/EditPost"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from 'sonner'
import { Search, Filter, Edit, Plus, Calendar, Image as ImageIcon, MapPin, Smile } from "lucide-react"

interface Post {
  _id: string
  content: string
  category: 'photo' | 'event' | 'location' | 'feeling'
  author: {
    _id: string
    firstName: string
    lastName: string
    universityName: string
    role: string
    profileUrl?: string
  }
  imageUrl?: string
  eventDetails?: any
  locationDetails?: any
  feeling?: string
  tags: string[]
  likes: any[]
  comments: any[]
  likeCount: number
  commentCount: number
  shareCount: number
  createdAt: string
  updatedAt: string
}

export default function MyPostsPage() {
  const { user } = useAuth() as any
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMorePosts, setHasMorePosts] = useState(true)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)

  useEffect(() => {
    if (user) {
      fetchMyPosts()
    }
  }, [user])

  const fetchMyPosts = async (page = 1, reset = true) => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:4000/api/posts/my-posts?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()

      if (response.ok) {
        if (reset) {
          setPosts(data.posts)
        } else {
          setPosts(prev => [...prev, ...data.posts])
        }
        setHasMorePosts(data.pagination.hasNextPage)
        setCurrentPage(page)
      } else {
        toast.error('Failed to fetch your posts')
      }
    } catch (error) {
      console.error('Error fetching my posts:', error)
      toast.error('Failed to fetch your posts')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePostCreated = () => {
    setShowCreatePost(false)
    fetchMyPosts(1, true)
  }

  const handleEditPost = (post: Post) => {
    setEditingPost(post)
  }

  const handlePostUpdated = (updatedPost: Post) => {
    setPosts(posts.map(post => post._id === updatedPost._id ? updatedPost : post))
    setEditingPost(null)
  }

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter(post => post._id !== postId))
  }

  const loadMorePosts = () => {
    if (hasMorePosts && !isLoading) {
      fetchMyPosts(currentPage + 1, false)
    }
  }

  // Filter posts based on search term and category
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter
    
    return matchesSearch && matchesCategory
  })

  // Get post counts by category
  const getPostCounts = () => {
    const counts = {
      all: posts.length,
      photo: posts.filter(p => p.category === 'photo').length,
      event: posts.filter(p => p.category === 'event').length,
      location: posts.filter(p => p.category === 'location').length,
      feeling: posts.filter(p => p.category === 'feeling').length
    }
    return counts
  }

  const postCounts = getPostCounts()

  const categoryIcons = {
    photo: ImageIcon,
    event: Calendar,
    location: MapPin,
    feeling: Smile
  }

  if (!user) {
    return <div className="p-6 text-center">Loading...</div>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Posts</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all your posts in one place
          </p>
        </div>
        <Button 
          onClick={() => setShowCreatePost(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create New Post
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{postCounts.all}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Posts</p>
            </div>
          </CardContent>
        </Card>
        
        {Object.entries(categoryIcons).map(([category, IconComponent]) => (
          <Card key={category}>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <IconComponent className="h-5 w-5 text-gray-600" />
                </div>
                <p className="text-xl font-bold">{postCounts[category as keyof typeof postCounts]}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{category}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search your posts by content or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories ({postCounts.all})</SelectItem>
                <SelectItem value="photo">Photo ({postCounts.photo})</SelectItem>
                <SelectItem value="event">Event ({postCounts.event})</SelectItem>
                <SelectItem value="location">Location ({postCounts.location})</SelectItem>
                <SelectItem value="feeling">Feeling ({postCounts.feeling})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Create Post Dialog */}
      <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
          </DialogHeader>
          <CreatePost onPostCreated={handlePostCreated} />
        </DialogContent>
      </Dialog>

      {/* Edit Post Dialog */}
      {editingPost && (
        <EditPost
          post={editingPost}
          isOpen={!!editingPost}
          onClose={() => setEditingPost(null)}
          onPostUpdated={handlePostUpdated}
        />
      )}

      {/* Posts List */}
      <div className="space-y-6">
        {isLoading && posts.length === 0 ? (
          <div className="text-center py-8">
            <p>Loading your posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="max-w-md mx-auto">
                {searchTerm || categoryFilter !== 'all' ? (
                  <>
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No posts found</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      No posts match your search criteria. Try adjusting your search terms or filters.
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button variant="outline" onClick={() => setSearchTerm('')}>
                        Clear Search
                      </Button>
                      <Button variant="outline" onClick={() => setCategoryFilter('all')}>
                        Clear Filters
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Edit className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      You haven't created any posts yet. Share your thoughts, achievements, or experiences with the community!
                    </p>
                    <Button onClick={() => setShowCreatePost(true)}>
                      Create Your First Post
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredPosts.length} of {posts.length} posts
                {(searchTerm || categoryFilter !== 'all') && ' (filtered)'}
              </p>
            </div>

            {filteredPosts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUserId={user._id}
                onEdit={handleEditPost}
                onDelete={handleDeletePost}
                showActions={true}
              />
            ))}

            {/* Load More Button */}
            {hasMorePosts && !searchTerm && categoryFilter === 'all' && (
              <div className="text-center py-4">
                <Button
                  onClick={loadMorePosts}
                  disabled={isLoading}
                  variant="outline"
                >
                  {isLoading ? 'Loading...' : 'Load More Posts'}
                </Button>
              </div>
            )}

            {/* End of posts */}
            {!hasMorePosts && posts.length > 0 && !searchTerm && categoryFilter === 'all' && (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400">
                  You've reached the end of your posts
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
