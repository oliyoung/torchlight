"use client";

import { Suspense, useMemo } from "react";
import { Svg } from "@react-three/drei";
import type { CourtType } from "@/lib/types";

interface CourtBackgroundProps {
  courtType: CourtType;
}

export function CourtBackground({ courtType }: CourtBackgroundProps) {
  const { svgPath, scale, courtDimensions } = useMemo(() => {
    switch (courtType) {
      case "BASKETBALL_FULL":
        return {
          svgPath: "/courts/basketball-full.svg",
          scale: 0.01, // Scale down the SVG to fit the Three.js scene
          courtDimensions: { width: 16, height: 10 }
        };
      case "BASKETBALL_HALF":
        return {
          svgPath: "/courts/basketball-half.svg",
          scale: 0.0125,
          courtDimensions: { width: 8, height: 10 }
        };
      case "SOCCER_FULL":
        return {
          svgPath: "/courts/soccer-full.svg",
          scale: 0.01,
          courtDimensions: { width: 20, height: 12 }
        };
      case "SOCCER_HALF":
        return {
          svgPath: "/courts/soccer-half.svg",
          scale: 0.01,
          courtDimensions: { width: 10, height: 12 }
        };
      case "TENNIS":
        return {
          svgPath: "/courts/tennis.svg",
          scale: 0.01,
          courtDimensions: { width: 12, height: 6 }
        };
      case "VOLLEYBALL":
        return {
          svgPath: "/courts/volleyball.svg",
          scale: 0.01,
          courtDimensions: { width: 9, height: 6 }
        };
      case "FOOTBALL_FULL":
        return {
          svgPath: "/courts/soccer-full.svg", // Use soccer field as placeholder until we create a football field
          scale: 0.012,
          courtDimensions: { width: 24, height: 12 }
        };
      default:
        return {
          svgPath: "/courts/basketball-full.svg",
          scale: 0.01,
          courtDimensions: { width: 16, height: 10 }
        };
    }
  }, [courtType]);

  return (
    <group>
      <Suspense fallback={<FallbackCourt courtType={courtType} />}>
        <Svg
          src={svgPath}
          scale={scale}
          position={[0, 0.001, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fillMaterial={{ transparent: true }}
          strokeMaterial={{ transparent: true }}
        />
      </Suspense>
    </group>
  );
}

// Fallback court for loading state or when SVG fails
function FallbackCourt({ courtType }: { courtType: CourtType }) {
  const courtGeometry = useMemo(() => {
    switch (courtType) {
      case "BASKETBALL_FULL":
        return { width: 16, height: 10, color: "#8B4513" };
      case "BASKETBALL_HALF":
        return { width: 8, height: 10, color: "#8B4513" };
      case "SOCCER_FULL":
        return { width: 20, height: 12, color: "#228B22" };
      case "SOCCER_HALF":
        return { width: 10, height: 12, color: "#228B22" };
      case "FOOTBALL_FULL":
        return { width: 24, height: 12, color: "#228B22" };
      case "VOLLEYBALL":
        return { width: 9, height: 6, color: "#DEB887" };
      case "TENNIS":
        return { width: 12, height: 6, color: "#4682B4" };
      default:
        return { width: 16, height: 10, color: "#808080" };
    }
  }, [courtType]);

  return (
    <group>
      {/* Simple fallback court surface */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[courtGeometry.width, courtGeometry.height]} />
        <meshLambertMaterial color={courtGeometry.color} />
      </mesh>

      {/* Simple boundary lines */}
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
    </group>
  );
}