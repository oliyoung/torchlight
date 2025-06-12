import { summarizeSessionLog } from '@/ai/features/summarizeSessionLog';
import { logger } from "@/lib/logger";
import type { AiSummarizeSessionLogInput, SessionLog } from "@/lib/types";

/**
 * Mutation resolver to summarize a session log using AI.
 * This is a thin layer that delegates the core logic to summarizeSessionLogAI.
 *
 * @param _parent - The root value (unused).
 * @param input - The input object containing the session log ID.
 * @param context - The GraphQL context, including the authenticated coach and pubsub.
 * @returns The updated SessionLog object.
 * @throws Error if the coach is not authenticated or the underlying AI summarization fails.
 */
export default async (
    _parent: any,
    { input }: { input: AiSummarizeSessionLogInput },
    context: { coachId: string | null; pubsub: any }
): Promise<SessionLog> => {
    const { coachId } = context;
    const { sessionLogId } = input;

    logger.info({ coachId, sessionLogId }, "summarizeSessionLog mutation called");

    if (!coachId) {
        logger.error("Coach not authenticated for summarizeSessionLog mutation.");
        throw new Error("Authentication required.");
    }

    try {
        // Delegate the core summarization logic to the AI feature function
        const updatedSessionLog = await summarizeSessionLog(sessionLogId, coachId, context.pubsub);

        logger.info({ coachId, sessionLogId }, "summarizeSessionLog mutation completed successfully");
        return updatedSessionLog;
    } catch (error) {
        logger.error({ sessionLogId, coachId, error }, "Error in summarizeSessionLog mutation.");
        throw error;
    }
};