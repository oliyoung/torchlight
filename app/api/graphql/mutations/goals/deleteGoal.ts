import { goalRepository } from "@/lib/repository";
import { logger } from "@/lib/logger";

export interface DeleteGoalArgs {
  id: string;
}

export const deleteGoal = async (
  _parent: any,
  args: { id: string },
  context: { coachId: string | null }
): Promise<boolean> => {
  const { id } = args;
  const { coachId } = context;

  logger.info({ coachId, goalId: id }, "deleteGoal mutation called");

  if (!coachId) {
    throw new Error("Authentication required");
  }

  try {
    const success = await goalRepository.delete(coachId, id);

    if (!success) {
      logger.error({ coachId, goalId: id }, "Failed to delete goal");
      throw new Error("Failed to delete goal");
    }

    logger.info({ coachId, goalId: id }, "Goal deleted successfully");
    return true;
  } catch (error) {
    logger.error({ error, coachId, goalId: id }, "Failed to delete goal");
    throw error;
  }
};