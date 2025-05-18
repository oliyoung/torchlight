import { withFilter } from "graphql-subscriptions";
import { pubsub } from "@/app/api/graphql/route"; // Assuming pubsub is exported from your route file
import type { TrainingPlan, GraphQLContext } from "@/lib/types";

const TRAINING_PLAN_GENERATED = 'TRAINING_PLAN_GENERATED';

export const trainingPlanGenerated = {
    subscribe: withFilter(
        () => pubsub.asyncIterator(TRAINING_PLAN_GENERATED),
        (payload: { trainingPlanGenerated: TrainingPlan; clientId: string }, variables: { clientId: string }) => {
            // Only send updates to subscribers interested in this client's training plans
            return payload.clientId === variables.clientId;
        }
    ),
    resolve: (payload: { trainingPlanGenerated: TrainingPlan }) => {
        // The payload already contains the updated training plan
        return payload.trainingPlanGenerated;
    },
};