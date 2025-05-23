import { generateSessionPlanAI } from '@/ai/features/generateSessionPlanAI'; // Import the AI feature function
import type { GraphQLContext } from "@/app/api/graphql/route";
import { logger } from "@/lib/logger";
import type { AiGenerateSessionInput, SessionLog } from "@/lib/types";

/**
 * Mutation resolver to generate a new session plan using AI.
 * This is a thin layer that delegates the core logic to generateSessionPlanAI.
 *
 * @param _ - The root value (unused).
 * @param input - The input object containing athlete and goal IDs.
 * @param context - The GraphQL context, including the authenticated user and pubsub.
 * @returns The newly created SessionLog object containing the generated plan.
 * @throws Error if the user is not authenticated or the underlying AI generation fails.
 */
export const generateSession = async (
    _: unknown,
    { input }: { input: AiGenerateSessionInput },
    context: GraphQLContext
): Promise<SessionLog> => {
    logger.info({ input }, "generateSession mutation called");

    const athleteId = input.athleteId;
    const goalIds = input.goalIds || []; // Ensure goalIds is an array
    const userId = context?.user?.id ?? null;

    if (!userId) {
        logger.error("User not authenticated for generateSession mutation.");
        throw new Error("Authentication required.");
    }

    try {
        // Delegate the core session plan generation logic to the AI feature function
        const newSessionLog = await generateSessionPlanAI(athleteId, goalIds, userId, context.pubsub);
        logger.info({ sessionLogId: newSessionLog.id }, "generateSession mutation completed successfully.");
        return newSessionLog;
    } catch (error) {
        logger.error({ athleteId, userId, error }, "Error in generateSession mutation.");
        // Rethrow the error to be handled by the GraphQL error handling layer
        throw error;
    }
};