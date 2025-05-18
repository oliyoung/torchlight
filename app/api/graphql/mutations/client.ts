import type { Client } from "@/lib/types";
import type { GraphQLContext } from "../route";
import { createClient as createClientInRepo } from "@/lib/repository";

export const createClient = async (
    _: unknown,
    args: { input: Partial<Client> },
    context: GraphQLContext
): Promise<Client> => {
    return createClientInRepo(context?.user?.id ?? null, args.input);
};