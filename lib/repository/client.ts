import { supabaseServiceRole } from "@/lib/supabase/serviceRoleClient";
import type { Client } from "@/lib/types";

export async function createClient(userId: string | null, input: Partial<Client>): Promise<Client> {
    if (!userId) return {} as Client;

    const { data, error } = await supabaseServiceRole
        .from('clients')
        .insert({
            user_id: userId,
            first_name: input.firstName,
            last_name: input.lastName,
            email: input.email,
            birthday: input.birthday, // Assuming birthday is correctly formatted for Supabase insert
            gender: input.gender,
            fitness_level: input.fitnessLevel,
            training_history: input.trainingHistory,
            height: input.height, // Assuming height is correctly formatted
            weight: input.weight, // Assuming weight is correctly formatted
            tags: input.tags, // Assuming tags is compatible with Supabase array or JSONB type
            notes: input.notes
        })
        .select('*, createdAt:created_at, updatedAt:updatedAt, deletedAt:deleted_at') // Alias updated_at
        .single();

    if (error) {
        console.error('Error Creating clients:', error);
        // Decide on error handling strategy: throw, return null, or return default.
        // Returning default as per original index.ts, but throwing is often better for mutations.
        return {} as Client;
    }
    // Alias updated_at in return as well for consistency with select
    return { ...data, updatedAt: new Date(data.updated_at) } as Client;
}

export async function getClients(userId: string | null): Promise<Client[]> {
    if (!userId) return [];
    const { data, error } = await supabaseServiceRole
        .from('clients')
        .select('*, firstName:first_name, userId:user_id, lastName:last_name, createdAt:created_at, updatedAt:updated_at, deletedAt:deleted_at')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching clients:', error);
        return [];
    }
    // Map updated_at consistently
    return data.map(client => ({ ...client, updatedAt: new Date(client.updated_at) })) as Client[];
}

export async function getClientById(userId: string | null, clientId: Client['id']): Promise<Client | null> {
    const { data, error } = await supabaseServiceRole
        .from('clients')
        .select('*, firstName:first_name, userId:user_id, lastName:last_name, createdAt:created_at, updatedAt:updated_at, deletedAt:deleted_at')
        .eq('id', clientId)
        .eq('user_id', userId) // Ensure client belongs to the user
        .single();

    if (error) {
        console.error('Error fetching client:', error);
        // For fetching a single item, returning null on error or not found is appropriate
        return null;
    }

    if (!data) {
        logger.info(`Client with ID ${clientId} not found for user ${userId}.`);
        return null;
    }

    // Map updated_at consistently
    return { ...data, updatedAt: new Date(data.updated_at) } as Client;
}