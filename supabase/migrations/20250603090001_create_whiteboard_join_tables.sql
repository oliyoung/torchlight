-- Join table for whiteboards and athletes (many-to-many)
-- Allows whiteboards to be shared with specific athletes
CREATE TABLE whiteboard_athletes (
    id SERIAL PRIMARY KEY,
    whiteboard_id INTEGER NOT NULL REFERENCES whiteboards(id) ON DELETE CASCADE,
    athlete_id INTEGER NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(whiteboard_id, athlete_id) -- Prevent duplicate associations
);

-- Join table for whiteboards and training plans (many-to-many)
-- Allows whiteboards to be included in training plans
CREATE TABLE whiteboard_training_plans (
    id SERIAL PRIMARY KEY,
    whiteboard_id INTEGER NOT NULL REFERENCES whiteboards(id) ON DELETE CASCADE,
    training_plan_id INTEGER NOT NULL REFERENCES training_plans(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(whiteboard_id, training_plan_id) -- Prevent duplicate associations
);

-- Create indexes for performance
CREATE INDEX idx_whiteboard_athletes_whiteboard_id ON whiteboard_athletes(whiteboard_id);
CREATE INDEX idx_whiteboard_athletes_athlete_id ON whiteboard_athletes(athlete_id);

CREATE INDEX idx_whiteboard_training_plans_whiteboard_id ON whiteboard_training_plans(whiteboard_id);
CREATE INDEX idx_whiteboard_training_plans_training_plan_id ON whiteboard_training_plans(training_plan_id);