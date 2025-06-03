"use client";

import { useMemo } from "react";
import type { Play, Phase } from "@/lib/types";

interface PlayRendererProps {
  play: Play;
  currentPhase?: Phase;
  isAnimating?: boolean;
}

export function PlayRenderer({ play, currentPhase, isAnimating }: PlayRendererProps) {
  const annotations = useMemo(() => {
    // Render play-level annotations (always visible)
    const playAnnotations = play.annotations || [];

    // Render phase-specific annotations if there's a current phase
    const phaseAnnotations = currentPhase?.annotations || [];

    return [...playAnnotations, ...phaseAnnotations];
  }, [play.annotations, currentPhase?.annotations]);

  return (
    <group>
      {/* Render annotations */}
      {annotations.map((annotation) => (
        <AnnotationRenderer
          key={annotation.id}
          annotation={annotation}
        />
      ))}

      {/* Render movement trails if animating */}
      {isAnimating && currentPhase && (
        <MovementTrails phase={currentPhase} />
      )}
    </group>
  );
}

// Component to render individual annotations
function AnnotationRenderer({ annotation }: { annotation: any }) {
  const color = annotation.color || "#ffffff";
  const strokeWidth = annotation.strokeWidth || 0.1;

  switch (annotation.type) {
    case "LINE":
      return (
        <mesh position={[0, 0.01, 0]}>
          <cylinderGeometry args={[strokeWidth / 2, strokeWidth / 2, 1]} />
          <meshBasicMaterial color={color} />
        </mesh>
      );

    case "CIRCLE":
      if (annotation.coordinates.length >= 4) {
        const [x, y, radius] = annotation.coordinates;
        return (
          <mesh position={[x, 0.01, y]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius - strokeWidth / 2, radius + strokeWidth / 2, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.8} />
          </mesh>
        );
      }
      return null;

    case "ARROW":
      if (annotation.coordinates.length >= 4) {
        const [startX, startY, endX, endY] = annotation.coordinates;
        const length = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
        const angle = Math.atan2(endY - startY, endX - startX);

        return (
          <group position={[(startX + endX) / 2, 0.01, (startY + endY) / 2]} rotation={[0, angle, 0]}>
            {/* Arrow shaft */}
            <mesh>
              <boxGeometry args={[length, strokeWidth, strokeWidth]} />
              <meshBasicMaterial color={color} />
            </mesh>
            {/* Arrow head */}
            <mesh position={[length / 2, 0, 0]}>
              <coneGeometry args={[strokeWidth * 2, strokeWidth * 3, 8]} />
              <meshBasicMaterial color={color} />
            </mesh>
          </group>
        );
      }
      return null;

    default:
      return null;
  }
}

// Component to render movement trails for the current phase
function MovementTrails({ phase }: { phase: Phase }) {
  const movements = phase.movements || [];

  return (
    <group>
      {movements.map((movement) => {
        if (!movement.showTrail) return null;

        const trailColor = movement.trailColor || "#ffffff";
        const length = Math.sqrt(
          (movement.toX - movement.fromX) ** 2 +
          (movement.toY - movement.fromY) ** 2
        );
        const angle = Math.atan2(
          movement.toY - movement.fromY,
          movement.toX - movement.fromX
        );

        return (
          <mesh
            key={movement.id}
            position={[
              (movement.fromX + movement.toX) / 2,
              0.005,
              (movement.fromY + movement.toY) / 2
            ]}
            rotation={[0, angle, 0]}
          >
            <boxGeometry args={[length, 0.05, 0.1]} />
            <meshBasicMaterial color={trailColor} transparent opacity={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}