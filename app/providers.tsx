'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { useState } from 'react'
import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute from '../components/ProtectedRoute'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
        <AuthProvider>
          {/* <ProtectedRoute> */}
          {children}
          {/* </ProtectedRoute> */}
        </AuthProvider>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </ThemeProvider>
     
    </QueryClientProvider>
  )
}