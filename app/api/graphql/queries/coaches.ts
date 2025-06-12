import { coachRepository } from '@/lib/repository'
import { GraphQLContext } from '../route'

/**
 * Gets the current authenticated coach profile (me query).
 * Returns null if coach profile doesn't exist (needs onboarding).
 */
export async function me(
  parent: any,
  args: any,
  context: GraphQLContext
) {
  const { userId } = context

  if (!userId) {
    return null // Not authenticated
  }

  try {
    // Get coach by user ID
    const coach = await coachRepository.getByUserId(userId)
    if (!coach) {
      return null // Coach profile not created yet
    }

    // Load billing relationship
    if (context.dataloaders?.coachBillingLoaders) {
      coach.billing = await context.dataloaders.coachBillingLoaders.coachBillingByCoachId.load(coach.id)
    }

    return coach
  } catch (error) {
    console.error('Error fetching coach profile:', error)

    // Handle JWT signature errors gracefully - this happens with new OAuth users
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'PGRST301' || error.code === 'PGRST116') {
        console.log('Coach profile not found or JWT signature error - user needs onboarding')
        return null // User needs to complete onboarding
      }
    }

    // For other errors, still throw
    throw new Error('Failed to fetch coach profile')
  }
}

/**
 * Gets a specific coach by ID (admin only).
 * Used for admin operations and support.
 */
export async function coach(
  parent: any,
  args: { id: string },
  context: GraphQLContext
) {
  const { userId } = context

  if (!userId) {
    throw new Error('Authentication required')
  }

  // For now, only allow coaches to view their own profile
  // In the future, add admin role checking here
  const currentCoach = await coachRepository.getByUserId(userId)
  if (!currentCoach || currentCoach.id !== args.id) {
    throw new Error('Access denied')
  }

  try {
    // Use DataLoader for consistent caching
    if (context.dataloaders?.coachLoaders) {
      const coach = await context.dataloaders.coachLoaders.coachById.load(args.id)

      if (coach && context.dataloaders.coachBillingLoaders) {
        coach.billing = await context.dataloaders.coachBillingLoaders.coachBillingByCoachId.load(coach.id)
      }

      return coach
    }

    // Fallback to direct repository call
    const coach = await coachRepository.getById(userId, args.id)
    return coach
  } catch (error) {
    console.error('Error fetching coach:', error)
    throw new Error('Failed to fetch coach')
  }
}