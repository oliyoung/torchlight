import { supabaseServiceRole } from "@/lib/supabase/serviceRoleClient";
import type { CreateTrainingPlanInput, TrainingPlan } from "@/lib/types";
import { logger } from "@/lib/logger";

// Function to create a new training plan in the database
export const createTrainingPlan = async (
  userId: string | null,
  data: CreateTrainingPlanInput & { overview: string; planJson: JSON },
): Promise<TrainingPlan> => {
  logger.info({ data }, "Saving training plan to database");

  // Map the input data to the database schema (assuming snake_case)
  const { data: newTrainingPlan, error } = await supabaseServiceRole
    .from('training_plans') // Assuming your table name is 'training_plans'
    .insert([
      {
        user_id: userId,
        client_id: data.clientId,
        plan_json: data.planJson, // Store JSON data directly
        // generated_by: data.generatedBy, // Optional: if you pass this from the resolver
        // source_prompt: data.sourcePrompt, // Optional: if you pass this from the resolver
      },
    ])
    .select()
    .single(); // Select the newly inserted row

  if (error) {
    logger.error({ error }, "Error saving training plan");
    throw new Error(`Failed to create training plan: ${error.message}`);
  }

  // Insert into join tables for assistants and goals
  const trainingPlanId = newTrainingPlan.id;
  if (data.assistantIds && data.assistantIds.length > 0) {
    await supabaseServiceRole
      .from('training_plan_assistants')
      .insert(
        data.assistantIds.map((assistantId) => ({
          training_plan_id: trainingPlanId,
          assistant_id: assistantId,
        }))
      );
  }
  if (data.goalIds && data.goalIds.length > 0) {
    await supabaseServiceRole
      .from('training_plan_goals')
      .insert(
        data.goalIds.map((goalId) => ({
          training_plan_id: trainingPlanId,
          goal_id: goalId,
        }))
      );
  }

  // Map the database response back to the GraphQL TrainingPlan type (assuming camelCase in GraphQL)
  // Note: You might need a more robust mapping function if column names differ significantly
  const createdTrainingPlan: TrainingPlan = {
    id: newTrainingPlan.id,
    client: newTrainingPlan.client,
    title: newTrainingPlan.title,
    overview: newTrainingPlan.overview,
    planJson: newTrainingPlan.plan_json,
    assistants: newTrainingPlan.assistants,
    goals: newTrainingPlan.goals,
    createdAt: new Date(newTrainingPlan.created_at), // Assuming Supabase returns timestamp strings
    updatedAt: new Date(newTrainingPlan.updated_at), // Assuming Supabase returns timestamp strings
    deletedAt: newTrainingPlan.deleted_at ? new Date(newTrainingPlan.deleted_at) : null,
    generatedBy: newTrainingPlan.generated_by || null, // Handle potential nulls
    sourcePrompt: newTrainingPlan.source_prompt || null, // Handle potential nulls
  };

  logger.info({ createdTrainingPlan }, "Successfully saved training plan");

  return createdTrainingPlan;
};