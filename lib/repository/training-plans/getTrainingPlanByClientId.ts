import { supabaseServiceRole } from "@/lib/supabase/serviceRoleClient";
import type { TrainingPlan } from "@/lib/types";
import { logger } from "@/lib/logger";

// Function to get all training plans for a specific client ID
export const getTrainingPlansByClientId = async (clientId: string): Promise<TrainingPlan[]> => {
  logger.info("Fetching training plans for client ID:", clientId);

  const { data: trainingPlans, error } = await supabaseServiceRole
    .from('training_plans')
    .select('*')
    .eq('client_id', clientId);

  if (error) {
    console.error(`Error fetching training plans for client ID ${clientId}:`, error);
    throw new Error(`Failed to fetch training plans: ${error.message}`);
  }

  // Map the database response array back to the GraphQL TrainingPlan type array
  const fetchedTrainingPlans: TrainingPlan[] = trainingPlans.map(plan => ({
    id: plan.id,
    client: plan.client,
    title: plan.title,
    overview: plan.overview,
    planJson: plan.plan_json,
    assistants: plan.assistants,
    goals: plan.goals,
    createdAt: new Date(plan.created_at),
    updatedAt: new Date(plan.updated_at),
    deletedAt: plan.deleted_at ? new Date(plan.deleted_at) : null,
    generatedBy: plan.generated_by || null,
    sourcePrompt: plan.source_prompt || null,
  }));

  logger.info(`Successfully fetched ${fetchedTrainingPlans.length} training plans for client ID ${clientId}.`);

  return fetchedTrainingPlans;
};
