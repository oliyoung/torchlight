import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

/**
 * REST API endpoint for user registration.
 * Accepts email and password via POST and returns a JWT access token or confirmation message.
 *
 * @param request - Next.js request object containing email and password in JSON body
 * @returns JSON response with access_token on immediate success, confirmation message if email verification required, or error message on failure
 *
 * @example
 * ```bash
 * curl -X POST http://localhost:3000/api/auth/register \
 *   -H "Content-Type: application/json" \
 *   -d '{"email": "newuser@example.com", "password": "password123"}'
 * ```
 *
 * @example Success Response (immediate session)
 * ```json
 * {
 *   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 * ```
 *
 * @example Success Response (email confirmation required)
 * ```json
 * {
 *   "message": "Registration successful. Please check your email for confirmation.",
 *   "user_id": "user-uuid-here"
 * }
 * ```
 *
 * @example Error Response
 * ```json
 * {
 *   "error": "Password must be at least 6 characters long"
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength (basic example)
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Create Supabase client
    const supabase = createClient()

    // Register user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      // Handle specific Supabase errors
      if (error.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Registration failed - no user data returned' },
        { status: 500 }
      )
    }

    // Check if session was created immediately (no email confirmation required)
    if (data.session?.access_token) {
      // User registered and logged in immediately
      return NextResponse.json({
        access_token: data.session.access_token,
        user: {
          id: data.user.id,
          email: data.user.email
        }
      })
    } else {
      // User registered but needs email confirmation
      return NextResponse.json({
        message: 'Registration successful. Please check your email for confirmation.',
        user_id: data.user.id,
        email_confirmed: data.user.email_confirmed_at !== null
      })
    }

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Invalid request body or server error' },
      { status: 400 }
    )
  }
}