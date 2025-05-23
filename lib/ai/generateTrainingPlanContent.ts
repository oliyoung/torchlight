import { updateTrainingPlan } from "@/lib/repository/training-plan";
import { PubSub } from "graphql-subscriptions";
import type { Athlete, Goal, TrainingPlan, Assistant, SessionLog, AiTrainingPlanContent } from "@/lib/types";

import { getAssistantsByIds } from "@/lib/repository/assistant";
import { getSessionLogsByAthleteId } from "@/lib/repository/sessionLog";
import { generateContentWithAI } from "@/lib/ai/aiClient";
import { loadPrompt } from "@/lib/ai/promptLoader";

// In-memory PubSub instance for demonstration. In a real application, use a robust solution like Redis.
// TODO: Use the PubSub instance from the GraphQL context instead of a local one.
const pubsub = new PubSub();

export const TRAININING_PLAN_GENERATED = 'trainingPlanGenerated';

// Define the path to the training plan prompt file
const TRAINING_PLAN_PROMPT_FILE = 'ai/prompts/training_plan.prompt.yml';

export const generateTrainingPlanContent = async (
    trainingPlanId: string,
    userId: string | null,
    assistantIds: string[],
    athlete: Omit<Athlete, 'goals' | 'sessionLogs' | 'trainingPlans'>,
    goals: Goal[]
) => {
    console.log(`Generating content for training plan ${trainingPlanId}`);

    try {
        // Fetch necessary data
        const assistants = assistantIds.length > 0 ? await getAssistantsByIds(assistantIds) : [];
        const sessionLogs = await getSessionLogsByAthleteId(userId, athlete.id);

        // Load and parse the prompt file
        const promptFileContent = loadPrompt(TRAINING_PLAN_PROMPT_FILE);
        if (!promptFileContent) {
            console.error("Failed to load training plan prompt file.");
            // TODO: Handle this error appropriately
            return;
        }

        // Extract the user message content which contains the placeholders
        const userMessageTemplate = promptFileContent.messages.find(msg => msg.role === 'user')?.content;

        if (!userMessageTemplate) {
            console.error("User message template not found in prompt file.");
            // TODO: Handle this error appropriately
            return;
        }

        // Extract notes and action items from recent session logs
        const previousSessionLogsContext = sessionLogs.map(log =>
            `Session on ${log.date.toDateString()}: Notes: ${log.notes || 'N/A'}, Action Items: ${(log.actionItems as string[]).join('; ') || 'N/A'}`
        ).join('\n');

        const progressNotes = sessionLogs.map(log => log.notes).filter(Boolean).join('\n');
        const actionItems = sessionLogs.flatMap(log => log.actionItems).filter(Boolean).join('; ');

        // Populate the prompt template
        let prompt = userMessageTemplate;
        prompt = prompt.replace('{{age}}', (new Date().getFullYear() - new Date(athlete.birthday!).getFullYear()).toString() || 'N/A');
        prompt = prompt.replace('{{gender}}', athlete.gender || 'N/A');
        prompt = prompt.replace('{{fitnessLevel}}', athlete.fitnessLevel || 'N/A');
        prompt = prompt.replace('{{trainingHistory}}', athlete.trainingHistory || 'N/A');
        prompt = prompt.replace('{{height}}', athlete.height?.toString() || 'N/A');
        prompt = prompt.replace('{{weight}}', athlete.weight?.toString() || 'N/A');
        prompt = prompt.replace('{{activeGoals}}', goals.map(g => `${g.title} (ID: ${g.id})`).join(', ') || 'None');
        prompt = prompt.replace('{{previousSessionLogs}}', previousSessionLogsContext || 'None');
        prompt = prompt.replace('{{progressNotes}}', progressNotes || 'None');
        prompt = prompt.replace('{{actionItems}}', actionItems || 'None');

        console.log("Generated Prompt:", prompt);

        // Call the placeholder AI client function
        const generatedContent = await generateContentWithAI(prompt);

        if (!generatedContent || !generatedContent.planJson) {
            console.error("AI content generation failed or returned empty.");
            // TODO: Handle this case, maybe update training plan status to error
            return;
        }

        // Cast the planJson to the specific type
        const planJson: AiTrainingPlanContent = generatedContent.planJson as AiTrainingPlanContent;

        const updatedTrainingPlan = await updateTrainingPlan(userId, trainingPlanId, {
            planJson: planJson, // Use the typed content
            overview: generatedContent.overview, // Use the generated overview
            sourcePrompt: prompt // Store the generated prompt
        });

        if (updatedTrainingPlan) {
            console.log(`Training plan ${trainingPlanId} content generated and updated.`);
            // Publish update to PubSub
            // TODO: Use the PubSub instance from context
            pubsub.publish(TRAININING_PLAN_GENERATED, { trainingPlanGenerated: updatedTrainingPlan });
        } else {
            console.error(`Failed to update training plan ${trainingPlanId} after generation.`);
        }
    } catch (error) {
        console.error(`Error generating training plan content for ${trainingPlanId}:`, error);
        // TODO: Handle error appropriately, maybe update training plan status to error
    }
};