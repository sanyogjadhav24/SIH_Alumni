'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { Send, Users } from 'lucide-react'

interface Connection {
  _id: string
  firstName: string
  lastName: string
  universityName: string
  role: string
  profileUrl?: string
}

interface SharePostProps {
  isOpen: boolean
  onClose: () => void
  postId: string
  postContent: string
  onShareSuccess?: () => void
}

export default function SharePost({ isOpen, onClose, postId, postContent, onShareSuccess }: SharePostProps) {
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedConnections, setSelectedConnections] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingConnections, setIsLoadingConnections] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchConnections()
    }
  }, [isOpen])

  const fetchConnections = async () => {
    try {
      setIsLoadingConnections(true)
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:4000/api/users/connections', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        setConnections(data.connections || [])
      } else {
        toast.error('Failed to load connections')
      }
    } catch (error) {
      console.error('Error fetching connections:', error)
      toast.error('Failed to load connections')
    } finally {
      setIsLoadingConnections(false)
    }
  }

  const handleConnectionToggle = (connectionId: string) => {
    setSelectedConnections(prev => 
      prev.includes(connectionId) 
        ? prev.filter(id => id !== connectionId)
        : [...prev, connectionId]
    )
  }

  const handleSelectAll = () => {
    if (selectedConnections.length === connections.length) {
      setSelectedConnections([])
    } else {
      setSelectedConnections(connections.map(conn => conn._id))
    }
  }

  const handleShare = async () => {
    if (selectedConnections.length === 0) {
      toast.error('Please select at least one connection to share with')
      return
    }

    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:4000/api/posts/${postId}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          connectionIds: selectedConnections,
          message: message.trim()
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        onShareSuccess?.()
        onClose()
        // Reset form
        setSelectedConnections([])
        setMessage('')
      } else {
        toast.error(data.error || 'Failed to share post')
      }
    } catch (error) {
      console.error('Error sharing post:', error)
      toast.error('Failed to share post')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Share Post
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Post Preview */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Sharing:</p>
            <p className="text-sm line-clamp-3">{postContent}</p>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium mb-2">Add a message (optional)</label>
            <Textarea
              placeholder="Write something about why you're sharing this..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{message.length}/500</p>
          </div>

          {/* Connections List */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium">Share with connections</label>
              {connections.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-xs"
                >
                  {selectedConnections.length === connections.length ? 'Deselect All' : 'Select All'}
                </Button>
              )}
            </div>

            {isLoadingConnections ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2 text-gray-500">
                  <Users className="h-4 w-4 animate-spin" />
                  Loading connections...
                </div>
              </div>
            ) : connections.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No connections found</p>
                  <p className="text-sm">Connect with alumni to share posts</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto border rounded-lg p-2 space-y-2">
                {connections.map((connection) => (
                  <div
                    key={connection._id}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer"
                    onClick={() => handleConnectionToggle(connection._id)}
                  >
                    <Checkbox
                      checked={selectedConnections.includes(connection._id)}
                      onChange={() => handleConnectionToggle(connection._id)}
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={connection.profileUrl} />
                      <AvatarFallback>
                        {connection.firstName[0]}{connection.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {connection.firstName} {connection.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {connection.role} at {connection.universityName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleShare} 
              disabled={isLoading || selectedConnections.length === 0}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <Send className="h-4 w-4 mr-2 animate-pulse" />
                  Sharing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Share ({selectedConnections.length})
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}