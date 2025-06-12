import { type GoalEvaluationResponse, extractAndEvaluateGoal } from '@/ai/features/extractAndEvaluateGoal';
import { logger } from "@/lib/logger";
import type { AiExtractAndEvaluateGoalInput } from "@/lib/types";

/**
 * Mutation resolver to extract and evaluate goal information using AI.
 * This is a thin layer that delegates the core logic to extractAndEvaluateGoalAI.
 *
 * @param _parent - The root value (unused).
 * @param input - The input object containing athleteId and goalText.
 * @param context - The GraphQL context, including the authenticated coach.
 * @returns A GoalEvaluationResponse containing structured goal data and quality assessment.
 * @throws Error if the coach is not authenticated or the underlying AI evaluation fails.
 */
export default async (
    _parent: any,
    { input }: { input: AiExtractAndEvaluateGoalInput },
    context: { coachId: string | null }
): Promise<GoalEvaluationResponse> => {
    const { coachId } = context;
    const { athleteId, goalText } = input;

    logger.info({ coachId, athleteId, goalTextLength: goalText.length }, "extractAndEvaluateGoal mutation called");

    if (!coachId) {
        logger.error("Coach not authenticated for extractAndEvaluateGoal mutation.");
        throw new Error("Authentication required.");
    }

    if (!goalText || goalText.trim().length === 0) {
        logger.error("Goal text is required for extractAndEvaluateGoal mutation.");
        throw new Error("Goal text cannot be empty.");
    }

    try {
        // Delegate the core goal evaluation logic to the AI feature function
        const evaluationResult = await extractAndEvaluateGoal({
            athleteId,
            goalText,
            userId: coachId
        });

        logger.info(
            {
                athleteId,
                coachId,
                goalTextLength: goalText.length,
                overallScore: evaluationResult.goalEvaluation.overallQualityScore
            },
            "extractAndEvaluateGoal mutation completed successfully."
        );

        return evaluationResult;

    } catch (error) {
        logger.error({ athleteId, coachId, goalTextLength: goalText.length, error }, "Error in extractAndEvaluateGoal mutation.");
        throw error;
    }
};