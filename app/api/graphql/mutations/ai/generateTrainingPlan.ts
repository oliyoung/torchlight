import { generateTrainingPlanContent } from "@/ai/features/generateTrainingPlan";
import { logger } from "@/lib/logger";
import { trainingPlanRepository } from "@/lib/repository";
import type { AiGenerateTrainingPlanInput, TrainingPlan } from "@/lib/types";
import type { GraphQLContext } from "../../route";

export const generateTrainingPlan = async (
  _: unknown,
  { input }: { input: AiGenerateTrainingPlanInput },
  context: GraphQLContext,
): Promise<TrainingPlan> => {
  logger.info({ input }, "generateTrainingPlan mutation called");

  const athleteId = input.athleteId;
  const goalIds = input.goalIds;
  const userId = context?.user?.id ?? null;

  if (!userId) {
    logger.error("User not authenticated for generateTrainingPlan mutation.");
    throw new Error("Authentication required.");
  }

  try {
    const trainingPlan = await trainingPlanRepository.createTrainingPlan(userId, {
      athleteId,
      goalIds,
    });

    if (!trainingPlan) {
      logger.error({ trainingPlan }, "Training plan not created");
      throw new Error("Training plan not created");
    }

    await generateTrainingPlanContent(
      trainingPlan.id,
      userId,
      [],
      trainingPlan.athlete,
      trainingPlan.goals ?? [],
      context.pubsub,
    );
    return trainingPlan;
  } catch (error) {
    logger.error({ error }, "Error in generateTrainingPlan mutation.");
    throw error;
  }
};
