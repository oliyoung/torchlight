import { goalRepository } from "@/lib/repository";
import { logger } from "@/lib/logger";

export interface DeleteGoalArgs {
  id: string;
}

export const deleteGoal = async (
  _parent: unknown,
  args: DeleteGoalArgs,
  context: { userId: string | null }
): Promise<boolean> => {
  const { id } = args;
  const { userId } = context;

  logger.info({ userId, goalId: id }, "deleteGoal mutation called");

  if (!userId) {
    logger.error("Unauthorized attempt to delete goal");
    throw new Error("Authentication required");
  }

  try {
    const success = await goalRepository.delete(userId, id);

    if (!success) {
      logger.error({ userId, goalId: id }, "Failed to delete goal");
      throw new Error("Goal not found or delete failed");
    }

    logger.info({ userId, goalId: id }, "Goal deleted successfully");
    return true;
  } catch (error) {
    logger.error({ error, userId, goalId: id }, "Failed to delete goal");
    throw error;
  }
};