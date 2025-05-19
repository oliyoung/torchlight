import { supabase } from "@/lib/supabase";
import type { Client } from "@/lib/types";

export async function getClients(userId: string | null): Promise<Client[]> {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('clients')
    .select('*, firstName:first_name, userId:user_id, lastName:last_name, createdAt:created_at, updatedAt:updated_at, deletedAt:deleted_at')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching clients:', error);
    return [];
  }
  return data as Client[];
}