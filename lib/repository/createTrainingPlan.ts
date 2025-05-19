import { supabase } from "@/lib/supabase";
import type { TrainingPlan } from "@/lib/types";

export async function createTrainingPlan(userId: string | null, input: Partial<TrainingPlan>): Promise<TrainingPlan> {
  if (!userId) return {} as TrainingPlan;

  const { data, error } = await supabase
    .from('training_plans')
    .insert({
      user_id: userId,
      client_id: input.clientId,
      title: input.title,
      overview: input.overview,
    })
    .select('*, createdAt:created_at, updatedAt:updated_at, deletedAt:deleted_at')
    .single();

  if (error) {
    console.error('Error creating training plan:', error);
    return {} as TrainingPlan;
  }
  return data as TrainingPlan;
}