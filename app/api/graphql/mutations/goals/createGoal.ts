import { goalRepository } from "@/lib/repository";
import { logger } from "@/lib/logger";
import type { CreateGoalInput, Goal } from "@/lib/types";

export const createGoal = async (
  _parent: any,
  args: { input: CreateGoalInput },
  context: { coachId: string | null }
): Promise<Goal> => {
  const { coachId } = context;

  logger.info({ coachId, input: args.input }, "createGoal mutation called");

  if (!coachId) {
    throw new Error("Authentication required");
  }

  try {
    const goal = await goalRepository.createGoal(coachId, args.input);

    if (!goal) {
      logger.error({ coachId, input: args.input }, "Failed to create goal - null returned from repository");
      throw new Error("Failed to create goal");
    }

    logger.info({ coachId, goalId: goal.id }, "Goal created successfully");
    return goal;
  } catch (error) {
    logger.error({ error, coachId, input: args.input }, "Failed to create goal");
    throw error;
  }
};