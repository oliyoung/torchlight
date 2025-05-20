import type { CreateTrainingPlanInput, TrainingPlan, Client, Goal } from "@/lib/types";

// TODO: Implement mock training plan generation logic
import { generateTrainingPlanContent } from "@/lib/ai/generateTrainingPlanContent"; // Import the async generator

// Import repository instances
import { clientRepository, goalRepository, trainingPlanRepository } from "@/lib/repository";
import { logger } from "@/lib/logger";
import type { GraphQLContext } from "../route";

export const createTrainingPlan = async (
    _: unknown,
    { input }: { input: CreateTrainingPlanInput },
    context: GraphQLContext
): Promise<TrainingPlan> => {
    logger.info({ input }, "Creating training plan with input");

    // 1. Prepare initial data (without generated content)
    const initialTrainingPlanData: CreateTrainingPlanInput & { overview: string; planJson: JSON } = {
        ...input,
        overview: "", // Initialize with empty or placeholder
        planJson: { input: {}, output: {} } as unknown as JSON, // Initialize with empty object matching JSON type structure
    };

    // 2. Save initial training plan to repository
    const newTrainingPlan = await trainingPlanRepository.createTrainingPlan(context?.user?.id ?? null, initialTrainingPlanData);

    // Check if training plan was successfully created
    if (!newTrainingPlan || !newTrainingPlan.id) {
        throw new Error("Failed to create initial training plan.");
    }

    // 3. Fetch client and goals data needed for content generation
    const client = await clientRepository.getClientById(context?.user?.id ?? null, input.clientId);
    const goals = await goalRepository.getGoalsByIds(context?.user?.id ?? null, input.goalIds ?? []);

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