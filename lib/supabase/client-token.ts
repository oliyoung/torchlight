import { createClient } from '@supabase/supabase-js'
import { supabaseConfig } from './config'
import { authStorage } from '@/lib/auth/storage'

/**
 * Creates a Supabase client configured for token-based authentication.
 * Uses localStorage for token storage with automatic session management.
 *
 * @returns Configured Supabase client with token-based auth
 * @example
 * ```typescript
 * const supabase = createTokenClient()
 *
 * // Sign in - tokens automatically stored
 * const { data, error } = await supabase.auth.signInWithPassword({
 *   email: 'user@example.com',
 *   password: 'password123'
 * })
 *
 * // Make authenticated requests - tokens automatically included
 * const { data: user } = await supabase.auth.getUser()
 * ```
 */
export const createTokenClient = () => {
  return createClient(supabaseConfig.url, supabaseConfig.anonKey, {
    auth: {
      storage: {
        getItem: (key: string) => {
          if (typeof window === 'undefined') return null

          // Map Supabase auth keys to our storage
          if (key.includes('access_token')) {
            return authStorage.getTokens().access_token
          }
          if (key.includes('refresh_token')) {
            return authStorage.getTokens().refresh_token
          }
          return localStorage.getItem(key)
        },
        setItem: (key: string, value: string) => {
          if (typeof window === 'undefined') return

          // Intercept session storage to use our token storage
          if (key.includes('supabase.auth.token')) {
            try {
              const session = JSON.parse(value)
              authStorage.setTokens(session)
              return
            } catch {
              // If not a valid session, use default storage
            }
          }
          localStorage.setItem(key, value)
        },
        removeItem: (key: string) => {
          if (typeof window === 'undefined') return

          if (key.includes('supabase.auth.token')) {
            authStorage.clearTokens()
            return
          }
          localStorage.removeItem(key)
        }
      },
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })
}