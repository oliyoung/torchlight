import { generateContentWithAI } from '@/ai/aiClient';
import { loadPrompt } from '@/ai/promptLoader';
import { logger } from '@/lib/logger';
import { assistantRepository, sessionLogRepository, trainingPlanRepository } from "@/lib/repository";
import type { Assistant, Athlete, Goal, TrainingPlan } from '@/lib/types';
import { TrainingPlanStatus } from '@/lib/types';
import type { PubSub } from 'graphql-subscriptions';

// Ensure the correct PubSub event constant is used
const TRAINING_PLAN_GENERATED = 'TRAINING_PLAN_GENERATED';
const TRAINING_PLAN_GENERATION_FAILED = 'TRAINING_PLAN_GENERATION_FAILED'; // Define failed event

// Define the path to the training plan prompt file
const TRAINING_PLAN_PROMPT_FILE = 'ai/prompts/training_plan.prompt.yml';

// Function to generate training plan content asynchronously
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
        // Set status to GENERATING
        await trainingPlanRepository.updateTrainingPlan(userId, trainingPlanId, { status: TrainingPlanStatus.Generating });

        // 1. Fetch necessary data (Assistants and Session Logs)
        const assistants = assistantIds.length > 0 ? await assistantRepository.getAssistantsByIds(assistantIds) : [];
        const sessionLogs = await sessionLogRepository.getSessionLogsByAthleteId(userId, athlete.id);

        // 2. Load and parse the prompt file
        const promptFileContent = loadPrompt(TRAINING_PLAN_PROMPT_FILE);
        if (!promptFileContent) {
            logger.error("Failed to load training plan prompt file.");
            // TODO: Handle this error appropriately (e.g., update training plan status)
            return;
        }

        // Extract the user message template and system message
        const userMessageTemplate = promptFileContent.messages.find(msg => msg.role === 'user')?.content;
        const systemMessage = promptFileContent.messages.find(msg => msg.role === 'system')?.content;

        if (!userMessageTemplate || !systemMessage) {
            logger.error("System or User message template not found in prompt file.");
            // TODO: Handle this error appropriately
            return;
        }

        // 3. Prepare the prompt using the template and fetched data
        // Extract notes and action items from recent session logs
        const previousSessionLogsContext = sessionLogs.map(log =>
            `Session on ${log.date.toDateString()}: Notes: ${log.notes || 'N/A'}, Action Items: ${(log.actionItems as string[]).join('; ') || 'N/A'}`
        ).join('\n');

        const progressNotes = sessionLogs.map(log => log.notes).filter(Boolean).join('\n');
        const actionItems = sessionLogs.flatMap(log => log.actionItems).filter(Boolean).join('; ');

        // Populate the user message template
        let populatedUserMessage = userMessageTemplate;
        // Use optional chaining and provide default values for athlete properties
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
        // Combine system and user messages for the final prompt (this format depends on the AI provider/MCP)
        const finalPrompt = `${systemMessage}\n\n${populatedUserMessage}`; // Simplified concatenation

        logger.info({ finalPrompt }, "Generated Prompt");

        // 4. Call the placeholder AI client function (replace with actual MCP call later)
        const generatedContent = await generateContentWithAI(finalPrompt);

        if (!generatedContent || !generatedContent.planJson) {
            logger.error("AI content generation failed or returned empty.");
            // TODO: Handle this case, maybe update training plan status to error
            return;
        }

        // 5. Prepare data for database update
        // Ensure planJson conforms to AiTrainingPlanContent type
        const planJson = generatedContent.planJson; // Removed type casting for now

        const updateData = {
            planJson: planJson, // Use the content
            overview: generatedContent.overview,
            sourcePrompt: finalPrompt,
            // TODO: Add generatedBy based on the actual AI model/assistant used
        };

        // 6. Update the training plan record in the database
        const updatedTrainingPlan = await trainingPlanRepository.updateTrainingPlan(userId, trainingPlanId, {
            ...updateData,
            status: TrainingPlanStatus.Generated,
        });

        if (updatedTrainingPlan) {
            logger.info(`Training plan ${trainingPlanId} content generated and updated.`);
            // 7. Publish update via PubSub
            pubsub.publish(TRAINING_PLAN_GENERATED, { trainingPlanGenerated: updatedTrainingPlan });
            logger.info({ trainingPlanId }, "Published update for training plan.");
        } else {
            logger.error({ trainingPlanId }, 'Failed to update training plan after generation.');
            // Optionally publish a generation failed event
            pubsub.publish(TRAINING_PLAN_GENERATION_FAILED, { trainingPlanId, error: 'Failed to update training plan after AI generation.' });
            // Also update status to ERROR if DB update fails after generation
            await trainingPlanRepository.updateTrainingPlan(userId, trainingPlanId, { status: TrainingPlanStatus.Error });
        }

    } catch (error) {
        logger.error({ trainingPlanId, error }, 'Error during async training plan generation');
        // Optionally publish an error state via PubSub
        pubsub.publish(TRAINING_PLAN_GENERATION_FAILED, { trainingPlanId, error: error instanceof Error ? error.message : 'Unknown error' });
        // Set status to ERROR on any exception
        await trainingPlanRepository.updateTrainingPlan(userId, trainingPlanId, { status: TrainingPlanStatus.Error });
    }
}