import { createClient } from '@supabase/supabase-js';
import type { TrainingPlan, CreateTrainingPlanInput } from "@/lib/types";
import type { JSON } from "@/lib/types"; // Import JSON type if not already imported

// Initialize Supabase client with service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// WARNING: SUPABASE_SERVICE_ROLE_KEY should only be used on the server-side and kept secret.
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables for service role client');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Function to create a new training plan in the database
export const createTrainingPlan = async (
    userId: string | null,
    data: CreateTrainingPlanInput & { overview: string; planJson: JSON },
): Promise<TrainingPlan> => {
    console.log("Saving training plan to database:", data);

    // Map the input data to the database schema (assuming snake_case)
    const { data: newTrainingPlan, error } = await supabase
        .from('training_plans') // Assuming your table name is 'training_plans'
        .insert([
            {
                client_id: data.clientId,
                title: data.title,
                overview: data.overview,
                plan_json: data.planJson, // Store JSON data directly
                assistant_ids: data.assistantIds, // Assuming these are stored as an array type or JSONB
                goal_ids: data.goalIds, // Assuming these are stored as an array type or JSONB
                // Supabase often auto-manages created_at, updated_at, id
                // generated_by: data.generatedBy, // Optional: if you pass this from the resolver
                // source_prompt: data.sourcePrompt, // Optional: if you pass this from the resolver
            },
        ])
        .select()
        .single(); // Select the newly inserted row

    if (error) {
        console.error("Error saving training plan:", error);
        throw new Error(`Failed to create training plan: ${error.message}`);
    }

    // Map the database response back to the GraphQL TrainingPlan type (assuming camelCase in GraphQL)
    // Note: You might need a more robust mapping function if column names differ significantly
    const createdTrainingPlan: TrainingPlan = {
        id: newTrainingPlan.id,
        clientId: newTrainingPlan.client_id,
        title: newTrainingPlan.title,
        overview: newTrainingPlan.overview,
        planJson: newTrainingPlan.plan_json,
        assistantIds: newTrainingPlan.assistant_ids,
        goalIds: newTrainingPlan.goal_ids,
        createdAt: new Date(newTrainingPlan.created_at), // Assuming Supabase returns timestamp strings
        updatedAt: new Date(newTrainingPlan.updated_at), // Assuming Supabase returns timestamp strings
        deletedAt: newTrainingPlan.deleted_at ? new Date(newTrainingPlan.deleted_at) : null,
        generatedBy: newTrainingPlan.generated_by || null, // Handle potential nulls
        sourcePrompt: newTrainingPlan.source_prompt || null, // Handle potential nulls
    };

    console.log("Successfully saved training plan:", createdTrainingPlan);

    return createdTrainingPlan;
};

// Function to get a training plan by its ID
export const getTrainingPlanById = async (id: string): Promise<TrainingPlan | null> => {
    console.log("Fetching training plan by ID:", id);

    const { data: trainingPlan, error } = await supabase
        .from('training_plans')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error(`Error fetching training plan with ID ${id}:`, error);
        // Depending on error type, might throw or return null. Returning null for not found is common.
        return null;
    }

    if (!trainingPlan) {
        console.log(`Training plan with ID ${id} not found.`);
        return null;
    }

    // Map the database response back to the GraphQL TrainingPlan type
    const fetchedTrainingPlan: TrainingPlan = {
        id: trainingPlan.id,
        clientId: trainingPlan.client_id,
        title: trainingPlan.title,
        overview: trainingPlan.overview,
        planJson: trainingPlan.plan_json,
        assistantIds: trainingPlan.assistant_ids,
        goalIds: trainingPlan.goal_ids,
        createdAt: new Date(trainingPlan.created_at),
        updatedAt: new Date(trainingPlan.updated_at),
        deletedAt: trainingPlan.deleted_at ? new Date(trainingPlan.deleted_at) : null,
        generatedBy: trainingPlan.generated_by || null,
        sourcePrompt: trainingPlan.source_prompt || null,
    };

    console.log("Successfully fetched training plan:", fetchedTrainingPlan);

    return fetchedTrainingPlan;
};

// Function to get all training plans for a specific client ID
export const getTrainingPlansByClientId = async (clientId: string): Promise<TrainingPlan[]> => {
    console.log("Fetching training plans for client ID:", clientId);

    const { data: trainingPlans, error } = await supabase
        .from('training_plans')
        .select('*')
        .eq('client_id', clientId);

    if (error) {
        console.error(`Error fetching training plans for client ID ${clientId}:`, error);
        throw new Error(`Failed to fetch training plans: ${error.message}`);
    }

    // Map the database response array back to the GraphQL TrainingPlan type array
    const fetchedTrainingPlans: TrainingPlan[] = trainingPlans.map(plan => ({
        id: plan.id,
        clientId: plan.client_id,
        title: plan.title,
        overview: plan.overview,
        planJson: plan.plan_json,
        assistantIds: plan.assistant_ids,
        goalIds: plan.goal_ids,
        createdAt: new Date(plan.created_at),
        updatedAt: new Date(plan.updated_at),
        deletedAt: plan.deleted_at ? new Date(plan.deleted_at) : null,
        generatedBy: plan.generated_by || null,
        sourcePrompt: plan.source_prompt || null,
    }));

    console.log(`Successfully fetched ${fetchedTrainingPlans.length} training plans for client ID ${clientId}.`);

    return fetchedTrainingPlans;
};

// TODO: Add other repository functions (e.g., getTrainingPlan, getTrainingPlans, updateTrainingPlan, deleteTrainingPlan)