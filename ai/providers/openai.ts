import { logger } from "@/lib/logger"; // Import logger
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { z } from "zod";

/**
 * Calls the OpenAI API to generate content based on a prompt.
 * Note: This is a basic implementation assuming the prompt is a simple string
 * and the response is plain text. More complex interactions (e.g., chat messages)
 * would require adapting the input/output types.
 *
 * @param prompt The prompt string to send to the AI.
 * @returns A promise that resolves with the generated content string, or null if an error occurs.
 */
export const callOpenAI = async <T>(
    model: string,
    temperature: number,
    instructions: string,
    input: string,
    schema: z.AnyZodObject,
): Promise<T | null> => {
    const apiKey = process.env.NEXT_PUBLIC_OPEN_AI_TOKEN;

    if (!model || !apiKey) {
        logger.error({ model, apiKey }, "OpenAI environment variables not set.");
        return null;
    }

    try {
        const client = new OpenAI({ apiKey });
        const response = await client.responses.parse({
            model,
            instructions,
            input,
            temperature,
            text: {
                format: zodTextFormat(schema, "zodFormat"),
            },
        });

        if (
            response.status === "incomplete" &&
            response?.incomplete_details?.reason
        ) {
            throw new Error(
                `${response.status} ${response?.incomplete_details?.reason}`,
            );
        }

        if (response.status === "completed" && response.output_parsed) {
            return response.output_parsed as T;
        }
        return null;

    } catch (error) {
        if (error instanceof OpenAI.APIError) {
            logger.error({ error }, "OpenAI API Error.");
            return null;
        }
        return null;
    }
};
