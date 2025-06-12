import { athleteRepository } from "@/lib/repository";
import type { Athlete } from "@/lib/types";
import type { GraphQLContext } from "@/app/api/graphql/route";
import { logger } from "@/lib/logger";

export const createAthlete = async (
    _: unknown,
    args: { input: Partial<Athlete> },
    context: GraphQLContext
): Promise<Athlete> => {
    const athlete = await athleteRepository.createAthlete(context?.user?.id ?? null, args.input);
    if (!athlete) {
        logger.error("Failed to create athlete", {
            athlete,
            userId: context?.user?.id,
            input: args.input
        });
        throw new Error("Failed to create athlete");
    }
    return athlete;
};