"use client"

import { useQuery } from "urql"
import { useAuth } from "@/lib/auth/context"

const ME_QUERY = `
  query Me {
    me {
      id
      email
      firstName
      lastName
      displayName
      timezone
      accountStatus
      onboardingCompleted
      billing {
        id
        subscriptionStatus
        subscriptionTier
        trialEndDate
        monthlyAthleteLimit
        currentAthleteCount
        monthlySessionLogLimit
        currentSessionLogCount
        aiCreditsRemaining
      }
    }
  }
`

/**
 * Hook to manage coach profile state and onboarding status.
 * Returns coach data, loading state, and onboarding requirements.
 */
export function useCoachProfile() {
  const { user, loading: authLoading } = useAuth()
  
  const [{ data, fetching, error }, refetch] = useQuery({
    query: ME_QUERY,
    pause: !user || authLoading,
    requestPolicy: 'cache-and-network'
  })

  const coach = data?.me
  const loading = authLoading || fetching
  
  // Determine onboarding status
  const needsOnboarding = !loading && user && !coach
  const needsProfileCompletion = !loading && coach && !coach.onboardingCompleted

  return {
    // Core data
    coach,
    user,
    loading,
    error,
    
    // Onboarding state
    needsOnboarding,
    needsProfileCompletion,
    shouldShowOnboarding: needsOnboarding || needsProfileCompletion,
    
    // Actions
    refetch: () => refetch({ requestPolicy: 'network-only' }),
    
    // Convenience flags
    isAuthenticated: !!user,
    hasCoachProfile: !!coach,
    isOnboardingComplete: !!coach?.onboardingCompleted,
    
    // Billing info (if available)
    billing: coach?.billing,
    subscriptionStatus: coach?.billing?.subscriptionStatus,
    subscriptionTier: coach?.billing?.subscriptionTier,
    isTrialActive: coach?.billing?.subscriptionStatus === 'TRIAL',
    
    // Usage tracking
    athleteUsage: coach?.billing ? {
      current: coach.billing.currentAthleteCount,
      limit: coach.billing.monthlyAthleteLimit,
      remaining: Math.max(0, coach.billing.monthlyAthleteLimit - coach.billing.currentAthleteCount)
    } : null,
    
    sessionLogUsage: coach?.billing ? {
      current: coach.billing.currentSessionLogCount,
      limit: coach.billing.monthlySessionLogLimit,
      remaining: Math.max(0, coach.billing.monthlySessionLogLimit - coach.billing.currentSessionLogCount)
    } : null,
    
    aiCreditsRemaining: coach?.billing?.aiCreditsRemaining || 0
  }
}