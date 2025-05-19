import type { PubSub } from 'graphql-subscriptions';
import type { TrainingPlan, Client, Goal, Assistant } from '@/lib/types';
import { getTrainingPlanById } from "@/lib/repository/training-plans/getTrainingPlanById";
import { updateTrainingPlan } from "@/lib/repository/training-plans/updateTrainingPlan";
import { readFileSync } from 'node:fs';
import { logger } from '../logger';

// Ensure the correct PubSub event constant is used
const TRAINING_PLAN_GENERATED = 'TRAINING_PLAN_GENERATED';

// Placeholder for AI generation logic
async function callLLMForTrainingPlan(prompt: string): Promise<{ overview: string; planJson: unknown }> {
    logger.info({ prompt }, "Simulating LLM call with prompt");
    // In a real implementation, this would call the AI provider (e.g., Anthropic SDK or MCP)
    // Based on the prompt, generate mock overview and planJson
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay

    // Mock implementation based on the prompt structure from training_plan.md
    const mockOverview = "Generated training plan overview based on client data and goals.";
    const mockPlanJson = {
        programOverview: {
            title: "Basketball Skill & Conditioning Plan",
            duration: "6 Weeks",
            phases: ["Phase 1: Foundational Skills", "Phase 2: Conditioning & Agility", "Phase 3: Game Specific Drills"],
            expectedOutcomes: ["Improved ball-handling", "Increased vertical jump", "Enhanced court speed"], // Based on goals
            equipment: ["Basketball", "Cones", "Agility ladder", "Court access"],
            targetGoals: [] // Populate with relevant goal IDs
        },
        weeklySchedule: [
            { day: "Monday", focus: "Ball Handling & Shooting", duration: "75 min", intensity: "Moderate" },
            { day: "Tuesday", focus: "Strength & Conditioning", duration: "60 min", intensity: "High" },
            { day: "Wednesday", focus: "Rest or Active Recovery", duration: "30 min", intensity: "Low" },
            { day: "Thursday", focus: "Agility & Footwork", duration: "60 min", intensity: "High" },
            { day: "Friday", focus: "Game Simulation & Scrimmage", duration: "90 min", intensity: "Very High" },
            { day: "Saturday", focus: "Light Skills Work", duration: "45 min", intensity: "Low" },
            { day: "Sunday", focus: "Rest", duration: "", intensity: "" },
        ],
        sessions: [
            {
                name: "Monday - Ball Handling & Shooting",
                dayOfWeek: "Monday",
                warmup: ["10 min dynamic stretching", "Mikan drill"],
                mainExercises: [
                    { name: "Stationary Ball Handling (various drills)", sets: 5, reps: "60s each", intensity: "Moderate", rest: "30s", notes: "Focus on control" },
                    { name: "Form Shooting (close range)", sets: 5, reps: "10 makes", intensity: "Low", rest: "60s", notes: "Elbow tucked" },
                    { name: "Layup variations", sets: 3, reps: "5 each side", intensity: "Moderate", rest: "45s", notes: "Practice different finishes" },
                ],
                cooldown: ["10 min static stretching"]
            },
            {
                name: "Tuesday - Strength & Conditioning",
                dayOfWeek: "Tuesday",
                warmup: ["5 min jump rope", "dynamic movements"],
                mainExercises: [
                    { name: "Box Jumps", sets: 4, reps: "5", intensity: "High", rest: "90s", notes: "Focus on landing" },
                    { name: "Lateral Bounds", sets: 3, reps: "8 each side", intensity: "Moderate", rest: "60s", notes: "Explosive movement" },
                    { name: "Sprint Intervals (e.g., 17s)", sets: 10, reps: "1", intensity: "Very High", rest: "60s", notes: "Maximize speed" },
                ],
                cooldown: ["stretching and foam rolling"]
            }
            // Add more basketball-specific sessions
        ],
        progressionGuidelines: ["Increase reps/duration weekly", "Reduce rest periods", "Add defensive slides to warmups"],
        recoveryRecommendations: ["Use ice baths post-conditioning", "Focus on nutrition for energy"],
        monitoringStrategies: ["Track vertical jump progress", "Record sprint times", "Log shooting percentage in practice"] // Link to session logs
    };

    // In a real LLM call, you'd parse the LLM's response into this structure.

    return { overview: mockOverview, planJson: mockPlanJson };
}

// Function to generate training plan content asynchronously
export async function generateTrainingPlanContent(
    trainingPlanId: TrainingPlan['id'],
    userId: string | null,
    assistantIds: Assistant['id'][],
    client: Client, // Accept Client object directly
    goals: Goal[] // Accept Goal objects directly
) {
    logger.info({ trainingPlanId, userId }, "Starting async generation for Training Plan");

    // Need the pubsub instance from the context in route.ts
    // Temporarily import pubsub directly for the mock, though this is not ideal in production async jobs
    let pubsub: PubSub;
    try {
        const { pubsub: importedPubsub } = await import("@/app/api/graphql/route");
        pubsub = importedPubsub;
    } catch (e) {
        logger.error({ e }, "Failed to import pubsub in async job");
        return; // Cannot proceed without pubsub
    }

    try {
        // 1. Fetch the initial training plan to get training plan specific data if needed
        // Note: Client and Goals are now passed in, no need to fetch them here
        const initialTrainingPlan = await getTrainingPlanById(trainingPlanId); // Still need this for plan-specific fields if any

        if (!initialTrainingPlan) {
            logger.error({ trainingPlanId }, "Training plan not found");
            return; // Cannot proceed if the plan itself is not found
        }

        // Use the passed-in client and goals data directly
        const clientData = client;
        const goalsData = goals;
        // Check if client or goals data is missing (should ideally be handled by the caller)
        if (!clientData || goalsData.length !== initialTrainingPlan.goals?.length) { // Check if the number of goals matches what was requested initially
            logger.error({ trainingPlanId }, "Invalid data passed for training plan. Client or goals missing/mismatch.");
            // TODO: Publish a TRAINING_PLAN_GENERATION_FAILED event
            return;
        }

        // 2. Prepare the prompt
        // Read the prompt template from the file
        const promptTemplate = readFileSync('lib/ai/prompts/training_plan.md', 'utf-8');

        // Construct the specific prompt using the template and passed-in data
        // This is a simplified example; a real implementation would involve
        // more sophisticated prompt engineering and data formatting.
        const prompt = `Based on the following prompt template and client data, generate a training plan:\n\n${promptTemplate}\n\nClient Data:\nName: ${clientData.firstName} ${clientData.lastName}\nGoals: ${goalsData.map((g: Goal) => g.title).join(", ")}\nGoal Descriptions:\n${goalsData.map((g: Goal) => `- ${g.title}: ${g.description}`).join("\n")}\nAssistant IDs: ${assistantIds.join(", ")}\n\nGenerate the response in the specified JSON format.\n\n`;

        logger.info("Generated Prompt:", prompt);

        // 3. Simulate AI call
        const { overview, planJson } = await callLLMForTrainingPlan(prompt);

        // 4. Prepare data for update
        const aiTitle = (planJson as any)?.programOverview?.title || '';
        const updateData = {
            title: aiTitle,
            overview: overview,
            planJson: planJson,
            generatedBy: "Mock AI Service", // Indicate source
            sourcePrompt: prompt,
            // Add any other fields to update, e.g., status to 'generated'
        };
        // 5. Update the training plan record in the database
        const updatedTrainingPlan = await updateTrainingPlan(userId, trainingPlanId, {
            ...updateData,
            planJson: JSON.parse(JSON.stringify(updateData.planJson)) // Convert unknown to JSON type
        });

        if (updatedTrainingPlan) {
            logger.info(`Training plan ${trainingPlanId} updated successfully.`);
            // 6. Publish update via PubSub
            // Include clientId in the payload for subscription filtering
            if (updatedTrainingPlan.client?.id) {
                pubsub.publish(TRAINING_PLAN_GENERATED, {
                    trainingPlanGenerated: updatedTrainingPlan,
                    clientId: updatedTrainingPlan.client.id
                });
                logger.info(`Published update for training plan ${trainingPlanId}.`);
            } else {
                logger.warn({ trainingPlanId }, "Cannot publish update - client ID is missing");
            }
        } else {
            logger.error({ trainingPlanId }, "Failed to update training plan after generation.");
            // Optionally publish a generation failed event
            // TODO: Publish a TRAINING_PLAN_GENERATION_FAILED event with relevant ID/error
        }

    } catch (error) {
        logger.error({ error, trainingPlanId }, "Error during async training plan generation");
        // Optionally publish an error state via PubSub
        // TODO: Publish a TRAINING_PLAN_GENERATION_FAILED event with relevant ID/error
    }
}