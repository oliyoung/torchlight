import type { Client } from "@/lib/types";
import type { GraphQLContext } from "../route";
import { createClient } from "@/lib/repository";

export default {
  createClient: async (_parent: unknown, args: { input: Partial<Client> }, context: GraphQLContext): Promise<Client> =>
    createClient(context?.user?.id ?? null, args.input),
}