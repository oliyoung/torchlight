import { supabaseServiceRole } from "@/lib/supabase/serviceRoleClient";
import type { TrainingPlan } from "@/lib/types";
import { logger } from "@/lib/logger";

// Function to get training plans for a specific user (and optionally client)
export async function getTrainingPlans(userId: string | null, clientId: string | null): Promise<TrainingPlan[]> {
  logger.info({ userId, clientId }, 'Fetching training plans for user');
  if (!userId) {
    logger.info({ clientId }, 'getTrainingPlans: No user ID provided.');
    return [];
  }

  let query = supabaseServiceRole
    .from('training_plans')
    .select('*, createdAt:created_at, updatedAt:updated_at, deletedAt:deleted_at')
    .eq('user_id', userId); // Filter by user ID

  if (clientId) {
    query = query.eq('client_id', clientId); // Optionally filter by client ID
  }

  const { data, error } = await query;

  if (error) {
    logger.error({ error, userId }, 'Error fetching training plans for user');
    return [];
  }

  // Map database response array to TrainingPlan type array
  const fetchedTrainingPlans: TrainingPlan[] = data.map(plan => ({
    ...plan,
    createdAt: new Date(plan.created_at), // Assuming timestamp strings
    updatedAt: new Date(plan.updated_at), // Assuming timestamp strings
    deletedAt: plan.deleted_at ? new Date(plan.deleted_at) : null, // Handle nullable deleted_at
  })) as TrainingPlan[]; // Type assertion

  logger.info({ fetchedTrainingPlans }, 'Successfully fetched training plans');
  return fetchedTrainingPlans;
}