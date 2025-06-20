import { loadAndProcessPrompt } from "../lib/promptLoader";
import { callOpenAI } from "../providers/openai";
import { logger } from "@/lib/logger";
import { z } from "zod";

const EXPAND_YOUTH_FEEDBACK_PROMPT_FILE = "ai/prompts/expand_youth_feedback.prompt.yml";

/**
 * Schema for follow-up questions to help expand youth athlete feedback
 */
export const followUpQuestionsSchema = z.object({
    questions: z.array(z.object({
        question: z.string(),
        reasoning: z.string(),
        category: z.enum(['technique', 'feelings', 'challenges', 'goals', 'enjoyment', 'understanding'])
    })),
    encouragement: z.string(),
    context: z.string()
});

export type FollowUpQuestions = z.infer<typeof followUpQuestionsSchema>;

/**
 * Generates follow-up questions to help youth athletes expand on their initial feedback.
 * This helps coaches get more detailed insights when athletes give basic responses like "it was good".
 *
 * @param initialFeedback The athlete's initial, potentially brief feedback
 * @param athleteAge Age of the athlete to tailor question complexity
 * @param sessionGoals Goals that were worked on during the session
 * @param coachNotes Any relevant coach observations
 * @returns Follow-up questions and encouragement to help expand the feedback
 */
export const generateFollowUpQuestions = async (
    initialFeedback: string,
    athleteAge: number,
    sessionGoals: string[] = [],
    coachNotes?: string
): Promise<FollowUpQuestions> => {
    logger.info({ 
        athleteAge, 
        feedbackLength: initialFeedback.length, 
        goalsCount: sessionGoals.length 
    }, "Generating follow-up questions for youth feedback");

    // Prepare context for the AI
    const prompt = loadAndProcessPrompt(EXPAND_YOUTH_FEEDBACK_PROMPT_FILE, {
        initialFeedback: initialFeedback,
        athleteAge: athleteAge.toString(),
        sessionGoals: sessionGoals.join(", ") || "No specific goals mentioned",
        coachNotes: coachNotes || "No coach notes provided",
        developmentalStage: athleteAge < 12 ? "Elementary" : athleteAge < 16 ? "Middle School" : "High School"
    });

    const followUpQuestions = await callOpenAI<FollowUpQuestions>(
        prompt.model,
        prompt.temperature,
        prompt.systemMessage,
        prompt.userMessage,
        followUpQuestionsSchema
    );

    if (!followUpQuestions) {
        logger.error("Failed to generate follow-up questions.");
        throw new Error("Failed to generate follow-up questions.");
    }

    logger.info({ 
        questionsGenerated: followUpQuestions.questions.length 
    }, "Successfully generated follow-up questions");

    return followUpQuestions;
};

/**
 * Analyzes whether feedback needs expansion based on length, specificity, and content quality.
 */
export const needsExpansion = (feedback: string, athleteAge: number): boolean => {
    const wordCount = feedback.trim().split(/\s+/).length;
    const hasBasicResponses = /\b(good|bad|okay|fine|nice|hard|easy)\b/i.test(feedback);
    const lacksDetail = wordCount < (athleteAge < 12 ? 10 : athleteAge < 16 ? 15 : 20);
    
    return lacksDetail || (hasBasicResponses && wordCount < 25);
};

/**
 * Combines original feedback with expanded responses to create a comprehensive session transcript.
 */
export const combineExpandedFeedback = (
    originalFeedback: string,
    expandedResponses: Record<string, string>,
    questions: FollowUpQuestions['questions']
): string => {
    let combinedTranscript = `Original Response: ${originalFeedback}\n\n`;
    
    if (Object.keys(expandedResponses).length > 0) {
        combinedTranscript += "Follow-up Details:\n";
        
        questions.forEach((q, index) => {
            const response = expandedResponses[index.toString()];
            if (response && response.trim()) {
                combinedTranscript += `\nQ: ${q.question}\nA: ${response}\n`;
            }
        });
    }
    
    return combinedTranscript;
};