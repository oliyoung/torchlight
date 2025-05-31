import { loadAndProcessPrompt } from "@/ai/lib/promptLoader";
import { callOpenAI } from "@/ai/providers/openai";
import { logger } from "@/lib/logger";
import {
    athleteRepository,
    goalRepository,
    sessionLogRepository,
} from "@/lib/repository";
import type {
    Athlete,
    Goal,
} from "@/lib/types";
import { z } from "zod";

// Define the path to the progress analysis prompt file
const PROGRESS_ANALYSIS_PROMPT_FILE = "ai/prompts/analyze_progress.prompt.yml";

const analyzeProgressSchema = z.object({
    planJson: z.string(),
    overview: z.string(),
});

export type AnalyzeProgressResponse = z.infer<typeof analyzeProgressSchema>;

/**
 * Analyzes an athlete's progress over a specified date range using AI.
 *
 * @param athleteId The ID of the athlete to analyze progress for.
 * @param startDate The start date of the analysis period.
 * @param endDate The end date of the analysis period.
 * @param userId The ID of the user performing the analysis.
 * @returns A string containing the AI-generated progress analysis.
 * @throws Error if athlete, goals, session logs, prompt loading, or AI generation fails.
 */
export const analyzeProgress = async (
    athleteId: Athlete["id"],
    startDate: string, // Assuming date strings in input
    endDate: string, // Assuming date strings in input
    userId: string | null,
): Promise<AnalyzeProgressResponse> => {
    logger.info(
        { userId, athleteId, startDate, endDate },
        "Starting AI progress analysis for athlete",
    );

    if (!userId) {
        logger.error("User ID is required for progress analysis.");
        throw new Error("Authentication required for progress analysis.");
    }

    try {
        // Fetch necessary data
        const athlete = await athleteRepository.getAthleteById(userId, athleteId);
        if (!athlete) {
            logger.error(
                { athleteId, userId },
                "Athlete not found for progress analysis.",
            );
            throw new Error("Athlete not found");
        }

        // Fetch all goals for context, or filter by date if needed
        const goals: Goal[] = await goalRepository.getGoalsByAthleteId(
            userId,
            athleteId,
        );

        // Fetch session logs within the date range
        const sessionLogs =
            await sessionLogRepository.getSessionLogsByAthleteId(
                userId,
                athleteId
            );

        // Prepare the session logs context
        const sessionLogsContext = sessionLogs
            .map(
                (log) =>
                    `Session on ${log.date.toDateString()}: Notes: ${log.notes || "N/A"}, Summary: ${log.summary || "N/A"}, Action Items: ${(log.actionItems as string[]).join("; ") || "N/A"}`,
            )
            .join("\n");

        // Prepare all variables for prompt substitution
        const age = (
            new Date().getFullYear() -
            new Date(athlete.birthday ?? "1980-01-01").getFullYear()
        ).toString();

        const activeGoals = goals
            .map((g) => `${g.title} (ID: ${g.id}): ${g.description ?? "N/A"}`)
            .join("\n");

        // Load and process the prompt with variable substitution
        const prompt = loadAndProcessPrompt(PROGRESS_ANALYSIS_PROMPT_FILE, {
            age: age,
            gender: athlete.gender ?? "N/A",
            fitnessLevel: athlete.fitnessLevel ? String(athlete.fitnessLevel) : "N/A",
            trainingHistory: athlete.trainingHistory ?? "N/A",
            height: athlete.height?.toString() ?? "N/A",
            weight: athlete.weight?.toString() ?? "N/A",
            athleteNotes: athlete.notes ?? "None",
            activeGoals: activeGoals || "None",
            sessionLogs: sessionLogsContext || "None",
            startDate: new Date(startDate).toDateString(),
            endDate: new Date(endDate).toDateString()
        });

        logger.info(
            { athleteId, startDate, endDate },
            "Generated Prompt for Progress Analysis",
        );

        // Call the generic AI client function - expecting string output for analysis
        const generatedContent =
            await callOpenAI<AnalyzeProgressResponse>(
                prompt.model,
                prompt.temperature,
                prompt.systemMessage,
                prompt.userMessage,
                analyzeProgressSchema
            );

        if (!generatedContent || typeof generatedContent !== "string") {
            // Expecting a string output for this feature
            logger.error(
                { athleteId, startDate, endDate },
                "AI content generation failed or returned unexpected format for progress analysis.",
            );
            throw new Error(
                "AI content generation failed or returned unexpected format.",
            );
        }

        logger.info(
            { athleteId, startDate, endDate },
            "Successfully generated progress analysis.",
        );

        return generatedContent; // Return the generated string analysis
    } catch (error) {
        logger.error(
            { athleteId, userId, startDate, endDate, error },
            "Error during async progress analysis generation",
        );
        // Rethrow the error to be handled by the mutation resolver
        throw error;
    }
};
