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

    // Call mock generation function
    const { overview, planJson } = generateMockTrainingPlan(input.clientId, input.assistantIds ?? [], input.goalIds ?? []);

    // Prepare data for repository
    const trainingPlanData = {
        ...input,
        overview: overview,
        planJson: planJson,
    };

    // Save to repository using the renamed import
    const newTrainingPlan = await createTrainingPlanInRepo(context?.user?.id ?? null, trainingPlanData);

    // Return the saved training plan
    return newTrainingPlan;
};