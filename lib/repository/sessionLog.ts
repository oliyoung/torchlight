import { SessionLogRepository } from "./base/sessionLogRepository";

const sessionLogRepository = new SessionLogRepository();

export const getSessionLogsByAthleteId = sessionLogRepository.getSessionLogsByAthleteId.bind(sessionLogRepository);
export const getSessionLogById = sessionLogRepository.getSessionLogById.bind(sessionLogRepository);
export const getSessionLogsByIds = sessionLogRepository.getSessionLogsByIds.bind(sessionLogRepository);
export const createSessionLog = sessionLogRepository.createSessionLog.bind(sessionLogRepository);
export const updateSessionLog = sessionLogRepository.updateSessionLog.bind(sessionLogRepository);
export const summarizeSessionLog = sessionLogRepository.summarizeSessionLog.bind(sessionLogRepository);
export const generateSession = sessionLogRepository.generateSession.bind(sessionLogRepository);
// Add other necessary re-exports if needed in the future