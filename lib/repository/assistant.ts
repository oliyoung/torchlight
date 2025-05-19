import { supabaseServiceRole } from "@/lib/supabase/serviceRoleClient";
import type { Assistant, AssistantsInput } from "@/lib/types";
import { logger } from "../logger";

export async function getAssistantsByIds(ids: Assistant['id'][]): Promise<Assistant[]> {
    return []
}

export async function getAssistants(input: AssistantsInput): Promise<Assistant[]> {
    logger.info('Fetching assistants with input:', input);

    const { filter } = input ?? {};
    const { sport, role, strengths } = filter ?? {};

    const query = supabaseServiceRole.from('assistants').select('*');

    if (sport) query.eq('sport', sport);
    if (role) query.eq('role', role);
    // Assuming strengths filter works with Supabase 'in' operator on an array type column
    if (strengths && strengths.length > 0) query.in('strengths', strengths);

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching assistants:', error);
        return [];
    }

    // Assuming created_at and updated_at might need mapping if they are strings
    const fetchedAssistants: Assistant[] = data.map(assistant => ({
        ...assistant,
        createdAt: new Date(assistant.created_at), // Assuming timestamp strings
        updatedAt: new Date(assistant.updated_at), // Assuming timestamp strings
        deletedAt: assistant.deleted_at ? new Date(assistant.deleted_at) : null, // Handle nullable deleted_at
        // Assuming promptTemplate and bio are returned directly
    })) as Assistant[]; // Type assertion

    logger.info(`Successfully fetched ${fetchedAssistants.length} assistants.`);
    return fetchedAssistants;
}

export async function getAssistantsByTrainingPlanId(trainingPlanId: number): Promise<Assistant[]> {
    const { data, error } = await supabaseServiceRole
        .from('training_plan_assistants')
        .select('assistant_id')
        .eq('training_plan_id', trainingPlanId);
    if (error) {
        logger.error('Error fetching assistant IDs for training plan:', error);
        return [];
    }
    const assistantIds = (data ?? []).map((row: { assistant_id: number }) => row.assistant_id);
    if (assistantIds.length === 0) return [];
    const { data: assistants, error: assistantsError } = await supabaseServiceRole
        .from('assistants')
        .select('*')
        .in('id', assistantIds);
    if (assistantsError) {
        logger.error('Error fetching assistants:', assistantsError);
        return [];
    }
    return (assistants ?? []) as Assistant[];
}