import { athleteRepository } from "@/lib/repository";
import type { Athlete } from "@/lib/types";
import type { GraphQLContext } from "@/app/api/graphql/route";

export const createAthlete = async (
    _: unknown,
    args: { input: Partial<Athlete> },
    context: GraphQLContext
): Promise<Athlete> => {
    const athlete = await athleteRepository.createAthlete(context?.user?.id ?? null, args.input);
    if (!athlete) {
        throw new Error("Failed to create athlete");
    }
    return athlete;
};