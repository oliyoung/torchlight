
import { supabase } from "./supabase";
import type { Client, Goal, SessionLog } from "./types";

export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*');

  if (error) {
    console.error('Error fetching clients:', error);
    return [];
  }
  return data as Client[];
}

export async function getClientById(clientId: Client['id']): Promise<Client | null> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single();

  if (error) {
    console.error('Error fetching client:', error);
    return null;
  }

  return data as Client;
}

export async function getGoalById(goalId: Goal['id'], clientId: Client['id']): Promise<Goal | null> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('id', goalId)
    .eq('client_id', clientId)
    .single();

  if (error) {
    console.error('Error fetching goal:', error);
    return null;
  }
  return data as Goal;
}

export async function getGoalsByClientId(clientId: Client['id']): Promise<Goal[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('client_id', clientId);
  if (error) {
    console.error('Error fetching goals:', error);
    return [];
  }
  return data as Goal[];
}

export async function getGoalsByIds(goalIds: string[]): Promise<Goal[]> {
  // Logic to fetch goals by IDs
  return [];
}

export async function getSessionLogsByIds(sessionLogIds: string[]): Promise<SessionLog[]> {
  // Logic to fetch session logs by IDs
  return [];
}

// Function to calculate age from birthday
export function calculateAge(birthday: string): number {
  const birthDate = new Date(birthday);
  const ageDifMs = Date.now() - birthDate.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}
