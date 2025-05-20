import { logger } from '@/lib/logger';
import {
  getAssistantIdsByTrainingPlanId,
  getGoalIdsBySessionLogId,
  getGoalIdsByTrainingPlanId,
  getSessionLogIdsByGoalId,
  getTrainingPlanIdsByClientId
} from '@/lib/repository/relations';
import { supabaseServiceRole } from '@/lib/supabase/serviceRoleClient';
import DataLoader from 'dataloader';

/**
 * Creates a DataLoader for batching client → training plan IDs requests
 */
export function createClientTrainingPlanIdsLoader(userId: string | null) {
  return new DataLoader<string, string[]>(async (clientIds) => {
    try {
      // Process each client ID individually since we need separate arrays per client
      return Promise.all(
        clientIds.map(async (clientId) => {
          return getTrainingPlanIdsByClientId(userId, clientId);
        })
      );
    } catch (error) {
      logger.error({ error }, 'Error in client training plan IDs loader');
      return clientIds.map(() => []);
    }
  }, {
    cacheKeyFn: key => String(key)
  });
}

/**
 * Creates a DataLoader for batching goal → session log IDs requests
 */
export function createGoalSessionLogIdsLoader() {
  return new DataLoader<string, string[]>(async (goalIds) => {
    try {
      // Batch fetch session log IDs for all goals in this batch
      const { data, error } = await supabaseServiceRole
        .from('goal_session_logs')
        .select('goal_id, session_log_id')
        .in('goal_id', goalIds as string[]);

      if (error) {
        logger.error({ error, goalIds }, 'Error fetching session log IDs for goals');
        return goalIds.map(() => []);
      }

      // Group session log IDs by goal ID
      const sessionLogIdsByGoalId = new Map<string, string[]>();

      for (const goalId of goalIds) {
        sessionLogIdsByGoalId.set(goalId, []);
      }

      for (const row of data) {
        const goalId = row.goal_id;
        const sessionLogId = row.session_log_id;
        const sessionLogIds = sessionLogIdsByGoalId.get(goalId) || [];
        sessionLogIds.push(sessionLogId);
        sessionLogIdsByGoalId.set(goalId, sessionLogIds);
      }

      // Return session log IDs in the order of the input goal IDs
      return goalIds.map(goalId => sessionLogIdsByGoalId.get(goalId) || []);
    } catch (error) {
      logger.error({ error, goalIds }, 'Exception fetching session log IDs for goals');
      return goalIds.map(() => []);
    }
  });
}

/**
 * Creates a DataLoader for batching session log → goal IDs requests
 */
export function createSessionLogGoalIdsLoader() {
  return new DataLoader<string, string[]>(async (sessionLogIds) => {
    try {
      // Batch fetch goal IDs for all session logs in this batch
      const { data, error } = await supabaseServiceRole
        .from('goal_session_logs')
        .select('session_log_id, goal_id')
        .in('session_log_id', sessionLogIds as string[]);

      if (error) {
        logger.error({ error, sessionLogIds }, 'Error fetching goal IDs for session logs');
        return sessionLogIds.map(() => []);
      }

      // Group goal IDs by session log ID
      const goalIdsBySessionLogId = new Map<string, string[]>();

      for (const sessionLogId of sessionLogIds) {
        goalIdsBySessionLogId.set(sessionLogId, []);
      }

      for (const row of data) {
        const sessionLogId = row.session_log_id;
        const goalId = row.goal_id;
        const goalIds = goalIdsBySessionLogId.get(sessionLogId) || [];
        goalIds.push(goalId);
        goalIdsBySessionLogId.set(sessionLogId, goalIds);
      }

      // Return goal IDs in the order of the input session log IDs
      return sessionLogIds.map(sessionLogId => goalIdsBySessionLogId.get(sessionLogId) || []);
    } catch (error) {
      logger.error({ error, sessionLogIds }, 'Exception fetching goal IDs for session logs');
      return sessionLogIds.map(() => []);
    }
  });
}

/**
 * Creates a DataLoader for batching training plan → assistant IDs requests
 */
export function createTrainingPlanAssistantIdsLoader() {
  return new DataLoader<string, string[]>(async (trainingPlanIds) => {
    try {
      return Promise.all(
        trainingPlanIds.map(async (trainingPlanId) => {
          return getAssistantIdsByTrainingPlanId(trainingPlanId);
        })
      );
    } catch (error) {
      logger.error({ error }, 'Error in training plan assistant IDs loader');
      return trainingPlanIds.map(() => []);
    }
  }, {
    cacheKeyFn: key => String(key)
  });
}

/**
 * Creates a DataLoader for batching training plan → goal IDs requests
 */
export function createTrainingPlanGoalIdsLoader() {
  return new DataLoader<string, string[]>(async (trainingPlanIds) => {
    try {
      return Promise.all(
        trainingPlanIds.map(async (trainingPlanId) => {
          return getGoalIdsByTrainingPlanId(trainingPlanId);
        })
      );
    } catch (error) {
      logger.error({ error }, 'Error in training plan goal IDs loader');
      return trainingPlanIds.map(() => []);
    }
  }, {
    cacheKeyFn: key => String(key)
  });
}

/**
 * Creates a DataLoader for loading training plan IDs for a goal
 */
export function createGoalTrainingPlanIdsLoader() {
  return new DataLoader<string, string[]>(async (goalIds) => {
    try {
      // Batch fetch training plan IDs for all goals in this batch
      const { data, error } = await supabaseServiceRole
        .from('training_plan_goals')
        .select('goal_id, training_plan_id')
        .in('goal_id', goalIds as string[]);

      if (error) {
        logger.error({ error, goalIds }, 'Error fetching training plan IDs for goals');
        return goalIds.map(() => []);
      }

      // Group training plan IDs by goal ID
      const trainingPlanIdsByGoalId = new Map<string, string[]>();

      for (const goalId of goalIds) {
        trainingPlanIdsByGoalId.set(goalId, []);
      }

      for (const row of data) {
        const goalId = row.goal_id;
        const trainingPlanId = row.training_plan_id;
        const trainingPlanIds = trainingPlanIdsByGoalId.get(goalId) || [];
        trainingPlanIds.push(trainingPlanId);
        trainingPlanIdsByGoalId.set(goalId, trainingPlanIds);
      }

      // Return training plan IDs in the order of the input goal IDs
      return goalIds.map(goalId => trainingPlanIdsByGoalId.get(goalId) || []);
    } catch (error) {
      logger.error({ error, goalIds }, 'Exception fetching training plan IDs for goals');
      return goalIds.map(() => []);
    }
  });
}