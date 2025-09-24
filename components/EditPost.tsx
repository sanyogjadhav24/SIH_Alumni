'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  X, 
  Plus,
  Calendar,
  MapPin,
  Smile,
  Image as ImageIcon
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
  likes: any[]
  comments: any[]
  likeCount: number
  commentCount: number
  shareCount: number
  createdAt: string
  updatedAt: string
}

interface EditPostProps {
  post: Post
  isOpen: boolean
  onClose: () => void
  onPostUpdated: (updatedPost: Post) => void
}

export default function EditPost({ post, isOpen, onClose, onPostUpdated }: EditPostProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  // Form state
  const [content, setContent] = useState(post.content)
  const [tags, setTags] = useState<string[]>(post.tags || [])
  const [newTag, setNewTag] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>(post.imageUrl || '')
  
  // Event specific fields
  const [eventTitle, setEventTitle] = useState(post.eventDetails?.title || '')
  const [eventDate, setEventDate] = useState(post.eventDetails?.date || '')
  const [eventTime, setEventTime] = useState(post.eventDetails?.time || '')
  const [eventVenue, setEventVenue] = useState(post.eventDetails?.venue || '')
  const [eventDescription, setEventDescription] = useState(post.eventDetails?.description || '')
  const [registrationLink, setRegistrationLink] = useState(post.eventDetails?.registrationLink || '')
  
  // Location specific fields
  const [placeName, setPlaceName] = useState(post.locationDetails?.placeName || '')
  const [address, setAddress] = useState(post.locationDetails?.address || '')
  
  // Feeling specific fields
  const [feeling, setFeeling] = useState(post.feeling || '')

  const feelings = [
    'excited', 'grateful', 'proud', 'motivated', 
    'happy', 'nostalgic', 'inspired', 'accomplished'
  ]

  // Reset form when post changes
  useEffect(() => {
    if (post) {
      setContent(post.content)
      setTags(post.tags || [])
      setImagePreview(post.imageUrl || '')
      setEventTitle(post.eventDetails?.title || '')
      setEventDate(post.eventDetails?.date || '')
      setEventTime(post.eventDetails?.time || '')
      setEventVenue(post.eventDetails?.venue || '')
      setEventDescription(post.eventDetails?.description || '')
      setRegistrationLink(post.eventDetails?.registrationLink || '')
      setPlaceName(post.locationDetails?.placeName || '')
      setAddress(post.locationDetails?.address || '')
      setFeeling(post.feeling || '')
    }
  }, [post])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB')
        return
      }
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim().toLowerCase())) {
      setTags([...tags, newTag.trim().toLowerCase()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) {
      toast.error('Please enter some content for your post')
      return
    }

    // Category specific validations
    if (post.category === 'event') {
      if (!eventTitle || !eventDate || !eventTime || !eventVenue) {
        toast.error('Please fill in all required event details')
        return
      }
    }

    if (post.category === 'location' && !placeName) {
      toast.error('Please enter a place name for location posts')
      return
    }

    if (post.category === 'feeling' && !feeling) {
      toast.error('Please select a feeling for feeling posts')
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('content', content)
      formData.append('tags', JSON.stringify(tags))

      // Add image if selected (for photo posts)
      if (post.category === 'photo' && selectedImage) {
        formData.append('image', selectedImage)
      }

      // Add category-specific data
      if (post.category === 'event') {
        formData.append('eventDetails', JSON.stringify({
          title: eventTitle,
          date: eventDate,
          time: eventTime,
          venue: eventVenue,
          description: eventDescription,
          registrationLink: registrationLink
        }))
      }

      if (post.category === 'location') {
        formData.append('locationDetails', JSON.stringify({
          placeName,
          address
        }))
      }

      if (post.category === 'feeling') {
        formData.append('feeling', feeling)
      }

      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:4000/api/posts/${post._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Post updated successfully!')
        onPostUpdated(data.post)
        onClose()
      } else {
        toast.error(data.error || 'Failed to update post')
      }
    } catch (error) {
      console.error('Error updating post:', error)
      toast.error('Failed to update post. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryIcon = () => {
    switch (post.category) {
      case 'photo':
        return <ImageIcon className="h-5 w-5 text-primary" />
      case 'event':
        return <Calendar className="h-5 w-5 text-primary" />
      case 'location':
        return <MapPin className="h-5 w-5 text-primary" />
      case 'feeling':
        return <Smile className="h-5 w-5 text-primary" />
      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getCategoryIcon()}
            Edit {post.category.charAt(0).toUpperCase() + post.category.slice(1)} Post
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content */}
          <div>
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
              className="mt-1"
              required
            />
          </div>

          {/* Category Specific Fields */}
          {post.category === 'photo' && (
            <div>
              <Label htmlFor="image">Update Image</Label>
              <div className="mt-1">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mb-2"
                />
                {imagePreview && (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full max-h-64 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedImage(null)
                        setImagePreview('')
                      }}
                      className="absolute top-2 right-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {post.category === 'event' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eventTitle">Event Title *</Label>
                  <Input
                    id="eventTitle"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="Enter event title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="eventVenue">Venue *</Label>
                  <Input
                    id="eventVenue"
                    value={eventVenue}
                    onChange={(e) => setEventVenue(e.target.value)}
                    placeholder="Enter venue"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eventDate">Date *</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="eventTime">Time *</Label>
                  <Input
                    id="eventTime"
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="eventDescription">Description</Label>
                <Textarea
                  id="eventDescription"
                  value={eventDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEventDescription(e.target.value)}
                  placeholder="Event description"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="registrationLink">Registration Link</Label>
                <Input
                  id="registrationLink"
                  type="url"
                  value={registrationLink}
                  onChange={(e) => setRegistrationLink(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          )}

          {post.category === 'location' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="placeName">Place Name *</Label>
                <Input
                  id="placeName"
                  value={placeName}
                  onChange={(e) => setPlaceName(e.target.value)}
                  placeholder="Enter place name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter full address"
                />
              </div>
            </div>
          )}

          {post.category === 'feeling' && (
            <div>
              <Label htmlFor="feeling">How are you feeling? *</Label>
              <Select value={feeling} onValueChange={setFeeling} required>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a feeling" />
                </SelectTrigger>
                <SelectContent>
                  {feelings.map((feel) => (
                    <SelectItem key={feel} value={feel}>
                      {feel.charAt(0).toUpperCase() + feel.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags</Label>
            <div className="mt-1 space-y-2">
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a tag"
                />
                <Button type="button" onClick={addTag} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      #{tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Post'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}