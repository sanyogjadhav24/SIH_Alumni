'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"
import {useAuth} from "../../../hooks/useAuth";

export default function CreateEventPage() {
  const router = useRouter()
  const { user } = useAuth()

  // Form state
  const [posterFile, setPosterFile] = useState<File | null>(null) // optional
  const [posterPreview, setPosterPreview] = useState<string | null>(null)
  const [mode, setMode] = useState<"offline" | "online" | "">("")
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [venue, setVenue] = useState("")
  const [donationAccepted, setDonationAccepted] = useState<boolean>(false) // ✅ new field
  const [description, setDescription] = useState("") // ✅ new field
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const API_URL = "http://localhost:4000/api/events";

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPosterFile(file)
      setPosterPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!title || !date || !mode || !description) {
        setError("Please fill all required fields")
        setLoading(false)
        return
      }
      if (mode === "offline" && !venue) {
        setError("Venue is required for offline events")
        setLoading(false)
        return
      }

      const formData = new FormData()
      formData.append("title", title)
      formData.append("date", date)
      formData.append("mode", mode)
      formData.append("description", description)
      formData.append("donationAccepted", String(donationAccepted)) // ✅ send as string
      formData.append("createdBy", user.id)
      formData.append("registeredUsers", JSON.stringify([]));

      if (mode === "offline") formData.append("venue", venue)
      if (posterFile) formData.append("poster", posterFile)

      const res = await fetch(`${API_URL}/create`, {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to create event")

      alert("Event created successfully")
      router.push("/dashboard/events") // redirect to events list
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Event</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>

            {/* Poster */}
            <div className="flex flex-col items-center space-y-2">
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {posterPreview ? (
                    <img src={posterPreview} alt="Poster" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm text-gray-500">No Poster</span>
                  )}
                </div>
                <input type="file" id="poster" accept="image/*" className="hidden" onChange={handlePosterChange} />
              </div>
              <label htmlFor="poster" className="flex items-center gap-1 text-sm text-primary cursor-pointer hover:underline">
                <Upload className="h-4 w-4" /> Upload Poster (Optional)
              </label>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input id="title" placeholder="Event Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            {/* Date */}
            <div>
              <Label htmlFor="date">Event Date *</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>

            {/* Mode */}
            <div>
              <Label>Mode *</Label>
              <select className="border rounded p-2 w-full" value={mode} onChange={(e) => setMode(e.target.value as "offline" | "online")} required>
                <option value="">Select mode</option>
                <option value="offline">Offline</option>
                <option value="online">Online</option>
              </select>
            </div>

            {/* Venue */}
            {mode === "offline" && (
              <div>
                <Label htmlFor="venue">Venue *</Label>
                <Input id="venue" placeholder="Event Venue" value={venue} onChange={(e) => setVenue(e.target.value)} required />
              </div>
            )}

            {/* Donation Accepted */}
            <div>
              <Label>Accept Donations? *</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="donationAccepted"
                    value="true"
                    checked={donationAccepted === true}
                    onChange={() => setDonationAccepted(true)}
                  />
                  Yes
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="donationAccepted"
                    value="false"
                    checked={donationAccepted === false}
                    onChange={() => setDonationAccepted(false)}
                  />
                  No
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                className="w-full border rounded p-2"
                rows={3}
                placeholder="Event description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={loading}>
              {loading ? "Creating..." : "Create Event"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
