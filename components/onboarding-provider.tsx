"use client"

import { useState, useEffect } from "react"
import { useCoachProfile } from "@/lib/hooks/use-coach-profile"
import { CoachOnboardingModal } from "./coach-onboarding-modal"

interface OnboardingProviderProps {
  children: React.ReactNode
}

/**
 * Provider that handles the onboarding flow for new coaches.
 * Automatically shows onboarding modal when a user doesn't have a coach profile.
 */
export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const {
    shouldShowOnboarding,
    loading,
    refetch,
    isAuthenticated
  } = useCoachProfile()

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)
  const [hasShownOnboarding, setHasShownOnboarding] = useState(false)

  // Show onboarding modal when conditions are met
  useEffect(() => {
    if (!loading && isAuthenticated && shouldShowOnboarding && !hasShownOnboarding) {
      setIsOnboardingOpen(true)
      setHasShownOnboarding(true)
    }
  }, [shouldShowOnboarding, loading, isAuthenticated, hasShownOnboarding])

  const handleOnboardingClose = () => {
    // For now, don't allow closing without completing onboarding
    // In the future, you might want to allow this and show a different message
  }

  const handleOnboardingSuccess = async () => {
    // Refetch the coach profile to get updated data
    await refetch()
    setIsOnboardingOpen(false)
  }

  return (
    <>
      {children}
      <CoachOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={handleOnboardingClose}
        onSuccess={handleOnboardingSuccess}
      />
    </>
  )
}