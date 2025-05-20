import {
  clientRepository,
  goalRepository,
  sessionLogRepository,
  assistantRepository,
  trainingPlanRepository
} from "@/lib/repository";
import type { Assistant, AssistantsInput, Client, Goal, SessionLog, TrainingPlan } from "@/lib/types";
import type { GraphQLContext } from "../route";

export default {
  // Single entity queries - use DataLoader pattern
  trainingPlan: async (_parent: unknown, args: { id: string }, context: GraphQLContext): Promise<TrainingPlan | null> =>
    context.loaders.trainingPlan.load(args.id),

  client: async (_parent: unknown, args: { id: string }, context: GraphQLContext): Promise<Client | null> =>
    context.loaders.client.load(args.id),

  goal: async (_parent: unknown, args: { id: string }, context: GraphQLContext): Promise<Goal | null> =>
    context.loaders.goal.load(args.id),

  sessionLog: async (_parent: unknown, args: { id: string }, context: GraphQLContext): Promise<SessionLog | null> =>
    context.loaders.sessionLog.load(args.id),

  // Collection queries - use repository instances
  trainingPlans: async (_parent: unknown, args: { clientId: string }, context: GraphQLContext): Promise<TrainingPlan[]> =>
    trainingPlanRepository.getTrainingPlans(context?.user?.id ?? null, args.clientId),

  assistants: async (_parent: unknown, args: { input: AssistantsInput }, context: GraphQLContext): Promise<Assistant[]> =>
    assistantRepository.getAssistants(args.input),

  clients: async (_parent: unknown, _args: unknown, context: GraphQLContext): Promise<Client[]> =>
    clientRepository.getClients(context?.user?.id ?? null),

  goals: async (_parent: unknown, args: { clientId: string }, context: GraphQLContext): Promise<Goal[]> =>
    goalRepository.getGoalsByClientId(context?.user?.id ?? null, args.clientId),

  sessionLogs: async (_parent: unknown, args: { clientId: string }, context: GraphQLContext): Promise<SessionLog[]> =>
    sessionLogRepository.getSessionLogsByClientId(context?.user?.id ?? null, args.clientId),
}
