"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { ErrorMessage } from '@/components/ui/error-message'

export default function LoginPageToken() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { signIn, signUp } = useAuth()

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

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="max-w-md p-5 bg-white  ">
        <h1 className="mb-5 text-xl font-bold">Sign in</h1>
        {error && <ErrorMessage message={error} />}

        <input
          type="email"
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-3 border "
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-3 border "
          disabled={loading}
        />

        <button
          type="button"
          onClick={handleSignIn}
          disabled={loading}
          className="w-full p-2 mb-3 text-white bg-blue-600  hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <button
          type="button"
          onClick={handleSignUp}
          disabled={loading}
          className="w-full p-2 mb-3 text-white bg-green-600  hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </div>
    </div>
  )
}