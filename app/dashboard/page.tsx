'use client'
import { useAuth } from '../hooks/useAuth'
import { useRouter,useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Badge } from "../../components/ui/badge"
import { Heart, MessageCircle, Share, MoreHorizontal, Image as ImageIcon, Calendar, MapPin, Users, Smile } from "lucide-react"


export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter()
  const [walletAddr, setWalletAddr] = useState<string | null>(null)

  const handleConnectWallet = async () => {
    if (!(window as any).ethereum) {
      alert('No web3 wallet found')
      return
    }
    try {
      const provider = new (await import('ethers')).providers.Web3Provider((window as any).ethereum)
      await provider.send('eth_requestAccounts', [])
      const signer = provider.getSigner()
      const address = await signer.getAddress()
      setWalletAddr(address)

      const token = localStorage.getItem('token')
      const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000')
      await fetch(`${base}/api/users/set-wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ walletAddress: address }),
      })
      // best effort: we don't refresh auth context here; a manual refresh will show updated state
    } catch (e) {
      console.error(e)
      alert('Wallet connection failed')
    }
  }

  // verification state for alumni upload
  const [docFile, setDocFile] = useState<File | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null)

  const handleVerifyUpload = async () => {
    setVerifyMessage(null)
    if (!docFile) return alert('Please choose a document file to upload')
    const walletToUse = walletAddr || user?.walletAddress
    if (!walletToUse) return alert('Please connect your wallet first')

    setVerifying(true)
    try {
      const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000')
      const form = new FormData()
      form.append('documentFile', docFile)
      form.append('walletAddress', walletToUse)

      const res = await fetch(`${base}/api/users/verify-document`, {
        method: 'POST',
        body: form,
      })

      const json = await res.json()
      if (!res.ok) {
        setVerifyMessage(json.message || 'Verification failed')
      } else {
        if (json.verified) {
          setVerifyMessage('Verified — congratulations!')
          // refresh the page/auth to pick up updated isVerified flag
          setTimeout(()=> window.location.reload(), 800)
        } else {
          setVerifyMessage('Not found in admin dataset')
        }
      }
    } catch (e) {
      console.error(e)
      setVerifyMessage('Server error during verification')
    } finally {
      setVerifying(false)
    }
  }

  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("token", token);  // Save token
      router.replace("/dashboard");          // Clean URL (remove ?token=)
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
    // If logged in and admin, go to admin users dashboard
    if (!loading && user && user.role === 'admin') {
      router.push('/dashboard/admin-users');
    }
  }, [loading, user, router])

  if (loading || !user) return null; 

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>
  }
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-primary to-primary/90 text-white border-0">
        <CardContent className="p-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to AlmaConnect</h1>
          <h1 className="text-3xl font-bold mb-2">Welcome {user?.firstName} 👋</h1>
          <p className="text-primary-foreground/80 text-lg mb-4">
            Your professional alumni network where stories inspire careers and
            connections create opportunities.
          </p>
          <Button
            variant="secondary"
            className="bg-white text-primary hover:bg-gray-50"
          >
            Connect Share Grow Succeed
          </Button>
          <div className="mt-4 space-x-2">
            {user.role === 'admin' ? (
              <Button onClick={() => router.push('/dashboard/admin-users')} className="bg-indigo-600 text-white">
                Admin Dashboard
              </Button>
              ) : (
              <>
                {/* For students/alumni show wallet connect + verified badge */}
                <div className="flex items-center gap-3">
                  <button onClick={handleConnectWallet} className="px-4 py-2 bg-green-600 text-white rounded">{walletAddr ? `Connected: ${walletAddr}` : 'Connect Wallet'}</button>
                  <span className="ml-3">{user.isVerified ? <span className="inline-block bg-emerald-100 text-emerald-800 px-2 py-1 rounded">Verified Alumni</span> : <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Pending Verification</span>}</span>
                </div>

                {/* Document upload & verify (alumni) */}
                {!user.isVerified && (
                  <div className="mt-3">
                    <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(e)=> setDocFile(e.target.files?.[0] || null)} />
                    <button onClick={handleVerifyUpload} disabled={verifying} className="ml-3 px-3 py-2 bg-blue-600 text-white rounded">{verifying ? 'Verifying...' : 'Upload & Verify'}</button>
                    {verifyMessage && <div className="mt-2 text-sm text-gray-700">{verifyMessage}</div>}
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Post */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-white">
                {user?.firstName[0]}{user?.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
                <p className="text-gray-500 dark:text-gray-400">
                  Share your thoughts, achievements, or career updates with the
                  AlmaConnect community...
                </p>
              </div>
              <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Photo
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Event
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Smile className="h-4 w-4" />
                  Feeling
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Post */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-start gap-3 mb-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-white">
                {user.firstName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                   {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user?.role} at {user?.universityName.toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    2 hours ago
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className="mb-4 text-gray-900 dark:text-white">
              Excited to share that I&apos;ve been promoted to Senior Software
              Engineer! The journey from our college days to here has been
              incredible. Special thanks to the AlmaConnect community for all
              the mentoring and support. Looking forward to giving back to our
              amazing network! 🚀
            </p>

            {/* Post Image */}
            <div className="rounded-lg overflow-hidden bg-gradient-to-br from-primary/80 to-cyan-400 h-64 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8" />
                </div>
                <p className="text-lg font-medium">Team Collaboration</p>
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <Badge variant="secondary">#career</Badge>
              <Badge variant="secondary">#promotion</Badge>
              <Badge variant="secondary">#google</Badge>
              <Badge variant="secondary">#grateful</Badge>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-gray-600 dark:text-gray-400"
              >
                <Heart className="h-4 w-4" />
                42
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-gray-600 dark:text-gray-400"
              >
                <MessageCircle className="h-4 w-4" />8
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-gray-600 dark:text-gray-400"
              >
                <Share className="h-4 w-4" />3
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
