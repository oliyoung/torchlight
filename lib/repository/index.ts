import { AssistantRepository } from "./base/assistantRepository";
import { AthleteRepository } from "./base/athleteRepository";
import { GoalRepository } from "./base/goalRepository";
import { RelationRepository } from "./base/relationRepository";
import { SessionLogRepository } from "./base/sessionLogRepository";
import { TrainingPlanRepository } from "./base/trainingPlanRepository";

// Export repository instances
export const athleteRepository = new AthleteRepository();
export const trainingPlanRepository = new TrainingPlanRepository();
export const relationRepository = new RelationRepository();
export const assistantRepository = new AssistantRepository();
export const goalRepository = new GoalRepository();
export const sessionLogRepository = new SessionLogRepository();

// Export repository classes for extension
export {
    AthleteRepository,
    TrainingPlanRepository,
    RelationRepository,
    AssistantRepository,
    GoalRepository,
    SessionLogRepository
};

// Export base classes for new repositories
export { EntityRepository } from "./base/entityRepository";
export { RelationRepository as RelationRepositoryBase } from "./base/relationRepository";