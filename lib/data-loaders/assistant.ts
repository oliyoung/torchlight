import DataLoader from 'dataloader';
import type { Assistant } from '@/lib/types';
import { logger } from '@/lib/logger';
import { assistantRepository } from '@/lib/repository';

/**
 * Creates a DataLoader for batching assistant requests
 */
export function createAssistantLoader() {
  return new DataLoader<string, Assistant | null>(async (assistantIds) => {
    logger.info({ count: assistantIds.length }, 'Batch loading assistants');

    // Get all the assistants in a single query using the repository
    const assistants = await assistantRepository.getAssistantsByIds(assistantIds as string[]);

    // Create a map for O(1) lookups
    const assistantMap = new Map(
      assistants.map(assistant => [String(assistant.id), assistant])
    );

    // Return assistants in the same order as requested IDs
    return assistantIds.map(id => assistantMap.get(String(id)) || null);
  }, {
    // Add cache key function to ensure consistent key handling
    cacheKeyFn: key => String(key)
  });
}