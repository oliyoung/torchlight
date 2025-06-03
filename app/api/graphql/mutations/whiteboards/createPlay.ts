import { playRepository } from "@/lib/repository";
import type { Play, CreatePlayInput } from "@/lib/types";
import type { GraphQLContext } from "@/app/api/graphql/route";

export const createPlay = async (
  _: unknown,
  args: { input: CreatePlayInput },
  context: GraphQLContext
): Promise<Play> => {
  const userId = context?.user?.id;

  if (!userId) {
    throw new Error("Authentication required");
  }

  const play = await playRepository.createPlay(userId, args.input);

  if (!play) {
    throw new Error("Failed to create play");
  }

  return play;
};