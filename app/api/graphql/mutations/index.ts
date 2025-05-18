import type { Client, TrainingPlan } from "@/lib/types";
import type { GraphQLContext } from "../route";
import { createClient, createTrainingPlan } from "@/lib/repository";
import aiMutations from "./ai";
import trainingPlanMutations from "./trainingPlan";

export default {
  ...aiMutations,
  ...trainingPlanMutations,
  createClient: async (_parent: unknown, args: { input: Partial<Client> }, context: GraphQLContext): Promise<Client> =>
    createClient(context?.user?.id ?? null, args.input),
  createTrainingPlan: async (_parent: unknown, args: { input: Partial<TrainingPlan> }, context: GraphQLContext): Promise<TrainingPlan> =>
    createTrainingPlan(context?.user?.id ?? null, args.input),
}