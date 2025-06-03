DROP TABLE IF EXISTS goals CASCADE;
-- Goal table
CREATE TABLE goals (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    athlete_id INTEGER NOT NULL REFERENCES athletes(id),
    title VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    status_id VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    due_date TIMESTAMP,
    progress_notes VARCHAR(255),
    sport VARCHAR(255),
    evaluation_response JSONB
);

