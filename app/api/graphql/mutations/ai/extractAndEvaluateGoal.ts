import { extractAndEvaluateGoalAI, type GoalEvaluationResponse } from '@/ai/features/extractAndEvaluateGoalAI';
import type { GraphQLContext } from "@/app/api/graphql/route";
import { logger } from "@/lib/logger";
import type { AiExtractAndEvaluateGoalInput } from "@/lib/types";

/**
 * Mutation resolver to extract and evaluate goal information using AI.
 * This is a thin layer that delegates the core logic to extractAndEvaluateGoalAI.
 *
 * @param _ - The root value (unused).
 * @param input - The input object containing athleteId and goalText.
 * @param context - The GraphQL context, including the authenticated user.
 * @returns A GoalEvaluationResponse containing structured goal data and quality assessment.
 * @throws Error if the user is not authenticated or the underlying AI evaluation fails.
 */
export const extractAndEvaluateGoal = async (
    _: unknown,
    { input }: { input: AiExtractAndEvaluateGoalInput },
    context: GraphQLContext
): Promise<GoalEvaluationResponse> => {
    logger.info({ input }, "extractAndEvaluateGoal mutation called");

    const athleteId = input.athleteId;
    const goalText = input.goalText;
    const userId = context?.user?.id ?? null;

    if (!userId) {
        logger.error("User not authenticated for extractAndEvaluateGoal mutation.");
        throw new Error("Authentication required.");
    }

    if (!goalText || goalText.trim().length === 0) {
        logger.error("Goal text is required for extractAndEvaluateGoal mutation.");
        throw new Error("Goal text cannot be empty.");
    }

    try {
        // Delegate the core goal evaluation logic to the AI feature function
        const evaluationResult = await extractAndEvaluateGoalAI({
            athleteId,
            goalText,
            userId
        });

        logger.info(
            { 
                athleteId, 
                userId, 
                goalTextLength: goalText.length,
                overallScore: evaluationResult.goalEvaluation.overallQualityScore 
            }, 
            "extractAndEvaluateGoal mutation completed successfully."
        );

        return evaluationResult;

    } catch (error) {
        logger.error({ athleteId, userId, goalTextLength: goalText.length, error }, "Error in extractAndEvaluateGoal mutation.");
        // Rethrow the error to be handled by the GraphQL error handling layer
        throw error;
    }
};