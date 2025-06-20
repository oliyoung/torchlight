// @ts-nocheck
import DataLoader from 'dataloader';
import { supabaseServiceRole } from "@/lib/supabase/serviceRoleClient";
import type { TrainingPlan } from '@/lib/types';
import { logger } from '@/lib/logger';

/**
 * Batch function to fetch multiple training plans by their IDs
 */
async function getTrainingPlansByIds(userId: string | null, trainingPlanIds: string[]): Promise<(TrainingPlan | null)[]> {
  if (!userId || trainingPlanIds.length === 0) {
    return trainingPlanIds.map(() => null);
  }

  const { data, error } = await supabaseServiceRole
    .from('training_plans')
    .select('*')
    .eq('user_id', userId)
    .in('id', trainingPlanIds);

  if (error) {
    logger.error({ error }, 'Error batch loading training plans');
    return trainingPlanIds.map(() => null);
  }

  // Format the data into TrainingPlan objects
  const trainingPlans = data.map(plan => ({
    id: plan.id,
    overview: plan.overview,
    planJson: plan.plan_json,
    athleteId: plan.athlete_id,
    createdAt: new Date(plan.created_at),
    updatedAt: new Date(plan.updated_at),
    deletedAt: plan.deleted_at ? new Date(plan.deleted_at) : null,
    generatedBy: plan.generated_by || null,
    sourcePrompt: plan.source_prompt || null,
  })) as TrainingPlan[];

  const trainingPlanMap = new Map(trainingPlans.map(plan => [String(plan.id), plan]));
  return trainingPlanIds.map(id => trainingPlanMap.get(String(id)) || null);
}

/**
 * Creates a DataLoader for batching training plan requests
 * This avoids N+1 query issues in GraphQL resolvers
 */
export function createTrainingPlanLoader(userId: string | null) {
  return new DataLoader<string, TrainingPlan | null>(async (trainingPlanIds) => {
    return getTrainingPlansByIds(userId, trainingPlanIds as string[]);
  }, {
    // Add cache key function to ensure consistent key handling
    cacheKeyFn: key => String(key)
  });
}