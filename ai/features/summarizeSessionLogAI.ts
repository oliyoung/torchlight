import { PubSubEvents } from "@/app/api/graphql/subscriptions/types";
import { logger } from "@/lib/logger";
import { sessionLogRepository } from "@/lib/repository";
import type { SessionLog } from "@/lib/types";
import type { PubSub } from "graphql-subscriptions";

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

    // TODO: Replace with actual AI summary generation here
    // const generatedSummary = await callAISummarization(sessionLog.notes || sessionLog.transcript);

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