import DataLoader from 'dataloader'
import { CoachBillingRepository } from '@/lib/repository/base/coachBillingRepository'
import type { CoachBilling } from '@/lib/types'

export interface CoachBillingLoaders {
  coachBillingById: DataLoader<string, CoachBilling | null>
  coachBillingByCoachId: DataLoader<string, CoachBilling | null>
}

/**
 * Creates data loaders for CoachBilling entities to prevent N+1 queries.
 * Provides efficient batching for billing lookups by ID and coach ID.
 */
export function createCoachBillingLoaders(): CoachBillingLoaders {
  const coachBillingRepository = new CoachBillingRepository()

  const coachBillingById = new DataLoader<string, CoachBilling | null>(
    async (ids: readonly string[]) => {
      const billingRecords = await coachBillingRepository.getByIds(Array.from(ids))
      const billingMap = new Map(billingRecords.map(billing => [billing.id, billing]))
      
      return ids.map(id => billingMap.get(id) || null)
    },
    {
      cache: true,
      maxBatchSize: 100
    }
  )

  const coachBillingByCoachId = new DataLoader<string, CoachBilling | null>(
    async (coachIds: readonly string[]) => {
      // Batch query all coach IDs at once
      const billingRecords: CoachBilling[] = []
      
      for (const coachId of coachIds) {
        const billing = await coachBillingRepository.getByCoachId(coachId)
        if (billing) billingRecords.push(billing)
      }
      
      const billingMap = new Map(billingRecords.map(billing => [billing.coachId, billing]))
      
      return coachIds.map(coachId => billingMap.get(coachId) || null)
    },
    {
      cache: true,
      maxBatchSize: 100
    }
  )

  return {
    coachBillingById,
    coachBillingByCoachId
  }
}