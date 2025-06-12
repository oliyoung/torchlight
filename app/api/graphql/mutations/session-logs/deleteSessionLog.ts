import { sessionLogRepository } from "@/lib/repository";
import { logger } from "@/lib/logger";

export interface DeleteSessionLogArgs {
  id: string;
}

export const deleteSessionLog = async (
  _parent: unknown,
  args: DeleteSessionLogArgs,
  context: { userId: string | null }
): Promise<boolean> => {
  const { id } = args;
  const { userId } = context;

  logger.info({ userId, sessionLogId: id }, "deleteSessionLog mutation called");

  if (!userId) {
    logger.error("Unauthorized attempt to delete session log");
    throw new Error("Authentication required");
  }

  try {
    const success = await sessionLogRepository.delete(userId, id);

    if (!success) {
      logger.error({ userId, sessionLogId: id }, "Session log not found or failed to delete");
      throw new Error("Session log not found or failed to delete");
    }

    logger.info({ userId, sessionLogId: id }, "Session log deleted successfully");
    return true;
  } catch (error) {
    logger.error({ error, userId, sessionLogId: id }, "Failed to delete session log");
    throw error;
  }
};