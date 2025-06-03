import { AssistantRepository } from "./base/assistantRepository";
import { AthleteRepository } from "./base/athleteRepository";
import { CoachRepository } from "./base/coachRepository";
import { CoachBillingRepository } from "./base/coachBillingRepository";
import { GoalRepository } from "./base/goalRepository";
import { RelationRepository } from "./base/relationRepository";
import { SessionLogRepository } from "./base/sessionLogRepository";
import { TrainingPlanRepository } from "./base/trainingPlanRepository";

// Import whiteboard repositories
import { WhiteboardRepository } from "./base/whiteboardRepository";
import { PlayRepository } from "./base/playRepository";
import {
    PhaseRepository,
    PlayerPositionRepository,
    MovementRepository,
    AnnotationRepository
} from "./base/whiteboardEntitiesRepository";

// Export all repository classes
export { AthleteRepository } from "./base/athleteRepository";
export { CoachRepository } from "./base/coachRepository";
export { CoachBillingRepository } from "./base/coachBillingRepository";
export { GoalRepository } from "./base/goalRepository";
export { SessionLogRepository } from "./base/sessionLogRepository";
export { TrainingPlanRepository } from "./base/trainingPlanRepository";
export { RelationRepository } from "./base/relationRepository";
export { AssistantRepository } from "./base/assistantRepository";

// Export whiteboard repositories
export { WhiteboardRepository } from "./base/whiteboardRepository";
export { PlayRepository } from "./base/playRepository";
export {
    PhaseRepository,
    PlayerPositionRepository,
    MovementRepository,
    AnnotationRepository
} from "./base/whiteboardEntitiesRepository";

// Export base classes for extension
export { EntityRepository } from "./base/entityRepository";

// Repository instances for reuse
export const athleteRepository = new AthleteRepository();
export const coachRepository = new CoachRepository();
export const coachBillingRepository = new CoachBillingRepository();
export const goalRepository = new GoalRepository();
export const sessionLogRepository = new SessionLogRepository();
export const trainingPlanRepository = new TrainingPlanRepository();
export const relationRepository = new RelationRepository();
export const assistantRepository = new AssistantRepository();

// Whiteboard repository instances
export const whiteboardRepository = new WhiteboardRepository();
export const playRepository = new PlayRepository();
export const phaseRepository = new PhaseRepository();
export const playerPositionRepository = new PlayerPositionRepository();
export const movementRepository = new MovementRepository();
export const annotationRepository = new AnnotationRepository();