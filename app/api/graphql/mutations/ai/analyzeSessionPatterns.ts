import { analyzeSessionPatterns } from "@/ai/features/analyzeSessionPatterns";
import { logger } from "@/lib/logger";
import type { AiAnalyzeSessionPatternsInput } from "@/lib/types";

export default async function analyzeSessionPatternsResolver(
    _parent: any,
    args: { input: AiAnalyzeSessionPatternsInput },
    context: { coachId: string | null }
): Promise<string> {
    const { input } = args;
    const { coachId } = context;

    logger.info({ coachId, athleteId: input.athleteId, startDate: input.startDate, endDate: input.endDate, goalIds: input.goalIds }, "analyzeSessionPatterns mutation called");

    if (!coachId) {
        throw new Error("Authentication required");
    }

    try {
        const analysis = await analyzeSessionPatterns(
            input.athleteId,
            new Date(input.startDate),
            new Date(input.endDate),
            input.goalIds || undefined,
            coachId
        );

        logger.info({ coachId, athleteId: input.athleteId }, "Session pattern analysis completed successfully");
        return analysis;
    } catch (error) {
        logger.error({ error, coachId, athleteId: input.athleteId }, "Failed to analyze session patterns");
        throw error;
    }
}