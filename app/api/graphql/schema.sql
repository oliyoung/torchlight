-- Drop tables if they exist
DROP TABLE IF EXISTS ai_metadata;
DROP TABLE IF EXISTS session_logs;
DROP TABLE IF EXISTS goals;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS training_plans;

-- Create table for Clients
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    tags TEXT[] NOT NULL,
    notes TEXT,
    birthday VARCHAR(255) NOT NULL,
    gender VARCHAR(50),
    fitness_level VARCHAR(50),
    training_history TEXT,
    height FLOAT,
    weight FLOAT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create table for Goals
CREATE TABLE goals (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    due_date TIMESTAMP,
    progress_notes TEXT
);

-- Create table for SessionLogs
CREATE TABLE session_logs (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL,
    date TIMESTAMP NOT NULL,
    notes TEXT,
    transcript TEXT,
    summary TEXT,
    action_items TEXT[],
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create table for AIMetadata
CREATE TABLE ai_metadata (
    session_log_id INTEGER PRIMARY KEY,
    summary_generated BOOLEAN NOT NULL,
    next_steps_generated BOOLEAN NOT NULL
);

-- Create table for TrainingPlans
CREATE TABLE training_plans (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    title VARCHAR(255) NOT NULL,
    overview TEXT,
    plan_json JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    generated_by VARCHAR(255),
    source_prompt TEXT
);

-- Add foreign key constraints
ALTER TABLE goals
ADD CONSTRAINT fk_client
FOREIGN KEY (client_id) REFERENCES clients(id);

ALTER TABLE session_logs
ADD CONSTRAINT fk_client
FOREIGN KEY (client_id) REFERENCES clients(id);

ALTER TABLE ai_metadata
ADD CONSTRAINT fk_session_log
FOREIGN KEY (session_log_id) REFERENCES session_logs(id);