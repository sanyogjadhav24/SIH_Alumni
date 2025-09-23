'use client'
import { useAuth } from '../hooks/useAuth'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import CreatePost from "../../components/CreatePost"
import PostCard from "../../components/PostCard"
import { toast } from 'sonner'

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

export default function DashboardPage() {
  const { user, loading, logout } = useAuth() as any
  const router = useRouter()
  const searchParams = useSearchParams()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMorePosts, setHasMorePosts] = useState(true)

  useEffect(() => {
    const token = searchParams.get("token")
    if (token) {
      localStorage.setItem("token", token)
      router.replace("/dashboard")
    }
  }, [searchParams, router])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (user) {
      fetchPosts()
    }
  }, [user])

  const fetchPosts = async (page = 1, reset = true) => {
    try {
      setIsLoadingPosts(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:4000/api/posts/feed?page=${page}&limit=10`, {
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
        toast.error('Failed to fetch posts')
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast.error('Failed to fetch posts')
    } finally {
      setIsLoadingPosts(false)
    }
  }

  const handlePostCreated = () => {
    // Refresh posts when a new post is created
    fetchPosts(1, true)
  }

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter(post => post._id !== postId))
  }

  const loadMorePosts = () => {
    if (hasMorePosts && !isLoadingPosts) {
      fetchPosts(currentPage + 1, false)
    }
  }

  if (loading || !user) return <div className="p-6 text-center">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-primary to-primary/90 text-white border-0">
        <CardContent className="p-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to AlmaConnect</h1>
          <h1 className="text-3xl font-bold mb-2">Welcome {user?.firstName} 👋</h1>
          <p className="text-primary-foreground/80 text-lg mb-4">
            Your personalized feed showing posts from your college network and connections.
          </p>
          <Button
            variant="secondary"
            className="bg-white text-primary hover:bg-gray-50"
          >
            Connect Share Grow Succeed
          </Button>
        </CardContent>
      </Card>

      {/* Create Post Component */}
      <CreatePost onPostCreated={handlePostCreated} />

      {/* Feed Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Feed</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Posts from your college and network connections
        </p>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {isLoadingPosts && posts.length === 0 ? (
          <div className="text-center py-8">
            <p>Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">No posts in your feed yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your feed shows posts from your college network and connections. Connect with alumni from {user?.universityName} to see more posts!
              </p>
              <Button 
                onClick={() => router.push('/dashboard/network')}
                variant="outline"
                className="mr-2"
              >
                Find Connections
              </Button>
              <Button 
                onClick={() => router.push('/dashboard/profile/my-posts')}
                variant="outline"
              >
                View My Posts
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUserId={user?._id}
                onDelete={handleDeletePost}
                showActions={true}
              />
            ))}

            {/* Load More Button */}
            {hasMorePosts && (
              <div className="text-center py-4">
                <Button
                  onClick={loadMorePosts}
                  disabled={isLoadingPosts}
                  variant="outline"
                >
                  {isLoadingPosts ? 'Loading...' : 'Load More Posts'}
                </Button>
              </div>
            )}

            {!hasMorePosts && posts.length > 0 && (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400">
                  You've reached the end of the feed
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
