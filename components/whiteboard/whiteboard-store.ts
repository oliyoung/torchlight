import { create } from 'zustand';
import type { Play, Phase, PlayerPosition } from '@/lib/types';

interface WhiteboardState {
  // Current play and phase
  currentPlay: Play | null;
  currentPhase: Phase | null;
  currentPhaseIndex: number;

  // Animation state
  isAnimating: boolean;
  animationSpeed: number;
  animationProgress: number; // 0-1 progress through current phase
  animationStartTime: number | null;

  // Interpolated positions for smooth animation
  interpolatedPositions: PlayerPosition[];

  // Selection and interaction
  selectedPlayerId: string | null;

  // Actions
  setCurrentPlay: (play: Play | null) => void;
  setCurrentPhase: (phase: Phase | null) => void;
  setCurrentPhaseIndex: (index: number) => void;
  toggleAnimation: () => void;
  setAnimationSpeed: (speed: number) => void;
  setSelectedPlayer: (playerId: string | null) => void;
  updatePlayerPosition: (playerId: string, x: number, y: number) => void;
  updateAnimation: () => void; // Called by animation frame

  // Reset state
  reset: () => void;
}

export const useWhiteboardStore = create<WhiteboardState>((set, get) => ({
  // Initial state
  currentPlay: null,
  currentPhase: null,
  currentPhaseIndex: 0,
  isAnimating: false,
  animationSpeed: 1.0,
  animationProgress: 0,
  animationStartTime: null,
  interpolatedPositions: [],
  selectedPlayerId: null,

  // Actions
  setCurrentPlay: (play) => {
    set({
      currentPlay: play,
      currentPhase: play?.phases?.[0] || null,
      currentPhaseIndex: 0,
      isAnimating: false,
      animationProgress: 0,
      animationStartTime: null,
      interpolatedPositions: play?.startingPositions || [],
    });
  },

  setCurrentPhase: (phase) => {
    const state = get();
    if (!state.currentPlay || !phase) return;

    const phaseIndex = state.currentPlay.phases?.findIndex(p => p.id === phase.id) ?? 0;
    set({
      currentPhase: phase,
      currentPhaseIndex: phaseIndex,
      isAnimating: false,
      animationProgress: 0,
      animationStartTime: null,
      interpolatedPositions: phase.playerPositions || state.currentPlay.startingPositions || [],
    });
  },

  setCurrentPhaseIndex: (index) => {
    const state = get();
    if (!state.currentPlay?.phases || index < 0 || index >= state.currentPlay.phases.length) return;

    const phase = state.currentPlay.phases[index];
    set({
      currentPhase: phase,
      currentPhaseIndex: index,
      isAnimating: false,
      animationProgress: 0,
      animationStartTime: null,
      interpolatedPositions: phase.playerPositions || state.currentPlay.startingPositions || [],
    });
  },

  toggleAnimation: () => {
    const state = get();
    const newAnimating = !state.isAnimating;

    set({
      isAnimating: newAnimating,
      animationStartTime: newAnimating ? Date.now() : null,
      animationProgress: newAnimating ? state.animationProgress : 0,
    });
  },

  setAnimationSpeed: (speed) => {
    set({ animationSpeed: Math.max(0.1, Math.min(3.0, speed)) });
  },

  setSelectedPlayer: (playerId) => {
    set({ selectedPlayerId: playerId });
  },

  updatePlayerPosition: (playerId, x, y) => {
    const state = get();
    if (!state.currentPlay) return;

    // Update interpolated positions for immediate feedback
    const updatedPositions = state.interpolatedPositions.map(pos =>
      pos.playerId === playerId ? { ...pos, x, y } : pos
    );

    set({ interpolatedPositions: updatedPositions });

    console.log(`Updated player ${playerId} position:`, { x, y });
  },

  updateAnimation: () => {
    const state = get();
    if (!state.isAnimating || !state.currentPlay || !state.animationStartTime) return;

    const now = Date.now();
    const elapsed = (now - state.animationStartTime) * state.animationSpeed;
    const currentPhase = state.currentPhase;

    if (!currentPhase) return;

    const phaseDuration = (currentPhase.duration || 1) * 1000; // Convert to milliseconds
    const progress = Math.min(elapsed / phaseDuration, 1);

    // Get start and end positions for interpolation
    const startPositions = state.currentPhaseIndex === 0
      ? state.currentPlay.startingPositions || []
      : state.currentPlay.phases?.[state.currentPhaseIndex - 1]?.playerPositions || [];

    const endPositions = currentPhase.playerPositions || [];

    // Interpolate positions
    const interpolatedPositions = endPositions.map(endPos => {
      const startPos = startPositions.find(p => p.playerId === endPos.playerId);
      if (!startPos) return endPos;

      // Smooth easing function (ease-in-out)
      const easeProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      return {
        ...endPos,
        x: startPos.x + (endPos.x - startPos.x) * easeProgress,
        y: startPos.y + (endPos.y - startPos.y) * easeProgress,
      };
    });

    set({
      animationProgress: progress,
      interpolatedPositions
    });

    // Check if phase is complete
    if (progress >= 1) {
      const nextPhaseIndex = state.currentPhaseIndex + 1;
      const hasNextPhase = state.currentPlay.phases && nextPhaseIndex < state.currentPlay.phases.length;

      if (hasNextPhase) {
        // Move to next phase
        const nextPhase = state.currentPlay.phases![nextPhaseIndex];
        set({
          currentPhase: nextPhase,
          currentPhaseIndex: nextPhaseIndex,
          animationProgress: 0,
          animationStartTime: now, // Start timing for next phase
          interpolatedPositions: nextPhase.playerPositions || [],
        });
      } else {
        // Animation complete
        set({
          isAnimating: false,
          animationProgress: 1,
          animationStartTime: null,
        });
      }
    }
  },

  reset: () => {
    set({
      currentPlay: null,
      currentPhase: null,
      currentPhaseIndex: 0,
      isAnimating: false,
      animationSpeed: 1.0,
      animationProgress: 0,
      animationStartTime: null,
      interpolatedPositions: [],
      selectedPlayerId: null,
    });
  },
}));