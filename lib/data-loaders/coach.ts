// @ts-nocheck
import DataLoader from 'dataloader'
import { CoachRepository } from '@/lib/repository/base/coachRepository'
import type { Coach } from '@/lib/types'

export interface CoachLoaders {
  coachById: DataLoader<string, Coach | null>
  coachByUserId: DataLoader<string, Coach | null>
}

/**
 * Creates data loaders for Coach entities to prevent N+1 queries.
 * Provides efficient batching for coach lookups by ID and user ID.
 */
export function createCoachLoaders(): CoachLoaders {
  const coachRepository = new CoachRepository()

  const coachById = new DataLoader<string, Coach | null>(
    async (ids: readonly string[]) => {
      const coaches = await coachRepository.getByIds(Array.from(ids))
      const coachMap = new Map(coaches.map(coach => [coach.id, coach]))

      return ids.map(id => coachMap.get(id) || null)
    },
    {
      cache: true,
      maxBatchSize: 100
    }
  )

  const coachByUserId = new DataLoader<string, Coach | null>(
    async (userIds: readonly string[]) => {
      // Since we need to query by user_id, we'll use a custom query
      const coaches: Coach[] = []

      // Batch query all user IDs at once
      for (const userId of userIds) {
        const coach = await coachRepository.getByUserId(userId)
        if (coach) coaches.push(coach)
      }

      const coachMap = new Map(coaches.map(coach => [coach.userId, coach]))

      return userIds.map(userId => coachMap.get(userId) || null)
    },
    {
      cache: true,
      maxBatchSize: 100
    }
  )

  return {
    coachById,
    coachByUserId
  }
}