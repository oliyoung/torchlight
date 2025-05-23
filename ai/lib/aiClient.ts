import { callAnthropic } from "@/ai/providers/anthropic";
import { callOpenAI } from '@/ai/providers/openai';
import { logger } from "@/lib/logger"; // Import logger

/**
 * Calls an AI model to generate content based on a prompt.
 * This function acts as an abstraction layer for different AI providers.
 *
 * @param prompt The prompt string to send to the AI.
 * @returns A promise that resolves with the generated content in the expected format, or null if generation fails.
 */
export const generateContentWithAI = async <T>(
    prompt: string,
    model: "OpenAI" | "Claude" = "OpenAI"
): Promise<T | null> => {
    logger.info("Calling AI with prompt.");

    try {
        const generatedText = model === 'OpenAI' ? await callOpenAI(prompt) : await callAnthropic(prompt);

        if (generatedText === null) {
            logger.error("AI provider call failed.");
            return null; // Return null if the AI call failed
        }

        // TODO: Implement logic to handle different expected output formats (e.g., JSON for plans, string for analysis)
        // For now, based on how generateSessionPlanAI and analyzeProgressAI use this, we need to handle both string and JSON.
        // A more robust solution would involve a parameter indicating the expected output type.

        // Attempt to parse as JSON first (for training plans and session plans)
        try {
            const parsedContent = JSON.parse(generatedText);
            // Basic check to see if it looks like a structured plan (could be more robust)
            if (typeof parsedContent === 'object' && parsedContent !== null) {
                logger.info("AI response parsed as JSON.");
                // Assuming the structure includes a planJson field or is the plan object itself
                // This part might need adjustment based on the exact output structure from the AI for plans
                // For now, return the parsed object assuming it contains the necessary fields (like planJson for training plans)
                return parsedContent as T; // Cast to expected type for plans
            }
        } catch (parseError) {
            // If JSON parsing fails, assume it's a plain text response (for analysis)
            logger.info("AI response is plain text (JSON parsing failed).");
            return null;
        }

        // Fallback if neither parsing works (shouldn't happen if AI returns valid string/json)
        logger.error("AI response in unexpected format.");
        return null;

    } catch (error) {
        logger.error({ error }, "Error in generateContentWithAI.");
        return null;
    }
};