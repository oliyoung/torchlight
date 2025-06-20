import { athleteRepository } from "@/lib/repository";
import { logger } from "@/lib/logger";

export interface DeleteAthleteArgs {
  id: string;
}

export const deleteAthlete = async (
  _parent: any,
  args: { id: string },
  context: { coachId: string | null }
): Promise<boolean> => {
  const { id } = args;
  const { coachId } = context;

  logger.info({ coachId, athleteId: id }, "deleteAthlete mutation called");

  if (!coachId) {
    throw new Error("Authentication required");
  }

  try {
    const success = await athleteRepository.delete(coachId, id);

    if (!success) {
      logger.error({ coachId, athleteId: id }, "Athlete not found or failed to delete");
      throw new Error("Failed to delete athlete");
    }

    logger.info({ coachId, athleteId: id }, "Athlete deleted successfully");
    return true;
  } catch (error) {
    logger.error({ error, coachId, athleteId: id }, "Failed to delete athlete");
    throw error;
  }
};