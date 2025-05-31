import { goalRepository } from "@/lib/repository";
import { logger } from "@/lib/logger";
import type { CreateGoalInput, Goal } from "@/lib/types";

export interface CreateGoalArgs {
  input: CreateGoalInput;
}

export const createGoal = async (
  _parent: unknown,
  args: CreateGoalArgs,
  context: { userId: string | null }
): Promise<Goal> => {
  const { input } = args;
  const { userId } = context;

  logger.info({ userId, input }, "createGoal mutation called");

  if (!userId) {
    logger.error("Unauthorized attempt to create goal");
    throw new Error("Authentication required");
  }

  try {
    const goal = await goalRepository.createGoal(userId, input);
    
    if (!goal) {
      logger.error({ userId, input }, "Failed to create goal - null returned from repository");
      throw new Error("Failed to create goal");
    }

    logger.info({ userId, goalId: goal.id }, "Goal created successfully");
    return goal;
  } catch (error) {
    logger.error({ error, userId, input }, "Failed to create goal");
    throw error;
  }
};