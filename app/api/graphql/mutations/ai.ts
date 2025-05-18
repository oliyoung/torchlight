import { generateSession as generateSessionFn } from "@/lib/ai/generateSession";
import type { AiGenerateSessionInput } from "@/lib/types";
import type { AiSummarizeSessionLogInput } from "@/lib/types";
import type { SessionLog } from "@/lib/types";

export const summarizeSessionLog = async (
  _: unknown,
  { input }: { input: AiSummarizeSessionLogInput },
): Promise<SessionLog> => {
  // Logic to summarize a session log
  return {
    id: input.sessionLogId,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as SessionLog;
};

export const generateSession = async (
  _: unknown,
  input: AiGenerateSessionInput,
): Promise<string> => generateSessionFn(input);