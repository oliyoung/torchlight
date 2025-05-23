import { logger } from "@/lib/logger"; // Import logger
import OpenAI from "openai";

/**
 * Calls the OpenAI API to generate content based on a prompt.
 * Note: This is a basic implementation assuming the prompt is a simple string
 * and the response is plain text. More complex interactions (e.g., chat messages)
 * would require adapting the input/output types.
 *
 * @param prompt The prompt string to send to the AI.
 * @returns A promise that resolves with the generated content string, or null if an error occurs.
 */
export const callOpenAI = async (prompt: string): Promise<string | null> => {
    const model = process.env.NEXT_PUBLIC_OPEN_AI_MODEL;
    const token = process.env.NEXT_PUBLIC_OPEN_AI_TOKEN;
    const endpoint = process.env.NEXT_PUBLIC_OPEN_AI_ENDPOINT;
    const temperature = process.env.NEXT_PUBLIC_OPEN_AI_TEMPERATURE || 1.0;

    if (!model || !token || !endpoint) {
        logger.error("OpenAI environment variables not set.");
        return null;
    }

    try {
        const client = new OpenAI({ baseURL: endpoint, apiKey: token });

        // Assuming the simple string prompt should be used in a user message for the API
        const response = await client.chat.completions.create({
            messages: [
                { role: "user", content: prompt }
            ],
            temperature: Number(temperature),
            top_p: 1.0,
            model: model
        });

        const generatedContent = response.choices[0].message.content;
        logger.info("Successfully called OpenAI API.");
        return generatedContent;
    } catch (error) {
        logger.error({ error }, "Error calling OpenAI API.");
        return null;
    }
};

