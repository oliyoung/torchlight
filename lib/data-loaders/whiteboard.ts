import DataLoader from "dataloader";
import {
  whiteboardRepository,
  playRepository,
  phaseRepository,
  playerPositionRepository,
  movementRepository,
  annotationRepository
} from "@/lib/repository";
import type { Whiteboard, Play, Phase, PlayerPosition, Movement, Annotation } from "@/lib/types";

// Whiteboard data loaders
export const whiteboardByIdLoader = new DataLoader<string, Whiteboard | null>(
  async (whiteboardIds: readonly string[]): Promise<(Whiteboard | null)[]> => {
    const whiteboards = await whiteboardRepository.getByIds(null, [...whiteboardIds]);

    // Create a map for O(1) lookups
    const whiteboardMap = new Map<string, Whiteboard>(whiteboards.map((w: Whiteboard) => [w.id, w]));

    // Return results in the same order as requested IDs
    return whiteboardIds.map(id => whiteboardMap.get(id) || null);
  }
);

export const playsByWhiteboardIdLoader = new DataLoader<string, Play[]>(
  async (whiteboardIds: readonly string[]): Promise<Play[][]> => {
    const playsByWhiteboardId = new Map<string, Play[]>();

    // Fetch plays for each whiteboard
    for (const whiteboardId of whiteboardIds) {
      const plays = await playRepository.getPlaysForWhiteboard(whiteboardId);
      playsByWhiteboardId.set(whiteboardId, plays);
    }

    // Return results in the same order as requested IDs
    return whiteboardIds.map(id => playsByWhiteboardId.get(id) || []);
  }
);

export const phasesByPlayIdLoader = new DataLoader<string, Phase[]>(
  async (playIds: readonly string[]): Promise<Phase[][]> => {
    const phasesByPlayId = new Map<string, Phase[]>();

    // Fetch phases for each play
    for (const playId of playIds) {
      const phases = await phaseRepository.getPhasesForPlay(playId);
      phasesByPlayId.set(playId, phases);
    }

    // Return results in the same order as requested IDs
    return playIds.map(id => phasesByPlayId.get(id) || []);
  }
);

export const playerPositionsByPlayIdLoader = new DataLoader<string, PlayerPosition[]>(
  async (playIds: readonly string[]): Promise<PlayerPosition[][]> => {
    const positionsByPlayId = new Map<string, PlayerPosition[]>();

    // Fetch positions for each play
    for (const playId of playIds) {
      const positions = await playerPositionRepository.getPositionsForPlay(playId);
      positionsByPlayId.set(playId, positions);
    }

    // Return results in the same order as requested IDs
    return playIds.map(id => positionsByPlayId.get(id) || []);
  }
);

export const movementsByPhaseIdLoader = new DataLoader<string, Movement[]>(
  async (phaseIds: readonly string[]): Promise<Movement[][]> => {
    const movementsByPhaseId = new Map<string, Movement[]>();

    // Fetch movements for each phase
    for (const phaseId of phaseIds) {
      const movements = await movementRepository.getMovementsForPhase(phaseId);
      movementsByPhaseId.set(phaseId, movements);
    }

    // Return results in the same order as requested IDs
    return phaseIds.map(id => movementsByPhaseId.get(id) || []);
  }
);

export const annotationsByPlayIdLoader = new DataLoader<string, Annotation[]>(
  async (playIds: readonly string[]): Promise<Annotation[][]> => {
    const annotationsByPlayId = new Map<string, Annotation[]>();

    // Fetch annotations for each play
    for (const playId of playIds) {
      const annotations = await annotationRepository.getAnnotationsForPlay(playId);
      annotationsByPlayId.set(playId, annotations);
    }

    // Return results in the same order as requested IDs
    return playIds.map(id => annotationsByPlayId.get(id) || []);
  }
);

export const annotationsByPhaseIdLoader = new DataLoader<string, Annotation[]>(
  async (phaseIds: readonly string[]): Promise<Annotation[][]> => {
    const annotationsByPhaseId = new Map<string, Annotation[]>();

    // Fetch annotations for each phase
    for (const phaseId of phaseIds) {
      const annotations = await annotationRepository.getAnnotationsForPhase(phaseId);
      annotationsByPhaseId.set(phaseId, annotations);
    }

    // Return results in the same order as requested IDs
    return phaseIds.map(id => annotationsByPhaseId.get(id) || []);
  }
);