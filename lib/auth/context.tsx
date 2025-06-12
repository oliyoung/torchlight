'use client'

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { createTokenClient } from '@/lib/supabase/client-token'
import { authStorage } from '@/lib/auth/storage'

/**
 * Authentication context interface providing user state and auth methods.
 */
interface AuthContextType {
  /** Current authenticated user or null */
  user: User | null
  /** Current session with tokens or null */
  session: Session | null
  /** Loading state during auth operations */
  loading: boolean
  /** Sign in with email and password */
  signIn: (email: string, password: string) => Promise<{ error: any }>
  /** Sign up with email and password */
  signUp: (email: string, password: string) => Promise<{ error: any }>
  /** Sign out and clear tokens */
  signOut: () => Promise<void>
  /** Get current access token for API calls */
  getAccessToken: () => string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Custom hook to access authentication context.
 * Must be used within an AuthProvider component.
 *
 * @returns Authentication context with user state and auth methods
 * @throws Error if used outside of AuthProvider
 * @example
 * ```typescript
 * const { user, signIn, signOut, loading } = useAuth()
 *
 * if (loading) return <div>Loading...</div>
 * if (!user) return <LoginForm />
 *
 * return <UserDashboard user={user} onSignOut={signOut} />
 * ```
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

/**
 * Authentication provider component that manages auth state and provides
 * authentication methods to child components via React context.
 *
 * @param props - Component props
 * @param props.children - Child components that will have access to auth context
 * @example
 * ```typescript
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = useMemo(() => createTokenClient(), [])

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        // Clear any stored tokens if session is invalid
        authStorage.clearTokens()
        setSession(null)
        setUser(null)
      } else {
        // Check if token is expired
        const currentTime = Math.floor(Date.now() / 1000)
        if (session.expires_at && session.expires_at < currentTime) {
          console.warn('Session has expired, clearing tokens')
          authStorage.clearTokens()
          setSession(null)
          setUser(null)
        } else {
          setSession(session)
          setUser(session.user)
          authStorage.setTokens(session)
        }
      }

      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id)

        if (event === 'SIGNED_OUT' || !session) {
          authStorage.clearTokens()
          setSession(null)
          setUser(null)
        } else if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
          // Check if new session is valid
          const currentTime = Math.floor(Date.now() / 1000)
          if (session.expires_at && session.expires_at < currentTime) {
            console.warn('Received expired session, signing out')
            await supabase.auth.signOut()
            return
          }

          setSession(session)
          setUser(session.user)
          authStorage.setTokens(session)
        }

        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  /**
   * Authenticates a user with email and password.
   * Automatically stores tokens in localStorage on successful login.
   *
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise resolving to object with error (null on success)
   * @example
   * ```typescript
   * const { error } = await signIn('user@example.com', 'password123')
   * if (error) {
   *   console.error('Login failed:', error.message)
   * } else {
   *   console.log('Login successful!')
   * }
   * ```
   */
  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (data.session) {
      authStorage.setTokens(data.session)
    }

    return { error }
  }, [supabase])

  /**
   * Registers a new user with email and password.
   * Automatically stores tokens in localStorage if session is created immediately.
   *
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise resolving to object with error (null on success)
   * @example
   * ```typescript
   * const { error } = await signUp('newuser@example.com', 'password123')
   * if (error) {
   *   console.error('Registration failed:', error.message)
   * } else {
   *   console.log('Registration successful!')
   * }
   * ```
   */
  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (data.session) {
      authStorage.setTokens(data.session)
    }

    return { error }
  }, [supabase])

  /**
   * Signs out the current user and clears all stored tokens.
   * Resets user and session state to null.
   *
   * @example
   * ```typescript
   * await signOut()
   * // User is now logged out and tokens are cleared
   * ```
   */
  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    authStorage.clearTokens()
  }, [supabase])

  /**
   * Retrieves the current user's access token for API authorization.
   *
   * @returns The JWT access token or null if not authenticated
   * @example
   * ```typescript
   * const token = getAccessToken()
   * if (token) {
   *   // Make authenticated API call
   *   fetch('/api/data', {
   *     headers: { Authorization: `Bearer ${token}` }
   *   })
   * }
   * ```
   */
  const getAccessToken = useCallback(() => {
    return authStorage.getAccessToken()
  }, [])

  const value = useMemo(() => ({
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    getAccessToken
  }), [user, session, loading, signIn, signUp, signOut, getAccessToken])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}