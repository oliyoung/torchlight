import { AssistantRepository } from './base/assistantRepository'
import { AthleteRepository } from './base/athleteRepository'
import { GoalRepository } from './base/goalRepository'
import { SessionLogRepository } from './base/sessionLogRepository'
import { TrainingPlanRepository } from './base/trainingPlanRepository'

// Create singleton instances
export const athleteRepository = new AthleteRepository();
export const goalRepository = new GoalRepository();
export const sessionLogRepository = new SessionLogRepository();
export const assistantRepository = new AssistantRepository();
export const trainingPlanRepository = new TrainingPlanRepository();

// Legacy re-exports for backward compatibility (deprecated)
export const clientRepository = athleteRepository;

