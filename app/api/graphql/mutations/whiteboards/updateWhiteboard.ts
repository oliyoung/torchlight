import { whiteboardRepository } from "@/lib/repository";
import type { Whiteboard, UpdateWhiteboardInput } from "@/lib/types";
import type { GraphQLContext } from "@/app/api/graphql/route";

export const updateWhiteboard = async (
  _: unknown,
  args: { id: string; input: UpdateWhiteboardInput },
  context: GraphQLContext
): Promise<Whiteboard> => {
  const userId = context?.user?.id;

  if (!userId) {
    throw new Error("Authentication required");
  }

  const whiteboard = await whiteboardRepository.updateWhiteboard(
    userId,
    args.id,
    args.input
  );

  if (!whiteboard) {
    throw new Error("Failed to update whiteboard or whiteboard not found");
  }

  return whiteboard;
};