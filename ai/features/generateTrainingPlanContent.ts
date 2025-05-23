import { generateContentWithAI } from '@/ai/lib/aiClient';
import { loadPrompt } from '@/ai/lib/promptLoader';
import { logger } from '@/lib/logger';
import { assistantRepository, sessionLogRepository, trainingPlanRepository } from "@/lib/repository";
import type { Assistant, Athlete, Goal, TrainingPlan } from '@/lib/types';
import { PubSubEvents, TrainingPlanStatus } from '@/lib/types';
import type { PubSub } from 'graphql-subscriptions';

// Define the path to the training plan prompt file
const TRAINING_PLAN_PROMPT_FILE = 'ai/prompts/training_plan.prompt.yml';

/**
 * Generates training plan content using AI based on athlete data, goals, and session logs.
 * Updates the training plan with the generated content and status, and publishes updates via PubSub.
 *
 * @param trainingPlanId The ID of the training plan to generate content for.
 * @param userId The ID of the user performing the generation.
 * @param assistantIds The IDs of the assistants to use for context.
 * @param athlete The athlete for whom the training plan is being generated.
 * @param goals The goals relevant to the training plan.
 * @param pubsub The PubSub instance for publishing updates.
 */
export async function generateTrainingPlanContent(
    trainingPlanId: TrainingPlan['id'],
    userId: string | null,
    assistantIds: Assistant['id'][],
    athlete: Omit<Athlete, 'goals' | 'sessionLogs' | 'trainingPlans'>, // Use Omit<Athlete, ...>
    goals: Goal[], // Accept Goal objects directly
    pubsub: PubSub // Add PubSub instance parameter
) {
    logger.info({ trainingPlanId, userId }, "Starting async generation for Training Plan");

    try {
        await trainingPlanRepository.updateTrainingPlan(userId, trainingPlanId, {
            status: TrainingPlanStatus.Generating
        });

        const assistants = assistantIds.length > 0 ? await assistantRepository.getAssistantsByIds(assistantIds) : [];
        const sessionLogs = await sessionLogRepository.getSessionLogsByAthleteId(userId, athlete.id);

        const promptFileContent = loadPrompt(TRAINING_PLAN_PROMPT_FILE);
        if (!promptFileContent) {
            logger.error("Failed to load training plan prompt file.");
            await trainingPlanRepository.updateTrainingPlan(userId, trainingPlanId, {
                status: TrainingPlanStatus.Error
            })
            return;
        }

        const userMessageTemplate = promptFileContent.messages.find(msg => msg.role === 'user')?.content;
        const systemMessage = promptFileContent.messages.find(msg => msg.role === 'system')?.content;

        if (!userMessageTemplate || !systemMessage) {
            logger.error("System or User message template not found in prompt file.");
            await trainingPlanRepository.updateTrainingPlan(userId, trainingPlanId, {
                status: TrainingPlanStatus.Error
            })
            return;
        }

        const previousSessionLogsContext = sessionLogs.map(log =>
            `Session on ${log.date.toDateString()}: Notes: ${log.notes || 'N/A'}, Action Items: ${(log.actionItems as string[]).join('; ') || 'N/A'}`
        ).join('\n');

        const progressNotes = sessionLogs.map(log => log.notes).filter(Boolean).join('\n');
        const actionItems = sessionLogs.flatMap(log => log.actionItems).filter(Boolean).join('; ');

        let populatedUserMessage = userMessageTemplate;
        populatedUserMessage = populatedUserMessage.replace('{{age}}', (new Date().getFullYear() - new Date(athlete.birthday ?? '1980-01-01').getFullYear()).toString() || 'N/A');
        populatedUserMessage = populatedUserMessage.replace('{{gender}}', athlete.gender || 'N/A');
        populatedUserMessage = populatedUserMessage.replace('{{fitnessLevel}}', athlete.fitnessLevel || 'N/A');
        populatedUserMessage = populatedUserMessage.replace('{{trainingHistory}}', athlete.trainingHistory || 'N/A');
        populatedUserMessage = populatedUserMessage.replace('{{height}}', athlete.height?.toString() || 'N/A');
        populatedUserMessage = populatedUserMessage.replace('{{weight}}', athlete.weight?.toString() || 'N/A');
        populatedUserMessage = populatedUserMessage.replace('{{activeGoals}}', goals.map(g => `${g.title} (ID: ${g.id})`).join(', ') || 'None');
        populatedUserMessage = populatedUserMessage.replace('{{previousSessionLogs}}', previousSessionLogsContext || 'None');
        populatedUserMessage = populatedUserMessage.replace('{{progressNotes}}', progressNotes || 'None');
        populatedUserMessage = populatedUserMessage.replace('{{actionItems}}', actionItems || 'None');
        populatedUserMessage = populatedUserMessage.replace('{{assitantsBios}}', assistants.map(assistant => assistant.bio).join(" and "))

        const finalPrompt = `${systemMessage}\n\n${populatedUserMessage}`; // Simplified concatenation

        logger.info({ finalPrompt }, "Generated Prompt");

        const generatedContent = await generateContentWithAI<TrainingPlan>(finalPrompt);

        if (!generatedContent || !generatedContent) {
            logger.error("AI content generation failed or returned empty.");
            await trainingPlanRepository.updateTrainingPlan(userId, trainingPlanId, {
                status: TrainingPlanStatus.Error
            })
            return;
        }

        const updatedTrainingPlan = await trainingPlanRepository.updateTrainingPlan(userId, trainingPlanId, {
            planJson: generatedContent.planJson,
            overview: generatedContent.overview,
            sourcePrompt: finalPrompt,
            status: TrainingPlanStatus.Generated,
        });

        if (updatedTrainingPlan) {
            pubsub.publish(PubSubEvents.TrainingPlanGenerated, { trainingPlanGenerated: updatedTrainingPlan });
            logger.info({ trainingPlanId }, "Published update for training plan.");
        } else {
            logger.error({ trainingPlanId }, 'Failed to update training plan after generation.')
            pubsub.publish(PubSubEvents.TrainingPlanGenerationFailed, { trainingPlanId, error: 'Failed to update training plan after AI generation.' });
            await trainingPlanRepository.updateTrainingPlan(userId, trainingPlanId, { status: TrainingPlanStatus.Error });
        }

    } catch (error) {
        logger.error({ trainingPlanId, error }, 'Error during async training plan generation');
        pubsub.publish(PubSubEvents.TrainingPlanGenerationFailed, { trainingPlanId, error: error instanceof Error ? error.message : 'Unknown error' });
        await trainingPlanRepository.updateTrainingPlan(userId, trainingPlanId, { status: TrainingPlanStatus.Error });
    }
}