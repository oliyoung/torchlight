-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE assistants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    sport VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    strengths TEXT[] NOT NULL,
    bio TEXT NOT NULL,
    prompt_template TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    -- Constraints
    CONSTRAINT chk_assistants_name_not_empty CHECK (length(trim(name)) > 0),
    CONSTRAINT chk_assistants_sport_not_empty CHECK (length(trim(sport)) > 0),
    CONSTRAINT chk_assistants_role_not_empty CHECK (length(trim(role)) > 0),
    CONSTRAINT chk_assistants_strengths_not_empty CHECK (array_length(strengths, 1) > 0)
);

-- Indexes for performance
CREATE INDEX idx_assistants_sport ON assistants(sport) WHERE deleted_at IS NULL;
CREATE INDEX idx_assistants_role ON assistants(role) WHERE deleted_at IS NULL;
CREATE INDEX idx_assistants_deleted_at ON assistants(deleted_at);

-- Full-text search
ALTER TABLE assistants ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(name, '') || ' ' ||
      coalesce(sport, '') || ' ' ||
      coalesce(role, '') || ' ' ||
      coalesce(bio, '')
    )
  ) STORED;

CREATE INDEX idx_assistants_search ON assistants USING GIN(search_vector);
