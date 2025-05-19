import { supabaseServiceRole } from "@/lib/supabase/serviceRoleClient";
import type { TrainingPlan } from "@/lib/types";

// Function to get a training plan by its ID
export const getTrainingPlanById = async (id: string): Promise<TrainingPlan | null> => {
  console.log("Fetching training plan by ID:", id);

  const { data: trainingPlan, error } = await supabaseServiceRole
    .from('training_plans')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching training plan with ID ${id}:`, error);
    // Depending on error type, might throw or return null. Returning null for not found is common.
    return null;
  }

  if (!trainingPlan) {
    console.log(`Training plan with ID ${id} not found.`);
    return null;
  }

  // Map the database response back to the GraphQL TrainingPlan type
  const fetchedTrainingPlan: TrainingPlan = {
    id: trainingPlan.id,
    client: trainingPlan.client,
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

  console.log("Successfully fetched training plan:", fetchedTrainingPlan);

  return fetchedTrainingPlan;
};
