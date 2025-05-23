import { summarizeSessionLogAI } from '@/ai/features/summarizeSessionLogAI';
import type { GraphQLContext } from "@/app/api/graphql/route";
import { logger } from "@/lib/logger";
import type { AiSummarizeSessionLogInput, SessionLog } from "@/lib/types";

/**
 * Mutation resolver to summarize a session log using AI.
 * This is a thin layer that delegates the core logic to summarizeSessionLogAI.
 *
 * @param _ - The root value (unused).
 * @param input - The input object containing the session log ID.
 * @param context - The GraphQL context, including the authenticated user and pubsub.
 * @returns The updated SessionLog object.
 * @throws Error if the user is not authenticated or the underlying AI summarization fails.
 */
export const summarizeSessionLog = async (
    _: unknown,
    { input }: { input: AiSummarizeSessionLogInput },
    context: GraphQLContext
): Promise<SessionLog> => {
    logger.info({ input }, "SummarizeSessionLog mutation called");

    const sessionLogId = input.sessionLogId;
    const userId = context?.user?.id ?? null;

    if (!userId) {
        logger.error("User not authenticated for summarizeSessionLog mutation.");
        throw new Error("Authentication required.");
    }

    try {
        // Delegate the core summarization logic to the AI feature function
        const updatedSessionLog = await summarizeSessionLogAI(sessionLogId, userId, context.pubsub);
        logger.info({ sessionLogId }, "SummarizeSessionLog mutation completed successfully.");
        return updatedSessionLog;
    } catch (error) {
        logger.error({ sessionLogId, userId, error }, "Error in summarizeSessionLog mutation.");
        // Rethrow the error to be handled by the GraphQL error handling layer
        throw error;
    }
};