import { logger } from '@/lib/logger';
import { athleteRepository } from '@/lib/repository';
import type { Athlete } from '@/lib/types';
import DataLoader from 'dataloader';

/**
 * Create a DataLoader for batching athlete requests
 */
export function createAthleteLoader(userId: string | null) {
  return new DataLoader<string, Athlete | null>(async (athleteIds) => {
    try {
      // Get all the athletes in a single query
      const athletes = await athleteRepository.getAthletesByIds(userId, athleteIds as string[]);

      // Create a map for easy lookup
      const athleteMap = new Map(
        athletes.map(athlete => [String(athlete.id), athlete])
      );

      // Return athletes in the same order as requested IDs
      return athleteIds.map(id => athleteMap.get(String(id)) || null);
    } catch (error) {
      logger.error({ error }, 'Error in athlete data loader');
      return athleteIds.map(() => null);
    }
  });
}