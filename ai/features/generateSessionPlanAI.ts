import { generateContentWithAI } from '@/ai/lib/aiClient';
import { loadPrompt } from "@/ai/lib/promptLoader";
import { logger } from "@/lib/logger";
import { athleteRepository, goalRepository, sessionLogRepository } from "@/lib/repository";
import type { AiSessionPlanOutput, Athlete, Goal, SessionLog } from "@/lib/types";
import { PubSubEvents } from "@/lib/types";
import type { PubSub } from "graphql-subscriptions";
import { unknown } from 'zod';

// Define the path to the session plan prompt file
const SESSION_PLAN_PROMPT_FILE = 'ai/prompts/session_plan.prompt.yml';

/**
 * Generates a new session plan using AI based on athlete data, goals, and session logs.
 * Creates a new session log entry with the generated plan and publishes updates via PubSub.
 *
 * @param athleteId The ID of the athlete for whom the session plan is being generated.
 * @param goalIds The IDs of the goals relevant to the session plan.
 * @param userId The ID of the user performing the generation.
 * @param pubsub The PubSub instance for publishing updates.
 * @returns The newly created SessionLog object containing the generated plan.
 * @throws Error if athlete, goals, prompt loading, AI generation, parsing, or session log creation fails.
 */
export const generateSessionPlanAI = async (
    athleteId: Athlete["id"],
    goalIds: Goal["id"][],
    userId: string | null,
    pubsub: PubSub
): Promise<SessionLog> => {
    logger.info({ userId, athleteId, goalIds }, "Starting AI generation for new Session Plan");

    if (!userId) {
        logger.error("User ID is required for session plan generation.");
        throw new Error("Authentication required for session plan generation.");
    }

    try {
        // Fetch necessary data
        const athlete = await athleteRepository.getAthleteById(userId, athleteId);
        if (!athlete) {
            logger.error({ athleteId, userId }, "Athlete not found for session plan generation.");
            throw new Error('Athlete not found');
        }

        const goals: Goal[] = goalIds.length > 0 ? await goalRepository.getGoalsByIds(userId, goalIds) : [];
        if (goalIds.length > 0 && goals.length === 0) {
            // If goal IDs were provided but none were found, log a warning but proceed.
            logger.warn({ goalIds, userId }, "Provided goal IDs not found, proceeding without goal context.");
        }

        // Fetch associated session logs for context
        const contextSessionLogs = await sessionLogRepository.getSessionLogsByAthleteId(userId, athleteId);
        if (contextSessionLogs.length === 0) {
            logger.warn({ athleteId, userId }, "No previous session logs found for context.");
        }

        // Load and parse the prompt file
        const promptFileContent = loadPrompt(SESSION_PLAN_PROMPT_FILE);
        if (!promptFileContent) {
            logger.error("Failed to load session plan prompt file.");
            throw new Error("Failed to load session plan prompt.");
        }

        // Extract the user message template and system message
        const userMessageTemplate = promptFileContent.messages.find(msg => msg.role === 'user')?.content;
        const systemMessage = promptFileContent.messages.find(msg => msg.role === 'system')?.content;

        if (!userMessageTemplate || !systemMessage) {
            logger.error("System or User message template not found in session plan prompt file.");
            throw new Error("System or User message template not found in session plan prompt.");
        }

        // Prepare the prompt using the template and fetched data
        const sessionLogsContext = contextSessionLogs.map(log =>
            `Session on ${log.date.toDateString()}: Notes: ${log.notes || 'N/A'}, Transcript (excerpt): ${log.transcript?.substring(0, 200) || 'N/A'}, Summary: ${log.summary || 'N/A'}, Action Items: ${(log.actionItems as string[]).join('; ') || 'N/A'}`
        ).join('\n');

        let populatedUserMessage = userMessageTemplate;
        // Populate athlete properties
        populatedUserMessage = populatedUserMessage.replace('{{age}}', (new Date().getFullYear() - new Date(athlete.birthday ?? '1980-01-01').getFullYear()).toString() || 'N/A');
        populatedUserMessage = populatedUserMessage.replace('{{gender}}', athlete.gender || 'N/A');
        populatedUserMessage = populatedUserMessage.replace('{{fitnessLevel}}', athlete.fitnessLevel || 'N/A');
        populatedUserMessage = populatedUserMessage.replace('{{trainingHistory}}', athlete.trainingHistory || 'N/A');
        populatedUserMessage = populatedUserMessage.replace('{{height}}', athlete.height?.toString() || 'N/A');
        populatedUserMessage = populatedUserMessage.replace('{{weight}}', athlete.weight?.toString() || 'N/A');
        // Populate goal and session log context
        populatedUserMessage = populatedUserMessage.replace('{{activeGoals}}', goals.map(g => `${g.title} (ID: ${g.id}): ${g.description || 'N/A'}`).join('\n') || 'None');
        populatedUserMessage = populatedUserMessage.replace('{{previousSessionLogs}}', sessionLogsContext || 'None');
        // Assuming 'progressNotes' and 'actionItems' in prompt refer to cumulative info or from recent logs
        populatedUserMessage = populatedUserMessage.replace('{{progressNotes}}', athlete.notes || 'None'); // Using athlete notes for now, could refine later
        const cumulativeActionItems = contextSessionLogs.flatMap(log => log.actionItems).filter(Boolean).join('; ') || 'None';
        populatedUserMessage = populatedUserMessage.replace('{{actionItems}}', cumulativeActionItems);

        // Combine system and user messages for the final prompt
        const finalPrompt = `${systemMessage}\n\n${populatedUserMessage}`; // Simplified concatenation

        logger.info({ athleteId, finalPrompt }, "Generated Prompt for Session Plan");

        // Call the generic AI client function
        const generatedContent = await generateContentWithAI<AiSessionPlanOutput>(finalPrompt)

        if (!generatedContent || !generatedContent.sessionPlan) {
            logger.error({ athleteId, parsedContent: generatedContent }, "Parsed AI content is not in expected session plan format.");
            throw new Error("AI content is not in expected session plan format.");
        }

        // Map parsed content to a new SessionLog object
        const notes = JSON.stringify(generatedContent, null, 2); // Store the full JSON in notes
        const summary = `${generatedContent.sessionPlan.title}${generatedContent.sessionPlan.focusArea ? ` - ${generatedContent.sessionPlan.focusArea}` : ''}`; // Use template literal
        // Extract action items from sessionNotes, handling potential undefined
        const actionItems = generatedContent.sessionNotes ? [
            ...(generatedContent.sessionNotes.keyMetricsToTrack || []),
            ...(generatedContent.sessionNotes.warningSignsToMonitor || []),
            ...(generatedContent.sessionNotes.adjustmentGuidelines ? [`Adjustments: ${generatedContent.sessionNotes.adjustmentGuidelines}`] : []),
            ...(generatedContent.sessionNotes.nextSessionConnection ? [`Next Session Connection: ${generatedContent.sessionNotes.nextSessionConnection}`] : []),
        ].filter(item => item && typeof item === 'string') : [];

        // Create the new session log
        const newSessionLogData = {
            athleteId: athlete.id,
            date: new Date(), // Date of creation
            notes: notes,
            summary: summary,
            actionItems: actionItems,
            goalIds: generatedContent.sessionPlan.targetGoalIds || [], // Link goals suggested by AI if any
            // Add aiMetadata or status if SessionLog schema is extended
        };

        const newSessionLog = await sessionLogRepository.createSessionLog(userId, newSessionLogData);

        if (!newSessionLog) {
            logger.error({ athleteId, userId, newSessionLogData }, "Failed to create session log with generated session plan.");
            throw new Error(`Failed to create session log for athlete ID ${athleteId}.`);
        }

        logger.info({ sessionLogId: newSessionLog.id }, "Successfully generated and created new session log with plan.");

        // Publish PubSub event for the new session log
        pubsub.publish(PubSubEvents.SessionLogAdded, { sessionLogAdded: newSessionLog });
        logger.info({ sessionLogId: newSessionLog.id }, "Published SessionLogAdded event.");

        return newSessionLog;

    } catch (error) {
        logger.error({ athleteId, userId, error }, 'Error during async session plan generation');
        // Rethrow the error to be handled by the mutation resolver
        throw error;
    }
};