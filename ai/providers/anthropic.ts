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
    const token = process.env.NEXT_PUBLIC_ANTHROPIC_TOKEN;
    const endpoint = process.env.NEXT_PUBLIC_ANTHROPIC_ENDPOINT;

    if (!model || !token) {
        logger.error("Anthropic environment variables (ANTHROPIC_MODEL, ANTHROPIC_TOKEN) not set.");
        return null;
    }

    try {
        // Use the endpoint if provided, otherwise the SDK will use the default.
        const client = new Anthropic({ apiKey: token, baseURL: endpoint });

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

        logger.info("Successfully called Anthropic API.");
        return generatedContent;
    } catch (error) {
        logger.error({ error }, "Error calling Anthropic API.");
        return null;
    }
};
