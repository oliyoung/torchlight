import { type AiSummarizeSessionLogInput, type SessionLog } from "@/lib/types";
import { sessionLogRepository } from "@/lib/repository";
import type { GraphQLContext } from "@/app/api/graphql/route";


// Mock implementation for summarizing a session log
export const summarizeSessionLog = async (_: unknown, { input }: { input: AiSummarizeSessionLogInput }, context: GraphQLContext): Promise<SessionLog> => {
    const originalSessionLog = await sessionLogRepository.getSessionLogById(context?.user?.id ?? null, input.sessionLogId);

    if (!originalSessionLog) {
        throw new Error(`Session log ${input.sessionLogId} not found`);
    }

    // Force non-null return with type assertion
    const result = await sessionLogRepository.summarizeSessionLog(context?.user?.id ?? null, input.sessionLogId);
    if (!result) throw new Error(`Failed to summarize session log ${input.sessionLogId}`);
    return result;
};
