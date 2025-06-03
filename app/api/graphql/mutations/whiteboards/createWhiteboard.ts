import { whiteboardRepository } from "@/lib/repository";
import type { Whiteboard, CreateWhiteboardInput } from "@/lib/types";
import type { GraphQLContext } from "@/app/api/graphql/route";

export const createWhiteboard = async (
  _: unknown,
  args: { input: CreateWhiteboardInput },
  context: GraphQLContext
): Promise<Whiteboard> => {
  const userId = context?.user?.id;

  if (!userId) {
    throw new Error("Authentication required");
  }

  const whiteboard = await whiteboardRepository.createWhiteboard(userId, args.input);

  if (!whiteboard) {
    throw new Error("Failed to create whiteboard");
  }

  return whiteboard;
};