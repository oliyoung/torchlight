import type { Assistant, AssistantsInput, Client, Goal, SessionLog, TrainingPlan } from "../types";
import { supabaseServiceRole } from "../supabase/serviceRoleClient";
import { logger } from "../logger";


export async function getAssistants(input: AssistantsInput): Promise<Assistant[]> {
  const { filter } = input ?? {};
  const { sport, role, strengths } = filter ?? {};

  const query = supabaseServiceRole.from('assistants').select('*');
  if (sport) query.eq('sport', sport);
  if (role) query.eq('role', role);
  if (strengths) query.in('strengths', strengths);

  const { data, error } = await query;

  if (error) {
    logger.error({ error }, 'Error fetching assistants');
    return [];
  }
  return data as Assistant[];
}

export async function createClient(userId: string | null, input: Partial<Client>): Promise<Client> {
  if (!userId) return {} as Client;

  const { data, error } = await supabaseServiceRole
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
    logger.error({ error }, 'Error Creating clients');
    return {} as Client;
  }
  return data as Client;
}

export async function getClients(userId: string | null): Promise<Client[]> {
  if (!userId) return [];
  const { data, error } = await supabaseServiceRole
    .from('clients')
    .select('*, firstName:first_name, userId:user_id, lastName:last_name, createdAt:created_at, updatedAt:updated_at, deletedAt:deleted_at')
    .eq('user_id', userId);

  if (error) {
    logger.error({ error }, 'Error fetching clients');
    return [];
  }
  return data as Client[];
}

export async function getClientById(userId: string | null, clientId: Client['id']): Promise<Client | null> {
  logger.info({ userId, clientId }, 'Fetching client by ID');

  const { data, error } = await supabaseServiceRole
    .from('clients')
    .select('*, firstName:first_name, userId:user_id, lastName:last_name, createdAt:created_at, updatedAt:updated_at, deletedAt:deleted_at')
    .eq('id', clientId)
    .eq('user_id', userId)
    .single();

  if (error) {
    logger.error({ error }, 'Error fetching client');
    return null;
  }

  return data as Client;
}

export async function getGoalById(userId: string | null, goalId: Goal['id']): Promise<Goal | null> {
  const { data, error } = await supabaseServiceRole
    .from('goals')
    .select('*')
    .eq('id', goalId)
    .eq('user_id', userId)
    .single();

  if (error) {
    logger.error({ error }, 'Error fetching goal');
    return null;
  }
  return data as Goal;
}

export async function getGoalsByClientId(userId: string | null, clientId: Client['id']): Promise<Goal[]> {
  const { data, error } = await supabaseServiceRole
    .from('goals')
    .select('*')
    .eq('client_id', clientId);
  if (error) {
    logger.error({ error }, 'Error fetching goals');
    return [];
  }
  return data as Goal[];
}

export async function getSessionLogsByClientId(userId: string | null, clientId: Client['id']): Promise<SessionLog[]> {
  return [];
}
export async function getSessionLogById(userId: string | null, sessionLogId: SessionLog['id']): Promise<SessionLog | null> {
  return null;
}

// Function to calculate age from birthday
export function calculateAge(birthday: string): number {
  const birthDate = new Date(birthday);
  const ageDifMs = Date.now() - birthDate.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}
