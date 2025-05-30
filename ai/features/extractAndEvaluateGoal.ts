import { loadPrompt } from "@/ai/lib/promptLoader";
import { callOpenAI } from "@/ai/providers/openai";
import { logger } from "@/lib/logger";
import { athleteRepository } from "@/lib/repository";
import { z } from "zod";

// Define the path to the goal evaluation prompt file
const GOAL_EVALUATION_PROMPT_FILE = "ai/prompts/goal_evaluation.prompt.yml";

/**
 * Zod schema for the goal evaluation response structure matching the prompt template
 */
const goalEvaluationResponseSchema = z.object({
    coreGoal: z.object({
        type: z.string(),
        primaryObjective: z.string(),
        sport: z.string(),
        measurableOutcome: z.string().nullable(),
    }),
    goalEvaluation: z.object({
        overallQualityScore: z.number(),
        specificityScore: z.number(),
        feasibilityScore: z.number(),
        relevanceScore: z.number(),
        timeStructureScore: z.number(),
        motivationScore: z.number(),
        evaluationSummary: z.object({
            strengths: z.array(z.string()),
            weaknesses: z.array(z.string()),
            riskFactors: z.array(z.string()),
            improvementPriorities: z.array(z.string()),
        }),
    }),
    refinedGoalSuggestion: z.object({
        improvedGoalStatement: z.string().nullable(),
        keyChanges: z.array(z.string()),
        rationale: z.string(),
    }),
    timeline: z.object({
        targetDate: z.string().nullable(),
        duration: z.string().nullable(),
        urgencyLevel: z.enum(["immediate", "short-term", "medium-term", "long-term"]),
        milestones: z.array(z.string()),
    }),
    motivation: z.object({
        whyItMatters: z.string(),
        externalDrivers: z.array(z.string()),
        emotionalContext: z.string(),
        supportSystem: z.array(z.string()),
    }),
    availability: z.object({
        trainingTime: z.string().nullable(),
        scheduleConstraints: z.array(z.string()),
        location: z.string().nullable(),
        equipment: z.array(z.string()),
        budget: z.string().nullable(),
    }),
    constraints: z.object({
        physicalLimitations: z.array(z.string()),
        experienceLevel: z.enum(["beginner", "intermediate", "advanced", "returning"]),
        previousChallenges: z.array(z.string()),
        riskFactors: z.array(z.string()),
    }),
    successIndicators: z.object({
        measurementMethods: z.array(z.string()),
        successDefinition: z.string(),
        secondaryBenefits: z.array(z.string()),
    }),
    extractionConfidence: z.object({
        overallConfidence: z.enum(["high", "medium", "low"]),
        missingInformation: z.array(z.string()),
        assumptions: z.array(z.string()),
        suggestedQuestions: z.array(z.string()),
    }),
    coachingFeedback: z.object({
        dataQuality: z.enum(["excellent", "good", "limited", "insufficient"]),
        keyGapsIdentified: z.array(z.string()),
        improvementSuggestions: z.array(z.string()),
        riskFlags: z.array(z.string()),
        coachDevelopmentInsight: z.string(),
    }),
});

/**
 * Goal evaluation response structure matching the prompt template
 */
export type GoalEvaluationResponse = z.infer<typeof goalEvaluationResponseSchema>;

/**
 * Input parameters for goal evaluation
 */
export interface ExtractAndEvaluateGoalInput {
    athleteId: string;
    goalText: string;
    userId: string;
}

/**
 * Extracts and evaluates goal information from natural language using AI.
 * Provides structured goal data, quality evaluation, and coaching feedback.
 *
 * @param input The goal evaluation input parameters
 * @returns A structured goal evaluation response with quality assessment and suggestions
 * @throws Error if athlete not found, prompt loading, or AI generation fails
 */
export const extractAndEvaluateGoal = async (
    input: ExtractAndEvaluateGoalInput
): Promise<GoalEvaluationResponse> => {
    const { athleteId, goalText, userId } = input;

    logger.info(
        { userId, athleteId, goalTextLength: goalText.length },
        "Starting AI goal extraction and evaluation"
    );

    if (!userId) {
        logger.error("User ID is required for goal evaluation.");
        throw new Error("Authentication required for goal evaluation.");
    }

    if (!goalText.trim()) {
        logger.error("Goal text is required for evaluation.");
        throw new Error("Goal text cannot be empty.");
    }

    try {
        // Fetch athlete data for context
        const athlete = await athleteRepository.getAthleteById(userId, athleteId);
        if (!athlete) {
            logger.error({ athleteId, userId }, "Athlete not found for goal evaluation.");
            throw new Error("Athlete not found");
        }

        // Load and parse the prompt file
        const promptFileContent = loadPrompt(GOAL_EVALUATION_PROMPT_FILE);
        if (!promptFileContent) {
            logger.error("Failed to load goal evaluation prompt file.");
            throw new Error("Failed to load goal evaluation prompt.");
        }

        // Extract the user message template and system message
        const userMessageTemplate = promptFileContent.messages.find(
            (msg) => msg.role === "user"
        )?.content;
        const systemMessage = promptFileContent.messages.find(
            (msg) => msg.role === "system"
        )?.content;

        if (!userMessageTemplate || !systemMessage) {
            logger.error(
                "System or User message template not found in goal evaluation prompt file."
            );
            throw new Error(
                "System or User message template not found in goal evaluation prompt."
            );
        }

        // Calculate athlete age from birthday
        const currentYear = new Date().getFullYear();
        const birthYear = athlete.birthday
            ? new Date(athlete.birthday).getFullYear()
            : currentYear - 25; // Default age assumption
        const athleteAge = currentYear - birthYear;

        // Prepare athlete context variables
        const athleteContext = {
            athleteName: `${athlete.firstName} ${athlete.lastName}`,
            athleteAge: athleteAge.toString(),
            athleteSport: athlete.sport,
            athleteExperience: athlete.trainingHistory || "Not specified",
            athleteFitnessLevel: athlete.fitnessLevel || "Not specified",
            athleteTrainingHistory: athlete.trainingHistory || "No training history provided",
            athleteBirthday: athlete.birthday || "Not specified",
            athleteGender: athlete.gender || "Not specified",
            athleteHeight: athlete.height?.toString() || "Not specified",
            athleteWeight: athlete.weight?.toString() || "Not specified",
            coachRelationship: "Current coach", // Could be enhanced with actual relationship data
            athletePreviousGoals: athlete.notes || "No previous goals recorded",
            goalText: goalText
        };

        // Populate the user message template with athlete context and goal text
        let populatedUserMessage = userMessageTemplate;
        for (const [key, value] of Object.entries(athleteContext)) {
            const placeholder = `{{${key}}}`;
            populatedUserMessage = populatedUserMessage.replace(
                new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'),
                value
            );
        }

        logger.info(
            { athleteId, userId, goalTextLength: goalText.length },
            "Generated prompt for goal evaluation"
        );

        const temperature = Number(promptFileContent?.modelParameters?.temperature) ?? 0.9;

        // Call the AI client with structured output
        const evaluationResult = await callOpenAI<GoalEvaluationResponse>(
            promptFileContent.model,
            temperature,
            systemMessage,
            populatedUserMessage,
            goalEvaluationResponseSchema
        );

        if (!evaluationResult || typeof evaluationResult !== "object") {
            logger.error(
                { athleteId, userId },
                "AI goal evaluation failed or returned unexpected format."
            );
            throw new Error(
                "AI goal evaluation failed or returned unexpected format."
            );
        }

        // Validate required fields in the response
        if (!evaluationResult.coreGoal || !evaluationResult.goalEvaluation) {
            logger.error(
                { athleteId, userId, result: evaluationResult },
                "AI response missing required goal evaluation fields."
            );
            throw new Error("Invalid goal evaluation response structure.");
        }

        logger.info(
            {
                athleteId,
                userId,
                overallScore: evaluationResult.goalEvaluation.overallQualityScore,
                confidence: evaluationResult.extractionConfidence.overallConfidence
            },
            "Successfully completed goal evaluation"
        );

        return evaluationResult as GoalEvaluationResponse;

    } catch (error) {
        logger.error(
            { athleteId, userId, goalTextLength: goalText.length, error },
            "Error during goal extraction and evaluation"
        );
        throw error;
    }
};