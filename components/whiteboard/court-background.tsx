"use client";

import { useMemo } from "react";
import type { CourtType } from "@/lib/types";

interface CourtBackgroundProps {
  courtType: CourtType;
}

export function CourtBackground({ courtType }: CourtBackgroundProps) {
  const courtGeometry = useMemo(() => {
    // Court dimensions (normalized to fit in view)
    switch (courtType) {
      case "BASKETBALL_FULL":
        return { width: 16, height: 10 }; // Basketball court proportions
      case "BASKETBALL_HALF":
        return { width: 8, height: 10 };
      case "SOCCER_FULL":
        return { width: 20, height: 12 }; // Soccer field proportions
      case "SOCCER_HALF":
        return { width: 10, height: 12 };
      case "FOOTBALL_FULL":
        return { width: 24, height: 12 }; // American football proportions
      case "VOLLEYBALL":
        return { width: 9, height: 6 }; // Volleyball court proportions
      case "TENNIS":
        return { width: 12, height: 6 }; // Tennis court proportions
      default:
        return { width: 16, height: 10 };
    }
  }, [courtType]);

  const courtMarkings = useMemo(() => {
    // Generate court-specific markings
    const markings = [];

    switch (courtType) {
      case "BASKETBALL_FULL":
      case "BASKETBALL_HALF":
        // Center court line (divides court in half)
        markings.push(
          <mesh key="center-line" position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.1, courtGeometry.height]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
          </mesh>
        );

        // Center circle
        markings.push(
          <mesh key="center-circle" position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.9, 3.1, 64]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
          </mesh>
        );

        // Left side markings (defensive end)
        if (courtType === "BASKETBALL_FULL") {
          // Left free throw lane (paint/key)
          markings.push(
            // Left lane outline
            <group key="left-lane">
              {/* Top of key */}
              <mesh position={[-4.5, 0.005, -2.85]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[2.85, 0.1]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
              </mesh>
              {/* Bottom of key */}
              <mesh position={[-4.5, 0.005, 2.85]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[2.85, 0.1]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
              </mesh>
              {/* Left side of key */}
              <mesh position={[-6, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.1, 5.8]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
              </mesh>
            </group>
          );

          // Left free throw circle
          markings.push(
            <mesh key="left-ft-circle" position={[-4.5, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.8, 2, 64]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
            </mesh>
          );

          // Left three-point line
          markings.push(
            <mesh key="left-three-point" position={[-7.25, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[7.2, 7.4, 32, 1, -Math.PI/2, Math.PI]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
            </mesh>
          );

          // Left basket
          markings.push(
            <mesh key="left-basket" position={[-7.6, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.4, 0.5, 16]} />
              <meshBasicMaterial color="#FF6600" transparent opacity={0.9} />
            </mesh>
          );
        }

        // Right side markings (offensive end)
        // Right free throw lane (paint/key)
        markings.push(
          <group key="right-lane">
            {/* Top of key */}
            <mesh position={[4.5, 0.005, -2.85]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[2.85, 0.1]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
            </mesh>
            {/* Bottom of key */}
            <mesh position={[4.5, 0.005, 2.85]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[2.85, 0.1]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
            </mesh>
            {/* Right side of key */}
            <mesh position={[6, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.1, 5.8]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
            </mesh>
          </group>
        );

        // Right free throw circle
        markings.push(
          <mesh key="right-ft-circle" position={[4.5, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.8, 2, 64]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
          </mesh>
        );

        // Right three-point line
        markings.push(
          <mesh key="right-three-point" position={[7.25, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[7.2, 7.4, 32, 1, Math.PI/2, Math.PI]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
          </mesh>
        );

        // Right basket
        markings.push(
          <mesh key="right-basket" position={[7.6, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.4, 0.5, 16]} />
            <meshBasicMaterial color="#FF6600" transparent opacity={0.9} />
          </mesh>
        );

        break;

      case "SOCCER_FULL":
      case "SOCCER_HALF":
        // Soccer field markings
        markings.push(
          // Center circle
          <mesh key="center-circle" position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[4, 4.2, 64]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
          </mesh>
        );
        break;
    }

    return markings;
  }, [courtType, courtGeometry]);

  return (
    <group>
      {/* Court surface */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[courtGeometry.width, courtGeometry.height]} />
        <meshLambertMaterial color={getCourtColor(courtType)} />
      </mesh>

      {/* Court boundary */}
      <group>
        {/* Top line */}
        <mesh position={[0, 0.002, -courtGeometry.height / 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[courtGeometry.width, 0.1]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
        </mesh>
        {/* Bottom line */}
        <mesh position={[0, 0.002, courtGeometry.height / 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[courtGeometry.width, 0.1]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
        </mesh>
        {/* Left line */}
        <mesh position={[-courtGeometry.width / 2, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.1, courtGeometry.height]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
        </mesh>
        {/* Right line */}
        <mesh position={[courtGeometry.width / 2, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.1, courtGeometry.height]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
        </mesh>
      </group>

      {/* Court markings */}
      {courtMarkings}
    </group>
  );
}

function getCourtColor(courtType: CourtType): string {
  switch (courtType) {
    case "BASKETBALL_FULL":
    case "BASKETBALL_HALF":
      return "#8B4513"; // Basketball court brown
    case "SOCCER_FULL":
    case "SOCCER_HALF":
      return "#228B22"; // Soccer field green
    case "FOOTBALL_FULL":
      return "#228B22"; // Football field green
    case "VOLLEYBALL":
      return "#DEB887"; // Volleyball sand color
    case "TENNIS":
      return "#4682B4"; // Tennis court blue
    default:
      return "#808080"; // Default gray
  }
}