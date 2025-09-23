'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { 
  Heart, 
  MessageCircle, 
  Share, 
  MoreHorizontal, 
  Calendar,
  MapPin,
  Smile,
  Edit,
  Trash2,
  ExternalLink,
  Send
} from 'lucide-react'

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
  eventDetails?: {
    title: string
    date: string
    time: string
    venue: string
    description?: string
    registrationLink?: string
  }
  locationDetails?: {
    placeName: string
    address?: string
  }
  feeling?: string
  tags: string[]
  likes: Array<{ user: string, createdAt: string }>
  comments: Array<{
    _id: string
    user: {
      _id: string
      firstName: string
      lastName: string
      profileUrl?: string
    }
    content: string
    createdAt: string
  }>
  likeCount: number
  commentCount: number
  shareCount: number
  createdAt: string
  updatedAt: string
  isLikedBy?: (userId: string) => boolean
}

interface PostCardProps {
  post: Post
  currentUserId?: string
  onEdit?: (post: Post) => void
  onDelete?: (postId: string) => void
  showActions?: boolean
}

export default function PostCard({ 
  post, 
  currentUserId, 
  onEdit, 
  onDelete, 
  showActions = true 
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(
    post.likes.some(like => like.user === currentUserId)
  )
  const [likeCount, setLikeCount] = useState(post.likeCount || post.likes.length)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState(post.comments || [])
  const [isCommenting, setIsCommenting] = useState(false)

  const isOwner = currentUserId === post.author._id

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:4000/api/posts/${post._id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok) {
        setIsLiked(data.liked)
        setLikeCount(data.likeCount)
      } else {
        toast.error(data.error || 'Failed to toggle like')
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      toast.error('Failed to toggle like')
    }
  }

  const handleComment = async () => {
    if (!newComment.trim()) return

    setIsCommenting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:4000/api/posts/${post._id}/comment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newComment })
      })

      const data = await response.json()

      if (response.ok) {
        setComments([...comments, data.comment])
        setNewComment('')
        toast.success('Comment added successfully')
      } else {
        toast.error(data.error || 'Failed to add comment')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Failed to add comment')
    } finally {
      setIsCommenting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:4000/api/posts/${post._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        onDelete?.(post._id)
        toast.success('Post deleted successfully')
      } else {
        toast.error(data.error || 'Failed to delete post')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Failed to delete post')
    }
  }

  const getCategoryIcon = () => {
    switch (post.category) {
      case 'event':
        return <Calendar className="h-4 w-4" />
      case 'location':
        return <MapPin className="h-4 w-4" />
      case 'feeling':
        return <Smile className="h-4 w-4" />
      default:
        return null
    }
  }

  const getCategoryInfo = () => {
    switch (post.category) {
      case 'event':
        return post.eventDetails ? (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-blue-900 dark:text-blue-100">
                {post.eventDetails.title}
              </span>
            </div>
            <div className="text-sm space-y-1">
              <p><strong>Date:</strong> {new Date(post.eventDetails.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {post.eventDetails.time}</p>
              <p><strong>Venue:</strong> {post.eventDetails.venue}</p>
              {post.eventDetails.description && (
                <p><strong>Description:</strong> {post.eventDetails.description}</p>
              )}
              {post.eventDetails.registrationLink && (
                <a 
                  href={post.eventDetails.registrationLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 mt-2"
                >
                  Register Now <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        ) : null

      case 'location':
        return post.locationDetails ? (
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-600" />
              <span className="font-semibold text-green-900 dark:text-green-100">
                {post.locationDetails.placeName}
              </span>
            </div>
            {post.locationDetails.address && (
              <p className="text-sm mt-1 text-green-700 dark:text-green-300">
                {post.locationDetails.address}
              </p>
            )}
          </div>
        ) : null

      case 'feeling':
        return post.feeling ? (
          <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2">
              <Smile className="h-4 w-4 text-yellow-600" />
              <span className="font-semibold text-yellow-900 dark:text-yellow-100">
                Feeling {post.feeling}
              </span>
            </div>
          </div>
        ) : null

      default:
        return null
    }
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={post.author.profileUrl} />
            <AvatarFallback className="bg-primary text-white">
              {post.author.firstName[0]}{post.author.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {post.author.firstName} {post.author.lastName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {post.author.role} at {post.author.universityName}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </p>
                  {getCategoryIcon() && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      {getCategoryIcon()}
                      <span className="capitalize">{post.category}</span>
                    </div>
                  )}
                </div>
              </div>
              {isOwner && showActions && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit?.(post)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="mb-3 text-gray-900 dark:text-white whitespace-pre-wrap">
            {post.content}
          </p>

          {/* Post Image */}
          {post.category === 'photo' && post.imageUrl && (
            <div className="rounded-lg overflow-hidden mb-3">
              <img 
                src={post.imageUrl} 
                alt="Post image" 
                className="w-full max-h-96 object-cover"
              />
            </div>
          )}

          {/* Category specific content */}
          {getCategoryInfo()}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 ${isLiked ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}`}
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              {likeCount}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-gray-600 dark:text-gray-400"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-4 w-4" />
              {comments.length}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-gray-600 dark:text-gray-400"
            >
              <Share className="h-4 w-4" />
              {post.shareCount || 0}
            </Button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t dark:border-gray-700">
            {/* Add Comment */}
            {currentUserId && (
              <div className="flex gap-3 mb-4">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-white text-xs">
                    U
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Textarea
                    value={newComment}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    rows={2}
                    className="resize-none"
                  />
                  <Button
                    onClick={handleComment}
                    disabled={!newComment.trim() || isCommenting}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Comments List */}
            {comments.length > 0 && (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment._id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.user.profileUrl} />
                      <AvatarFallback className="bg-primary text-white text-xs">
                        {comment.user.firstName[0]}{comment.user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {comment.user.firstName} {comment.user.lastName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}