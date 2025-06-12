import { generateTrainingPlanContent } from "@/ai/features/generateTrainingPlan";
import type { GraphQLContext } from "@/app/api/graphql/route";
import { logger } from "@/lib/logger";
import { athleteRepository, goalRepository, trainingPlanRepository } from "@/lib/repository";
import type { Athlete, CreateTrainingPlanInput, Goal, TrainingPlan } from "@/lib/types";

export const createTrainingPlan = async (
    _parent: any,
    { input }: { input: CreateTrainingPlanInput },
    context: { coachId: string | null; pubsub: any }
): Promise<TrainingPlan> => {
    const { coachId } = context;

    const initialTrainingPlanData: CreateTrainingPlanInput & { overview: string; planJson: JSON } = {
        ...input,
        overview: "AI-generated training plan",
        planJson: {} as JSON
    };

    if (!coachId) {
        throw new Error("Authentication required");
    }

    try {
        const trainingPlan = await trainingPlanRepository.createTrainingPlan(coachId, initialTrainingPlanData);

        if (!trainingPlan) {
            logger.error({ coachId, input }, "Failed to create training plan - null returned from repository");
            throw new Error("Failed to create training plan");
        }

        logger.info({ coachId, trainingPlanId: trainingPlan.id }, "Training plan created successfully");

        const athlete = await athleteRepository.getAthleteById(coachId, input.athleteId);
        const goals = await goalRepository.getGoalsByIds(coachId, input.goalIds ?? []);

        if (!athlete || goals.length !== (input.goalIds ?? []).length) {
            logger.error({ input, trainingPlan }, 'Failed to fetch athlete');
        }

        generateTrainingPlanContent(
            trainingPlan.id,
            coachId,
            input.assistantIds ?? [],
            athlete as Athlete,
            goals as Goal[],
            context.pubsub
        ).catch(console.error);

        return trainingPlan;
    } catch (error) {
        logger.error({ error, coachId, input }, "Failed to create training plan");
        throw error;
    }
};