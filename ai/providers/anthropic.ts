import { logger } from "@/lib/logger";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Calls the Anthropic API to generate content based on a prompt.
 * Assumes the prompt is a simple string and the response is plain text.
 *
 * @param prompt The prompt string to send to the AI.
 * @returns A promise that resolves with the generated content string, or null if an error occurs.
 */
export const callAnthropic = async (prompt: string): Promise<string | null> => {
    const model = process.env.NEXT_PUBLIC_ANTHROPIC_MODEL;
    const token = process.env.NEXT_PUBLIC_ANTHROPIC_KEY;

    if (!model || !token) {
        logger.error("Anthropic environment variables (ANTHROPIC_MODEL, ANTHROPIC_TOKEN) not set.");
        return null;
    }

    try {
        // Use the endpoint if provided, otherwise the SDK will use the default.
        const client = new Anthropic({ apiKey: token });

        // Format the simple string prompt into the Messages API format
        const response = await client.messages.create({
            model: model,
            max_tokens: 1024, // Set a reasonable max tokens limit
            messages: [
                { role: "user", content: prompt }
            ],
        });

        // Extract the text content from the response
        // Filter for text blocks and join their text content
        const generatedContent = response.content
            .filter(block => block.type === 'text') // Filter for text blocks
            .map(block => block.text) // Map to the text property
            .join('\n');

        const parsedGeneratedContent = safeJsonParse<string>(generatedContent);
        logger.info({ parsedGeneratedContent }, "Successfully called Anthropic API.");
        return parsedGeneratedContent
    } catch (error) {
        logger.error({ error }, "Error calling Anthropic API.");
        return null;
    }
};


function safeJsonParse<T = unknown>(jsonString: string): T | null {
    let cleanedString = jsonString.trim();

    // Check if the string starts with ```json and ends with ```
    if (cleanedString.startsWith('```json')) {
        // Find the index of the closing ```
        const closingMarkerIndex = cleanedString.lastIndexOf('```');

        // Ensure the closing marker exists and is after the opening marker
        if (closingMarkerIndex > '```json'.length) {
            // Extract the content between the markers
            cleanedString = cleanedString.substring('```json'.length, closingMarkerIndex).trim();
        } else {
            // Handle case where starting marker is present but closing is missing or misplaced
            // We could potentially just try parsing the whole string or return null.
            // For robustness, let's assume an invalid format and try parsing the whole string
            // after removing just the opening marker, or return null if that seems safer.
            // A safer approach is to just return null if the format isn't as expected.
            console.error("Invalid markdown JSON format: missing or misplaced closing ```");
            return null;
        }
    }

    try {
        return JSON.parse(cleanedString) as T;
    } catch (error) {
        console.error("Failed to parse JSON string after cleaning:", error);
        return null;
    }
}