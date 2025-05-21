import { type AiSummarizeSessionLogInput, type AiGenerateSessionInput, AiAnalyzeProgressInput, type SessionLog } from "@/lib/types";
import { generateSession as generateSessionFn } from "@/lib/ai/generateSession";
import { sessionLogRepository } from "@/lib/repository";
import type { GraphQLContext } from "../route";

// Mock implementation for summarizing a session log
export const summarizeSessionLog = async (_: unknown, { input }: { input: AiSummarizeSessionLogInput }, context: GraphQLContext): Promise<SessionLog> => {
  const originalSessionLog = await sessionLogRepository.getSessionLogById(context?.user?.id ?? null, input.sessionLogId);

  if (!originalSessionLog) {
    throw new Error(`Session log ${input.sessionLogId} not found`);
  }

  // Force non-null return with type assertion
  const result = await sessionLogRepository.summarizeSessionLog(context?.user?.id ?? null, input.sessionLogId);
  if (!result) throw new Error(`Failed to summarize session log ${input.sessionLogId}`);
  return result;
};

// Mock implementation for generating a session
export const generateSession = async (_: unknown, { input }: { input: AiGenerateSessionInput }, context: GraphQLContext
): Promise<SessionLog> => {
  // Convert string result to SessionLog object
  const generatedContent = await generateSessionFn(context?.user?.id ?? null, input);

  // Create a mock session log with the generated content
  const result = await sessionLogRepository.createSessionLog(context?.user?.id ?? null, {
    athleteId: input.athleteId,
    date: new Date(),
    notes: generatedContent,
    goalIds: input.goalIds
  });

  if (!result) throw new Error("Failed to create session log");
  return result;
};