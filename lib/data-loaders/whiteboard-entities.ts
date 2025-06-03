import { logger } from '@/lib/logger';
import {
  whiteboardRepository,
  playRepository,
  phaseRepository,
  playerPositionRepository,
  movementRepository,
  annotationRepository
} from '@/lib/repository';
import type { Whiteboard, Play, Phase, PlayerPosition, Movement, Annotation } from '@/lib/types';
import DataLoader from 'dataloader';

/**
 * Create a DataLoader for batching whiteboard requests
 */
export function createWhiteboardLoader(userId: string | null) {
  return new DataLoader<string, Whiteboard | null>(async (whiteboardIds) => {
    try {
      // Get all the whiteboards in a single query
      const whiteboards = await whiteboardRepository.getByIds(userId, whiteboardIds as string[]);

      // Create a map for easy lookup
      const whiteboardMap = new Map(
        whiteboards.map(whiteboard => [String(whiteboard.id), whiteboard])
      );

      // Return whiteboards in the same order as requested IDs
      return whiteboardIds.map(id => whiteboardMap.get(String(id)) || null);
    } catch (error) {
      logger.error({ error }, 'Error in whiteboard data loader');
      return whiteboardIds.map(() => null);
    }
  });
}

/**
 * Create a DataLoader for batching play requests
 */
export function createPlayLoader() {
  return new DataLoader<string, Play | null>(async (playIds) => {
    try {
      // Get all the plays in a single query
      const plays = await playRepository.getPlaysByIds(playIds as string[]);

      // Create a map for easy lookup
      const playMap = new Map(
        plays.map(play => [String(play.id), play])
      );

      // Return plays in the same order as requested IDs
      return playIds.map(id => playMap.get(String(id)) || null);
    } catch (error) {
      logger.error({ error }, 'Error in play data loader');
      return playIds.map(() => null);
    }
  });
}

/**
 * Create a DataLoader for batching phase requests
 */
export function createPhaseLoader() {
  return new DataLoader<string, Phase | null>(async (phaseIds) => {
    try {
      // Get all the phases in a single query
      const phases = await phaseRepository.getByIds(null, phaseIds as string[]);

      // Create a map for easy lookup
      const phaseMap = new Map(
        phases.map(phase => [String(phase.id), phase])
      );

      // Return phases in the same order as requested IDs
      return phaseIds.map(id => phaseMap.get(String(id)) || null);
    } catch (error) {
      logger.error({ error }, 'Error in phase data loader');
      return phaseIds.map(() => null);
    }
  });
}

/**
 * Create a DataLoader for batching player position requests
 */
export function createPlayerPositionLoader() {
  return new DataLoader<string, PlayerPosition | null>(async (positionIds) => {
    try {
      // Get all the positions in a single query
      const positions = await playerPositionRepository.getByIds(null, positionIds as string[]);

      // Create a map for easy lookup
      const positionMap = new Map(
        positions.map(position => [String(position.id), position])
      );

      // Return positions in the same order as requested IDs
      return positionIds.map(id => positionMap.get(String(id)) || null);
    } catch (error) {
      logger.error({ error }, 'Error in player position data loader');
      return positionIds.map(() => null);
    }
  });
}

/**
 * Create a DataLoader for batching movement requests
 */
export function createMovementLoader() {
  return new DataLoader<string, Movement | null>(async (movementIds) => {
    try {
      // Get all the movements in a single query
      const movements = await movementRepository.getByIds(null, movementIds as string[]);

      // Create a map for easy lookup
      const movementMap = new Map(
        movements.map(movement => [String(movement.id), movement])
      );

      // Return movements in the same order as requested IDs
      return movementIds.map(id => movementMap.get(String(id)) || null);
    } catch (error) {
      logger.error({ error }, 'Error in movement data loader');
      return movementIds.map(() => null);
    }
  });
}

/**
 * Create a DataLoader for batching annotation requests
 */
export function createAnnotationLoader() {
  return new DataLoader<string, Annotation | null>(async (annotationIds) => {
    try {
      // Get all the annotations in a single query
      const annotations = await annotationRepository.getByIds(null, annotationIds as string[]);

      // Create a map for easy lookup
      const annotationMap = new Map(
        annotations.map(annotation => [String(annotation.id), annotation])
      );

      // Return annotations in the same order as requested IDs
      return annotationIds.map(id => annotationMap.get(String(id)) || null);
    } catch (error) {
      logger.error({ error }, 'Error in annotation data loader');
      return annotationIds.map(() => null);
    }
  });
}