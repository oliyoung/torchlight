import DataLoader from 'dataloader';
import type { SessionLog } from '@/lib/types';
import { logger } from '@/lib/logger';
import { sessionLogRepository } from '@/lib/repository/entities';

/**
 * Creates a DataLoader for batching session log requests
 */
export function createSessionLogLoader(userId: string | null) {
  return new DataLoader<string, SessionLog | null>(async (sessionLogIds) => {
    logger.info({ userId, count: sessionLogIds.length }, 'Batch loading session logs');

    // Get all the session logs in a single query using the repository
    const sessionLogs = await sessionLogRepository.getSessionLogsByIds(userId, sessionLogIds as string[]);

    // Create a map for O(1) lookups
    const sessionLogMap = new Map(
      sessionLogs.map(log => [String(log.id), log])
    );

    // Return session logs in the same order as requested IDs
    return sessionLogIds.map(id => sessionLogMap.get(String(id)) || null);
  }, {
    // Add cache key function to ensure consistent key handling
    cacheKeyFn: key => String(key)
  });
}