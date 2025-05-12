import { getClients, getClientById, getGoalsByClientId, getGoalById, getSessionLogsByClientId, getSessionLogById } from "@/lib/repository";
import type { Client, Goal, SessionLog } from "@/lib/types";
import type { GraphQLContext } from "../route";

export default {
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
