import DataLoader from 'dataloader';
import type { Goal } from '@/lib/types';
import { logger } from '@/lib/logger';
import { goalRepository } from '@/lib/repository';

/**
 * Creates a DataLoader for batching goal requests
 */
export const createGoalLoader = (coachId: string | null) =>
  new DataLoader<string, Goal | null>(async (goalIds) => {
    logger.info({ coachId, count: goalIds.length }, 'Batch loading goals');

    // Get all the goals in a single query using the repository
    const goals = await goalRepository.getGoalsByIds(coachId, goalIds as string[]);

    // Create a map for O(1) lookups
    const goalMap = new Map(
      goals.map(goal => [String(goal.id), goal])
    );

    // Return goals in the same order as requested IDs
    return goalIds.map(id => goalMap.get(String(id)) || null);
  }, {
    // Add cache key function to ensure consistent key handling
    cacheKeyFn: key => String(key)
  });