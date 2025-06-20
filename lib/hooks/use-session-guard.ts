"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { authStorage } from '@/lib/auth/storage'

interface UseSessionGuardOptions {
  /** Whether to enable automatic session checking */
  enabled?: boolean
  /** How often to check session validity (in milliseconds) */
  checkInterval?: number
  /** Whether to redirect immediately on stale session detection */
  autoRedirect?: boolean
  /** Custom redirect path (defaults to /logout) */
  redirectPath?: string
}

/**
 * Hook that monitors session validity and automatically redirects users
 * with stale or expired sessions to the logout page.
 *
 * @param options - Configuration options for session monitoring
 * @example
 * ```typescript
 * // Basic usage - checks every 30 seconds
 * useSessionGuard()
 *
 * // Custom configuration
 * useSessionGuard({
 *   checkInterval: 60000, // Check every minute
 *   redirectPath: '/logout?reason=session_expired'
 * })
 * ```
 */
export function useSessionGuard({
  enabled = true,
  checkInterval = 30000, // 30 seconds
  autoRedirect = true,
  redirectPath = '/logout'
}: UseSessionGuardOptions = {}) {
  const { user, session, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!enabled || loading) return

    const checkSessionValidity = () => {
      // Skip if we're already on auth pages
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname
        if (currentPath.startsWith('/login') || currentPath.startsWith('/logout') || currentPath.startsWith('/auth/')) {
          return
        }
      }

      const storedTokens = authStorage.getTokens()

      // If no user context but we have stored tokens, check if they're expired
      if (!user && !session && storedTokens.access_token) {
        try {
          const tokenPayload = JSON.parse(atob(storedTokens.access_token.split('.')[1]))
          const currentTime = Math.floor(Date.now() / 1000)

          if (tokenPayload.exp && tokenPayload.exp < currentTime) {
            console.log('Session guard: Detected expired token, redirecting to logout')
            if (autoRedirect) {
              router.push(`${redirectPath}?message=session_expired`)
            }
            return
          }
        } catch (error) {
          console.warn('Session guard: Failed to parse stored token, redirecting to logout')
          if (autoRedirect) {
            router.push(`${redirectPath}?message=invalid_session`)
          }
          return
        }
      }

      // If we have a session, check if it's expired
      if (session?.expires_at) {
        const currentTime = Math.floor(Date.now() / 1000)
        if (session.expires_at < currentTime) {
          console.log('Session guard: Detected expired session, redirecting to logout')
          if (autoRedirect) {
            router.push(`${redirectPath}?message=session_expired`)
          }
          return
        }
      }

      // Check for mismatched state (user context vs stored tokens)
      if (user && !storedTokens.access_token) {
        console.log('Session guard: User context exists but no stored tokens, redirecting to logout')
        if (autoRedirect) {
          router.push(`${redirectPath}?message=session_invalid`)
        }
        return
      }

      if (!user && !session && storedTokens.access_token) {
        console.log('Session guard: Stored tokens exist but no user context, checking token validity')
        // This case is handled above with token parsing
      }
    }

    // Initial check
    checkSessionValidity()

    // Set up interval checking
    const interval = setInterval(checkSessionValidity, checkInterval)

    return () => clearInterval(interval)
  }, [enabled, loading, user, session, checkInterval, autoRedirect, redirectPath, router])

  // Return session status for manual handling
  return {
    isSessionValid: !loading && (!!user || !!session),
    hasStoredTokens: !!authStorage.getTokens().access_token,
    isLoading: loading
  }
}

/**
 * Simplified session guard that only checks on mount and auth state changes.
 * Useful for pages that don't need continuous monitoring.
 */
export function useSessionGuardOnce(options: Omit<UseSessionGuardOptions, 'checkInterval'> = {}) {
  return useSessionGuard({
    ...options,
    checkInterval: Number.MAX_SAFE_INTEGER // Effectively disables interval checking
  })
}