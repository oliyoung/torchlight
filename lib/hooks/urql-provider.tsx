'use client'

import { Provider, createClient, cacheExchange, fetchExchange } from 'urql'
import { authExchange } from '@urql/exchange-auth'
import { authStorage } from '@/lib/auth/storage'
import { useAuth } from '@/lib/auth/context'

interface UrqlProviderProps {
  children: React.ReactNode
}

/**
 * URQL GraphQL client provider with automatic JWT token authentication.
 * Configures the GraphQL client to automatically include JWT tokens in requests
 * and handle authentication errors with token refresh.
 *
 * @param props - Component props
 * @param props.children - Child components that will have access to GraphQL client
 * @example
 * ```typescript
 * <AuthProvider>
 *   <UrqlProvider>
 *     <App />
 *   </UrqlProvider>
 * </AuthProvider>
 * ```
 */
export const UrqlProvider = ({ children }: UrqlProviderProps) => {
  const { getAccessToken, signOut } = useAuth()

  const client = createClient({
    url: '/api/graphql',
    exchanges: [
      cacheExchange,
      authExchange(async (utils) => {
        return {
          addAuthToOperation(operation) {
            const token = getAccessToken()
            if (!token) return operation

            return utils.appendHeaders(operation, {
              Authorization: `Bearer ${token}`
            })
          },
          didAuthError(error) {
            // Check if we got an auth error (401, 403, or token expired)
            return error.graphQLErrors.some(e =>
              e.extensions?.code === 'UNAUTHENTICATED' ||
              e.message.includes('JWT') ||
              e.message.includes('token')
            )
          },
          async refreshAuth() {
            // Try to refresh the token
            const { refresh_token } = authStorage.getTokens()
            if (!refresh_token) {
              await signOut()
              return
            }

            try {
              // You could implement token refresh here
              // For now, just sign out on auth error
              await signOut()
              return
            } catch {
              await signOut()
              return
            }
          }
        }
      }),
      fetchExchange
    ]
  })

  return <Provider value={client}>{children}</Provider>
}