"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { ErrorMessage } from '@/components/ui/error-message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function LoginPageToken() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, signUp, signInWithGoogle } = useAuth()

  // Handle URL error and message parameters
  useEffect(() => {
    const urlError = searchParams.get('error')
    const urlMessage = searchParams.get('message')

    if (urlError) {
      switch (urlError) {
        case 'auth_callback_failed':
          setError('Authentication failed. Please try again.')
          break
        case 'no_session':
          setError('Sign-in was not completed. Please try again.')
          break
        case 'callback_error':
          setError('An error occurred during sign-in. Please try again.')
          break
        default:
          setError('An error occurred. Please try again.')
      }
    } else if (urlMessage) {
      // Handle logout messages (these are informational, not errors)
      switch (urlMessage) {
        case 'logged_out':
          // Don't set as error - this is a successful logout
          console.log('Successfully logged out')
          break
        case 'session_expired':
          setError('Your session has expired. Please sign in again.')
          break
        case 'session_invalid':
          setError('Your session is invalid. Please sign in again.')
          break
        case 'invalid_session':
          setError('Invalid session detected. Please sign in again.')
          break
        case 'no_session':
          setError('Please sign in to continue.')
          break
        case 'signed_out':
          // Don't set as error - this is a successful sign out
          console.log('Successfully signed out')
          break
        case 'already_logged_out':
          // Don't set as error - user was already logged out
          console.log('User was already logged out')
          break
        case 'logout_error':
          setError('There was an error during logout, but you have been signed out.')
          break
        case 'force_logout':
          setError('You have been forcefully logged out due to session issues.')
          break
        default:
          console.log('Unknown message:', urlMessage)
      }
    }
  }, [searchParams])

  const handleSignIn = async () => {
    setLoading(true)
    setError(null)

    const { error } = await signIn(email, password)

    if (error) {
      setError(error.message)
    } else {
      router.push('/')
    }

    setLoading(false)
  }

  const handleSignUp = async () => {
    setLoading(true)
    setError(null)

    const { error } = await signUp(email, password)

    if (error) {
      setError(error.message)
    } else {
      router.push('/')
    }

    setLoading(false)
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError(null)

    const { error } = await signInWithGoogle()

    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
    // Note: If successful, user will be redirected to Google, so we don't set loading to false
  }

  const isLoading = loading || googleLoading

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your coaching account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <ErrorMessage message={error} />}

          {/* Google Sign In Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full"
          >
            {googleLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                Signing in with Google...
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </div>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <div className="space-y-3">
            <div>
              <Input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div>
              <Input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            <Button
              type="button"
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleSignUp}
              disabled={isLoading}
              className="w-full"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}