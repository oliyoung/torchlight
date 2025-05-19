import { supabase } from "@/lib/supabase";
import type { Client } from "@/lib/types";

export async function createClient(userId: string | null, input: Partial<Client>): Promise<Client> {
  if (!userId) return {} as Client;

  const { data, error } = await supabase
    .from('clients')
    .insert({
      user_id: userId,
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      birthday: input.birthday,
      gender: input.gender,
      fitness_level: input.fitnessLevel,
      training_history: input.trainingHistory,
      height: input.height,
      weight: input.weight,
      tags: input.tags,
      notes: input.notes
    })
    .select('*, createdAt:created_at, updatedAt:updated_at, deletedAt:deleted_at')
    .single();

  if (error) {
    console.error('Error Creating clients:', error);
    return {} as Client;
  }
  return data as Client;
}