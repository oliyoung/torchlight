"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useCoachProfile } from "@/lib/hooks/use-coach-profile"

interface OnboardingProviderProps {
  children: React.ReactNode
}

/**
 * Provider that handles the onboarding flow for new coaches.
 * Automatically redirects to onboarding page when a user doesn't have a coach profile.
 */
export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const {
    shouldShowOnboarding,
    loading,
    isAuthenticated,
    user
  } = useCoachProfile()

  // Check if we're on an auth page (login, callback, etc.) or onboarding page
  const isAuthPage = pathname?.startsWith('/login') ||
    pathname?.startsWith('/auth/') ||
    pathname?.startsWith('/register')
  
  const isOnboardingPage = pathname === '/onboarding'
  const isAthleteCreationOnboarding = pathname === '/athletes/new' && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('onboarding') === 'true'

  // Only redirect to onboarding if:
  // 1. Not loading
  // 2. User is authenticated (has user object)
  // 3. User needs onboarding
  // 4. Not already on auth, onboarding, or athlete creation onboarding pages
  useEffect(() => {
    if (!loading &&
      user &&
      isAuthenticated &&
      shouldShowOnboarding &&
      !isAuthPage &&
      !isOnboardingPage &&
      !isAthleteCreationOnboarding) {
      console.log('OnboardingProvider: Redirecting to onboarding')
      router.push('/onboarding')
    }
  }, [shouldShowOnboarding, loading, isAuthenticated, user, isAuthPage, isOnboardingPage, isAthleteCreationOnboarding, router, pathname])

  return <>{children}</>
}