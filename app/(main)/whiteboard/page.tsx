 "use client";

import { PageWrapper } from "@/components/ui/page-wrapper";
import { WhiteboardContainer } from "@/components/whiteboard/whiteboard-container";
import type { Whiteboard } from "@/lib/types";

// Sample whiteboard data for demonstration
const sampleWhiteboard: Whiteboard = {
  id: "whiteboard-1",
  title: "Basketball Fast Break Drill",
  description: "Learn the fundamentals of the fast break offense with this multi-phase drill",
  sport: "Basketball",
  courtType: "BASKETBALL_FULL" as any,
  difficulty: "INTERMEDIATE" as any,
  isPublic: false,
  tags: ["offense", "fast-break", "transition"],
  coach: {} as any, // Simplified for demo
  athletes: [],
  trainingPlans: [],
  plays: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
};

// Create the play with proper references
const play = {
  id: "play-1",
  title: "3-on-2 Fast Break",
  description: "Classic 3-on-2 fast break scenario",
  playerCount: 5,
  duration: 15,
  order: 1,
  whiteboard: sampleWhiteboard,
  phases: [] as any[],
  startingPositions: [
    {
      id: "start-pos-1",
      playerId: "player1",
      playerName: "Point Guard",
      playerRole: "PG",
      x: 0.35,
      y: 0.75,
      z: 0,
      color: "#FF6B6B",
      jersey: "1",
      play: null as any, // Will be set below
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "start-pos-2",
      playerId: "player2",
      playerName: "Left Wing",
      playerRole: "SG",
      x: 0.25,
      y: 0.7,
      z: 0,
      color: "#4ECDC4",
      jersey: "2",
      play: null as any, // Will be set below
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "start-pos-3",
      playerId: "player3",
      playerName: "Right Wing",
      playerRole: "SF",
      x: 0.75,
      y: 0.7,
      z: 0,
      color: "#45B7D1",
      jersey: "3",
      play: null as any, // Will be set below
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  annotations: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Create phases with proper play references
const phases = [
  {
    id: "phase-1",
    title: "Defensive Rebound",
    description: "Players secure defensive rebound and prepare to push the ball",
    order: 1,
    duration: 2,
    delay: 0,
    play: play,
    playerPositions: [
      {
        id: "pos-1",
        playerId: "player1",
        playerName: "Point Guard",
        playerRole: "PG",
        x: 0.35, // Near left side
        y: 0.75, // Defensive end
        z: 0,
        color: "#FF6B6B",
        jersey: "1",
        play: play,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "pos-2",
        playerId: "player2",
        playerName: "Left Wing",
        playerRole: "SG",
        x: 0.25, // Left wing
        y: 0.7, // Defensive rebound area
        z: 0,
        color: "#4ECDC4",
        jersey: "2",
        play: play,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "pos-3",
        playerId: "player3",
        playerName: "Right Wing",
        playerRole: "SF",
        x: 0.75, // Right wing
        y: 0.7, // Defensive rebound area
        z: 0,
        color: "#45B7D1",
        jersey: "3",
        play: play,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    movements: [],
    annotations: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "phase-2",
    title: "Transition Push",
    description: "Point guard pushes the ball, wings run the lanes",
    order: 2,
    duration: 3,
    delay: 0,
    play: play,
    playerPositions: [
      {
        id: "pos-4",
        playerId: "player1",
        playerName: "Point Guard",
        playerRole: "PG",
        x: 0.5, // Center court
        y: 0.5, // Mid-court
        z: 0,
        color: "#FF6B6B",
        jersey: "1",
        play: play,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "pos-5",
        playerId: "player2",
        playerName: "Left Wing",
        playerRole: "SG",
        x: 0.2, // Left lane
        y: 0.4, // Running down court
        z: 0,
        color: "#4ECDC4",
        jersey: "2",
        play: play,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "pos-6",
        playerId: "player3",
        playerName: "Right Wing",
        playerRole: "SF",
        x: 0.8, // Right lane
        y: 0.4, // Running down court
        z: 0,
        color: "#45B7D1",
        jersey: "3",
        play: play,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    movements: [
      {
        id: "movement-1",
        playerId: "player1",
        fromX: 0.35,
        fromY: 0.75,
        toX: 0.5,
        toY: 0.5,
        movementType: "RUN" as any,
        speed: 1.2,
        showTrail: true,
        trailColor: "#FF6B6B",
        phase: null as any, // Will be set below
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "movement-2",
        playerId: "player2",
        fromX: 0.25,
        fromY: 0.7,
        toX: 0.2,
        toY: 0.4,
        movementType: "SPRINT" as any,
        speed: 1.5,
        showTrail: true,
        trailColor: "#4ECDC4",
        phase: null as any, // Will be set below
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "movement-3",
        playerId: "player3",
        fromX: 0.75,
        fromY: 0.7,
        toX: 0.8,
        toY: 0.4,
        movementType: "SPRINT" as any,
        speed: 1.5,
        showTrail: true,
        trailColor: "#45B7D1",
        phase: null as any, // Will be set below
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    annotations: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "phase-3",
    title: "Attack the Basket",
    description: "Point guard attacks, wings position for rebounds or passes",
    order: 3,
    duration: 4,
    delay: 0,
    play: play,
    playerPositions: [
      {
        id: "pos-7",
        playerId: "player1",
        playerName: "Point Guard",
        playerRole: "PG",
        x: 0.62, // Attacking the basket (right side)
        y: 0.2, // Near the offensive basket
        z: 0,
        color: "#FF6B6B",
        jersey: "1",
        play: play,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "pos-8",
        playerId: "player2",
        playerName: "Left Wing",
        playerRole: "SG",
        x: 0.3, // Left corner/wing
        y: 0.15, // Offensive end
        z: 0,
        color: "#4ECDC4",
        jersey: "2",
        play: play,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "pos-9",
        playerId: "player3",
        playerName: "Right Wing",
        playerRole: "SF",
        x: 0.8, // Right wing
        y: 0.25, // Trailing for rebound
        z: 0,
        color: "#45B7D1",
        jersey: "3",
        play: play,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    movements: [],
    annotations: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Set the movement phase references
phases[1].movements[0].phase = phases[1];
phases[1].movements[1].phase = phases[1];
phases[1].movements[2].phase = phases[1];

// Set the play's phases
play.phases = phases;

// Set play references for starting positions
play.startingPositions.forEach(pos => pos.play = play);

// Add the play to the whiteboard
sampleWhiteboard.plays = [play];

export default function WhiteboardPage() {
  return (
    <PageWrapper
      title="Whiteboard Demo"
      description="Interactive 3D whiteboard for drawing plays and training drills"
      breadcrumbs={[
        { label: "Whiteboard", href: "/whiteboard" },
      ]}
    >
      <div className="h-[calc(100vh-4rem)]">
        <WhiteboardContainer
          whiteboard={sampleWhiteboard}
          onSave={(whiteboard) => {
            console.log("Saving whiteboard:", whiteboard);
          }}
        />
      </div>
    </PageWrapper>
  );
}