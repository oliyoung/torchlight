import { ClientRepository } from "./base/clientRepository";
import { TrainingPlanRepository } from "./base/trainingPlanRepository";
import { RelationRepository } from "./base/relationRepository";
import { AssistantRepository } from "./base/assistantRepository";
import { GoalRepository } from "./base/goalRepository";
import { SessionLogRepository } from "./base/sessionLogRepository";

// Export repository instances
export const clientRepository = new ClientRepository();
export const trainingPlanRepository = new TrainingPlanRepository();
export const relationRepository = new RelationRepository();
export const assistantRepository = new AssistantRepository();
export const goalRepository = new GoalRepository();
export const sessionLogRepository = new SessionLogRepository();

// Export repository classes for extension
export {
  ClientRepository,
  TrainingPlanRepository,
  RelationRepository,
  AssistantRepository,
  GoalRepository,
  SessionLogRepository
};

// Export base classes for new repositories
export { EntityRepository } from "./base/entityRepository";
export { RelationRepository as RelationRepositoryBase } from "./base/relationRepository";