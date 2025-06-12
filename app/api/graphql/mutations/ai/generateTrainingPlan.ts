import { generateTrainingPlanContent } from "@/ai/features/generateTrainingPlan";
import { logger } from "@/lib/logger";
import { trainingPlanRepository } from "@/lib/repository";
import type { AiGenerateTrainingPlanInput, TrainingPlan } from "@/lib/types";

export default async (
  _parent: any,
  { input }: { input: AiGenerateTrainingPlanInput },
  context: { coachId: string | null; pubsub: any },
): Promise<TrainingPlan> => {
  const { coachId } = context;
  const { athleteId, goalIds } = input;

  logger.info({ coachId, athleteId, goalIds }, "generateTrainingPlan mutation called");

  if (!coachId) {
    logger.error("Coach not authenticated for generateTrainingPlan mutation.");
    throw new Error("Authentication required.");
  }

  try {
    const trainingPlan = await trainingPlanRepository.createTrainingPlan(coachId, {
      athleteId,
      goalIds,
    });

    if (!trainingPlan) {
      logger.error({ coachId, athleteId }, "Training plan not created");
      throw new Error("Training plan not created");
    }

    await generateTrainingPlanContent(
      trainingPlan.id,
      coachId,
      [],
      trainingPlan.athlete,
      trainingPlan.goals ?? [],
      context.pubsub,
    );

    logger.info({ coachId, trainingPlanId: trainingPlan.id }, "Training plan generated successfully");
    return trainingPlan;
  } catch (error) {
    logger.error({ error, coachId, athleteId }, "Error in generateTrainingPlan mutation.");
    throw error;
  }
};
