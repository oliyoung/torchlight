import { supabaseServiceRole } from "@/lib/supabase/serviceRoleClient";
import { logger } from "@/lib/logger";

/**
 * Get training plan IDs associated with a client
 */
export async function getTrainingPlanIdsByClientId(
  userId: string | null,
  clientId: string
): Promise<string[]> {
  try {
    if (!userId) return [];

    const { data, error } = await supabaseServiceRole
      .from('training_plans')
      .select('id')
      .eq('client_id', clientId)
      .eq('user_id', userId);

    if (error) {
      logger.error({ error, clientId }, 'Error fetching training plan IDs for client');
      return [];
    }

    return data.map(item => item.id);
  } catch (error) {
    logger.error({ error, clientId }, 'Exception fetching training plan IDs for client');
    return [];
  }
}

/**
 * Get session log IDs associated with a goal
 */
export async function getSessionLogIdsByGoalId(goalId: string): Promise<string[]> {
  try {
    const { data, error } = await supabaseServiceRole
      .from('goal_session_logs')
      .select('session_log_id')
      .eq('goal_id', goalId);

    if (error) {
      logger.error({ error, goalId }, 'Error fetching session log IDs for goal');
      return [];
    }

    return data.map(item => item.session_log_id);
  } catch (error) {
    logger.error({ error, goalId }, 'Exception fetching session log IDs for goal');
    return [];
  }
}

/**
 * Get goal IDs associated with a session log
 */
export async function getGoalIdsBySessionLogId(sessionLogId: string): Promise<string[]> {
  try {
    const { data, error } = await supabaseServiceRole
      .from('goal_session_logs')
      .select('goal_id')
      .eq('session_log_id', sessionLogId);

    if (error) {
      logger.error({ error, sessionLogId }, 'Error fetching goal IDs for session log');
      return [];
    }

    return data.map(item => item.goal_id);
  } catch (error) {
    logger.error({ error, sessionLogId }, 'Exception fetching goal IDs for session log');
    return [];
  }
}

/**
 * Get assistant IDs associated with a training plan
 */
export async function getAssistantIdsByTrainingPlanId(trainingPlanId: string): Promise<string[]> {
  try {
    const { data, error } = await supabaseServiceRole
      .from('training_plan_assistants')
      .select('assistant_id')
      .eq('training_plan_id', trainingPlanId);

    if (error) {
      logger.error({ error, trainingPlanId }, 'Error fetching assistant IDs for training plan');
      return [];
    }

    return data.map(item => item.assistant_id);
  } catch (error) {
    logger.error({ error, trainingPlanId }, 'Exception fetching assistant IDs for training plan');
    return [];
  }
}

/**
 * Get goal IDs associated with a training plan
 */
export async function getGoalIdsByTrainingPlanId(trainingPlanId: string): Promise<string[]> {
  try {
    const { data, error } = await supabaseServiceRole
      .from('training_plan_goals')
      .select('goal_id')
      .eq('training_plan_id', trainingPlanId);

    if (error) {
      logger.error({ error, trainingPlanId }, 'Error fetching goal IDs for training plan');
      return [];
    }

    return data.map(item => item.goal_id);
  } catch (error) {
    logger.error({ error, trainingPlanId }, 'Exception fetching goal IDs for training plan');
    return [];
  }
}