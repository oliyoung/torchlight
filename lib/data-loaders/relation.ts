import DataLoader from 'dataloader';
import {
  getTrainingPlanIdsByClientId,
  getSessionLogIdsByGoalId,
  getGoalIdsBySessionLogId,
  getAssistantIdsByTrainingPlanId,
  getGoalIdsByTrainingPlanId
} from '@/lib/repository/relations';
import { logger } from '@/lib/logger';

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
      return Promise.all(
        goalIds.map(async (goalId) => {
          return getSessionLogIdsByGoalId(goalId);
        })
      );
    } catch (error) {
      logger.error({ error }, 'Error in goal session log IDs loader');
      return goalIds.map(() => []);
    }
  }, {
    cacheKeyFn: key => String(key)
  });
}

/**
 * Creates a DataLoader for batching session log → goal IDs requests
 */
export function createSessionLogGoalIdsLoader() {
  return new DataLoader<string, string[]>(async (sessionLogIds) => {
    try {
      return Promise.all(
        sessionLogIds.map(async (sessionLogId) => {
          return getGoalIdsBySessionLogId(sessionLogId);
        })
      );
    } catch (error) {
      logger.error({ error }, 'Error in session log goal IDs loader');
      return sessionLogIds.map(() => []);
    }
  }, {
    cacheKeyFn: key => String(key)
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