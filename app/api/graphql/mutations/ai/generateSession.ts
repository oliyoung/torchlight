


import { sessionLogRepository } from "@/lib/repository";
import { type AiGenerateSessionInput, type SessionLog } from "@/lib/types";
import type { GraphQLContext } from "@/app/api/graphql/route";


// Mock implementation for generating a session
export const generateSession = async (_: unknown, { input }: { input: AiGenerateSessionInput }, context: GraphQLContext
): Promise<SessionLog> => {
    // Convert string result to SessionLog object
    const generatedContent = await sessionLogRepository.generateSession(context?.user?.id ?? null, input);

    if (!generatedContent) throw new Error("Failed to generate session");

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