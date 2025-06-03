import { playerPositionRepository } from "@/lib/repository";
import type { Play, PlayerPositionInput } from "@/lib/types";
import type { GraphQLContext } from "@/app/api/graphql/route";

export const updatePlayerPositions = async (
  _: unknown,
  args: { playId: string; positions: PlayerPositionInput[] },
  context: GraphQLContext
): Promise<Play> => {
  const userId = context?.user?.id;

  if (!userId) {
    throw new Error("Authentication required");
  }

  // Update the player positions
  const updatedPositions = await playerPositionRepository.updatePlayerPositions(
    userId,
    args.playId,
    args.positions
  );

  if (!updatedPositions || updatedPositions.length === 0) {
    throw new Error("Failed to update player positions");
  }

  // Load and return the updated play via data loader
  const play = await context.loaders.playLoader.load(args.playId);

  if (!play) {
    throw new Error("Play not found after updating positions");
  }

  return play;
};