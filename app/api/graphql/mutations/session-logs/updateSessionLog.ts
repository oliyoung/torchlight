import { sessionLogRepository } from "@/lib/repository";
import { logger } from "@/lib/logger";
import type { UpdateSessionLogInput, SessionLog } from "@/lib/types";

export const updateSessionLog = async (
  _parent: any,
  args: { id: string; input: UpdateSessionLogInput },
  context: { coachId: string | null }
): Promise<SessionLog> => {
  const { id, input } = args;
  const { coachId } = context;

  logger.info({ coachId, sessionLogId: id, input }, "updateSessionLog mutation called");

  if (!coachId) {
    throw new Error("Authentication required");
  }

  try {
    const sessionLog = await sessionLogRepository.updateSessionLog(coachId, id, input);

    if (!sessionLog) {
      logger.error({ coachId, sessionLogId: id }, "Session log not found or failed to update");
      throw new Error("Failed to update session log");
    }

    logger.info({ coachId, sessionLogId: sessionLog.id }, "Session log updated successfully");
    return sessionLog;
  } catch (error) {
    logger.error({ error, coachId, sessionLogId: id, input }, "Failed to update session log");
    throw error;
  }
};