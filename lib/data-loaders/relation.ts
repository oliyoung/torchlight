import { logger } from '@/lib/logger';
import {
  // Removed imports from deleted relations.ts
  // getGoalSessionLogIds,
  // getGoalTrainingPlanIds,
  // getSessionLogGoalIds,
  // getTrainingPlanAssistantIds,
  // getTrainingPlanGoalIds,
  // getTrainingPlanIdsByAthleteId
} from '@/lib/repository/relations'; // This import will be removed
import { supabaseServiceRole } from '@/lib/supabase/serviceRoleClient';
import DataLoader from 'dataloader';
import { relationRepository } from '@/lib/repository';

// Import JoinTableConfig objects from base repositories
import { goalSessionLogsConfig, trainingPlanGoalsConfig } from '@/lib/repository/base/goalRepository';
import { trainingPlanAssistantsConfig } from '@/lib/repository/base/trainingPlanRepository';

/**
 * Creates a DataLoader for batching athlete → training plan IDs requests
 */
export function createAthleteTrainingPlanIdsLoader(userId: string | null) {
  return new DataLoader<string, string[]>(async (athleteIds) => {
    try {
      // Fetch training plans for the athlete using the trainingPlanRepository
      // Note: Since there isn't a direct relation table for athlete to training plans
      // with just athlete_id, we fetch training plans and extract their IDs.
      // If performance is critical, a dedicated relation table could be considered.
      const { data, error } = await supabaseServiceRole
        .from('training_plans')
        .select('id')
        .in('athlete_id', athleteIds);
      // Note: Adding userId filter here if training plans are user-specific
      // .eq('user_id', userId);

      if (error) {
        logger.error({ error }, 'Error fetching training plan IDs for athletes');
        return athleteIds.map(() => []); // Return empty arrays for each requested ID
      }

      // Group training plan IDs by athleteId
      // This requires fetching athlete_id along with id
      const { data: plansWithAthleteId, error: fetchError } = await supabaseServiceRole
        .from('training_plans')
        .select('id, athlete_id')
        .in('athlete_id', athleteIds);
      // Note: Adding userId filter here if training plans are user-specific
      // .eq('user_id', userId);

      if (fetchError) {
        logger.error({ fetchError }, 'Error fetching training plan IDs and athlete IDs');
        return athleteIds.map(() => []);
      }

      const athletePlanMap = new Map<string, string[]>();
      plansWithAthleteId.forEach(plan => {
        const currentIds = athletePlanMap.get(plan.athlete_id) || [];
        currentIds.push(plan.id);
        athletePlanMap.set(plan.athlete_id, currentIds);
      });

      return athleteIds.map(id => athletePlanMap.get(id) || []);

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
      // Use relationRepository to get related session log IDs
      return Promise.all(
        goalIds.map(async (goalId) => {
          // Pass goalSessionLogsConfig directly
          return relationRepository.getRelatedIds(goalSessionLogsConfig, goalId);
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
      // Use relationRepository to get related goal IDs
      return Promise.all(
        sessionLogIds.map(async (sessionLogId) => {
          // Note: sessionLogGoalsConfig sourceIdColumn is session_log_id
          return relationRepository.getRelatedIds(goalSessionLogsConfig, sessionLogId);
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
      // Use relationRepository to get related training plan IDs
      return Promise.all(
        goalIds.map(async (goalId) => {
          // Note: trainingPlanGoalsConfig sourceIdColumn is goal_id
          return relationRepository.getRelatedIds(trainingPlanGoalsConfig, goalId);
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
      // Use relationRepository to get related assistant IDs
      return Promise.all(
        trainingPlanIds.map(async (trainingPlanId) => {
          // Note: trainingPlanAssistantsConfig sourceIdColumn is training_plan_id
          return relationRepository.getRelatedIds(trainingPlanAssistantsConfig, trainingPlanId);
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
      // Use relationRepository to get related goal IDs
      return Promise.all(
        trainingPlanIds.map(async (trainingPlanId) => {
          // Note: trainingPlanGoalsConfig sourceIdColumn is training_plan_id
          return relationRepository.getRelatedIds(trainingPlanGoalsConfig, trainingPlanId);
        })
      );
    } catch (error) {
      logger.error({ error }, 'Error in training plan goal IDs loader');
      return trainingPlanIds.map(() => []);
    }
  });
}