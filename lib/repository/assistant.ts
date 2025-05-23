import { AssistantRepository } from "./base/assistantRepository";

const assistantRepository = new AssistantRepository();

export const getAssistantsByIds = assistantRepository.getAssistantsByIds.bind(assistantRepository);
export const getAssistantById = assistantRepository.getAssistantById.bind(assistantRepository);
export const getAssistants = assistantRepository.getAssistants.bind(assistantRepository);
// Add other necessary re-exports if needed in the future