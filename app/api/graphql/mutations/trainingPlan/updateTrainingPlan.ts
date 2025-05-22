import type { UpdateTrainingPlanInput, TrainingPlan } from "@/lib/types";
import { logger } from "@/lib/logger";
import { trainingPlanRepository } from "@/lib/repository";
import type { GraphQLContext } from "../../route";

export const updateTrainingPlan = async (
    _: unknown,
    { id, input }: { id: string; input: UpdateTrainingPlanInput },
    context: GraphQLContext
): Promise<TrainingPlan> => {
    logger.info({ id, input }, "Updating training plan");

    try {
        const existingPlan = await trainingPlanRepository.getTrainingPlanById(
            context?.user?.id ?? null,
            id
        );

        if (!existingPlan) {
            logger.error({ id }, "Training plan not found for update");
            throw new Error(`Training plan with ID ${id} not found`);
        }

        logger.info({ existingPlan }, "Found existing training plan");

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