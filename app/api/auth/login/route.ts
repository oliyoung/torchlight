import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

/**
 * REST API endpoint for user authentication.
 * Accepts email and password via POST and returns a JWT access token.
 * 
 * @param request - Next.js request object containing email and password in JSON body
 * @returns JSON response with access_token on success or error message on failure
 * 
 * @example
 * ```bash
 * curl -X POST http://localhost:3000/api/auth/login \
 *   -H "Content-Type: application/json" \
 *   -d '{"email": "user@example.com", "password": "password123"}'
 * ```
 * 
 * @example Success Response
 * ```json
 * {
 *   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 * ```
 * 
 * @example Error Response
 * ```json
 * {
 *   "error": "Invalid login credentials"
 * }
 * ```
 */
export async function POST(request: NextRequest) {
  // Only allow in development environment
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development environments' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { email, password } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Create Supabase client
    const supabase = createClient()

    // Authenticate user
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    if (!data.session?.access_token) {
      return NextResponse.json(
        { error: 'Authentication failed - no token received' },
        { status: 401 }
      )
    }

    // Return only the JWT token
    return NextResponse.json({
      access_token: data.session.access_token
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}