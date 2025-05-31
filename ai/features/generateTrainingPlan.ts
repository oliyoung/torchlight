import { loadAndProcessPrompt } from "../lib/promptLoader";
import { PubSubEvents } from '@/app/api/graphql/subscriptions/types';
import { logger } from '@/lib/logger';
import { assistantRepository, sessionLogRepository, trainingPlanRepository } from "@/lib/repository";
import type { Assistant, Athlete, Goal, TrainingPlan } from '@/lib/types';
import { TrainingPlanStatus } from '@/lib/types';
import type { PubSub } from 'graphql-subscriptions';
import { z } from 'zod';
import { callOpenAI } from "../providers/openai";

// Define the path to the training plan prompt file
const TRAINING_PLAN_PROMPT_FILE = 'ai/prompts/generate_training_plan.prompt.yml';

export const trainingPlanSchema = z.object({
    planOverview: z.object({
        title: z.string(),
        durationWeeks: z.number(),
        sessionsPerWeek: z.number(),
        equipment: z.array(z.string()),
        primaryGoals: z.array(z.string()),
        secondaryGoals: z.array(z.string()),
        intensityGuidelines: z.string(),
    }),
    weeklyStructure: z.array(
        z.object({
            week: z.number(),
            focus: z.string(),
            sessions: z.array(
                z.object({
                    type: z.string(),
                    focusArea: z.string(),
                    templateRef: z.string(),
                }),
            ),
        }),
    ),
    sessionTemplates: z.array(
        z.object({
            templateRef: z.string(),
            structure: z.object({
                warmup: z.string(),
                mainBlock: z.string(),
                supplementary: z.string(),
                cooldown: z.string(),
            }),
        }),
    ),
    progressionGuidelines: z.string(),
    tracking: z.object({
        keyMetrics: z.array(z.string()),
        warningSigns: z.array(z.string()),
        adjustmentCriteria: z.string(),
    }),
});

export type TrainingPlanResponse = z.infer<typeof trainingPlanSchema>;

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

        // Prepare session logs context
        const previousSessionLogsContext = sessionLogs.map(log =>
            `Session on ${log.date.toDateString()}: Notes: ${log.notes || 'N/A'}, Action Items: ${(log.actionItems as string[]).join('; ') || 'N/A'}`
        ).join('\n');

        const progressNotes = sessionLogs.map(log => log.notes).filter(Boolean).join('\n');
        const actionItems = sessionLogs.flatMap(log => log.actionItems).filter(Boolean).join('; ');

        // Prepare all variables for prompt substitution
        const age = (new Date().getFullYear() - new Date(athlete.birthday ?? '1980-01-01').getFullYear()).toString();
        const activeGoals = goals.map(g => `${g.title} (ID: ${g.id})`).join(', ');
        const assistantsBios = assistants.map(assistant => assistant.bio).join(" and ");

        let prompt;
        try {
            // Load and process the prompt with variable substitution
            prompt = loadAndProcessPrompt(TRAINING_PLAN_PROMPT_FILE, {
                age: age || 'N/A',
                gender: athlete.gender || 'N/A',
                fitnessLevel: athlete.fitnessLevel || 'N/A',
                trainingHistory: athlete.trainingHistory || 'N/A',
                height: athlete.height?.toString() || 'N/A',
                weight: athlete.weight?.toString() || 'N/A',
                activeGoals: activeGoals || 'None',
                previousSessionLogs: previousSessionLogsContext || 'None',
                progressNotes: progressNotes || 'None',
                actionItems: actionItems || 'None',
                assitantsBios: assistantsBios || 'None'
            });

            logger.info({ trainingPlanId }, "Generated Training Plan Prompt");
        } catch (promptError) {
            logger.error({ promptError, trainingPlanId }, "Failed to load/process training plan prompt file.");
            await trainingPlanRepository.updateTrainingPlan(userId, trainingPlanId, {
                status: TrainingPlanStatus.Error
            });
            return;
        }

        const generatedContent = await callOpenAI<TrainingPlanResponse>(
            prompt.model,
            prompt.temperature,
            prompt.systemMessage,
            prompt.userMessage,
            trainingPlanSchema
        );

        if (!generatedContent || !generatedContent) {
            logger.error("AI content generation failed or returned empty.");
            await trainingPlanRepository.updateTrainingPlan(userId, trainingPlanId, {
                status: TrainingPlanStatus.Error
            })
            return;
        }

        const updatedTrainingPlan = await trainingPlanRepository.updateTrainingPlan(userId, trainingPlanId, {
            planJson: generatedContent,
            sourcePrompt: prompt.userMessage,
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