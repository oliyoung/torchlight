import type { CreateTrainingPlanInput, TrainingPlan } from "@/lib/types";

// TODO: Implement mock training plan generation logic
import { generateMockTrainingPlan } from "@/lib/ai/generateTrainingPlan";

// TODO: Implement saving training plan to the database
import { createTrainingPlan } from "@/lib/repository/trainingPlan";

export default {
    createTrainingPlan: async (
        _: unknown,
        { input }: { input: CreateTrainingPlanInput },
    ): Promise<TrainingPlan> => {
        console.log("Creating training plan with input:", input);

        // Call mock generation function
        const { overview, planJson } = generateMockTrainingPlan(input.clientId, input.assistantIds ?? [], input.goalIds ?? []);

        // Prepare data for repository
        const trainingPlanData = {
            ...input,
            overview: overview,
            planJson: planJson,
            // Assuming userId can be derived or is not strictly needed by the repository create function based on current signature
            // If needed, the resolver signature should include context: GraphQLContext
        };

        // Save to repository
        const newTrainingPlan = await createTrainingPlan(trainingPlanData);

        // Return the saved training plan
        return newTrainingPlan;
    },
};