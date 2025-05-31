import { sessionLogRepository } from "@/lib/repository";
import { logger } from "@/lib/logger";
import type { UpdateSessionLogInput, SessionLog } from "@/lib/types";

export interface UpdateSessionLogArgs {
  id: string;
  input: UpdateSessionLogInput;
}

export const updateSessionLog = async (
  _parent: unknown,
  args: UpdateSessionLogArgs,
  context: { userId: string | null }
): Promise<SessionLog> => {
  const { id, input } = args;
  const { userId } = context;

  logger.info({ userId, sessionLogId: id, input }, "updateSessionLog mutation called");

  if (!userId) {
    logger.error("Unauthorized attempt to update session log");
    throw new Error("Authentication required");
  }

  try {
    const sessionLog = await sessionLogRepository.updateSessionLog(userId, id, input);
    
    if (!sessionLog) {
      logger.error({ userId, sessionLogId: id }, "Session log not found or failed to update");
      throw new Error("Session log not found or failed to update");
    }

    logger.info({ userId, sessionLogId: sessionLog.id }, "Session log updated successfully");
    return sessionLog;
  } catch (error) {
    logger.error({ error, userId, sessionLogId: id, input }, "Failed to update session log");
    throw error;
  }
};