import { PubSub } from "graphql-subscriptions";
import { TRAININING_PLAN_GENERATED } from "@/lib/ai/generateTrainingPlanContent"; // Note the intentional misspelling for now
import type { GraphQLContext } from "@/app/api/graphql/route";
import type { TrainingPlan } from "@/lib/types";

// In-memory PubSub instance - ensure this is the same instance used in mutations
// In a real application, this would be a shared instance like from a Redis connection
const pubsub = new PubSub(); // TODO: Use the PubSub instance from the context

export const trainingPlanSubscriptions = {
    trainingPlanGenerated: {
        subscribe: (
            _: unknown,
            { athleteId }: { athleteId: string },
            context: GraphQLContext,
        ) => {
            // In a real app, you'd filter by user/athlete here for security and relevance
            // For now, subscribing to all events for demonstration
            console.log(`Subscribing to trainingPlanGenerated for athlete ${athleteId}`);
            // Use the pubsub instance from the context
            return context.pubsub.asyncIterator([TRAININING_PLAN_GENERATED]);
        },
        resolve: (payload: { trainingPlanGenerated: TrainingPlan }) => {
            console.log("Resolving trainingPlanGenerated subscription payload:", payload);
            return payload.trainingPlanGenerated;
        },
    },
};