import { generateContentWithAI } from "@/ai/aiClient";
import { loadPrompt } from "@/ai/promptLoader";
import { logger } from "@/lib/logger";
import { athleteRepository, goalRepository, sessionLogRepository } from "@/lib/repository";
import type { Athlete, Goal, SessionLog } from "@/lib/types";

// Define the path to the progress analysis prompt file
const PROGRESS_ANALYSIS_PROMPT_FILE = 'ai/prompts/progress_analysis.prompt.yml';

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
export const analyzeProgressAI = async (
    athleteId: Athlete["id"],
    startDate: string, // Assuming date strings in input
    endDate: string, // Assuming date strings in input
    userId: string | null
): Promise<string> => {
    logger.info({ userId, athleteId, startDate, endDate }, "Starting AI progress analysis for athlete");

    if (!userId) {
        logger.error("User ID is required for progress analysis.");
        throw new Error("Authentication required for progress analysis.");
    }

    try {
        // Fetch necessary data
        const athlete = await athleteRepository.getAthleteById(userId, athleteId);
        if (!athlete) {
            logger.error({ athleteId, userId }, "Athlete not found for progress analysis.");
            throw new Error('Athlete not found');
        }

        // Fetch all goals for context, or filter by date if needed
        const goals: Goal[] = await goalRepository.getGoalsByAthleteId(userId, athleteId);

        // Fetch session logs within the date range
        const sessionLogs = await sessionLogRepository.getSessionLogsByAthleteIdAndDateRange(userId, athleteId, new Date(startDate), new Date(endDate));

        // Load and parse the prompt file
        const promptFileContent = loadPrompt(PROGRESS_ANALYSIS_PROMPT_FILE);
        if (!promptFileContent) {
            logger.error("Failed to load progress analysis prompt file.");
            throw new Error("Failed to load progress analysis prompt.");
        }

        // Extract the user message template and system message
        const userMessageTemplate = promptFileContent.messages.find(msg => msg.role === 'user')?.content;
        const systemMessage = promptFileContent.messages.find(msg => msg.role === 'system')?.content;

        if (!userMessageTemplate || !systemMessage) {
            logger.error("System or User message template not found in progress analysis prompt file.");
            throw new Error("System or User message template not found in progress analysis prompt.");
        }

        // Prepare the prompt using the template and fetched data
        const sessionLogsContext = sessionLogs.map(log =>
            `Session on ${log.date.toDateString()}: Notes: ${log.notes || 'N/A'}, Summary: ${log.summary || 'N/A'}, Action Items: ${(log.actionItems as string[]).join('; ') || 'N/A'}`
        ).join('\n');

        let populatedUserMessage = userMessageTemplate;
        // Populate athlete properties
        populatedUserMessage = populatedUserMessage.replace('{{age}}', (new Date().getFullYear() - new Date(athlete.birthday ?? '1980-01-01').getFullYear()).toString() || 'N/A');
        populatedUserMessage = populatedUserMessage.replace('{{gender}}', athlete.gender || 'N/A');
        populatedUserMessage = populatedUserMessage.replace('{{fitnessLevel}}', athlete.fitnessLevel || 'N/A');
        populatedUserMessage = populatedUserMessage.replace('{{trainingHistory}}', athlete.trainingHistory || 'N/A');
        populatedUserMessage = populatedUserMessage.replace('{{height}}', athlete.height?.toString() || 'N/A');
        populatedUserMessage = populatedUserMessage.replace('{{weight}}', athlete.weight?.toString() || 'N/A');
        populatedUserMessage = populatedUserMessage.replace('{{athleteNotes}}', athlete.notes || 'None');
        // Populate goal and session log context
        populatedUserMessage = populatedUserMessage.replace('{{activeGoals}}', goals.map(g => `${g.title} (ID: ${g.id}): ${g.description || 'N/A'}`).join('\n') || 'None');
        populatedUserMessage = populatedUserMessage.replace('{{sessionLogs}}', sessionLogsContext || 'None');
        // Populate date range
        populatedUserMessage = populatedUserMessage.replace('{{startDate}}', new Date(startDate).toDateString());
        populatedUserMessage = populatedUserMessage.replace('{{endDate}}', new Date(endDate).toDateString());

        // Combine system and user messages for the final prompt
        const finalPrompt = `${systemMessage}\n\n${populatedUserMessage}`; // Simplified concatenation

        logger.info({ athleteId, startDate, endDate, finalPrompt }, "Generated Prompt for Progress Analysis");

        // Call the generic AI client function - expecting string output for analysis
        const generatedContent = await generateContentWithAI(finalPrompt);

        if (!generatedContent || typeof generatedContent !== 'string') { // Expecting a string output for this feature
            logger.error({ athleteId, startDate, endDate }, "AI content generation failed or returned unexpected format for progress analysis.");
            throw new Error("AI content generation failed or returned unexpected format.");
        }

        logger.info({ athleteId, startDate, endDate }, "Successfully generated progress analysis.");

        return generatedContent; // Return the generated string analysis

    } catch (error) {
        logger.error({ athleteId, userId, startDate, endDate, error }, 'Error during async progress analysis generation');
        // Rethrow the error to be handled by the mutation resolver
        throw error;
    }
};