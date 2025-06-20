import { sessionLogRepository } from "@/lib/repository";
import { logger } from "@/lib/logger";

export interface DeleteSessionLogArgs {
  id: string;
}

export const deleteSessionLog = async (
  _parent: any,
  args: { id: string },
  context: { coachId: string | null }
): Promise<boolean> => {
  const { id } = args;
  const { coachId } = context;

  logger.info({ coachId, sessionLogId: id }, "deleteSessionLog mutation called");

  if (!coachId) {
    throw new Error("Authentication required");
  }

  try {
    const success = await sessionLogRepository.delete(coachId, id);

    if (!success) {
      logger.error({ coachId, sessionLogId: id }, "Session log not found or failed to delete");
      throw new Error("Failed to delete session log");
    }

    logger.info({ coachId, sessionLogId: id }, "Session log deleted successfully");
    return true;
  } catch (error) {
    logger.error({ error, coachId, sessionLogId: id }, "Failed to delete session log");
    throw error;
  }
};