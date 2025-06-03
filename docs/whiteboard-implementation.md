# Whiteboard Feature Implementation

## Overview

The whiteboard feature is a comprehensive 3D tactical whiteboard system that allows coaches to create, edit, and animate plays with multi-phase player movements. The system includes both a sophisticated frontend Three.js implementation and a complete production-ready backend infrastructure.

## Architecture

### Frontend (3D Whiteboard)
- **Technology**: Three.js, React Three Fiber, Zustand state management
- **Features**: Interactive drag-and-drop player positioning, multi-phase animation system, sport-specific court rendering, movement trails
- **Location**: `app/(main)/whiteboard/` and `components/whiteboard/`

### Backend Infrastructure
- **Database**: 6 core tables + 2 join tables with proper relationships and constraints
- **Repository Layer**: Type-safe CRUD operations with user scoping and validation
- **Data Loaders**: 7 DataLoader instances for efficient GraphQL query resolution
- **GraphQL API**: Complete mutations and queries with field resolvers

## Database Schema

### Core Tables
1. **whiteboards** - Main whiteboard entities with metadata
2. **plays** - Individual plays within a whiteboard
3. **phases** - Time-based phases within a play
4. **player_positions** - Player positions for plays/phases
5. **movements** - Player movements between phases
6. **annotations** - Drawing annotations (text, arrows, lines)

### Join Tables
7. **whiteboard_athletes** - Many-to-many whiteboard ↔ athlete relationships
8. **whiteboard_training_plans** - Many-to-many whiteboard ↔ training plan relationships

## GraphQL API

### Queries
```graphql
# Get all whiteboards (filtered by sport, difficulty, public status)
whiteboards(sport: String, difficulty: DifficultyLevel, isPublic: Boolean): [Whiteboard!]!

# Get single entities
whiteboard(id: ID!): Whiteboard
play(id: ID!): Play
phase(id: ID!): Phase
```

### Mutations
```graphql
# Whiteboard management
createWhiteboard(input: CreateWhiteboardInput!): Whiteboard!
updateWhiteboard(id: ID!, input: UpdateWhiteboardInput!): Whiteboard!
deleteWhiteboard(id: ID!): Boolean!

# Play management
createPlay(input: CreatePlayInput!): Play!

# Interactive features
updatePlayerPositions(playId: ID!, positions: [PlayerPositionInput!]!): Play!
```

### Input Types
```graphql
input CreateWhiteboardInput {
  title: String!
  description: String
  sport: String!
  courtType: CourtType!
  difficulty: DifficultyLevel
  tags: [String!]
  isPublic: Boolean
}

input PlayerPositionInput {
  playerId: String!
  playerName: String
  playerRole: String
  x: Float!        # Normalized 0-1 coordinate
  y: Float!        # Normalized 0-1 coordinate
  z: Float         # For future 3D support
  color: String
  jersey: String
}
```

## Key Features

### 1. Multi-Sport Support
- Basketball (full/half court)
- Soccer/Football
- American Football
- Volleyball
- Tennis
- Court-specific markings and dimensions

### 2. Animation System
- Multi-phase play progression
- Smooth player interpolation with easing
- Configurable timing and speed controls
- Movement trails during animations
- Play/pause/navigation controls

### 3. Interactive Controls
- Drag-and-drop player positioning
- Real-time coordinate updates
- Role-based player color coding
- Normalized coordinate system (device independent)

### 4. Data Persistence
- Auto-save player positions via GraphQL
- Complete play/phase management
- User ownership and privacy controls
- Efficient data loading with DataLoaders

## Testing the Implementation

### 1. Access the Demo
Navigate to `/whiteboard` to see the interactive basketball demo with:
- 3-phase fast break play
- 5 players with realistic movement
- Animation controls (play/pause/speed/navigation)

### 2. GraphQL Testing
Use the GraphQL playground at `/api/graphql`:

```graphql
# Create a new whiteboard
mutation CreateWhiteboard {
  createWhiteboard(input: {
    title: "Basketball Fast Break Drills"
    description: "Quick transition plays"
    sport: "BASKETBALL"
    courtType: "BASKETBALL_FULL"
    difficulty: "INTERMEDIATE"
    tags: ["fast-break", "transition"]
    isPublic: false
  }) {
    id
    title
    sport
    courtType
    plays {
      id
      title
    }
  }
}

# Create a play
mutation CreatePlay {
  createPlay(input: {
    whiteboardId: "1"
    title: "3v2 Fast Break"
    description: "Quick transition to basket"
    playerCount: 5
    duration: 8.0
  }) {
    id
    title
    playerCount
    startingPositions {
      id
      playerId
      x
      y
    }
  }
}

# Update player positions (for drag-and-drop)
mutation UpdatePositions {
  updatePlayerPositions(
    playId: "1"
    positions: [
      {
        playerId: "PG"
        playerName: "Point Guard"
        playerRole: "PG"
        x: 0.1
        y: 0.5
        color: "#3B82F6"
        jersey: "1"
      }
      # ... more players
    ]
  ) {
    id
    startingPositions {
      playerId
      x
      y
      color
    }
  }
}
```

### 3. Frontend Integration Testing
The frontend currently uses demo data but is ready to connect to the GraphQL API:

```typescript
// Replace demo data in WhiteboardContainer with:
const { data } = useQuery(GET_WHITEBOARD, {
  variables: { id: whiteboardId }
});

const [updatePositions] = useMutation(UPDATE_PLAYER_POSITIONS);

// In drag handler:
await updatePositions({
  variables: {
    playId: currentPlay.id,
    positions: updatedPositions
  }
});
```

## Performance Characteristics

### DataLoader Efficiency
- **N+1 Prevention**: Batch loading prevents individual queries for each nested entity
- **Caching**: Request-scoped caching reduces redundant database calls
- **Type Safety**: Full TypeScript integration from database → GraphQL → frontend

### Database Optimization
- **Proper Indexing**: Performance indexes on foreign keys and query patterns
- **Cascade Deletes**: Automatic cleanup of related data
- **User Scoping**: All queries automatically filter by coach ownership

### Frontend Performance
- **60fps Animation**: Smooth interpolation using React Three Fiber's useFrame
- **Optimized Rendering**: Minimal React re-renders during animation
- **Efficient State**: Zustand provides fast state updates without overhead

## Security & Privacy

### Authentication Required
- All mutations require valid user authentication
- User ID validation in every repository method
- Proper error handling for unauthorized access

### Data Isolation
- Coaches can only access their own whiteboards
- Public whiteboards visible to all (when implemented)
- Ownership validation on all update/delete operations

### Input Validation
- Type-safe GraphQL schema validation
- Repository-level constraint checking
- Comprehensive error handling and logging

## Next Steps

### Frontend Integration (Phase 4)
1. Replace demo data with GraphQL queries
2. Implement real-time position updates
3. Add loading/error states
4. Create whiteboard list/management UI

### Additional Features (Future)
1. **Phase Management**: Create/edit/delete phases with animations
2. **Movement Editor**: Visual movement path creation
3. **Annotation System**: Drawing tools for tactical notes
4. **Sharing**: Public whiteboards and sharing controls
5. **Export**: PDF/video export of animated plays
6. **Templates**: Pre-built play templates by sport

## File Structure

```
/supabase/migrations/
├── 20250603090000_create_whiteboards.sql      # Core tables
└── 20250603090001_create_whiteboard_join_tables.sql  # Relationships

/lib/repository/base/
├── whiteboardRepository.ts                    # Main whiteboard CRUD
├── playRepository.ts                          # Play management
└── whiteboardEntitiesRepository.ts           # Phase/position/movement/annotation repos

/lib/data-loaders/
├── whiteboard.ts                              # Batch relation loaders
└── whiteboard-entities.ts                    # Individual entity loaders

/app/api/graphql/
├── queries/whiteboards.ts                     # Query resolvers
└── mutations/whiteboards/                     # Mutation resolvers

/app/(main)/whiteboard/                        # Demo page
/components/whiteboard/                        # 3D whiteboard components
```

## Status: Production Ready Backend

✅ **Complete Database Schema** - All tables, relationships, constraints, indexes
✅ **Repository Layer** - Type-safe CRUD with user scoping and validation
✅ **Data Loaders** - Efficient batch loading prevents N+1 queries
✅ **GraphQL API** - Comprehensive mutations, queries, and field resolvers
✅ **Frontend Demo** - Fully functional 3D whiteboard with basketball example

**Remaining**: Connect frontend to GraphQL API (replace demo data with real queries/mutations)

The whiteboard feature now has a production-ready backend infrastructure and a sophisticated 3D frontend demo. The next step is simply connecting the two systems through GraphQL queries and mutations.