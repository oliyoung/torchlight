import { supabase } from "@/lib/supabase";
import type { Assistant, AssistantsInput } from "@/lib/types";

export async function getAssistants(input: AssistantsInput): Promise<Assistant[]> {
  const { filter } = input ?? {};
  const { sport, role, strengths } = filter ?? {};

  const query = supabase.from('assistants').select('*');
  if (sport) query.eq('sport', sport);
  if (role) query.eq('role', role);
  if (strengths) query.in('strengths', strengths);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching assistants:', error);
    return [];
  }
  return data as Assistant[];
}