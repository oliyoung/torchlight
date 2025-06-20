"use client"

import { useState } from 'react'
import { useAuth } from '@/lib/auth/context'
import { authStorage } from '@/lib/auth/storage'
import { LogoutButton, LogoutIconButton } from '@/components/logout-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export default function LogoutTestPage() {
  const { user, session, signOut } = useAuth()
  const [testResult, setTestResult] = useState<string>('')

  const handleDirectSignOut = async () => {
    try {
      await signOut()
      setTestResult('Direct signOut() called successfully')
    } catch (error) {
      setTestResult(`Direct signOut() failed: ${error}`)
    }
  }

  const handleClearTokensOnly = () => {
    authStorage.clearTokens()
    setTestResult('Tokens cleared from localStorage only')
  }

  const handleExpireToken = () => {
    const tokens = authStorage.getTokens()
    if (tokens.access_token) {
      try {
        // Create a fake expired token by modifying the exp claim
        const parts = tokens.access_token.split('.')
        const payload = JSON.parse(atob(parts[1]))
        payload.exp = Math.floor(Date.now() / 1000) - 3600 // Expired 1 hour ago
        const expiredPayload = btoa(JSON.stringify(payload))
        const expiredToken = `${parts[0]}.${expiredPayload}.${parts[2]}`

        localStorage.setItem('supabase-auth-token', expiredToken)
        setTestResult('Token artificially expired for testing')
      } catch (error) {
        setTestResult(`Failed to expire token: ${error}`)
      }
    } else {
      setTestResult('No token found to expire')
    }
  }

  const currentTokens = authStorage.getTokens()

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Logout Functionality Test</CardTitle>
            <CardDescription>
              Test different logout scenarios and session handling
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Current Auth State</h3>
                <div className="text-sm space-y-1">
                  <p><strong>User:</strong> {user?.email || 'None'}</p>
                  <p><strong>Session:</strong> {session ? 'Active' : 'None'}</p>
                  <p><strong>Stored Access Token:</strong> {currentTokens.access_token ? 'Present' : 'None'}</p>
                  <p><strong>Stored Refresh Token:</strong> {currentTokens.refresh_token ? 'Present' : 'None'}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Test Result</h3>
                <div className="text-sm bg-gray-100 p-2 rounded min-h-[60px]">
                  {testResult || 'No test run yet'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logout Button Components</CardTitle>
            <CardDescription>
              Test the different logout button variants
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <LogoutButton variant="default">Default Logout</LogoutButton>
              <LogoutButton variant="destructive">Destructive Logout</LogoutButton>
              <LogoutButton variant="outline">Outline Logout</LogoutButton>
              <LogoutIconButton variant="ghost" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manual Logout Tests</CardTitle>
            <CardDescription>
              Test different logout scenarios manually
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={handleDirectSignOut} variant="outline">
                Direct signOut() Call
              </Button>

              <Button onClick={handleClearTokensOnly} variant="outline">
                Clear Tokens Only
              </Button>

              <Button onClick={handleExpireToken} variant="outline">
                Artificially Expire Token
              </Button>

              <Button onClick={() => window.location.href = '/logout'} variant="outline">
                Navigate to /logout
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session Information</CardTitle>
            <CardDescription>
              Detailed session and token information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentTokens.access_token && (
              <div className="space-y-2">
                <h4 className="font-semibold">Token Details</h4>
                <div className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  <pre>
                    {JSON.stringify(
                      (() => {
                        try {
                          const payload = JSON.parse(atob(currentTokens.access_token!.split('.')[1]))
                          return {
                            exp: payload.exp,
                            iat: payload.iat,
                            sub: payload.sub,
                            email: payload.email,
                            expires_in_seconds: payload.exp - Math.floor(Date.now() / 1000),
                            is_expired: payload.exp < Math.floor(Date.now() / 1000)
                          }
                        } catch {
                          return { error: 'Failed to parse token' }
                        }
                      })(),
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}