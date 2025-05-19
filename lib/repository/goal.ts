import { supabaseServiceRole } from "@/lib/supabase/serviceRoleClient";
import type { Goal, Client } from "@/lib/types";

export async function getGoalById(userId: string | null, goalId: Goal['id']): Promise<Goal | null> {
    logger.info('Fetching goal by ID:', goalId, 'for user:', userId);

    if (!userId) {
        logger.info('getGoalById: No user ID provided.');
        return null;
    }

    const { data, error } = await supabaseServiceRole
        .from('goals')
        .select('*')
        .eq('id', goalId)
        .eq('user_id', userId) // Ensure goal belongs to the user
        .single();

    if (error) {
        console.error(`Error fetching goal with ID ${goalId} for user ${userId}:`, error);
        return null;
    }

    if (!data) {
        logger.info(`Goal with ID ${goalId} not found for user ${userId}.`);
        return null;
    }

    // Assuming created_at and updated_at need mapping to Date objects if they are strings
    const fetchedGoal: Goal = {
        ...data,
        createdAt: new Date(data.created_at), // Assuming created_at is a string timestamp
        updatedAt: new Date(data.updated_at), // Assuming updated_at is a string timestamp
        deletedAt: data.deleted_at ? new Date(data.deleted_at) : null, // Handle nullable deleted_at
        // Assuming other fields like client and sessionLogs need resolving separately or are implicitly joined by Supabase
    } as Goal; // Type assertion for now, proper mapping might be needed

    logger.info('Successfully fetched goal:', fetchedGoal);
    return fetchedGoal;
}

export async function getGoalsByClientId(userId: string | null, clientId: Client['id']): Promise<Goal[]> {
    logger.info('Fetching goals for client ID:', clientId, 'for user:', userId);

    if (!userId) {
        logger.info('getGoalsByClientId: No user ID provided.');
        return [];
    }

    // Ensure client belongs to the user before fetching goals for that client
    // This check is important for security
    const client = await supabaseServiceRole
        .from('clients')
        .select('id')
        .eq('id', clientId)
        .eq('user_id', userId)
        .single();

    if (!client) {
        logger.info(`Client with ID ${clientId} not found for user ${userId}, cannot fetch goals.`);
        return []; // Return empty array if client not found or doesn't belong to user
    }

    const { data, error } = await supabaseServiceRole
        .from('goals')
        .select('*')
        .eq('client_id', clientId);

    if (error) {
        console.error(`Error fetching goals for client ID ${clientId} for user ${userId}:`, error);
        return [];
    }

    // Assuming created_at and updated_at need mapping to Date objects if they are strings
    const fetchedGoals: Goal[] = data.map(goal => ({
        ...goal,
        createdAt: new Date(goal.created_at), // Assuming created_at is a string timestamp
        updatedAt: new Date(goal.updated_at), // Assuming updated_at is a string timestamp
        deletedAt: goal.deleted_at ? new Date(goal.deleted_at) : null, // Handle nullable deleted_at
        // Assuming other fields like client and sessionLogs need resolving separately or are implicitly joined by Supabase
    })) as Goal[]; // Type assertion for now, proper mapping might be needed

    logger.info(`Successfully fetched ${fetchedGoals.length} goals for client ID ${clientId} for user ${userId}.`);
    return fetchedGoals;
}

// Function to get goals by a list of IDs
export async function getGoalsByIds(userId: string | null, goalIds: string[]): Promise<Goal[]> {
    logger.info('Fetching goals by IDs:', goalIds, 'for user:', userId);

    if (!userId) {
        logger.info('getGoalsByIds: No user ID provided.');
        return [];
    }

    if (goalIds.length === 0) {
        logger.info('getGoalsByIds: No goal IDs provided.');
        return [];
    }

    const { data, error } = await supabaseServiceRole
        .from('goals')
        .select('*')
        .in('id', goalIds)
        .eq('user_id', userId); // Ensure goals belong to the user

    if (error) {
        console.error(`Error fetching goals by IDs ${goalIds} for user ${userId}:`, error);
        return [];
    }

    // Assuming created_at and updated_at need mapping to Date objects if they are strings
    const fetchedGoals: Goal[] = data.map(goal => ({
        ...goal,
        createdAt: new Date(goal.created_at), // Assuming created_at is a string timestamp
        updatedAt: new Date(goal.updated_at), // Assuming updated_at is a string timestamp
        deletedAt: goal.deleted_at ? new Date(goal.deleted_at) : null, // Handle nullable deleted_at
        // Assuming other fields like client and sessionLogs need resolving separately or are implicitly joined by Supabase
    })) as Goal[]; // Type assertion for now, proper mapping might be needed

    logger.info(`Successfully fetched ${fetchedGoals.length} goals by IDs ${goalIds} for user ${userId}.`);
    return fetchedGoals;
}