/**
 * Token-based authentication storage utilities for managing JWT tokens in localStorage.
 * Provides secure token storage and retrieval for Supabase authentication.
 */
import type { Session } from '@supabase/supabase-js'

/** Storage key for access token in localStorage */
const TOKEN_KEY = 'supabase-auth-token'
/** Storage key for refresh token in localStorage */
const REFRESH_TOKEN_KEY = 'supabase-refresh-token'

/**
 * Authentication storage utilities for managing JWT tokens in the browser.
 * Handles both access and refresh tokens with proper SSR safety checks.
 */
export const authStorage = {
  /**
   * Retrieves both access and refresh tokens from localStorage.
   * 
   * @returns Object containing access_token and refresh_token (both nullable)
   * @example
   * ```typescript
   * const { access_token, refresh_token } = authStorage.getTokens()
   * if (access_token) {
   *   // Use token for API calls
   * }
   * ```
   */
  getTokens: (): { access_token: string | null; refresh_token: string | null } => {
    if (typeof window === 'undefined') return { access_token: null, refresh_token: null }
    
    return {
      access_token: localStorage.getItem(TOKEN_KEY),
      refresh_token: localStorage.getItem(REFRESH_TOKEN_KEY)
    }
  },

  /**
   * Stores authentication session tokens in localStorage.
   * If session is null, removes all stored tokens.
   * 
   * @param session - Supabase session object containing tokens, or null to clear
   * @example
   * ```typescript
   * // Store tokens
   * authStorage.setTokens(session)
   * 
   * // Clear tokens
   * authStorage.setTokens(null)
   * ```
   */
  setTokens: (session: Session | null) => {
    if (typeof window === 'undefined') return
    
    if (session?.access_token) {
      localStorage.setItem(TOKEN_KEY, session.access_token)
      localStorage.setItem(REFRESH_TOKEN_KEY, session.refresh_token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
    }
  },

  /**
   * Removes all authentication tokens from localStorage.
   * Safe to call during SSR (will return early if window is undefined).
   * 
   * @example
   * ```typescript
   * // On logout
   * authStorage.clearTokens()
   * ```
   */
  clearTokens: () => {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },

  /**
   * Retrieves only the access token for API authorization headers.
   * 
   * @returns The access token string or null if not found/not in browser
   * @example
   * ```typescript
   * const token = authStorage.getAccessToken()
   * if (token) {
   *   fetch('/api/data', {
   *     headers: { Authorization: `Bearer ${token}` }
   *   })
   * }
   * ```
   */
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_KEY)
  }
}