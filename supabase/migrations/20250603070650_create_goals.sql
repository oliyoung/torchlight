-- Create enum types for goals
CREATE TYPE goal_status AS ENUM ('ACTIVE', 'COMPLETED', 'PAUSED');
CREATE TYPE goal_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE goal_category AS ENUM ('STRENGTH', 'ENDURANCE', 'SKILL', 'MENTAL', 'FLEXIBILITY', 'SPEED', 'TECHNIQUE', 'NUTRITION', 'RECOVERY');

CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,

    -- Goal Information
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category goal_category NOT NULL,
    priority goal_priority NOT NULL DEFAULT 'MEDIUM',

    -- Progress Tracking
    target_value DECIMAL(10,2),
    current_value DECIMAL(10,2) DEFAULT 0,
    unit VARCHAR(50), -- 'kg', 'seconds', 'reps', 'meters', etc.
    progress_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
      CASE
        WHEN target_value IS NULL OR target_value = 0 THEN 0
        ELSE LEAST(100, (current_value / target_value * 100))
      END
    ) STORED,

    -- Status and Timeline
    status goal_status NOT NULL DEFAULT 'ACTIVE',
    due_date DATE,
    completed_at TIMESTAMP,

    -- Notes and Metadata
    progress_notes TEXT,
    evaluation_response JSONB,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    -- Constraints
    CONSTRAINT chk_goals_title_not_empty CHECK (length(trim(title)) > 0),
    CONSTRAINT chk_goals_target_value_positive CHECK (target_value IS NULL OR target_value > 0),
    CONSTRAINT chk_goals_current_value_non_negative CHECK (current_value IS NULL OR current_value >= 0),
    CONSTRAINT chk_goals_progress_percentage CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    CONSTRAINT chk_goals_due_date_future CHECK (due_date IS NULL OR due_date >= CURRENT_DATE),
    CONSTRAINT chk_goals_completed_status CHECK (
      (status = 'COMPLETED' AND completed_at IS NOT NULL) OR
      (status != 'COMPLETED' AND completed_at IS NULL)
    )
);

-- Indexes for performance
CREATE INDEX idx_goals_coach_id ON goals(coach_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_goals_athlete_id ON goals(athlete_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_goals_status ON goals(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_goals_category ON goals(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_goals_priority ON goals(priority) WHERE deleted_at IS NULL;
CREATE INDEX idx_goals_due_date ON goals(due_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_goals_deleted_at ON goals(deleted_at);

-- Composite indexes for common queries
CREATE INDEX idx_goals_athlete_status ON goals(athlete_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_goals_coach_status ON goals(coach_id, status) WHERE deleted_at IS NULL;

-- Full-text search
ALTER TABLE goals ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(title, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(progress_notes, '')
    )
  ) STORED;

CREATE INDEX idx_goals_search ON goals USING GIN(search_vector);

