import { readFileSync } from 'node:fs';
import { logger } from '@/lib/logger';
import yaml from 'js-yaml';

// Define a type for the expected structure of the YAML prompt file
interface PromptFileContent {
    name: string;
    description: string;
    model: string;
    modelParameters?: { [key: string]: unknown };
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
}

// Processed prompt ready for AI execution
export interface ProcessedPrompt {
    model: string;
    temperature: number;
    systemMessage: string;
    userMessage: string;
}

/**
 * Loads and parses a YAML prompt file.
 */
export const loadPrompt = (filePath: string): PromptFileContent | null => {
    try {
        const fileContent = readFileSync(filePath, 'utf-8');
        const parsedContent = yaml.load(fileContent) as PromptFileContent;
        // Basic validation to ensure it has the expected structure
        if (!parsedContent || !parsedContent.messages || !Array.isArray(parsedContent.messages)) {
            logger.error({ filePath }, "Invalid prompt file structure");
            return null;
        }
        return parsedContent;
    } catch (error) {
        logger.error({ filePath, error }, "Error loading or parsing prompt file");
        return null;
    }
};

/**
 * Loads a prompt file and processes it with variable substitution.
 * This is an optimized version that handles all common prompt operations:
 * - Loading and parsing the YAML file
 * - Extracting system and user messages
 * - Getting model and temperature settings
 * - Replacing template variables
 * 
 * @param filePath Path to the YAML prompt file
 * @param variables Object containing variables to substitute in the user message template
 * @returns ProcessedPrompt ready for AI execution
 */
export const loadAndProcessPrompt = (
    filePath: string, 
    variables: Record<string, string>
): ProcessedPrompt => {
    // Load the prompt file
    const promptFileContent = loadPrompt(filePath);
    if (!promptFileContent) {
        logger.error({ filePath }, "Failed to load prompt file.");
        throw new Error(`Failed to load prompt file: ${filePath}`);
    }

    // Extract the user message template and system message
    const userMessageTemplate = promptFileContent.messages.find(
        (msg) => msg.role === "user"
    )?.content;
    const systemMessage = promptFileContent.messages.find(
        (msg) => msg.role === "system"
    )?.content;

    if (!userMessageTemplate || !systemMessage) {
        logger.error({ filePath }, "System or User message template not found in prompt file.");
        throw new Error(`System or User message template not found in prompt file: ${filePath}`);
    }

    // Replace variables in the user message template
    let userMessage = userMessageTemplate;
    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
        userMessage = userMessage.replace(regex, value);
    }

    // Get model parameters
    const model = promptFileContent.model;
    const temperature = Number(promptFileContent?.modelParameters?.temperature) ?? 0.7;

    logger.info({ filePath, model, temperature, variablesCount: Object.keys(variables).length }, "Processed prompt successfully");

    return {
        model,
        temperature,
        systemMessage,
        userMessage,
    };
};