import { coachRepository, coachBillingRepository } from '@/lib/repository'
import { GraphQLContext } from '@/app/api/graphql/route';

/**
 * Creates a new coach profile during onboarding.
 * Automatically creates associated billing record with trial settings.
 * Called after successful authentication to set up coach account.
 */
export async function createCoach(
  parent: any,
  args: { input: { firstName?: string; lastName?: string; displayName?: string; timezone?: string; billingEmail?: string } },
  context: GraphQLContext
) {

  const { userId, user } = context

  if (!userId || !user?.email) {
    throw new Error('Authentication required')
  }

  // Check if coach already exists
  const existingCoach = await coachRepository.getByUserId(userId)
  if (existingCoach) {
    return existingCoach
  }

  try {
    // Create coach profile
    const coach = await coachRepository.createCoach(userId, user.email, args.input)

    // Create billing record
    if (!coach) {
      throw new Error('Failed to create coach profile')
    }
    const billing = await coachBillingRepository.createForCoach(
      coach.id,
      user.email
    )

    // Mark onboarding as completed
    const updatedCoach = await coachRepository.updateByUserId(userId, {
      onboardingCompleted: true
    })

    // Populate billing relationship
    if (!updatedCoach) {
      throw new Error('Failed to update coach profile')
    }
    updatedCoach.billing = billing

    return updatedCoach
  } catch (error) {
    console.error('Error creating coach:', error)
    throw new Error('Failed to create coach profile')
  }
}