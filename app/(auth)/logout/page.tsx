"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { authStorage } from '@/lib/auth/storage'
import { createTokenClient } from '@/lib/supabase/client-token'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type LogoutState = 'checking' | 'signing_out' | 'completed' | 'error'

export default function LogoutPage() {
  const [state, setState] = useState<LogoutState>('checking')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { signOut, user, session } = useAuth()

  useEffect(() => {
    const handleLogout = async () => {
      try {
        setState('checking')

        // Check if there's an active session
        const storedTokens = authStorage.getTokens()
        const hasStoredTokens = storedTokens.access_token || storedTokens.refresh_token

        // If no user context and no stored tokens, redirect immediately
        if (!user && !session && !hasStoredTokens) {
          console.log('No active session detected, redirecting to login')
          router.replace('/login?message=already_logged_out')
          return
        }

        // Check if stored token is expired
        if (storedTokens.access_token) {
          try {
            const tokenPayload = JSON.parse(atob(storedTokens.access_token.split('.')[1]))
            const currentTime = Math.floor(Date.now() / 1000)

            if (tokenPayload.exp && tokenPayload.exp < currentTime) {
              console.log('Token expired, clearing stale session')
              authStorage.clearTokens()
              router.replace('/login?message=session_expired')
              return
            }
          } catch (tokenError) {
            console.warn('Failed to parse token, treating as invalid:', tokenError)
            authStorage.clearTokens()
            router.replace('/login?message=invalid_session')
            return
          }
        }

        // Validate session with Supabase
        const supabase = createTokenClient()
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !currentSession) {
          console.log('No valid Supabase session, clearing tokens')
          authStorage.clearTokens()
          router.replace('/login?message=session_invalid')
          return
        }

        // Perform actual logout
        setState('signing_out')
        console.log('Signing out user:', user?.email || 'unknown')

        await signOut()

        setState('completed')

        // Redirect after a brief delay to show completion state
        setTimeout(() => {
          router.replace('/login?message=logged_out')
        }, 1500)

      } catch (error) {
        console.error('Logout error:', error)
        setError(error instanceof Error ? error.message : 'An unexpected error occurred')
        setState('error')

        // Even on error, clear tokens and redirect after delay
        authStorage.clearTokens()
        setTimeout(() => {
          router.replace('/login?message=logout_error')
        }, 3000)
      }
    }

    handleLogout()
  }, [signOut, user, session, router])

  const handleRetryLogout = async () => {
    setError(null)
    setState('checking')
    // The useEffect will trigger again
  }

  const handleForceRedirect = () => {
    authStorage.clearTokens()
    router.replace('/login?message=force_logout')
  }

  const renderContent = () => {
    switch (state) {
      case 'checking':
        return (
          <>
            <CardHeader className="text-center">
              <CardTitle>Checking Session</CardTitle>
              <CardDescription>
                Verifying your current session...
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="text-sm text-muted-foreground">Checking authentication status</span>
              </div>
            </CardContent>
          </>
        )

      case 'signing_out':
        return (
          <>
            <CardHeader className="text-center">
              <CardTitle>Signing Out</CardTitle>
              <CardDescription>
                Securely ending your session...
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="text-sm text-muted-foreground">Clearing session data</span>
              </div>
            </CardContent>
          </>
        )

      case 'completed':
        return (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-green-600">Signed Out Successfully</CardTitle>
              <CardDescription>
                You have been securely logged out
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="rounded-full h-6 w-6 bg-green-100 flex items-center justify-center">
                  <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-muted-foreground">Redirecting to login...</span>
              </div>
            </CardContent>
          </>
        )

      case 'error':
        return (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-red-600">Logout Error</CardTitle>
              <CardDescription>
                There was a problem signing you out
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              <div className="flex flex-col space-y-2">
                <Button onClick={handleRetryLogout} variant="outline">
                  Try Again
                </Button>
                <Button onClick={handleForceRedirect} variant="destructive" size="sm">
                  Force Logout & Redirect
                </Button>
              </div>
            </CardContent>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        {renderContent()}
      </Card>
    </div>
  )
}