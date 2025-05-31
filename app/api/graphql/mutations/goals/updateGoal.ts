import { goalRepository } from "@/lib/repository";
import { logger } from "@/lib/logger";
import type { UpdateGoalInput, Goal } from "@/lib/types";

export interface UpdateGoalArgs {
  id: string;
  input: UpdateGoalInput;
}

export const updateGoal = async (
  _parent: unknown,
  args: UpdateGoalArgs,
  context: { userId: string | null }
): Promise<Goal> => {
  const { id, input } = args;
  const { userId } = context;

  logger.info({ userId, goalId: id, input }, "updateGoal mutation called");

  if (!userId) {
    logger.error("Unauthorized attempt to update goal");
    throw new Error("Authentication required");
  }

  try {
    const goal = await goalRepository.updateGoal(userId, id, input);
    
    if (!goal) {
      logger.error({ userId, goalId: id, input }, "Failed to update goal - null returned from repository");
      throw new Error("Goal not found or update failed");
    }

    logger.info({ userId, goalId: goal.id }, "Goal updated successfully");
    return goal;
  } catch (error) {
    logger.error({ error, userId, goalId: id, input }, "Failed to update goal");
    throw error;
  }
};