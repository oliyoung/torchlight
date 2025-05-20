import DataLoader from 'dataloader';
import type { Client } from '../types';
import { logger } from '../logger';
import { clientRepository } from '@/lib/repository/entities';

/**
 * Creates a DataLoader for batching client requests
 * This avoids N+1 query issues in GraphQL resolvers
 */
export function createClientLoader(userId: string | null) {
  return new DataLoader<string, Client | null>(async (clientIds) => {
    // Get all the clients in a single query
    const clients = await clientRepository.getClientsByIds(userId, clientIds as string[]);

    // Create a map for O(1) lookups instead of using array.find (O(n))
    const clientMap = new Map(
      clients.map(client => [String(client.id), client])
    );

    // Return clients in the same order as requested IDs
    return clientIds.map(id => clientMap.get(String(id)) || null);
  }, {
    // Add cache key function to ensure consistent key handling
    cacheKeyFn: key => String(key)
  });
}