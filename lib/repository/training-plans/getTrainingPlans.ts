import { supabaseServiceRole } from "@/lib/supabase/serviceRoleClient";
import type { TrainingPlan } from "@/lib/types";


// Function to get training plans for a specific user (and optionally client)
export async function getTrainingPlans(userId: string | null, clientId: string | null): Promise<TrainingPlan[]> {
  console.log('Fetching training plans for user:', userId, 'and client:', clientId);
  if (!userId) {
    console.log('getTrainingPlans: No user ID provided.');
    return [];
  }

  let query = supabaseServiceRole
    .from('training_plans')
    .select('*')
    .eq('user_id', userId); // Filter by user ID

  if (clientId) {
    query = query.eq('client_id', clientId); // Optionally filter by client ID
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Error fetching training plans for user ${userId}:`, error);
    return [];
  }

  // Map database response array to TrainingPlan type array
  const fetchedTrainingPlans: TrainingPlan[] = data.map(plan => ({
    ...plan,
    createdAt: new Date(plan.created_at), // Assuming timestamp strings
    updatedAt: new Date(plan.updated_at), // Assuming timestamp strings
    deletedAt: plan.deleted_at ? new Date(plan.deleted_at) : null, // Handle nullable deleted_at
  })) as TrainingPlan[]; // Type assertion

  console.log(`Successfully fetched ${fetchedTrainingPlans.length} training plans for user ${userId}.`);
  return fetchedTrainingPlans;
}