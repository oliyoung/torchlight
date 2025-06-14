import type { UpdateTrainingPlanInput, TrainingPlan } from "@/lib/types";
import { logger } from "@/lib/logger";
import { trainingPlanRepository } from "@/lib/repository";

export const updateTrainingPlan = async (
    _parent: any,
    { id, input }: { id: string; input: UpdateTrainingPlanInput },
    context: { coachId: string | null }
): Promise<TrainingPlan> => {
    const { coachId } = context;

    logger.info({ coachId, id, input }, "updateTrainingPlan mutation called");

    if (!coachId) {
        throw new Error("Authentication required");
    }

    try {
        const existingPlan = await trainingPlanRepository.getTrainingPlanById(coachId, id);

        if (!existingPlan) {
            logger.error({ coachId, id }, "Training plan not found for update");
            throw new Error(`Training plan with ID ${id} not found`);
        }

        const updateData: any = {};

        if (input.overview !== undefined && input.overview !== null) {
            updateData.overview = input.overview;
        }

        if (input.difficulty !== undefined && input.difficulty !== null) {
            updateData.difficulty = input.difficulty;
        }

        if (input.startDate !== undefined && input.startDate !== null) {
            updateData.startDate = input.startDate;
        }

        if (input.endDate !== undefined && input.endDate !== null) {
            updateData.endDate = input.endDate;
        }

        if (input.status !== undefined && input.status !== null) {
            updateData.status = input.status;
        }

        if (input.completionPercentage !== undefined && input.completionPercentage !== null) {
            updateData.completionPercentage = input.completionPercentage;
        }

        if (input.planJson !== undefined && input.planJson !== null) {
            updateData.planJson = input.planJson;
        }

        if (input.notes !== undefined && input.notes !== null) {
            updateData.notes = input.notes;
        }

        if (input.assistantIds !== undefined && input.assistantIds !== null) {
            updateData.assistantIds = input.assistantIds;
        }

        if (input.goalIds !== undefined && input.goalIds !== null) {
            updateData.goalIds = input.goalIds;
        }

        const updatedTrainingPlan = await trainingPlanRepository.updateTrainingPlan(
            coachId,
            id,
            updateData
        );

        if (!updatedTrainingPlan) {
            logger.error({ coachId, id, updateData }, "Failed to update training plan");
            throw new Error(`Failed to update training plan with ID ${id}`);
        }

        logger.info({ coachId, id, updatedPlan: updatedTrainingPlan }, "Training plan updated successfully");
        return updatedTrainingPlan;
    } catch (error) {
        logger.error({ error, coachId, id, input }, "Failed to update training plan");
        throw error;
    }
};