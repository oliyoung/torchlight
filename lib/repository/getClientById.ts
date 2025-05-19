import { supabase } from "@/lib/supabase";
import type { Client } from "@/lib/types";

export async function getClientById(userId: string | null, clientId: Client['id']): Promise<Client | null> {
  const { data, error } = await supabase
    .from('clients')
    .select('*, firstName:first_name, userId:user_id, lastName:last_name, createdAt:created_at, updatedAt:updated_at, deletedAt:deleted_at')
    .eq('id', clientId)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching client:', error);
    return null;
  }

  return data as Client;
}