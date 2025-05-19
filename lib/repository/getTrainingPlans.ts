import { supabase } from "@/lib/supabase";
import type { TrainingPlan } from "@/lib/types";

export async function getTrainingPlans(userId: string | null, clientId: string | null): Promise<TrainingPlan[]> {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('training_plans')
    .select('*,clientId:client_id,createdAt:created_at,updatedAt:updated_at,deletedAt:deleted_at')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching training plans:', error);
    return [];
  }
  return data as TrainingPlan[];
}