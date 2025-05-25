import { generateContentWithAI } from "@/ai/lib/aiClient";
import { loadPrompt } from "@/ai/lib/promptLoader";
import { logger } from "@/lib/logger";
import { athleteRepository } from "@/lib/repository";
import type { Athlete } from "@/lib/types";

// Define the path to the goal evaluation prompt file
const GOAL_EVALUATION_PROMPT_FILE = "ai/prompts/goal_evaluation.prompt.yml";

/**
 * Goal evaluation response structure matching the prompt template
 */
export interface GoalEvaluationResponse {
    coreGoal: {
        type: string;
        primaryObjective: string;
        sport: string;
        measurableOutcome: string | null;
    };
    goalEvaluation: {
        overallQualityScore: number;
        specificityScore: number;
        feasibilityScore: number;
        relevanceScore: number;
        timeStructureScore: number;
        motivationScore: number;
        evaluationSummary: {
            strengths: string[];
            weaknesses: string[];
            riskFactors: string[];
            improvementPriorities: string[];
        };
    };
    refinedGoalSuggestion: {
        improvedGoalStatement: string | null;
        keyChanges: string[];
        rationale: string;
    };
    timeline: {
        targetDate: string | null;
        duration: string | null;
        urgencyLevel: "immediate" | "short-term" | "medium-term" | "long-term";
        milestones: string[];
    };
    motivation: {
        whyItMatters: string;
        externalDrivers: string[];
        emotionalContext: string;
        supportSystem: string[];
    };
    availability: {
        trainingTime: string | null;
        scheduleConstraints: string[];
        location: string | null;
        equipment: string[];
        budget: string | null;
    };
    constraints: {
        physicalLimitations: string[];
        experienceLevel: "beginner" | "intermediate" | "advanced" | "returning";
        previousChallenges: string[];
        riskFactors: string[];
    };
    successIndicators: {
        measurementMethods: string[];
        successDefinition: string;
        secondaryBenefits: string[];
    };
    extractionConfidence: {
        overallConfidence: "high" | "medium" | "low";
        missingInformation: string[];
        assumptions: string[];
        suggestedQuestions: string[];
    };
    coachingFeedback: {
        dataQuality: "excellent" | "good" | "limited" | "insufficient";
        keyGapsIdentified: string[];
        improvementSuggestions: string[];
        riskFlags: string[];
        coachDevelopmentInsight: string;
    };
}

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
export const extractAndEvaluateGoalAI = async (
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
            logger.error(
                { athleteId, userId },
                "Athlete not found for goal evaluation."
            );
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
        Object.entries(athleteContext).forEach(([key, value]) => {
            const placeholder = `{{${key}}}`;
            populatedUserMessage = populatedUserMessage.replace(
                new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'),
                value
            );
        });

        // Combine system and user messages for the final prompt
        const finalPrompt = `${systemMessage}\n\n${populatedUserMessage}`;

        logger.info(
            { athleteId, userId, goalTextLength: goalText.length },
            "Generated prompt for goal evaluation"
        );

        // Call the AI client with structured output
        const evaluationResult = await generateContentWithAI<GoalEvaluationResponse>(
            finalPrompt
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

        return evaluationResult;

    } catch (error) {
        logger.error(
            { athleteId, userId, goalTextLength: goalText.length, error },
            "Error during goal extraction and evaluation"
        );
        throw error;
    }
};