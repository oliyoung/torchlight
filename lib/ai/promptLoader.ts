import { readFileSync } from 'node:fs';
import yaml from 'js-yaml';

// Define a type for the expected structure of the YAML prompt file
interface PromptFileContent {
    name: string;
    description: string;
    model: string;
    modelParameters?: { [key: string]: any };
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
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
            console.error(`Invalid prompt file structure: ${filePath}`);
            return null;
        }
        return parsedContent;
    } catch (error) {
        console.error(`Error loading or parsing prompt file ${filePath}:`, error);
        return null;
    }
};