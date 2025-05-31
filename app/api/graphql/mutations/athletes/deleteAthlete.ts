import { athleteRepository } from "@/lib/repository";
import { logger } from "@/lib/logger";

export interface DeleteAthleteArgs {
  id: string;
}

export const deleteAthlete = async (
  _parent: unknown,
  args: DeleteAthleteArgs,
  context: { userId: string | null }
): Promise<boolean> => {
  const { id } = args;
  const { userId } = context;

  logger.info({ userId, athleteId: id }, "deleteAthlete mutation called");

  if (!userId) {
    logger.error("Unauthorized attempt to delete athlete");
    throw new Error("Authentication required");
  }

  try {
    const success = await athleteRepository.deleteAthlete(userId, id);
    
    if (!success) {
      logger.error({ userId, athleteId: id }, "Athlete not found or failed to delete");
      throw new Error("Athlete not found or failed to delete");
    }

    logger.info({ userId, athleteId: id }, "Athlete deleted successfully");
    return true;
  } catch (error) {
    logger.error({ error, userId, athleteId: id }, "Failed to delete athlete");
    throw error;
  }
};