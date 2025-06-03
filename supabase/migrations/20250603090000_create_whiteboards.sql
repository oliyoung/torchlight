-- Create whiteboards table
CREATE TABLE whiteboards (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL, -- Coach who owns this whiteboard
    title VARCHAR(255) NOT NULL,
    description TEXT,
    sport VARCHAR(255) NOT NULL,
    court_type VARCHAR(50) NOT NULL DEFAULT 'BASKETBALL_FULL',
    difficulty VARCHAR(50) NOT NULL DEFAULT 'INTERMEDIATE',
    tags TEXT[] NOT NULL DEFAULT '{}',
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create plays table
CREATE TABLE plays (
    id SERIAL PRIMARY KEY,
    whiteboard_id INTEGER NOT NULL REFERENCES whiteboards(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    player_count INTEGER NOT NULL DEFAULT 5,
    duration FLOAT, -- Duration in seconds
    play_order INTEGER NOT NULL DEFAULT 1, -- Order within whiteboard
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create phases table
CREATE TABLE phases (
    id SERIAL PRIMARY KEY,
    play_id INTEGER NOT NULL REFERENCES plays(id) ON DELETE CASCADE,
    title VARCHAR(255),
    description TEXT,
    phase_order INTEGER NOT NULL DEFAULT 1, -- Order within play
    duration FLOAT NOT NULL DEFAULT 1.0, -- Duration in seconds
    delay_seconds FLOAT NOT NULL DEFAULT 0.0, -- Delay before phase starts
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create player_positions table
CREATE TABLE player_positions (
    id SERIAL PRIMARY KEY,
    play_id INTEGER NOT NULL REFERENCES plays(id) ON DELETE CASCADE,
    phase_id INTEGER REFERENCES phases(id) ON DELETE CASCADE, -- NULL for starting positions
    player_id VARCHAR(255) NOT NULL, -- Logical player ID (e.g., "player1", "PG")
    player_name VARCHAR(255),
    player_role VARCHAR(255), -- Position like "PG", "SG", etc.
    x_coordinate FLOAT NOT NULL, -- Normalized 0-1 coordinate
    y_coordinate FLOAT NOT NULL, -- Normalized 0-1 coordinate
    z_coordinate FLOAT NOT NULL DEFAULT 0.0, -- For future 3D support
    color VARCHAR(7), -- Hex color code
    jersey VARCHAR(10), -- Jersey number or identifier
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create movements table
CREATE TABLE movements (
    id SERIAL PRIMARY KEY,
    phase_id INTEGER NOT NULL REFERENCES phases(id) ON DELETE CASCADE,
    player_id VARCHAR(255) NOT NULL, -- Player this movement applies to
    from_x FLOAT NOT NULL, -- Starting X coordinate
    from_y FLOAT NOT NULL, -- Starting Y coordinate
    to_x FLOAT NOT NULL, -- Ending X coordinate
    to_y FLOAT NOT NULL, -- Ending Y coordinate
    movement_type VARCHAR(50) NOT NULL DEFAULT 'RUN', -- RUN, WALK, SPRINT, etc.
    speed FLOAT NOT NULL DEFAULT 1.0, -- Movement speed multiplier
    curve_data TEXT, -- JSON string for bezier curve data
    show_trail BOOLEAN NOT NULL DEFAULT true, -- Whether to show movement trail
    trail_color VARCHAR(7), -- Hex color for trail
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create annotations table
CREATE TABLE annotations (
    id SERIAL PRIMARY KEY,
    play_id INTEGER REFERENCES plays(id) ON DELETE CASCADE, -- NULL for phase-specific
    phase_id INTEGER REFERENCES phases(id) ON DELETE CASCADE, -- NULL for play-level
    annotation_type VARCHAR(50) NOT NULL, -- TEXT, ARROW, LINE, CIRCLE, etc.
    text_content TEXT, -- For text annotations
    coordinates FLOAT[] NOT NULL, -- Array of coordinates defining the annotation
    color VARCHAR(7) NOT NULL DEFAULT '#FFFFFF', -- Hex color
    stroke_width FLOAT DEFAULT 0.1, -- Line width for drawings
    font_size FLOAT, -- Font size for text annotations
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Constraint: must belong to either play or phase, not both
    CONSTRAINT annotation_belongs_to_play_or_phase CHECK (
        (play_id IS NOT NULL AND phase_id IS NULL) OR
        (play_id IS NULL AND phase_id IS NOT NULL)
    )
);

-- Create indexes for performance
CREATE INDEX idx_whiteboards_user_id ON whiteboards(user_id);
CREATE INDEX idx_whiteboards_sport ON whiteboards(sport);
CREATE INDEX idx_whiteboards_difficulty ON whiteboards(difficulty);
CREATE INDEX idx_whiteboards_is_public ON whiteboards(is_public);

CREATE INDEX idx_plays_whiteboard_id ON plays(whiteboard_id);
CREATE INDEX idx_plays_order ON plays(whiteboard_id, play_order);

CREATE INDEX idx_phases_play_id ON phases(play_id);
CREATE INDEX idx_phases_order ON phases(play_id, phase_order);

CREATE INDEX idx_player_positions_play_id ON player_positions(play_id);
CREATE INDEX idx_player_positions_phase_id ON player_positions(phase_id);
CREATE INDEX idx_player_positions_player_id ON player_positions(player_id);

CREATE INDEX idx_movements_phase_id ON movements(phase_id);
CREATE INDEX idx_movements_player_id ON movements(player_id);

CREATE INDEX idx_annotations_play_id ON annotations(play_id);
CREATE INDEX idx_annotations_phase_id ON annotations(phase_id);