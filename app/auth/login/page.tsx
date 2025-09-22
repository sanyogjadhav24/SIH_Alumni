'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Separator } from '../../../components/ui/separator'
import { useAuth } from '../../hooks/useAuth'
import { GraduationCap, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth() // use login from AuthContext

  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const data = await login(formData.email, formData.password)

      if (data && data.user) {
        // Successful login, redirect based on role
        if (data.user.role === 'admin') {
          router.push('/dashboard/admin-users')
        } else {
          router.push('/dashboard')
        }
      } else {
        // If backend returns error
        if (data && (data.status === 403 || /verification|pending/i.test(data.message || ''))) {
          // Throw a specific error message so UI can detect verification pending state
          const msg = data.message || 'Account pending verification. Please complete verification.'
          const err: any = new Error(msg)
          // attach a flag so UI can show a button to go to verification
          err.verificationPending = true
          throw err
        }
        throw new Error(data.message || 'Invalid credentials')
      }
    } catch (err: any) {
      setError(err.message)
      // set a local flag if the error indicates verification pending
      if (err && err.verificationPending) {
        // store as a special string so rendering can show the button
        setError(err.message + '::verificationPending')
      }
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
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your alumni network account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
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
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="space-y-2">
                  <p className="text-sm text-red-500">{error.replace('::verificationPending','')}</p>
                  {/* If error contains our verificationPending marker, show button to go to verify-public */}
                  {error.includes('::verificationPending') && (
                    <div className="pt-1">
                      <Button variant="ghost" onClick={() => router.push('/verify-public')} className="w-full border border-dashed">
                        Complete verification
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Submit */}
              <Button type="submit" className="w-full bg-gradient-primary" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="w-full">Google</Button>
              <Button variant="outline" className="w-full">LinkedIn</Button>
            </div>

            <div className="text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
