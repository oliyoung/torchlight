import {
    type AnalyzeProgressResponse,
    analyzeProgressAI,
} from "@/ai/features/analyzeProgressAI"; // Import the AI feature function
import type { GraphQLContext } from "@/app/api/graphql/route";
import { logger } from "@/lib/logger";
import type { AiAnalyzeProgressInput } from "@/lib/types";

/**
 * Mutation resolver to analyze athlete progress using AI.
 * This is a thin layer that delegates the core logic to analyzeProgressAI.
 *
 * @param _ - The root value (unused).
 * @param input - The input object containing athleteId, startDate, and endDate.
 * @param context - The GraphQL context, including the authenticated user.
 * @returns A string containing the AI-generated progress analysis.
 * @throws Error if the user is not authenticated or the underlying AI analysis fails.
 */
export const analyzeProgress = async (
    _: unknown,
    { input }: { input: AiAnalyzeProgressInput },
    context: GraphQLContext,
): Promise<AnalyzeProgressResponse> => {
    logger.info({ input }, "analyzeProgress mutation called");

    const athleteId = input.athleteId;
    const startDate = input.startDate;
    const endDate = input.endDate;
    const userId = context?.user?.id ?? null;

    if (!userId) {
        logger.error("User not authenticated for analyzeProgress mutation.");
        throw new Error("Authentication required.");
    }

    try {
        // Delegate the core progress analysis logic to the AI feature function
        const analysisResult = await analyzeProgressAI(
            athleteId,
            startDate,
            endDate,
            userId,
        );
        logger.info(
            { athleteId, startDate, endDate },
            "analyzeProgress mutation completed successfully.",
        );
        return analysisResult;
    } catch (error) {
        logger.error(
            { athleteId, userId, startDate, endDate, error },
            "Error in analyzeProgress mutation.",
        );
        // Rethrow the error to be handled by the GraphQL error handling layer
        throw error;
    }
};
