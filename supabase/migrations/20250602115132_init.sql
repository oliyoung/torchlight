-- Drop tables if they exist (drop join tables first to avoid FK errors)
DROP TABLE IF EXISTS training_plan_session_logs CASCADE;
DROP TABLE IF EXISTS training_plan_goals CASCADE;
DROP TABLE IF EXISTS training_plan_assistants CASCADE;
DROP TABLE IF EXISTS goal_session_logs CASCADE;
DROP TABLE IF EXISTS ai_metadata CASCADE;
DROP TABLE IF EXISTS training_plans CASCADE;
DROP TABLE IF EXISTS session_logs CASCADE;
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS athletes CASCADE;
DROP TABLE IF EXISTS assistants CASCADE;
DROP TABLE IF EXISTS coach_billing CASCADE;
DROP TABLE IF EXISTS coaches CASCADE;

-- =========================
-- 1. Base Tables
-- =========================

-- Coach table
CREATE TABLE coaches (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    display_name VARCHAR(255),
    avatar VARCHAR(255),
    timezone VARCHAR(255) DEFAULT 'UTC',
    account_status_id VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    billing_id INTEGER REFERENCES coach_billing(id)
);

-- CoachBilling table
CREATE TABLE coach_billing (
    id SERIAL PRIMARY KEY,
    coach_id INTEGER UNIQUE NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(255),
    subscription_status_id VARCHAR(50) NOT NULL DEFAULT 'TRIAL',
    subscription_tier_id VARCHAR(50) NOT NULL DEFAULT 'FREE',
    subscription_start_date TIMESTAMP,
    subscription_end_date TIMESTAMP,
    trial_end_date TIMESTAMP,
    billing_email VARCHAR(255),
    monthly_athlete_limit INTEGER NOT NULL,
    current_athlete_count INTEGER NOT NULL,
    monthly_session_log_limit INTEGER NOT NULL,
    current_session_log_count INTEGER NOT NULL,
    ai_credits_remaining INTEGER,
    usage_reset_date TIMESTAMP NOT NULL,
    last_payment_date TIMESTAMP,
    next_billing_date TIMESTAMP,
    billing_cycle_day INTEGER,
    currency VARCHAR(255) NOT NULL DEFAULT 'USD',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Assistant table
CREATE TABLE assistants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sport VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    strengths TEXT[] NOT NULL,
    bio VARCHAR(255) NOT NULL,
    prompt_template VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Athlete table
CREATE TABLE athletes (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    birthday VARCHAR(255),
    gender VARCHAR(255),
    fitness_level VARCHAR(255),
    training_history VARCHAR(255),
    height FLOAT,
    weight FLOAT,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    tags TEXT[] NOT NULL,
    notes VARCHAR(255),
    sport VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

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

-- SessionLog table
CREATE TABLE session_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    athlete_id INTEGER NOT NULL REFERENCES athletes(id),
    date TIMESTAMP NOT NULL,
    notes VARCHAR(255),
    transcript VARCHAR(255),
    summary VARCHAR(255),
    action_items TEXT[] NOT NULL,
    ai_metadata_id INTEGER REFERENCES ai_metadata(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- TrainingPlan table
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

-- AIMetadata table
CREATE TABLE ai_metadata (
    session_log_id INTEGER PRIMARY KEY REFERENCES session_logs(id) ON DELETE CASCADE,
    summary_generated BOOLEAN NOT NULL DEFAULT FALSE,
    next_steps_generated BOOLEAN NOT NULL DEFAULT FALSE
);

-- =========================
-- 2. Join Tables (many-to-many)
-- =========================

-- Join table: goal_session_logs (many-to-many)
CREATE TABLE goal_session_logs (
    goal_id INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    session_log_id INTEGER NOT NULL REFERENCES session_logs(id) ON DELETE CASCADE,
    PRIMARY KEY (goal_id, session_log_id)
);

-- Join table: training_plan_assistants (many-to-many)
CREATE TABLE training_plan_assistants (
    training_plan_id INTEGER NOT NULL REFERENCES training_plans(id) ON DELETE CASCADE,
    assistant_id INTEGER NOT NULL REFERENCES assistants(id) ON DELETE CASCADE,
    PRIMARY KEY (training_plan_id, assistant_id)
);

-- Join table: training_plan_goals (many-to-many)
CREATE TABLE training_plan_goals (
    training_plan_id INTEGER NOT NULL REFERENCES training_plans(id) ON DELETE CASCADE,
    goal_id INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    PRIMARY KEY (training_plan_id, goal_id)
);

-- Join table: training_plan_session_logs (many-to-many)
CREATE TABLE training_plan_session_logs (
    training_plan_id INTEGER NOT NULL REFERENCES training_plans(id) ON DELETE CASCADE,
    session_log_id INTEGER NOT NULL REFERENCES session_logs(id) ON DELETE CASCADE,
    PRIMARY KEY (training_plan_id, session_log_id)
);