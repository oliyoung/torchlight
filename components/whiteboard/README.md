# Whiteboard Feature

An interactive 3D whiteboard system for drawing plays and training drills using Three.js and React Three Fiber.

## Overview

The whiteboard feature enables coaches to:
- Create interactive 3D tactical whiteboards
- Draw plays with multiple phases and animations
- Position players with x,y coordinates stored in the database
- Animate plays step-by-step with customizable timing
- Support different sports courts/fields as backgrounds
- Export and share plays with athletes and other coaches

## Architecture

### Core Components

**`WhiteboardContainer`** - Main container component that orchestrates the entire whiteboard experience
- Manages play selection and phase navigation
- Provides animation controls (play/pause/speed)
- Displays side panel with play and player information
- Handles user interactions and state management

**`WhiteboardCanvas`** - Three.js canvas component for 3D rendering
- Uses React Three Fiber for React integration
- Orthographic camera for true top-down view
- Supports pan and zoom (rotation disabled for top-down)
- Renders court backgrounds, players, and annotations

**`CourtBackground`** - Renders sport-specific court/field backgrounds
- Supports basketball, soccer, football, volleyball, tennis courts
- Dynamically adjusts dimensions and markings per sport
- Uses appropriate colors and line markings

**`PlayerMarkers`** - Interactive player position markers
- Drag-and-drop functionality for repositioning
- Color-coded by player role (PG, SG, SF, PF, C, etc.)
- Visual feedback for selection and hover states
- Jersey numbers and player names display

**`PlayRenderer`** - Handles rendering of plays and annotations
- Draws arrows, lines, circles, and other annotations
- Shows movement trails during animations
- Supports both play-level and phase-specific annotations

### State Management

**`useWhiteboardStore`** - Zustand store for whiteboard state
- Current play and phase selection
- Animation state (playing/paused/speed)
- Selected player tracking
- Player position updates
- Reset functionality

### Data Model

The whiteboard system uses a comprehensive GraphQL schema:

**Entities:**
- `Whiteboard` - Container for multiple plays
- `Play` - Individual tactical play or drill
- `Phase` - Step in a play animation sequence
- `PlayerPosition` - x,y coordinates for player placement
- `Movement` - Animation data for player movements
- `Annotation` - Drawings, arrows, text on the whiteboard

**Key Features:**
- Normalized coordinate system (0-1) for device independence
- Multi-phase animation support with timing controls
- Sport-specific court types and player roles
- Difficulty levels for progressive training
- Public/private sharing capabilities

## Usage

### Basic Setup

```tsx
import { WhiteboardContainer } from "@/components/whiteboard/whiteboard-container";

const whiteboard = {
  title: "Pick and Roll Play",
  sport: "Basketball",
  courtType: "BASKETBALL_FULL",
  difficulty: "INTERMEDIATE",
  plays: [/* play data */]
};

<WhiteboardContainer
  whiteboard={whiteboard}
  onSave={(updatedWhiteboard) => {
    // Save to backend
  }}
/>
```

### Creating Players

```tsx
const playerPosition = {
  playerId: "player1",
  playerName: "Point Guard",
  playerRole: "PG",
  x: 0.5,        // Center horizontally (0 = left, 1 = right)
  y: 0.8,        // Near bottom (0 = top, 1 = bottom)
  color: "#FF6B6B",
  jersey: "1"
};
```

### Multi-Phase Animation

```tsx
const phases = [
  {
    title: "Setup",
    duration: 2.0,
    playerPositions: [/* initial positions */]
  },
  {
    title: "Screen Set",
    duration: 3.0,
    playerPositions: [/* moved positions */],
    movements: [
      {
        playerId: "player1",
        fromX: 0.5, fromY: 0.8,
        toX: 0.3, toY: 0.6,
        movementType: "RUN",
        showTrail: true
      }
    ]
  }
];
```

## Sport Support

### Court Types
- `BASKETBALL_FULL` - Full basketball court
- `BASKETBALL_HALF` - Half basketball court
- `SOCCER_FULL` - Full soccer field
- `SOCCER_HALF` - Half soccer field
- `FOOTBALL_FULL` - American football field
- `VOLLEYBALL` - Volleyball court
- `TENNIS` - Tennis court
- `CUSTOM` - Custom court layout

### Player Roles
The system automatically assigns colors based on player roles:
- **Basketball**: PG (red), SG (teal), SF (blue), PF (green), C (yellow)
- **Soccer**: GK (pink), DEF (purple), MID (light purple), FWD (light red)
- **Default**: Plum for unrecognized roles

## Coordinate System

The whiteboard uses a normalized coordinate system:
- **X-axis**: 0.0 (left edge) to 1.0 (right edge)
- **Y-axis**: 0.0 (top edge) to 1.0 (bottom edge)
- **Z-axis**: 0.0 (court level) - reserved for future 3D features

This system ensures plays work across different screen sizes and court dimensions.

## Animation System

### Animation Controls
- **Play/Pause**: Start/stop phase animations
- **Phase Navigation**: Step through play phases manually
- **Speed Control**: 0.5x to 2.0x animation speed
- **Timeline**: Visual indicator of current phase

### Movement Types
- `WALK` - Normal walking pace
- `RUN` - Running/jogging
- `SPRINT` - Fast sprint
- `CUT` - Sharp directional cut
- `SHUFFLE` - Defensive shuffle
- `BACKPEDAL` - Moving backward
- `JUMP` - Jumping movement
- `SCREEN` - Setting a screen/pick

## Future Enhancements

### Planned Features
- **3D Mode**: Full 3D court view with height positioning
- **Voice Recording**: Audio coaching instructions per phase
- **Video Integration**: Overlay real game footage
- **AI Play Generation**: Generate plays based on team strengths
- **Real-time Collaboration**: Multiple coaches editing simultaneously
- **Mobile App**: Touch-optimized interface for tablets
- **VR Support**: Immersive virtual reality whiteboard

### Technical Roadmap
- WebGL 2.0 for advanced graphics
- Physics engine integration for realistic movement
- Performance optimizations for complex plays
- Offline mode with local storage
- Export to video/GIF animations

## Performance Considerations

- Uses Three.js for hardware-accelerated rendering
- Orthographic camera reduces rendering complexity
- Player markers are instanced for better performance
- Animation system optimized for 60fps
- Responsive design adapts to various screen sizes

## Integration

The whiteboard integrates with the broader coaching platform:
- **Athletes**: Assign plays to specific athletes
- **Training Plans**: Include whiteboards in training programs
- **Session Logs**: Reference plays used in training sessions
- **Goals**: Link plays to specific skill development goals