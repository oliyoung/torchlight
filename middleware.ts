import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for public routes and static files
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/logout') ||
    pathname.startsWith('/auth/callback') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/'
  ) {
    return NextResponse.next()
  }

  // For API routes (especially GraphQL), check Authorization header
  if (pathname.startsWith('/api/')) {
    const authHeader = request.headers.get('authorization')

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const accessToken = authHeader.replace('Bearer ', '')

    try {
      // Validate token expiration
      const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]))
      const currentTime = Math.floor(Date.now() / 1000)

      if (tokenPayload.exp && tokenPayload.exp < currentTime) {
        return NextResponse.json(
          { error: 'Token expired' },
          { status: 401 }
        )
      }

      // Additional validation for GraphQL
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
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
  }

  // For page routes, let the client-side auth handle authentication
  // The AuthProvider will redirect to login if needed
  return NextResponse.next()
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