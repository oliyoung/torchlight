import type { Athlete, CreateTrainingPlanInput, Goal, TrainingPlan, UpdateTrainingPlanInput } from "@/lib/types";

// TODO: Implement mock training plan generation logic
import { generateTrainingPlanContent } from "@/lib/ai/generateTrainingPlanContent"; // Import the async generator

import { logger } from "@/lib/logger";
// Import repository instances
import { athleteRepository, goalRepository, trainingPlanRepository } from "@/lib/repository";
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

    // 3. Fetch athlete and goals data needed for content generation
    const athlete = await athleteRepository.getAthleteById(context?.user?.id ?? null, input.athleteId);
    const goals = await goalRepository.getGoalsByIds(context?.user?.id ?? null, input.goalIds ?? []);

    // Basic validation: Ensure athlete is found and all requested goals were found
    if (!athlete || goals.length !== (input.goalIds ?? []).length) {
        console.error(`Failed to fetch athlete (${input.athleteId}) or goals (${input.goalIds}) for training plan ${newTrainingPlan.id}.`);
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
        // Pass the fetched athlete and goals objects
        athlete as Athlete, // Cast as Athlete to satisfy type checks, though error handling above is basic
        goals as Goal[] // Cast as Goal[]
    ).catch(console.error);

    // 5. Return the initial training plan immediately
    return newTrainingPlan;
};

export const updateTrainingPlan = async (
    _: unknown,
    { id, input }: { id: string; input: UpdateTrainingPlanInput },
    context: GraphQLContext
): Promise<TrainingPlan> => {
    logger.info({ id, input }, "Updating training plan");

    try {
        // First, fetch the existing training plan to ensure it exists
        const existingPlan = await trainingPlanRepository.getTrainingPlanById(
            context?.user?.id ?? null,
            id
        );

        if (!existingPlan) {
            logger.error({ id }, "Training plan not found for update");
            throw new Error(`Training plan with ID ${id} not found`);
        }

        logger.info({ existingPlan }, "Found existing training plan");

        // Only include fields that are actually provided in the input
        const updateData: Partial<TrainingPlan> & { assistantIds?: string[]; goalIds?: string[] } = {};

        if (input.title !== undefined && input.title !== null) {
            updateData.title = input.title;
        }

        if (input.overview !== undefined && input.overview !== null) {
            updateData.overview = input.overview;
        }

        if (input.assistantIds !== undefined && input.assistantIds !== null) {
            updateData.assistantIds = input.assistantIds;
        }

        if (input.goalIds !== undefined && input.goalIds !== null) {
            updateData.goalIds = input.goalIds;
        }

        logger.info({ updateData }, "Prepared update data");

        const updatedTrainingPlan = await trainingPlanRepository.updateTrainingPlan(
            context?.user?.id ?? null,
            id,
            updateData
        );

        if (!updatedTrainingPlan) {
            logger.error({ id, updateData }, "Repository failed to update training plan");
            throw new Error(`Failed to update training plan with ID ${id}`);
        }

        logger.info({ id, updatedPlan: updatedTrainingPlan }, "Successfully updated training plan");
        return updatedTrainingPlan;
    } catch (error) {
        logger.error({ id, input, error }, "Exception updating training plan");
        throw error;
    }
};