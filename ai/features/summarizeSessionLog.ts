import { PubSubEvents } from "@/app/api/graphql/subscriptions/types";
import { logger } from "@/lib/logger";
import { sessionLogRepository } from "@/lib/repository";
import type { SessionLog } from "@/lib/types";
import type { PubSub } from "graphql-subscriptions";

import { z } from "zod";
import { loadPrompt } from "../lib/promptLoader";
import { callOpenAI } from "../providers/openai";

const SUMMARIZE_SESSION_LOG_PROMPT_FILE = "ai/prompts/summarize_session_log.prompt.yml";

export const sessionPlanSchema = z.object({
    sessionPlan: z.object({
        title: z.string(),
        focusArea: z.string(),
        targetGoalIds: z.array(z.string()), // Assuming ID is string based on GraphQL schema context
        duration: z.string(),
        intensityLevel: z.string(),
        equipment: z.array(z.string()),
        preparationNotes: z.string(),
    }),
    warmup: z.object({
        duration: z.string(),
        description: z.string(),
        exercises: z.array(
            z.object({
                name: z.string(),
                instruction: z.string(),
                duration: z.string(),
                sets: z.number(),
                reps: z.string(),
            }),
        ),
    }),
    mainBlock: z.object({
        exercises: z.array(
            z.object({
                name: z.string(),
                focusArea: z.string(),
                sets: z.number(),
                reps: z.string(),
                load: z.string(),
                rest: z.string(),
                tempoOrTiming: z.string(),
                techniqueCues: z.array(z.string()),
                modifications: z.object({
                    progression: z.string(),
                    regression: z.string(),
                }),
            }),
        ),
    }),
    supplementaryWork: z.object({
        exercises: z.array(
            z.object({
                name: z.string(),
                purpose: z.string(),
                sets: z.number(),
                reps: z.string(),
                intensity: z.string(),
                notes: z.string(),
            }),
        ),
    }),
    cooldown: z.object({
        duration: z.string(),
        components: z.array(z.string()),
        keyFocus: z.string(),
    }),
    sessionNotes: z.object({
        keyMetricsToTrack: z.array(z.string()),
        warningSignsToMonitor: z.array(z.string()),
        adjustmentGuidelines: z.string(),
        nextSessionConnection: z.string(),
    }),
});

/**
 * Goal evaluation response structure matching the prompt template
 */
export type SummarizeSessionLog = z.infer<typeof sessionPlanSchema>;

/**
 * Summarizes a session log using a mocked AI.
 * Updates the session log with the generated content and publishes a PubSub event on update.
 *
 * @param sessionLogId The ID of the session log to summarize.
 * @param userId The ID of the user performing the summarization.
 * @param pubsub The PubSub instance for publishing updates.
 * @throws Error if the session log is not found or the update fails.
 */
export const summarizeSessionLogAI = async (
    sessionLogId: SessionLog["id"],
    userId: string | null,
    pubsub: PubSub,
): Promise<SessionLog> => {
    logger.info({ userId, sessionLogId }, "Starting AI summarization for session log");

    if (!userId) {
        logger.error("User ID is required for summarization.");
        throw new Error("Authentication required for summarization.");
    }

    const sessionLog = await sessionLogRepository.getSessionLogById(userId, sessionLogId);

    if (!sessionLog) {
        logger.error({ sessionLogId, userId }, "Session log not found for summarization.");
        // No PubSub publish here, as the mutation resolver handles the error.
        throw new Error(`Session log with ID ${sessionLogId} not found.`);
    }

    // Load and parse the prompt file
    const promptFileContent = loadPrompt(SUMMARIZE_SESSION_LOG_PROMPT_FILE);
    if (!promptFileContent) {
        logger.error("Failed to load progress analysis prompt file.");
        throw new Error("Failed to load progress analysis prompt.");
    }

    // Extract the user message template and system message
    const userMessageTemplate = promptFileContent.messages.find(
        (msg) => msg.role === "user"
    )?.content;
    const systemMessage = promptFileContent.messages.find(
        (msg) => msg.role === "system"
    )?.content;

    if (!userMessageTemplate || !systemMessage) {
        logger.error(
            "System or User message template not found in goal evaluation prompt file."
        );
        throw new Error(
            "System or User message template not found in goal evaluation prompt."
        );
    }

    // Call the generic AI client function - expecting string output for analysis
    const generatedContent =
        await callOpenAI<SummarizeSessionLog>(
            promptFileContent.model,
            Number(promptFileContent?.modelParameters?.temperature) ?? 0.9,
            systemMessage,
            userMessageTemplate,
            sessionPlanSchema
        );

    // Mocked AI summary generation
    const sourceText = sessionLog.notes || sessionLog.transcript || "";
    const generatedSummary = `${sourceText.substring(0, 100)}... (Mocked Summary)`;

    // Update the session log with the generated summary
    const updateData = { summary: generatedSummary };
    const updatedSessionLog = await sessionLogRepository.updateSessionLog(userId, sessionLogId, updateData);

    if (!updatedSessionLog) {
        logger.error({ sessionLogId, userId, updateData }, "Failed to update session log with summary.");
        // Depending on desired behavior, you might throw an error or return the original log
        // No PubSub publish here, as the mutation resolver handles potential update failure.
        throw new Error(`Failed to update session log with ID ${sessionLogId}.`);
    }

    logger.info({ sessionLogId }, "Successfully generated and updated session log summary.");

    // Publish PubSub event for update
    pubsub.publish(PubSubEvents.SessionLogUpdated, { sessionLogUpdated: updatedSessionLog });
    logger.info({ sessionLogId }, "Published sessionLogUpdated event after summarization.");

    return updatedSessionLog;
};