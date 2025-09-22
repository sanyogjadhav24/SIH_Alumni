import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import ProtectedRoute from '../components/ProtectedRoute'
import {AuthProvider} from './hooks/useAuth';


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AlumniConnect - Professional Alumni Network',
  description: 'Connect with your alumni community, find mentors, and advance your career',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <AuthProvider>
          {children}
          </AuthProvider>
        </Providers>
        
      </body>
    </html>
  )
}