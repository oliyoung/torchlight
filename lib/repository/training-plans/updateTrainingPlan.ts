import { supabaseServiceRole } from "@/lib/supabase/serviceRoleClient";
import type { TrainingPlan } from "@/lib/types";

// Function to update a training plan in the database
export const updateTrainingPlan = async (
  userId: string | null,
  trainingPlanId: string,
  data: { overview?: string; planJson?: JSON; generatedBy?: string | null; sourcePrompt?: string | null },
): Promise<TrainingPlan | null> => {
  console.log("Updating training plan", trainingPlanId, "with data:", data);

  if (!userId) {
    console.log('updateTrainingPlan: No user ID provided.');
    return null;
  }

  // Ensure the training plan belongs to the user before updating
  const existingPlan = await supabaseServiceRole
    .from('training_plans')
    .select('id')
    .eq('id', trainingPlanId)
    .eq('user_id', userId)
    .single();

  if (!existingPlan) {
    console.log(`Training plan with ID ${trainingPlanId} not found for user ${userId}, cannot update.`);
    return null;
  }

  const { data: updatedPlan, error } = await supabaseServiceRole
    .from('training_plans')
    .update({
      overview: data.overview,
      plan_json: data.planJson, // Store JSON data directly
      generated_by: data.generatedBy, // Optional: if you pass this from the resolver
      source_prompt: data.sourcePrompt, // Optional: if you pass this from the resolver
      // updated_at will be automatically managed by Supabase if configured
    })
    .eq('id', trainingPlanId)
    .select()
    .single();

  if (error) {
    console.error(`Error updating training plan ${trainingPlanId}:`, error);
    throw new Error(`Failed to update training plan: ${error.message}`);
  }

  if (!updatedPlan) {
    console.error(`Update operation for training plan ${trainingPlanId} returned no data.`);
    return null; // Should not happen if there's no error, but good practice
  }

  // Map the database response back to the GraphQL TrainingPlan type
  const trainingPlan: TrainingPlan = {
    id: updatedPlan.id,
    client: updatedPlan.client,
    title: updatedPlan.title,
    overview: updatedPlan.overview,
    planJson: updatedPlan.plan_json,
    assistants: updatedPlan.assistants,
    goals: updatedPlan.goals,
    createdAt: new Date(updatedPlan.created_at), // Assuming Supabase returns timestamp strings
    updatedAt: new Date(updatedPlan.updated_at), // Assuming Supabase returns timestamp strings
    deletedAt: updatedPlan.deleted_at ? new Date(updatedPlan.deleted_at) : null,
    generatedBy: updatedPlan.generated_by || null, // Handle potential nulls
    sourcePrompt: updatedPlan.source_prompt || null, // Handle potential nulls
  };

  console.log("Successfully updated training plan:", trainingPlan);

  return trainingPlan;
};