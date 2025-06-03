"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import { Suspense } from "react";
import type { CourtType, Play, Phase } from "@/lib/types";
import { CourtBackground } from "./court-background";
import { PlayRenderer } from "./play-renderer";
import { PlayerMarkers } from "./player-markers";

interface WhiteboardCanvasProps {
  courtType: CourtType;
  plays: Play[];
  currentPhase?: Phase;
  isAnimating?: boolean;
  selectedPlayerId?: string;
  onPlayerSelect?: (playerId: string) => void;
  onPlayerMove?: (playerId: string, x: number, y: number) => void;
}

export function WhiteboardCanvas({
  courtType,
  plays,
  currentPhase,
  isAnimating = false,
  selectedPlayerId,
  onPlayerSelect,
  onPlayerMove,
}: WhiteboardCanvasProps) {
  return (
    <div className="w-full h-full min-h-[600px] bg-gray-900 rounded-lg overflow-hidden">
      <Canvas
        camera={{
          position: [0, 20, 0], // Higher position for better view
          left: -12,
          right: 12,
          top: 8,
          bottom: -8,
          near: 0.1,
          far: 1000,
          zoom: 1,
        }}
        orthographic={true} // Use orthographic camera for true top-down view
        shadows
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* Camera Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={false} // Disable rotation to maintain top-down view
          minZoom={0.3}
          maxZoom={5}
          target={[0, 0, 0]}
        />

        {/* Scene Content */}
        <Suspense fallback={null}>
          {/* Court/Field Background */}
          <CourtBackground courtType={courtType} />

          {/* Grid Helper for alignment */}
          <Grid
            position={[0, 0.01, 0]}
            args={[16, 10]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#ffffff"
            sectionSize={4}
            sectionThickness={1}
            sectionColor="#ffffff"
            fadeDistance={30}
            fadeStrength={0.5}
            infiniteGrid={false}
          />

          {/* Render all plays */}
          {plays.map((play) => (
            <PlayRenderer
              key={play.id}
              play={play}
              currentPhase={currentPhase}
              isAnimating={isAnimating}
            />
          ))}

          {/* Player markers */}
          <PlayerMarkers
            plays={plays}
            currentPhase={currentPhase}
            selectedPlayerId={selectedPlayerId}
            onPlayerSelect={onPlayerSelect}
            onPlayerMove={onPlayerMove}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}