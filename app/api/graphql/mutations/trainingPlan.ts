import type { CreateTrainingPlanInput, TrainingPlan } from "@/lib/types";

// TODO: Implement mock training plan generation logic
import { generateMockTrainingPlan } from "@/lib/ai/generateTrainingPlan";

// TODO: Implement saving training plan to the database
import { createTrainingPlan as createTrainingPlanInRepo } from "@/lib/repository/trainingPlan";

export const createTrainingPlan = async (
    _: unknown,
    { input }: { input: CreateTrainingPlanInput },
    context: any
): Promise<TrainingPlan> => {
    console.log("Creating training plan with input:", input);

    // 1. Prepare initial data (without generated content)
    const initialTrainingPlanData = {
        ...input,
        overview: "", // Initialize with empty or placeholder
        planJson: {}, // Initialize with empty or placeholder
    };

    // 2. Save initial training plan to repository
    const newTrainingPlan = await createTrainingPlanInRepo(context?.user?.id ?? null, initialTrainingPlanData);

    // Check if training plan was successfully created
    if (!newTrainingPlan || !newTrainingPlan.id) {
        throw new Error("Failed to create initial training plan.");
    }

    // 3. Asynchronously generate content and update the training plan
    // Do not await this call, it runs in the background
    // The generateTrainingPlanContent function is responsible for updating the DB and publishing the subscription
    generateTrainingPlanContent(newTrainingPlan.id, context?.user?.id ?? null, input.assistantIds ?? [], input.goalIds ?? []).catch(console.error);

    // 4. Return the initial training plan immediately
    return newTrainingPlan;
};