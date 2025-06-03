CREATE TABLE training_plans (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    athlete_id INTEGER NOT NULL REFERENCES athletes(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    start_date VARCHAR(255),
    end_date VARCHAR(255),
    notes VARCHAR(255),
    plan_json JSONB,
    overview VARCHAR(255),
    source_prompt VARCHAR(255),
    generated_by VARCHAR(255),
    status_id VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    deleted_at TIMESTAMP
);