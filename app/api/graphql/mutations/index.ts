import type { Client, TrainingPlan } from "@/lib/types";
import type { GraphQLContext } from "../route";
import { createClient, createTrainingPlan } from "@/lib/repository";

export default {
  createClient: async (_parent: unknown, args: { input: Partial<Client> }, context: GraphQLContext): Promise<Client> =>
    createClient(context?.user?.id ?? null, args.input),
  createTrainingPlan: async (_parent: unknown, args: { input: Partial<TrainingPlan> }, context: GraphQLContext): Promise<TrainingPlan> =>
    createTrainingPlan(context?.user?.id ?? null, args.input),
}