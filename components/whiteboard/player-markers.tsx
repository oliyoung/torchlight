"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import type { Play, Phase, PlayerPosition } from "@/lib/types";
import { useWhiteboardStore } from "./whiteboard-store";

interface PlayerMarkersProps {
  plays: Play[];
  currentPhase?: Phase;
  selectedPlayerId?: string;
  onPlayerSelect?: (playerId: string) => void;
  onPlayerMove?: (playerId: string, x: number, y: number) => void;
}

export function PlayerMarkers({
  plays,
  currentPhase,
  selectedPlayerId,
  onPlayerSelect,
  onPlayerMove,
}: PlayerMarkersProps) {
  // Use interpolated positions from the store for smooth animation
  const interpolatedPositions = useWhiteboardStore(state => state.interpolatedPositions);
  const updateAnimation = useWhiteboardStore(state => state.updateAnimation);
  const isAnimating = useWhiteboardStore(state => state.isAnimating);

  // Update animation on each frame when animating
  useFrame(() => {
    if (isAnimating) {
      updateAnimation();
    }
  });

  // Use interpolated positions if available, otherwise fall back to static positions
  const playerPositions = interpolatedPositions.length > 0
    ? interpolatedPositions
    : getCurrentPlayerPositions(plays, currentPhase);

  return (
    <group>
      {playerPositions.map((position) => (
        <PlayerMarker
          key={`${position.play?.id || 'no-play'}-${position.playerId}`}
          position={position}
          isSelected={selectedPlayerId === position.playerId}
          onSelect={() => onPlayerSelect?.(position.playerId)}
          onMove={onPlayerMove}
        />
      ))}
    </group>
  );
}

interface PlayerMarkerProps {
  position: PlayerPosition;
  isSelected: boolean;
  onSelect: () => void;
  onMove?: (playerId: string, x: number, y: number) => void;
}

function PlayerMarker({ position, isSelected, onSelect, onMove }: PlayerMarkerProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Convert normalized coordinates to 3D world coordinates
  const worldX = (position.x - 0.5) * 16; // Scale to court size
  const worldZ = (position.y - 0.5) * 10;

  // Animation for hover and selection states
  useFrame((state) => {
    if (meshRef.current) {
      const targetScale = isSelected ? 1.3 : hovered ? 1.1 : 1.0;
      const currentScale = meshRef.current.scale.x;
      const newScale = currentScale + (targetScale - currentScale) * 0.1;
      meshRef.current.scale.setScalar(newScale);

      // Animate Y position for selection
      const targetY = isSelected ? 0.3 : 0.2;
      const currentY = meshRef.current.position.y;
      const newY = currentY + (targetY - currentY) * 0.1;
      meshRef.current.position.y = newY;
    }
  });

  const playerColor = position.color || getDefaultPlayerColor(position.playerRole || undefined);

  const handlePointerDown = (event: any) => {
    event.stopPropagation();
    setDragging(true);
    onSelect();
  };

  const handlePointerUp = () => {
    setDragging(false);
  };

  const handlePointerMove = (event: any) => {
    if (dragging && onMove) {
      event.stopPropagation();
      // Convert world coordinates back to normalized coordinates
      const normalizedX = (event.point.x / 16) + 0.5;
      const normalizedY = (event.point.z / 10) + 0.5;

      // Clamp to court bounds
      const clampedX = Math.max(0, Math.min(1, normalizedX));
      const clampedY = Math.max(0, Math.min(1, normalizedY));

      onMove(position.playerId, clampedX, clampedY);
    }
  };

  return (
    <group position={[worldX, 0, worldZ]}>
      {/* Player base/shadow */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.4, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.3} />
      </mesh>

      {/* Main player marker */}
      <mesh
        ref={meshRef}
        position={[0, 0.2, 0]}
        castShadow
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
      >
        <cylinderGeometry args={[0.3, 0.3, 0.4, 16]} />
        <meshLambertMaterial
          color={playerColor}
          emissive={isSelected ? "#444444" : "#000000"}
        />
      </mesh>

      {/* Player label */}
      <mesh position={[0, 0.6, 0]}>
        <planeGeometry args={[1, 0.3]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Jersey number/name */}
      {(position.jersey || position.playerName) && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.25, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.5, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

// Helper function to get current player positions based on phase
function getCurrentPlayerPositions(plays: Play[], currentPhase?: Phase): PlayerPosition[] {
  const positions: PlayerPosition[] = [];

  for (const play of plays) {
    if (currentPhase && currentPhase.play?.id === play.id) {
      // Use phase-specific positions if available
      const phasePositions = currentPhase.playerPositions || [];
      positions.push(...phasePositions.map(pos => ({ ...pos, play })));
    } else {
      // Use starting positions
      const startingPositions = play.startingPositions || [];
      positions.push(...startingPositions.map(pos => ({ ...pos, play })));
    }
  }

  // If no phase is selected, show starting positions for the first play
  if (positions.length === 0 && plays.length > 0) {
    const firstPlay = plays[0];
    const startingPositions = firstPlay.startingPositions || [];
    positions.push(...startingPositions.map(pos => ({ ...pos, play: firstPlay })));
  }

  return positions;
}

// Helper function to get default player colors based on role
function getDefaultPlayerColor(role?: string): string {
  switch (role?.toLowerCase()) {
    case "point guard":
    case "pg":
      return "#FF6B6B"; // Red
    case "shooting guard":
    case "sg":
      return "#4ECDC4"; // Teal
    case "small forward":
    case "sf":
      return "#45B7D1"; // Blue
    case "power forward":
    case "pf":
      return "#96CEB4"; // Green
    case "center":
    case "c":
      return "#FFEAA7"; // Yellow
    case "goalkeeper":
    case "gk":
      return "#FD79A8"; // Pink
    case "defender":
    case "def":
      return "#6C5CE7"; // Purple
    case "midfielder":
    case "mid":
      return "#A29BFE"; // Light Purple
    case "forward":
    case "fwd":
      return "#FD7272"; // Light Red
    default:
      return "#DDA0DD"; // Plum (default)
  }
}