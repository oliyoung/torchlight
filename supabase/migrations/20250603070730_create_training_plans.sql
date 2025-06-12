-- Create enum types for training plans
CREATE TYPE training_plan_status AS ENUM ('DRAFT', 'GENERATING', 'GENERATED', 'ERROR');
CREATE TYPE training_plan_difficulty AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE');

CREATE TABLE training_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,

    -- Plan Information
    title VARCHAR(255) NOT NULL,
    overview TEXT,
    difficulty training_plan_difficulty NOT NULL DEFAULT 'INTERMEDIATE',
    sport VARCHAR(255) NOT NULL,

    -- Timeline
    start_date DATE,
    end_date DATE,
    duration_weeks INTEGER GENERATED ALWAYS AS (
      CASE
        WHEN start_date IS NOT NULL AND end_date IS NOT NULL
        THEN CEIL((end_date - start_date)::numeric / 7)
        ELSE NULL
      END
    ) STORED,

    -- Status and Progress
    status training_plan_status NOT NULL DEFAULT 'DRAFT',
    completion_percentage DECIMAL(5,2) DEFAULT 0,

    -- Content
    plan_json JSONB CHECK (
      jsonb_typeof(plan_json) = 'object' AND
      (plan_json ? 'exercises' OR plan_json ? 'schedule' OR plan_json ? 'phases')
    ),
    notes TEXT,

    -- AI Generation Metadata
    source_prompt TEXT,
    generated_by UUID REFERENCES assistants(id),
    generation_metadata JSONB,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    -- Constraints
    CONSTRAINT chk_training_plans_title_not_empty CHECK (length(trim(title)) > 0),
    CONSTRAINT chk_training_plans_sport_not_empty CHECK (length(trim(sport)) > 0),
    CONSTRAINT chk_training_plans_date_order CHECK (start_date IS NULL OR end_date IS NULL OR start_date <= end_date),
    CONSTRAINT chk_training_plans_completion_percentage CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    CONSTRAINT chk_training_plans_duration_positive CHECK (duration_weeks IS NULL OR duration_weeks > 0)
);

-- Indexes for performance
CREATE INDEX idx_training_plans_coach_id ON training_plans(coach_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_training_plans_athlete_id ON training_plans(athlete_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_training_plans_status ON training_plans(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_training_plans_difficulty ON training_plans(difficulty) WHERE deleted_at IS NULL;
CREATE INDEX idx_training_plans_sport ON training_plans(sport) WHERE deleted_at IS NULL;
CREATE INDEX idx_training_plans_start_date ON training_plans(start_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_training_plans_generated_by ON training_plans(generated_by) WHERE deleted_at IS NULL;
CREATE INDEX idx_training_plans_deleted_at ON training_plans(deleted_at);

-- Composite indexes for common queries
CREATE INDEX idx_training_plans_athlete_status ON training_plans(athlete_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_training_plans_coach_status ON training_plans(coach_id, status) WHERE deleted_at IS NULL;

-- JSON indexes for plan content queries
CREATE INDEX idx_training_plans_plan_json_gin ON training_plans USING GIN(plan_json) WHERE deleted_at IS NULL;

-- Full-text search
ALTER TABLE training_plans ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(title, '') || ' ' ||
      coalesce(overview, '') || ' ' ||
      coalesce(sport, '') || ' ' ||
      coalesce(notes, '')
    )
  ) STORED;

CREATE INDEX idx_training_plans_search ON training_plans USING GIN(search_vector);