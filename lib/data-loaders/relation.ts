import { logger } from '@/lib/logger';
import {
  getGoalSessionLogIds,
  getGoalTrainingPlanIds,
  getSessionLogGoalIds,
  getTrainingPlanAssistantIds,
  getTrainingPlanGoalIds,
  getTrainingPlanIdsByAthleteId
} from '@/lib/repository/relations';
import { supabaseServiceRole } from '@/lib/supabase/serviceRoleClient';
import DataLoader from 'dataloader';

/**
 * Creates a DataLoader for batching athlete → training plan IDs requests
 */
export function createAthleteTrainingPlanIdsLoader(userId: string | null) {
  return new DataLoader<string, string[]>(async (athleteIds) => {
    try {
      // Process each athlete ID individually since we need separate arrays per athlete
      return Promise.all(
        athleteIds.map(async (athleteId) => {
          return getTrainingPlanIdsByAthleteId(userId, athleteId);
        })
      );
    } catch (error) {
      logger.error({ error }, 'Error in athlete training plan IDs loader');
      return athleteIds.map(() => []);
    }
  });
}

/**
 * Creates a DataLoader for batching goal → session log IDs requests
 */
export function createGoalSessionLogIdsLoader() {
  return new DataLoader<string, string[]>(async (goalIds) => {
    try {
      // Process each goal ID individually
      return Promise.all(
        goalIds.map(async (goalId) => {
          return getGoalSessionLogIds(goalId);
        })
      );
    } catch (error) {
      logger.error({ error }, 'Error in goal session log IDs loader');
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
      // Process each session log ID individually
      return Promise.all(
        sessionLogIds.map(async (sessionLogId) => {
          return getSessionLogGoalIds(sessionLogId);
        })
      );
    } catch (error) {
      logger.error({ error }, 'Error in session log goal IDs loader');
      return sessionLogIds.map(() => []);
    }
  });
}

/**
 * Creates a DataLoader for batching goal → training plan IDs requests
 */
export function createGoalTrainingPlanIdsLoader() {
  return new DataLoader<string, string[]>(async (goalIds) => {
    try {
      // Process each goal ID individually
      return Promise.all(
        goalIds.map(async (goalId) => {
          return getGoalTrainingPlanIds(goalId);
        })
      );
    } catch (error) {
      logger.error({ error }, 'Error in goal training plan IDs loader');
      return goalIds.map(() => []);
    }
  });
}

/**
 * Creates a DataLoader for batching training plan → assistant IDs requests
 */
export function createTrainingPlanAssistantIdsLoader() {
  return new DataLoader<string, string[]>(async (trainingPlanIds) => {
    try {
      // Process each training plan ID individually
      return Promise.all(
        trainingPlanIds.map(async (trainingPlanId) => {
          return getTrainingPlanAssistantIds(trainingPlanId);
        })
      );
    } catch (error) {
      logger.error({ error }, 'Error in training plan assistant IDs loader');
      return trainingPlanIds.map(() => []);
    }
  });
}

/**
 * Creates a DataLoader for batching training plan → goal IDs requests
 */
export function createTrainingPlanGoalIdsLoader() {
  return new DataLoader<string, string[]>(async (trainingPlanIds) => {
    try {
      // Process each training plan ID individually
      return Promise.all(
        trainingPlanIds.map(async (trainingPlanId) => {
          return getTrainingPlanGoalIds(trainingPlanId);
        })
      );
    } catch (error) {
      logger.error({ error }, 'Error in training plan goal IDs loader');
      return trainingPlanIds.map(() => []);
    }
  });
}