import type { CreateTrainingPlanInput, TrainingPlan, JSON, Client, Goal } from "@/lib/types";

// TODO: Implement mock training plan generation logic
import { generateMockTrainingPlan } from "@/lib/ai/generateTrainingPlan";
import { generateTrainingPlanContent } from "@/lib/ai/generateTrainingPlanContent"; // Import the async generator

// Import repository functions
import { getClientById } from "@/lib/repository/client";
import { getGoalsByIds } from "@/lib/repository/goal";

// TODO: Implement saving training plan to the database
import { createTrainingPlan as createTrainingPlanInRepo } from "@/lib/repository/trainingPlan";
import { getAssistants } from "@/lib/repository";
import { getAssistantsByIds } from "@/lib/repository/assistant";

export const createTrainingPlan = async (
    _: unknown,
    { input }: { input: CreateTrainingPlanInput },
    context: any
): Promise<TrainingPlan> => {
    console.log("Creating training plan with input:", input);

    // 1. Prepare initial data (without generated content)
    const initialTrainingPlanData: CreateTrainingPlanInput & { overview: string; planJson: JSON } = {
        ...input,
        overview: "", // Initialize with empty or placeholder
        planJson: { input: {}, output: {} } as JSON, // Initialize with empty object matching JSON type structure
    };

    // 2. Save initial training plan to repository
    const newTrainingPlan = await createTrainingPlanInRepo(context?.user?.id ?? null, initialTrainingPlanData);

    // Check if training plan was successfully created
    if (!newTrainingPlan || !newTrainingPlan.id) {
        throw new Error("Failed to create initial training plan.");
    }

    // 3. Fetch client and goals data needed for content generation
    const client = await getClientById(context?.user?.id ?? null, input.clientId);
    const goals = await getGoalsByIds(context?.user?.id ?? null, input.goalIds ?? []);

    // Basic validation: Ensure client is found and all requested goals were found
    if (!client || goals.length !== (input.goalIds ?? []).length) {
        console.error(`Failed to fetch client (${input.clientId}) or goals (${input.goalIds}) for training plan ${newTrainingPlan.id}.`);
        // TODO: Potentially update the training plan status to indicate generation failure or queue for retry
        // TODO: Publish a TRAINING_PLAN_GENERATION_FAILED event
        // For now, we proceed but log the error. The async function will also likely fail.
    }

    // 4. Asynchronously generate content and update the training plan
    // Do not await this call, it runs in the background
    // The generateTrainingPlanContent function is responsible for updating the DB and publishing the subscription
    generateTrainingPlanContent(
        newTrainingPlan.id,
        context?.user?.id ?? null,
        input.assistantIds ?? [],
        // Pass the fetched client and goals objects
        client as Client, // Cast as Client to satisfy type checks, though error handling above is basic
        goals as Goal[] // Cast as Goal[]
    ).catch(console.error);

    // 5. Return the initial training plan immediately
    return newTrainingPlan;
};