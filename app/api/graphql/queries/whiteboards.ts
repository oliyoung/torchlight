import { whiteboardRepository } from "@/lib/repository";
import type { Whiteboard, Play, Phase, DifficultyLevel } from "@/lib/types";
import type { GraphQLContext } from "../route";

// Whiteboard queries
export const whiteboards = async (
  _parent: unknown,
  args: {
    sport?: string;
    difficulty?: DifficultyLevel;
    isPublic?: boolean;
  },
  context: GraphQLContext
): Promise<Whiteboard[]> => {
  return whiteboardRepository.getWhiteboards(context?.user?.id ?? null, {
    sport: args.sport,
    difficulty: args.difficulty,
    isPublic: args.isPublic,
  });
};

export const whiteboard = async (
  _parent: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<Whiteboard | null> => {
  return context.loaders.whiteboardLoader.load(args.id);
};

export const play = async (
  _parent: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<Play | null> => {
  return context.loaders.playLoader.load(args.id);
};

export const phase = async (
  _parent: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<Phase | null> => {
  return context.loaders.phaseLoader.load(args.id);
};