import type { PubSub } from 'graphql-subscriptions';
import type { TrainingPlan, Client, Goal } from '@/lib/types';
// Need repository functions to fetch client and goals, and update training plan
import { getClientById } from "@/lib/repository/client"; // Assuming getClientById is in client.ts
import { getGoalsByIds } from "@/lib/repository/goal"; // Add this import
import { getTrainingPlanById } from "@/lib/repository/trainingPlan"; // Import getTrainingPlanById
import { updateTrainingPlan } from "@/lib/repository/trainingPlan"; // Need to add this
import { readFileSync } from 'fs'; // Import file system module

// Ensure the correct PubSub event constant is used
const TRAINING_PLAN_GENERATED = 'TRAINING_PLAN_GENERATED'; // Use the same constant as the subscription

// Placeholder for AI generation logic
async function callLLMForTrainingPlan(prompt: string): Promise<{ overview: string; planJson: any }> {
    console.log("Simulating LLM call with prompt:", prompt);
    // In a real implementation, this would call the AI provider (e.g., Anthropic SDK or MCP)
    // Based on the prompt, generate mock overview and planJson
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay

    // Mock implementation based on the prompt structure from training_plan.md
    const mockOverview = "Generated training plan overview based on client data and goals.";
    const mockPlanJson = {
        programOverview: {
            title: "Personalized Training Plan",
            duration: "8 Weeks",
            phases: ["Phase 1: Foundation", "Phase 2: Strength", "Phase 3: Power"],
            expectedOutcomes: ["Improved strength", "Increased endurance"], // Based on goals
            equipment: ["Gym access", "Dumbbells"],
            targetGoals: [] // Populate with relevant goal IDs
        },
        weeklySchedule: [
            { day: "Monday", focus: "Lower Body Strength", duration: "60 min", intensity: "High" },
            { day: "Tuesday", focus: "Upper Body Strength", duration: "60 min", intensity: "High" },
            { day: "Wednesday", focus: "Active Recovery", duration: "30 min", intensity: "Low" },
            { day: "Thursday", focus: "Full Body Power", duration: "75 min", intensity: "Very High" },
            { day: "Friday", focus: "Rest", duration: "", intensity: "" },
            { day: "Saturday", focus: "Long Endurance", duration: "90 min", intensity: "Moderate" },
            { day: "Sunday", focus: "Rest", duration: "", intensity: "" },
        ],
        sessions: [
            {
                name: "Monday - Lower Body Strength",
                dayOfWeek: "Monday",
                warmup: ["5 min jogging", "dynamic stretches"],
                mainExercises: [
                    { name: "Squats", sets: 3, reps: "8-10", intensity: "RPE 7", rest: "90s", notes: "Focus on form" },
                    { name: "Deadlifts", sets: 3, reps: "5", intensity: "RPE 8", rest: "120s", notes: "Heavy day" },
                ],
                cooldown: ["stretching"]
            },
            {
                name: "Tuesday - Upper Body Strength",
                dayOfWeek: "Tuesday",
                warmup: ["5 min cardio", "arm circles"],
                mainExercises: [
                    { name: "Bench Press", sets: 3, reps: "8-10", intensity: "RPE 7", rest: "90s", notes: "" },
                    { name: "Pull-ups", sets: 3, reps: "AMRAP", intensity: "RPE 8", rest: "90s", notes: "As many reps as possible" },
                ],
                cooldown: ["stretching"]
            }
            // Add more sessions based on the prompt and data
        ],
        progressionGuidelines: ["Increase weight by 5% weekly", "Reduce rest periods over time"],
        recoveryRecommendations: ["Get 7-9 hours of sleep", "Stay hydrated", "Include foam rolling"],
        monitoringStrategies: ["Track RPE for each set", "Monitor resting heart rate"] // Link to session logs
    };

    // In a real LLM call, you'd parse the LLM's response into this structure.

    return { overview: mockOverview, planJson: mockPlanJson };
}

// Function to generate training plan content asynchronously
export async function generateTrainingPlanContent(trainingPlanId: string, userId: string | null, assistantIds: string[], goalIds: string[]) {
    console.log(`Starting async generation for Training Plan ${trainingPlanId} for user ${userId}`);

    // Need the pubsub instance from the context in route.ts
    // For this async function, we'll need to pass it in or access it globally if possible.
    // Given the current structure, passing it as an argument is the most explicit way.
    // However, the call in the resolver doesn't pass pubsub. Let's assume for now pubsub is accessible via context globally or passed down.
    // A better approach might be to structure this differently, perhaps a background job runner.
    // For now, let's update the signature to accept pubsub.
    // Reworking the function signature to accept pubsub:
    // export async function generateTrainingPlanContent(trainingPlanId: string, userId: string | null, assistantIds: string[], goalIds: string[], pubsub: PubSub) {
    // For simplicity in this iteration, let's assume pubsub is available globally or via a context equivalent in this async env.
    // In a real app, you'd use a proper job queue (e.g., BullMQ, Faktory) and pass necessary data, not live PubSub.
    // For the purpose of this mock, let's just import and use pubsub assuming it's accessible (will likely need refactoring later).

    // Temporarily import pubsub directly for the mock, though this is not ideal in production async jobs
    let pubsub: PubSub;
    try {
        const { pubsub: importedPubsub } = await import("@/app/api/graphql/route");
        pubsub = importedPubsub;
    } catch (e) {
        console.error("Failed to import pubsub in async job:", e);
        return; // Cannot proceed without pubsub
    }

    try {
        // 1. Fetch necessary data (using userId for authorization checks in repository)
        // Fetch the initial training plan to get the clientId
        const initialTrainingPlan = await getTrainingPlanById(trainingPlanId); // Use getTrainingPlanById

        if (!initialTrainingPlan || !initialTrainingPlan.clientId) {
            console.error(`Training plan ${trainingPlanId} not found or missing clientId.`);
            return; // Cannot proceed without training plan and client ID
        }
        const clientId = initialTrainingPlan.clientId; // Get clientId from the fetched plan

        const client = await getClientById(userId, clientId);
        const goals = await getGoalsByIds(userId, goalIds); // Use the new function

        if (!client || goals.length !== goalIds.length) {
            console.error(`Data fetching failed for training plan ${trainingPlanId}. Client or some goals not found.`);
            // Optionally publish an error state or log failure
            // TODO: Publish a TRAINING_PLAN_GENERATION_FAILED event
            return;
        }

        // For now, use mock client/goal data for prompt preparation since getGoalsByIds is not yet implemented
        const clientData = client;
        const goalsData = goals;

        // 2. Prepare the prompt
        // Read the prompt template from the file
        const promptTemplate = readFileSync('lib/ai/prompts/training_plan.md', 'utf-8');

        // Construct the specific prompt using the template and fetched data
        // This is a simplified example; a real implementation would involve
        // more sophisticated prompt engineering and data formatting.
        const prompt = `Based on the following prompt template and client data, generate a training plan:\n\n${promptTemplate}\n\nClient Data:\nName: ${clientData.firstName} ${clientData.lastName}\nGoals: ${goalsData.map((g: Goal) => g.title).join(", ")}\nGoal Descriptions:\n${goalsData.map((g: Goal) => `- ${g.title}: ${g.description}`).join("\n")}\nAssistant IDs: ${assistantIds.join(", ")}\n\nGenerate the response in the specified JSON format.\n\n`;

        console.log("Generated Prompt:", prompt);

        // 3. Simulate AI call
        const { overview, planJson } = await callLLMForTrainingPlan(prompt);

        // 4. Prepare data for update
        const updateData = {
            overview: overview,
            planJson: planJson,
            generatedBy: "Mock AI Service", // Indicate source
            sourcePrompt: prompt,
            // Add any other fields to update, e.g., status to 'generated'
        };

        // 5. Update the training plan record in the database
        const updatedTrainingPlan = await updateTrainingPlan(userId, trainingPlanId, updateData); // Need to add updateTrainingPlan function

        if (updatedTrainingPlan) {
            console.log(`Training plan ${trainingPlanId} updated successfully.`);
            // 6. Publish update via PubSub
            // Include clientId in the payload for subscription filtering
            pubsub.publish(TRAINING_PLAN_GENERATED, { trainingPlanGenerated: updatedTrainingPlan, clientId: updatedTrainingPlan.clientId });
            console.log(`Published update for training plan ${trainingPlanId}.`);
        } else {
            console.error(`Failed to update training plan ${trainingPlanId} after generation.`);
            // Optionally publish a generation failed event
            // TODO: Publish a TRAINING_PLAN_GENERATION_FAILED event with relevant ID/error
        }

    } catch (error) {
        console.error(`Error during async training plan generation for ${trainingPlanId}:`, error);
        // Optionally publish an error state via PubSub
        // TODO: Publish a TRAINING_PLAN_GENERATION_FAILED event with relevant ID/error
    }
}