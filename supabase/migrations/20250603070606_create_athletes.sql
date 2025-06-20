CREATE TABLE athletes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,

    -- Personal Information
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    birthday DATE,
    gender VARCHAR(50),

    -- Emergency Contact
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),

    -- Physical Information
    height DECIMAL(5,2), -- in cm
    weight DECIMAL(5,2), -- in kg

    -- Training Information
    sport VARCHAR(255) NOT NULL,
    fitness_level VARCHAR(50),
    training_history TEXT,
    goals_summary TEXT,
    preferred_training_time TIME,
    availability JSONB, -- Store weekly availability

    -- Medical Information
    medical_conditions TEXT,
    injuries TEXT,

    -- Metadata
    tags TEXT[] NOT NULL DEFAULT '{}',
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    -- Constraints
    CONSTRAINT chk_athletes_name_not_empty CHECK (length(trim(first_name)) > 0 AND length(trim(last_name)) > 0),
    CONSTRAINT chk_athletes_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_athletes_height_positive CHECK (height IS NULL OR height > 0),
    CONSTRAINT chk_athletes_weight_positive CHECK (weight IS NULL OR weight > 0),
    CONSTRAINT chk_athletes_sport_not_empty CHECK (length(trim(sport)) > 0),
    CONSTRAINT chk_athletes_fitness_level CHECK (fitness_level IS NULL OR fitness_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE')),
    CONSTRAINT chk_athletes_gender CHECK (gender IS NULL OR gender IN ('MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY'))
);

-- Indexes for performance
CREATE INDEX idx_athletes_coach_id ON athletes(coach_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_athletes_sport ON athletes(sport) WHERE deleted_at IS NULL;
CREATE INDEX idx_athletes_email ON athletes(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_athletes_deleted_at ON athletes(deleted_at);
CREATE INDEX idx_athletes_birthday ON athletes(birthday) WHERE deleted_at IS NULL;

-- Full-text search
ALTER TABLE athletes ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(first_name, '') || ' ' ||
      coalesce(last_name, '') || ' ' ||
      coalesce(email, '') || ' ' ||
      coalesce(sport, '') || ' ' ||
      coalesce(notes, '')
    )
  ) STORED;

CREATE INDEX idx_athletes_search ON athletes USING GIN(search_vector);