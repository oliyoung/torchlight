import { goalRepository } from "@/lib/repository";
import { logger } from "@/lib/logger";
import type { UpdateGoalInput, Goal } from "@/lib/types";

export const updateGoal = async (
  _parent: any,
  args: { id: string; input: UpdateGoalInput },
  context: { coachId: string | null }
): Promise<Goal> => {
  const { id, input } = args;
  const { coachId } = context;

  logger.info({ coachId, goalId: id, input }, "updateGoal mutation called");

  if (!coachId) {
    throw new Error("Authentication required");
  }

  try {
    const goal = await goalRepository.updateGoal(coachId, id, input);

    if (!goal) {
      logger.error({ coachId, goalId: id, input }, "Failed to update goal - null returned from repository");
      throw new Error("Failed to update goal");
    }

    logger.info({ coachId, goalId: goal.id }, "Goal updated successfully");
    return goal;
  } catch (error) {
    logger.error({ error, coachId, goalId: id, input }, "Failed to update goal");
    throw error;
  }
};