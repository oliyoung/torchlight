import { PubSubEvents } from "@/app/api/graphql/subscriptions/types";
import { logger } from "@/lib/logger";
import { sessionLogRepository } from "@/lib/repository";
import type { SessionLog } from "@/lib/types";
import type { PubSub } from "graphql-subscriptions";

import { z } from "zod";
import { loadAndProcessPrompt } from "../lib/promptLoader";
import { callOpenAI } from "../providers/openai";

const SUMMARIZE_SESSION_LOG_PROMPT_FILE = "ai/prompts/summarize_session_log.prompt.yml";

/**
 * Session summary schema for structured AI response
 */
export const sessionSummarySchema = z.object({
    sessionOverview: z.string(),
    keyHighlights: z.array(z.string()),
    areasOfFocus: z.array(z.string()),
    athleteMindset: z.string(),
    nextSteps: z.array(z.string()),
});

/**
 * Session summary response structure
 */
export type SessionSummary = z.infer<typeof sessionSummarySchema>;

/**
 * Summarizes a session log using a mocked AI.
 * Updates the session log with the generated content and publishes a PubSub event on update.
 *
 * @param sessionLogId The ID of the session log to summarize.
 * @param userId The ID of the user performing the summarization.
 * @param pubsub The PubSub instance for publishing updates.
 * @throws Error if the session log is not found or the update fails.
 */
export const summarizeSessionLog = async (
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

    // Prepare session data for summarization
    const goals = sessionLog.goals?.map(g => ({ id: g.id, title: g.title, description: g.description })) || [];
    
    // Load and process the prompt with variable substitution
    const prompt = loadAndProcessPrompt(SUMMARIZE_SESSION_LOG_PROMPT_FILE, {
        sessionDate: sessionLog.date.toString(),
        goals: JSON.stringify(goals, null, 2),
        notes: sessionLog.notes || "No coach notes provided",
        transcript: sessionLog.transcript || "No athlete feedback provided"
    });

    // Call the AI client function to get structured summary
    const generatedContent = await callOpenAI<SessionSummary>(
        prompt.model,
        prompt.temperature,
        prompt.systemMessage,
        prompt.userMessage,
        sessionSummarySchema
    );

    if (!generatedContent) {
        logger.error({ sessionLogId, userId }, "Failed to generate session summary from AI.");
        throw new Error("Failed to generate session summary.");
    }

    // Format the structured summary into a readable text
    const formattedSummary = [
        `**Session Overview:** ${generatedContent.sessionOverview}`,
        "",
        "**Key Highlights:**",
        ...generatedContent.keyHighlights.map(highlight => `• ${highlight}`),
        "",
        "**Areas of Focus:**",
        ...generatedContent.areasOfFocus.map(area => `• ${area}`),
        "",
        `**Athlete Mindset:** ${generatedContent.athleteMindset}`,
        "",
        "**Next Steps:**",
        ...generatedContent.nextSteps.map(step => `• ${step}`),
    ].join("\n");

    // Update the session log with the generated summary
    const updateData = { summary: formattedSummary };
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