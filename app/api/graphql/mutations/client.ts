import type { Client } from "@/lib/types";
import type { GraphQLContext } from "../route";
import { clientRepository } from "@/lib/repository";

export const createClient = async (
    _: unknown,
    args: { input: Partial<Client> },
    context: GraphQLContext
): Promise<Client> => {
    const client = await clientRepository.createClient(context?.user?.id ?? null, args.input);
    if (!client) {
        throw new Error("Failed to create client");
    }
    return client;
};