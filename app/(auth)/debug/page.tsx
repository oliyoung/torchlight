'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createTokenClient } from '@/lib/supabase/client-token'
import { authStorage } from '@/lib/auth/storage'
import { useAuth } from '@/lib/auth/context'

export default function DebugPage() {
  const [sessionData, setSessionData] = useState<any>(null)
  const [urlParams, setUrlParams] = useState<any>({})
  const [storedTokens, setStoredTokens] = useState<any>(null)
  const searchParams = useSearchParams()
  const { user, session, loading } = useAuth()

  useEffect(() => {
    // Get URL parameters
    const params: any = {}
    searchParams.forEach((value, key) => {
      params[key] = value
    })
    setUrlParams(params)

    // Get session from Supabase
    const getSession = async () => {
      const supabase = createTokenClient()
      const { data, error } = await supabase.auth.getSession()
      setSessionData({ data, error })
    }

    // Get stored tokens
    const tokens = authStorage.getTokens()
    setStoredTokens(tokens)

    getSession()
  }, [searchParams])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">OAuth Debug Information</h1>

      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Auth Context State</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify({
              user: user ? { id: user.id, email: user.email } : null,
              session: session ? { expires_at: session.expires_at } : null,
              loading
            }, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">URL Parameters</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(urlParams, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Current URL</h2>
          <p className="text-sm break-all">{typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Supabase Session</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(sessionData, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Stored Tokens</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(storedTokens, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">URL Hash</h2>
          <p className="text-sm break-all">{typeof window !== 'undefined' ? window.location.hash : 'N/A'}</p>
        </div>
      </div>
    </div>
  )
}