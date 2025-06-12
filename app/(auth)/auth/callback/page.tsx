'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTokenClient } from '@/lib/supabase/client-token'
import { authStorage } from '@/lib/auth/storage'

export default function AuthCallback() {
  const router = useRouter()
  const [debugInfo, setDebugInfo] = useState<string>('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createTokenClient()

      try {
        setDebugInfo('Starting OAuth callback handling...')

        // Check URL for OAuth parameters
        const urlParams = new URLSearchParams(window.location.search)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))

        setDebugInfo(prev => prev + `\nURL Search: ${window.location.search}`)
        setDebugInfo(prev => prev + `\nURL Hash: ${window.location.hash}`)

        // Check for errors
        const error = urlParams.get('error') || hashParams.get('error')
        if (error) {
          const errorDescription = urlParams.get('error_description') || hashParams.get('error_description')
          console.error('OAuth error:', error, errorDescription)
          router.push(`/login?error=${encodeURIComponent(errorDescription || error)}`)
          return
        }

        // Check if we have access_token in hash (typical for OAuth)
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        if (accessToken) {
          setDebugInfo(prev => prev + '\nFound access token in URL hash')

          // Let Supabase process the session from URL
          const { data, error: sessionError } = await supabase.auth.getSession()

          if (sessionError) {
            console.error('Session error:', sessionError)
            setDebugInfo(prev => prev + `\nSession error: ${sessionError.message}`)
            router.push('/login?error=session_error')
            return
          }

          if (data.session) {
            setDebugInfo(prev => prev + `\nSession found for: ${data.session.user.email}`)
            console.log('OAuth successful, storing session for:', data.session.user.email)

            // Store the session
            authStorage.setTokens(data.session)

            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname)

            // Redirect to main app
            router.push('/')
            return
          }
        }

        // If no immediate session, wait for auth state change
        setDebugInfo(prev => prev + '\nWaiting for auth state change...')

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          setDebugInfo(prev => prev + `\nAuth event: ${event}`)

          if (event === 'SIGNED_IN' && session) {
            setDebugInfo(prev => prev + `\nSigned in: ${session.user.email}`)
            console.log('Auth state change: SIGNED_IN for', session.user.email)

            // Store the session
            authStorage.setTokens(session)

            // Clean up subscription
            subscription.unsubscribe()

            // Redirect to main app
            router.push('/')
          } else if (event === 'SIGNED_OUT') {
            setDebugInfo(prev => prev + '\nSigned out event received')
            router.push('/login?error=signed_out')
          }
        })

        // Timeout after 10 seconds
        setTimeout(() => {
          subscription.unsubscribe()
          setDebugInfo(prev => prev + '\nTimeout reached, redirecting to login')
          router.push('/login?error=timeout')
        }, 10000)

      } catch (error) {
        console.error('Auth callback error:', error)
        setDebugInfo(prev => prev + `\nError: ${error}`)
        router.push('/login?error=callback_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center max-w-md">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 mb-4">Completing sign in...</p>

        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-left bg-gray-100 p-3 rounded text-xs">
            <pre className="whitespace-pre-wrap">{debugInfo}</pre>
          </div>
        )}
      </div>
    </div>
  )
}