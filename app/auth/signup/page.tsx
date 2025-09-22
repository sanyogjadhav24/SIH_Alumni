'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { GraduationCap, User, Mail, Lock, Building, Phone } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const { signup } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [documentError, setDocumentError] = useState<string | null>(null)

  // files
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [profileFile, setProfileFile] = useState<File | null>(null) // optional

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    universityName: '',
    role: 'student',
    contactNumber: '',
    graduationYear: '',
    major: ''
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setDocumentError(null)

    try {
      // Manual document validation
      if (!documentFile) {
        setDocumentError("Please upload a document file.")
        setLoading(false)
        return
      }

      // Password validation
      if (formData.password && formData.password.length < 5) {
        setError("Password should be at least 5 characters")
        setLoading(false)
        return
      }

      // Graduation year validation
      if (!formData.graduationYear) {
        setError("Please select your graduation year")
        setLoading(false)
        return
      }

      // Role validation
      if (!formData.role) {
        setError("Please select a role")
        setLoading(false)
        return
      }

      // Prepare FormData
      const formPayload = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        formPayload.append(key, value as string)
      })
      formPayload.append("documentFile", documentFile)
      formPayload.append("profileUrl", profileFile || "")

      // Call signup
      await signup(formPayload)

      // Redirect on success
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Signup failed")
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors">
            <GraduationCap className="h-8 w-8" />
            <span className="text-2xl font-bold">AlumniNet</span>
          </Link>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Join AlumniNet</CardTitle>
            <CardDescription>Connect with your alumni community</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* First + Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      placeholder="First name"
                      className="pl-10"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    className="pl-10"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* University */}
              <div className="space-y-2">
                <Label htmlFor="universityName">University</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="universityName"
                    placeholder="Your university"
                    className="pl-10"
                    value={formData.universityName}
                    onChange={(e) => setFormData({ ...formData, universityName: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="alumni">Alumni</SelectItem>
                    <SelectItem value="employer">Employer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Contact Number */}
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="contactNumber"
                    type="tel"
                    required
                    placeholder="Enter your contact number"
                    className="pl-10"
                    value={formData.contactNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setFormData({ ...formData, contactNumber: val });
                    }}
                    pattern="\d{10}"
                    maxLength={10}
                  />
                </div>
              </div>

              {/* Document Upload */}
              <div className="space-y-2">
                <Label htmlFor="documentLink">Upload Document (Marksheet)</Label>
                <div className="flex items-center border rounded overflow-hidden">
                  <label
                    htmlFor="documentLink"
                    className="cursor-pointer bg-gray-600 text-white px-4 py-2 hover:bg-gray-700 transition-colors"
                  >
                    Choose File
                  </label>
                  <div className="w-px h-6 bg-gray-400/50"></div>
                  <span className="pl-4 text-gray-600 text-sm truncate">
                    {documentFile ? documentFile.name : "No file chosen"}
                  </span>
                </div>
                <Input
                  id="documentLink"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setDocumentFile(e.target.files[0])
                      setDocumentError(null)
                    }
                  }}
                />
                {documentError && <p className="text-sm text-red-500">{documentError}</p>}
              </div>

              {/* Profile Picture Upload (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="profileUrl">Upload Profile Picture (optional)</Label>
                <div className="flex items-center border rounded overflow-hidden">
                  <label
                    htmlFor="profileUrl"
                    className="cursor-pointer bg-gray-600 text-white px-4 py-2 hover:bg-gray-700 transition-colors"
                  >
                    Choose File
                  </label>
                  <div className="w-px h-6 bg-gray-400/50"></div>
                  <span className="pl-4 text-gray-600 text-sm truncate">
                    {profileFile ? profileFile.name : "No file chosen"}
                  </span>
                </div>
                <Input
                  id="profileUrl"
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setProfileFile(e.target.files[0])
                    }
                  }}
                />
              </div>

              {/* Graduation Year + Major */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graduation Year</Label>
                  <Select
                    onValueChange={(value) => setFormData({ ...formData, graduationYear: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 30 }, (_, i) => 2024 - i).map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="major">Major</Label>
                  <Input
                    id="major"
                    placeholder="Your major"
                    value={formData.major}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && <p className="text-sm text-red-500">{error}</p>}

              {/* Divider */}
              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="mx-2 text-sm text-gray-500">or continue with</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              {/* Social Logo Buttons */}
              <div className="flex gap-4 justify-center">
                <button
                  type="button"
                  // onClick={() => signIn("google", { callbackUrl: "/auth/complete-profile" })}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition"
                >
                  <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition"
                >
                  <img src="/LinkedIn_icon.svg.png" alt="LinkedIn" className="w-5 h-5" />
                </button>
              </div>

              {/* Submit */}
              <Button type="submit" className="w-full bg-gradient-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Account'}
              </Button>

              <p className="text-center text-sm mt-4">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-primary hover:underline font-medium">
                  Login
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
