import { analyzeSessionPatterns } from "@/ai/features/analyzeSessionPatterns";
import { logger } from "@/lib/logger";

export interface AnalyzeSessionPatternsArgs {
    input: {
        athleteId: string;
        startDate: string;
        endDate: string;
        goalIds?: string[];
    };
}

export const analyzeSessionPatternsResolver = async (
    _parent: unknown,
    args: AnalyzeSessionPatternsArgs,
    context: { userId: string | null }
): Promise<string> => {
    const { athleteId, startDate, endDate, goalIds } = args.input;
    const { userId } = context;

    logger.info({ userId, athleteId, startDate, endDate, goalIds }, "analyzeSessionPatterns mutation called");

    if (!userId) {
        logger.error("Unauthorized attempt to analyze session patterns");
        throw new Error("Authentication required");
    }

    try {
        const analysis = await analyzeSessionPatterns(
            athleteId,
            new Date(startDate),
            new Date(endDate),
            goalIds,
            userId
        );

        logger.info({ userId, athleteId }, "Session pattern analysis completed successfully");
        return analysis;
    } catch (error) {
        logger.error({ error, userId, athleteId }, "Failed to analyze session patterns");
        throw error;
    }
};

export default analyzeSessionPatternsResolver;