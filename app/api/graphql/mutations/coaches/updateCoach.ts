import type { GraphQLContext } from '../../route'
import { coachRepository } from '@/lib/repository'

/**
 * Updates coach profile information.
 * Only allows coaches to update their own profile.
 */
export async function updateCoach(
  parent: any,
  args: {
    input: {
      firstName?: string
      lastName?: string
      displayName?: string
      avatar?: string
      timezone?: string
      onboardingCompleted?: boolean
    }
  },
  context: GraphQLContext
) {
  const { userId } = context

  if (!userId) {
    throw new Error('Authentication required')
  }

  try {
    // Update coach profile
    const coach = await coachRepository.updateByUserId(userId, args.input)

    // Load billing relationship if needed
    if (!coach) {
      throw new Error('Failed to update coach profile')
    }
    if (context.dataloaders?.coachBillingLoaders) {
      coach.billing = await context.dataloaders.coachBillingLoaders.coachBillingByCoachId.load(coach.id)
    }

    return coach
  } catch (error) {
    console.error('Error updating coach:', error)
    throw new Error('Failed to update coach profile')
  }
}