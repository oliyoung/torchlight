import { createAssistantLoader } from './assistant';
import { createAthleteLoader } from './athlete';
import { createCoachLoaders } from './coach';
import { createCoachBillingLoaders } from './coachBilling';
import { createGoalLoader } from './goal';
import {
  createAthleteTrainingPlanIdsLoader,
  createGoalSessionLogIdsLoader,
  createSessionLogGoalIdsLoader,
  createTrainingPlanAssistantIdsLoader,
  createTrainingPlanGoalIdsLoader
} from './relation';
import { createSessionLogLoader } from './sessionLog';
import { createTrainingPlanLoader } from './training-plan';
import {
  whiteboardByIdLoader,
  playsByWhiteboardIdLoader,
  phasesByPlayIdLoader,
  playerPositionsByPlayIdLoader,
  movementsByPhaseIdLoader,
  annotationsByPlayIdLoader,
  annotationsByPhaseIdLoader
} from './whiteboard';
import {
  createWhiteboardLoader,
  createPlayLoader,
  createPhaseLoader,
  createPlayerPositionLoader,
  createMovementLoader,
  createAnnotationLoader
} from './whiteboard-entities';

export interface DataLoaders {
  // Entity loaders
  coachLoaders: ReturnType<typeof createCoachLoaders>;
  coachBillingLoaders: ReturnType<typeof createCoachBillingLoaders>;
  athleteLoader: ReturnType<typeof createAthleteLoader>;
  goalLoader: ReturnType<typeof createGoalLoader>;
  sessionLogLoader: ReturnType<typeof createSessionLogLoader>;
  trainingPlanLoader: ReturnType<typeof createTrainingPlanLoader>;
  assistantLoader: ReturnType<typeof createAssistantLoader>;

  // Whiteboard entity loaders
  whiteboardLoader: ReturnType<typeof createWhiteboardLoader>;
  playLoader: ReturnType<typeof createPlayLoader>;
  phaseLoader: ReturnType<typeof createPhaseLoader>;
  playerPositionLoader: ReturnType<typeof createPlayerPositionLoader>;
  movementLoader: ReturnType<typeof createMovementLoader>;
  annotationLoader: ReturnType<typeof createAnnotationLoader>;

  // Relation loaders
  athleteTrainingPlanIdsLoader: ReturnType<typeof createAthleteTrainingPlanIdsLoader>;
  goalSessionLogIdsLoader: ReturnType<typeof createGoalSessionLogIdsLoader>;
  sessionLogGoalIdsLoader: ReturnType<typeof createSessionLogGoalIdsLoader>;
  trainingPlanAssistantIdsLoader: ReturnType<typeof createTrainingPlanAssistantIdsLoader>;
  trainingPlanGoalIdsLoader: ReturnType<typeof createTrainingPlanGoalIdsLoader>;

  // Whiteboard relation loaders (batch loaders for nested data)
  playsByWhiteboardId: typeof playsByWhiteboardIdLoader;
  phasesByPlayId: typeof phasesByPlayIdLoader;
  playerPositionsByPlayId: typeof playerPositionsByPlayIdLoader;
  movementsByPhaseId: typeof movementsByPhaseIdLoader;
  annotationsByPlayId: typeof annotationsByPlayIdLoader;
  annotationsByPhaseId: typeof annotationsByPhaseIdLoader;
}

/**
 * Creates all DataLoaders for the GraphQL context
 * This ensures proper batching and caching for all entity and relation resolvers
 */
export function createDataLoaders(userId: string | null): DataLoaders {
  return {
    // Entity loaders
    coachLoaders: createCoachLoaders(),
    coachBillingLoaders: createCoachBillingLoaders(),
    athleteLoader: createAthleteLoader(userId),
    goalLoader: createGoalLoader(userId),
    sessionLogLoader: createSessionLogLoader(userId),
    trainingPlanLoader: createTrainingPlanLoader(userId),
    assistantLoader: createAssistantLoader(),

    // Whiteboard entity loaders
    whiteboardLoader: createWhiteboardLoader(userId),
    playLoader: createPlayLoader(),
    phaseLoader: createPhaseLoader(),
    playerPositionLoader: createPlayerPositionLoader(),
    movementLoader: createMovementLoader(),
    annotationLoader: createAnnotationLoader(),

    // Relation loaders
    athleteTrainingPlanIdsLoader: createAthleteTrainingPlanIdsLoader(userId),
    goalSessionLogIdsLoader: createGoalSessionLogIdsLoader(),
    sessionLogGoalIdsLoader: createSessionLogGoalIdsLoader(),
    trainingPlanAssistantIdsLoader: createTrainingPlanAssistantIdsLoader(),
    trainingPlanGoalIdsLoader: createTrainingPlanGoalIdsLoader(),

    // Whiteboard relation loaders
    playsByWhiteboardId: playsByWhiteboardIdLoader,
    phasesByPlayId: phasesByPlayIdLoader,
    playerPositionsByPlayId: playerPositionsByPlayIdLoader,
    movementsByPhaseId: movementsByPhaseIdLoader,
    annotationsByPlayId: annotationsByPlayIdLoader,
    annotationsByPhaseId: annotationsByPhaseIdLoader,
  };
}