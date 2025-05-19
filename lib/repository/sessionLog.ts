import { supabaseServiceRole } from "@/lib/supabase/serviceRoleClient";
import type { SessionLog, Client } from "@/lib/types";

export async function getSessionLogsByClientId(userId: string | null, clientId: Client['id']): Promise<SessionLog[]> {
    logger.info('Fetching session logs for client ID:', clientId, 'for user:', userId);

    if (!userId) {
        logger.info('getSessionLogsByClientId: No user ID provided.');
        return [];
    }

    // Ensure client belongs to the user before fetching session logs for that client
    // This check is important for security
    const client = await supabaseServiceRole
        .from('clients')
        .select('id')
        .eq('id', clientId)
        .eq('user_id', userId)
        .single();

    if (!client) {
        logger.info(`Client with ID ${clientId} not found for user ${userId}, cannot fetch session logs.`);
        return []; // Return empty array if client not found or doesn't belong to user
    }

    const { data, error } = await supabaseServiceRole
        .from('session_logs') // Assuming table name is 'session_logs'
        .select('*') // Select all fields
        .eq('client_id', clientId);

    if (error) {
        console.error(`Error fetching session logs for client ID ${clientId} for user ${userId}:`, error);
        return [];
    }

    // Map database response to SessionLog type
    const fetchedSessionLogs: SessionLog[] = data.map(log => ({
        ...log,
        createdAt: new Date(log.created_at), // Assuming timestamp strings
        updatedAt: new Date(log.updated_at), // Assuming timestamp strings
        deletedAt: log.deleted_at ? new Date(log.deleted_at) : null, // Handle nullable deleted_at
        date: new Date(log.date), // Assuming date is a timestamp string
        // Assuming other fields like client and goals need resolving separately or are implicitly joined
    })) as SessionLog[]; // Type assertion

    logger.info(`Successfully fetched ${fetchedSessionLogs.length} session logs for client ID ${clientId} for user ${userId}.`);
    return fetchedSessionLogs;
}

export async function getSessionLogById(userId: string | null, sessionLogId: SessionLog['id']): Promise<SessionLog | null> {
    logger.info('Fetching session log by ID:', sessionLogId, 'for user:', userId);

    if (!userId) {
        logger.info('getSessionLogById: No user ID provided.');
        return null;
    }

    const { data: sessionLog, error } = await supabaseServiceRole
        .from('session_logs') // Assuming table name is 'session_logs'
        .select('*, client(id, user_id)') // Select session log and join client to check user_id
        .eq('id', sessionLogId)
        .single();

    if (error) {
        console.error(`Error fetching session log with ID ${sessionLogId} for user ${userId}:`, error);
        return null;
    }

    if (!sessionLog) {
        logger.info(`Session log with ID ${sessionLogId} not found for user ${userId}.`);
        return null;
    }

    // Additional check to ensure the session log's client belongs to the user
    if (!sessionLog.client || sessionLog.client.user_id !== userId) {
        logger.info(`Session log with ID ${sessionLogId} does not belong to user ${userId}.`);
        return null; // Return null if the session log does not belong to the user
    }

    // Map database response to SessionLog type
    const fetchedSessionLog: SessionLog = {
        ...sessionLog,
        createdAt: new Date(sessionLog.created_at), // Assuming timestamp strings
        updatedAt: new Date(sessionLog.updated_at), // Assuming timestamp strings
        deletedAt: sessionLog.deleted_at ? new Date(sessionLog.deleted_at) : null, // Handle nullable deleted_at
        date: new Date(sessionLog.date), // Assuming date is a timestamp string
        // The client relationship might need further handling depending on GraphQL resolvers
        // For now, we exclude the nested client object from the return to match the expected SessionLog type structure unless explicitly defined.
    } as SessionLog; // Type assertion

    // Remove the nested client object as it might not be expected directly in the SessionLog type in GraphQL
    delete (fetchedSessionLog as any).client;

    logger.info('Successfully fetched session log:', fetchedSessionLog);
    return fetchedSessionLog;
}