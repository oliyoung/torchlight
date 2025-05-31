import { sessionLogRepository } from "@/lib/repository";
import { logger } from "@/lib/logger";
import type { CreateSessionLogInput, SessionLog } from "@/lib/types";

export interface CreateSessionLogArgs {
  input: CreateSessionLogInput;
}

export const createSessionLog = async (
  _parent: unknown,
  args: CreateSessionLogArgs,
  context: { userId: string | null }
): Promise<SessionLog> => {
  const { input } = args;
  const { userId } = context;

  logger.info({ userId, input }, "createSessionLog mutation called");

  if (!userId) {
    logger.error("Unauthorized attempt to create session log");
    throw new Error("Authentication required");
  }

  try {
    const sessionLog = await sessionLogRepository.createSessionLog(userId, input);
    
    if (!sessionLog) {
      logger.error({ userId, input }, "Failed to create session log - null returned from repository");
      throw new Error("Failed to create session log");
    }

    logger.info({ userId, sessionLogId: sessionLog.id }, "Session log created successfully");
    return sessionLog;
  } catch (error) {
    logger.error({ error, userId, input }, "Failed to create session log");
    throw error;
  }
};