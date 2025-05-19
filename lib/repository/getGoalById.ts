import { supabase } from "@/lib/supabase";
import type { Goal, Client } from "@/lib/types";

export async function getGoalById(userId: string | null, goalId: Goal['id']): Promise<Goal | null> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('id', goalId)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching goal:', error);
    return null;
  }
  return data as Goal;
}