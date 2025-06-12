// @ts-nocheck
import type { GraphQLContext } from "@/app/api/graphql/route";
import { PubSubEvents } from '@/app/api/graphql/subscriptions/types';
import { logger } from "@/lib/logger";
import type { TrainingPlan } from "@/lib/types";

export const trainingPlanSubscriptions = {
    trainingPlanGenerated: {
        subscribe: (_: unknown, { athleteId }: { athleteId: string }, context: GraphQLContext,) => {
            logger.info({ athleteId }, 'Subscribing to trainingPlanGenerated for athlete');
            return context.pubsub.subscribe(PubSubEvents.TrainingPlanGenerated, (payload: { trainingPlanGenerated: TrainingPlan }) => {
                logger.debug({ athleteId, payloadAthleteId: payload.trainingPlanGenerated.athleteId }, 'Received trainingPlanGenerated event');
                return payload.trainingPlanGenerated.athleteId === athleteId ? payload : null;
            });
        },
        resolve: (payload: { trainingPlanGenerated: TrainingPlan }) => {
            logger.info({ payload }, "Resolving trainingPlanGenerated subscription payload");
            return payload.trainingPlanGenerated;
        },
    },
};