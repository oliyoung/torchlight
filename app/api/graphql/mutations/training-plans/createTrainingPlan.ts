import { generateTrainingPlanContent } from "@/ai/features/generateTrainingPlanContent";
import type { GraphQLContext } from "@/app/api/graphql/route";
import { logger } from "@/lib/logger";
import { athleteRepository, goalRepository, trainingPlanRepository } from "@/lib/repository";
import type { Athlete, CreateTrainingPlanInput, Goal, TrainingPlan } from "@/lib/types";

export const createTrainingPlan = async (
    _: unknown,
    { input }: { input: CreateTrainingPlanInput },
    context: GraphQLContext
): Promise<TrainingPlan> => {
    logger.info({ input }, "Creating training plan with input");

    const initialTrainingPlanData: CreateTrainingPlanInput & { overview: string; planJson: JSON } = {
        ...input,
        overview: "",
        planJson: {} as unknown as JSON,
    };

    const newTrainingPlan = await trainingPlanRepository.createTrainingPlan(context?.user?.id ?? null, initialTrainingPlanData);

    if (!newTrainingPlan || !newTrainingPlan.id) {
        throw new Error("Failed to create initial training plan.");
    }

    const athlete = await athleteRepository.getAthleteById(context?.user?.id ?? null, input.athleteId);
    const goals = await goalRepository.getGoalsByIds(context?.user?.id ?? null, input.goalIds ?? []);

    if (!athlete || goals.length !== (input.goalIds ?? []).length) {
        logger.error({ input, newTrainingPlan }, 'Failed to fetch athlete');
    }

    generateTrainingPlanContent(
        newTrainingPlan.id,
        context?.user?.id ?? null,
        input.assistantIds ?? [],
        athlete as Athlete,
        goals as Goal[],
        context.pubsub
    ).catch(console.error);

    return newTrainingPlan;
};