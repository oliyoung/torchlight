import { whiteboardRepository } from "@/lib/repository";
import type { GraphQLContext } from "@/app/api/graphql/route";

export const deleteWhiteboard = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<boolean> => {
  const userId = context?.user?.id;

  if (!userId) {
    throw new Error("Authentication required");
  }

  const success = await whiteboardRepository.delete(userId, args.id);

  if (!success) {
    throw new Error("Failed to delete whiteboard or whiteboard not found");
  }

  return success;
};