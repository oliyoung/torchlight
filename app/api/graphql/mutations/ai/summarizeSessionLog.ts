import type { GraphQLContext } from "@/app/api/graphql/route";
import { logger } from "@/lib/logger";
import { sessionLogRepository } from "@/lib/repository";
import type { AISummarizeSessionLogInput, SessionLog } from "@/lib/types";

export const summarizeSessionLog = async (
    _: unknown,
    { input }: { input: AISummarizeSessionLogInput },
    context: GraphQLContext
): Promise<SessionLog> => {
    logger.info({ input }, "Summarizing session log with input");

    const sessionLogId = input.sessionLogId;
    const userId = context?.user?.id ?? null;

    if (!userId) {
        logger.error("User not authenticated.");
        throw new Error("Authentication required.");
    }

    const sessionLog = await sessionLogRepository.getSessionLogById(userId, sessionLogId);

    if (!sessionLog) {
        logger.error({ sessionLogId, userId }, "Session log not found.");
        throw new Error(`Session log with ID ${sessionLogId} not found.`);
    }

    // TODO: Implement AI summary generation here
    // const generatedSummary = await callAISummarization(sessionLog.notes || sessionLog.transcript);

    // Mocked AI summary generation
    const sourceText = sessionLog.notes || sessionLog.transcript || '';
    const generatedSummary = `${sourceText.substring(0, 100)}... (Mocked Summary)`;

    // Update the session log with the generated summary
    const updatedSessionLog = await sessionLogRepository.updateSessionLog(userId, sessionLogId, { summary: generatedSummary });

    if (!updatedSessionLog) {
        logger.error({ sessionLogId, userId }, "Failed to update session log with summary.");
        // Depending on desired behavior, you might throw an error or return the original log
        return sessionLog; // Returning original log if update fails
    }

    logger.info({ sessionLogId }, "Successfully summarized and updated session log.");
    return updatedSessionLog;
};
