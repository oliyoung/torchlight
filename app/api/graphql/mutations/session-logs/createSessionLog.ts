import { sessionLogRepository } from "@/lib/repository";
import { logger } from "@/lib/logger";
import type { CreateSessionLogInput, SessionLog } from "@/lib/types";

export const createSessionLog = async (
  _parent: any,
  args: { input: CreateSessionLogInput },
  context: { coachId: string | null }
): Promise<SessionLog> => {
  const { coachId } = context;

  logger.info({ coachId, input: args.input }, "createSessionLog mutation called");

  if (!coachId) {
    throw new Error("Authentication required");
  }

  try {
    const sessionLog = await sessionLogRepository.createSessionLog(coachId, args.input);

    if (!sessionLog) {
      logger.error({ coachId, input: args.input }, "Failed to create session log - null returned from repository");
      throw new Error("Failed to create session log");
    }

    logger.info({ coachId, sessionLogId: sessionLog.id }, "Session log created successfully");
    return sessionLog;
  } catch (error) {
    logger.error({ error, coachId, input: args.input }, "Failed to create session log");
    throw error;
  }
};