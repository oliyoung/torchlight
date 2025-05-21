import { createAssistantLoader } from './assistant';
import { createClientLoader } from './client';
import { createGoalLoader } from './goal';
import {
  createClientTrainingPlanIdsLoader,
  createGoalSessionLogIdsLoader,
  createSessionLogGoalIdsLoader,
  createTrainingPlanAssistantIdsLoader,
  createTrainingPlanGoalIdsLoader
} from './relation';
import { createSessionLogLoader } from './sessionLog';
import { createTrainingPlanLoader } from './training-plan';

export interface DataLoaders {
  // Entity loaders
  clientLoader: ReturnType<typeof createClientLoader>;
  goalLoader: ReturnType<typeof createGoalLoader>;
  sessionLogLoader: ReturnType<typeof createSessionLogLoader>;
  trainingPlanLoader: ReturnType<typeof createTrainingPlanLoader>;
  assistantLoader: ReturnType<typeof createAssistantLoader>;

  // Relation loaders
  clientTrainingPlanIdsLoader: ReturnType<typeof createClientTrainingPlanIdsLoader>;
  goalSessionLogIdsLoader: ReturnType<typeof createGoalSessionLogIdsLoader>;
  sessionLogGoalIdsLoader: ReturnType<typeof createSessionLogGoalIdsLoader>;
  trainingPlanAssistantIdsLoader: ReturnType<typeof createTrainingPlanAssistantIdsLoader>;
  trainingPlanGoalIdsLoader: ReturnType<typeof createTrainingPlanGoalIdsLoader>;
}

/**
 * Creates all DataLoaders for the GraphQL context
 * This ensures proper batching and caching for all entity and relation resolvers
 */
export function createDataLoaders(userId: string | null): DataLoaders {
  return {
    // Entity loaders
    clientLoader: createClientLoader(userId),
    goalLoader: createGoalLoader(userId),
    sessionLogLoader: createSessionLogLoader(userId),
    trainingPlanLoader: createTrainingPlanLoader(userId),
    assistantLoader: createAssistantLoader(),

    // Relation loaders
    clientTrainingPlanIdsLoader: createClientTrainingPlanIdsLoader(userId),
    goalSessionLogIdsLoader: createGoalSessionLogIdsLoader(),
    sessionLogGoalIdsLoader: createSessionLogGoalIdsLoader(),
    trainingPlanAssistantIdsLoader: createTrainingPlanAssistantIdsLoader(),
    trainingPlanGoalIdsLoader: createTrainingPlanGoalIdsLoader(),
  };
}