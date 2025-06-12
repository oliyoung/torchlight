import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for public routes and API routes (except GraphQL)
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/'
  ) {
    return NextResponse.next()
  }

  // Get the session token from Authorization header
  // Note: We can't access localStorage in middleware, so we rely on the client
  // to send the token in the Authorization header for API requests
  const authHeader = request.headers.get('authorization')

  let accessToken: string | null = null

  if (authHeader?.startsWith('Bearer ')) {
    accessToken = authHeader.replace('Bearer ', '')
  }

  if (!accessToken) {
    // No token found, redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Validate token expiration by checking JWT payload
    const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]))
    const currentTime = Math.floor(Date.now() / 1000)

    if (tokenPayload.exp && tokenPayload.exp < currentTime) {
      // Token has expired, redirect to login
      console.warn('Token has expired, redirecting to login')
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      loginUrl.searchParams.set('reason', 'expired')

      // Clear the expired token cookie
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete('sb-access-token')
      return response
    }

    // Additional validation with Supabase (for GraphQL requests)
    if (pathname.startsWith('/api/graphql')) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      })

      const { error } = await supabase.auth.getUser()
      if (error) {
        console.warn('Supabase token validation failed:', error.message)
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Token validation error:', error)
    // Invalid token format, redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    loginUrl.searchParams.set('reason', 'invalid')
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}