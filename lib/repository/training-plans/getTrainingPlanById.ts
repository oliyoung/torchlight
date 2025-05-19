import { supabaseServiceRole } from "@/lib/supabase/serviceRoleClient";
import type { TrainingPlan } from "@/lib/types";
import { logger } from "@/lib/logger";
import { getClientById } from "../client";
import type { GraphQLContext } from "@/app/api/graphql/route";

// Function to get a training plan by its ID
export const getTrainingPlanById = async (userId: string | null, id: string): Promise<TrainingPlan | null> => {
  logger.info({ id }, "Fetching training plan by ID");

  const { data: trainingPlan, error } = await supabaseServiceRole
    .from('training_plans')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    logger.error({ error, id }, "Error fetching training plan with ID");
    // Depending on error type, might throw or return null. Returning null for not found is common.
    return null;
  }

  if (!trainingPlan) {
    logger.info({ id }, `Training plan with ID ${id} not found.`);
    return null;
  }

  // Map the database response back to the GraphQL TrainingPlan type
  const fetchedTrainingPlan: TrainingPlan = {
    id: trainingPlan.id,
    title: trainingPlan.title,
    overview: trainingPlan.overview,
    planJson: trainingPlan.plan_json,
    assistants: trainingPlan.assistants,
    goals: trainingPlan.goals,
    createdAt: new Date(trainingPlan.created_at),
    updatedAt: new Date(trainingPlan.updated_at),
    deletedAt: trainingPlan.deleted_at ? new Date(trainingPlan.deleted_at) : null,
    generatedBy: trainingPlan.generated_by || null,
    sourcePrompt: trainingPlan.source_prompt || null,
  };

  logger.info({}, "Successfully fetched training plan");

  return fetchedTrainingPlan;
};
