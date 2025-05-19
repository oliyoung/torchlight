import pino from "pino";

export const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transport:
    process.env.NODE_ENV !== "production"
      ? { target: "pino-pretty" }
      : undefined,
});

/**
 * Create a logger bound to a request context (e.g., requestId, userId).
 * Usage: const reqLogger = createRequestLogger({ requestId, userId });
 *        reqLogger.info("Something happened");
 */
export function createRequestLogger(context: Record<string, unknown>) {
  return logger.child(context);
}