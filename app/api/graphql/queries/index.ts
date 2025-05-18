import { getClients, getClientById, getGoalsByClientId, getGoalById, getSessionLogsByClientId, getSessionLogById, getAssistants, getTrainingPlans } from "@/lib/repository";
import type { Assistant, AssistantsInput, Client, Goal, SessionLog, TrainingPlan } from "@/lib/types";
import type { GraphQLContext } from "../route";

export default {
  trainingPlans: async (_parent: unknown, args: { clientId: string }, context: GraphQLContext): Promise<TrainingPlan[]> =>
    getTrainingPlans(context?.user?.id ?? null, args.clientId),
  assistants: async (_parent: unknown, args: { input: AssistantsInput }, context: GraphQLContext): Promise<Assistant[]> =>
    getAssistants(args.input),
  clients: async (_parent: unknown, _args: unknown, context: GraphQLContext): Promise<Client[]> =>
    getClients(context?.user?.id ?? null),
  client: async (_parent: unknown, args: { id: string }, context: GraphQLContext): Promise<Client | null> =>
    getClientById(context?.user?.id ?? null, args.id),
  goals: async (_parent: unknown, args: { clientId: string }, context: GraphQLContext): Promise<Goal[]> =>
    getGoalsByClientId(context?.user?.id ?? null, args.clientId),
  goal: async (_parent: unknown, args: { id: string }, context: GraphQLContext): Promise<Goal | null> =>
    getGoalById(context?.user?.id ?? null, args.id),
  sessionLogs: async (_parent: unknown, args: { clientId: string }, context: GraphQLContext): Promise<SessionLog[]> =>
    getSessionLogsByClientId(context?.user?.id ?? null, args.clientId),
  sessionLog: async (_parent: unknown, args: { id: string }, context: GraphQLContext): Promise<SessionLog | null> =>
    getSessionLogById(context?.user?.id ?? null, args.id),
}
