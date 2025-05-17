
import { generateSession } from "@/lib/ai/generateSession"; import type { AiGenerateSessionInput } from "@/lib/types";
import type { AiSummarizeSessionLogInput } from "@/lib/types";
import type { SessionLog } from "@/lib/types";

export default {
  summarizeSessionLog: async (
    _: unknown,
    { input }: { input: AiSummarizeSessionLogInput },
  ): Promise<SessionLog> => {
    // Logic to summarize a session log
    return {
      id: input.sessionLogId,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as SessionLog;
  },
  generateSession: async (
    _: unknown,
    input: AiGenerateSessionInput,
  ): Promise<string> => generateSession(input),
}