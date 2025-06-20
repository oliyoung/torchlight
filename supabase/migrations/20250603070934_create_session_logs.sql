-- Create enum types for session logs
CREATE TYPE session_type AS ENUM ('TRAINING', 'ASSESSMENT', 'CONSULTATION', 'COMPETITION', 'RECOVERY', 'PLANNING');
CREATE TYPE session_intensity AS ENUM ('VERY_LOW', 'LOW', 'MODERATE', 'HIGH', 'VERY_HIGH');

CREATE TABLE session_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,

    -- Session Information
    title VARCHAR(255),
    session_type session_type NOT NULL DEFAULT 'TRAINING',
    date TIMESTAMP NOT NULL,
    duration_minutes INTEGER,
    location VARCHAR(255),

    -- Session Content
    notes TEXT,
    transcript TEXT,
    summary TEXT,
    action_items TEXT[] NOT NULL DEFAULT '{}',

    -- Session Metrics
    intensity_level session_intensity,
    coach_rating INTEGER CHECK (coach_rating BETWEEN 1 AND 5),
    athlete_feedback TEXT,
    weather_conditions VARCHAR(100),

    -- Equipment and Resources
    equipment_used TEXT[],
    exercises_performed JSONB,

    -- AI Metadata
    ai_summary_generated BOOLEAN DEFAULT FALSE,
    ai_next_steps_generated BOOLEAN DEFAULT FALSE,
    ai_metadata JSONB,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    -- Constraints
    CONSTRAINT chk_session_logs_date_not_future CHECK (date <= CURRENT_TIMESTAMP + INTERVAL '1 day'),
    CONSTRAINT chk_session_logs_duration_positive CHECK (duration_minutes IS NULL OR duration_minutes > 0),
    CONSTRAINT chk_session_logs_coach_rating_valid CHECK (coach_rating IS NULL OR (coach_rating >= 1 AND coach_rating <= 5)),
    CONSTRAINT chk_session_logs_title_not_empty CHECK (title IS NULL OR length(trim(title)) > 0)
);

-- Indexes for performance
CREATE INDEX idx_session_logs_coach_id ON session_logs(coach_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_session_logs_athlete_id ON session_logs(athlete_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_session_logs_date ON session_logs(date) WHERE deleted_at IS NULL;
CREATE INDEX idx_session_logs_session_type ON session_logs(session_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_session_logs_intensity_level ON session_logs(intensity_level) WHERE deleted_at IS NULL;
CREATE INDEX idx_session_logs_coach_rating ON session_logs(coach_rating) WHERE deleted_at IS NULL;
CREATE INDEX idx_session_logs_deleted_at ON session_logs(deleted_at);

-- Composite indexes for common queries
CREATE INDEX idx_session_logs_athlete_date ON session_logs(athlete_id, date DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_session_logs_coach_date ON session_logs(coach_id, date DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_session_logs_athlete_type ON session_logs(athlete_id, session_type) WHERE deleted_at IS NULL;

-- JSON indexes for exercises and metadata
CREATE INDEX idx_session_logs_exercises_gin ON session_logs USING GIN(exercises_performed) WHERE deleted_at IS NULL;
CREATE INDEX idx_session_logs_ai_metadata_gin ON session_logs USING GIN(ai_metadata) WHERE deleted_at IS NULL;

-- Full-text search
ALTER TABLE session_logs ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(title, '') || ' ' ||
      coalesce(notes, '') || ' ' ||
      coalesce(summary, '') || ' ' ||
      coalesce(athlete_feedback, '') || ' ' ||
      coalesce(location, '')
    )
  ) STORED;

CREATE INDEX idx_session_logs_search ON session_logs USING GIN(search_vector);

-- Partitioning for performance (optional, for large datasets)
-- This would be implemented as a separate migration when needed
-- CREATE TABLE session_logs_y2024m01 PARTITION OF session_logs
-- FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
