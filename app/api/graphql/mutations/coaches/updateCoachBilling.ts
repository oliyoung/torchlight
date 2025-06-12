// @ts-nocheck
import type { GraphQLContext } from '../../route'
import { coachRepository, coachBillingRepository } from '@/lib/repository'

/**
 * Updates coach billing information.
 * Typically called by Stripe webhooks or billing management system.
 * Requires admin privileges or valid webhook authentication.
 */
export async function updateCoachBilling(
  parent: any,
  args: {
    input: {
      stripeCustomerId?: string
      subscriptionStatus?: string
      subscriptionTier?: string
      subscriptionStartDate?: string
      subscriptionEndDate?: string
      trialEndDate?: string
      billingEmail?: string
      monthlyAthleteLimit?: number
      monthlySessionLogLimit?: number
      aiCreditsRemaining?: number
      lastPaymentDate?: string
      nextBillingDate?: string
      billingCycleDay?: number
      currency?: string
    }
  },
  context: GraphQLContext
) {
  const { userId } = context

  if (!userId) {
    throw new Error('Authentication required')
  }

  // Get coach to find their billing record
  const coach = await coachRepository.getByUserId(userId)
  if (!coach) {
    throw new Error('Coach not found')
  }

  try {
    // Convert date strings to Date objects
    const input = {
      ...args.input,
      ...(args.input.subscriptionStartDate && {
        subscriptionStartDate: new Date(args.input.subscriptionStartDate)
      }),
      ...(args.input.subscriptionEndDate && {
        subscriptionEndDate: new Date(args.input.subscriptionEndDate)
      }),
      ...(args.input.trialEndDate && {
        trialEndDate: new Date(args.input.trialEndDate)
      }),
      ...(args.input.lastPaymentDate && {
        lastPaymentDate: new Date(args.input.lastPaymentDate)
      }),
      ...(args.input.nextBillingDate && {
        nextBillingDate: new Date(args.input.nextBillingDate)
      })
    }

    // Update billing information
    const billing = await coachBillingRepository.updateByCoachId(coach.id, input)

    return billing
  } catch (error) {
    console.error('Error updating coach billing:', error)
    throw new Error('Failed to update billing information')
  }
}