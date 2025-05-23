import type { GraphQLContext } from "@/app/api/graphql/route";
import { logger } from "@/lib/logger";
import { PubSubEvents } from '@/lib/types';
import type { TrainingPlan } from "@/lib/types";

export const trainingPlanSubscriptions = {
    trainingPlanGenerated: {
        subscribe: (_: unknown, { athleteId }: { athleteId: string }, context: GraphQLContext,) => {
            logger.info({ athleteId }, 'Subscribing to trainingPlanGenerated for athlete');
            return context.pubsub.subscribe(PubSubEvents.SessionLogGenerationSuccess, () => { });
        },
        resolve: (payload: { trainingPlanGenerated: TrainingPlan }) => {
            logger.info({ payload }, "Resolving trainingPlanGenerated subscription payload");
            return payload.trainingPlanGenerated;
        },
    },
};