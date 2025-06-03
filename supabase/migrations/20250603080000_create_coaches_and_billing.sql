-- Create coaches and coach billing tables
-- Migration: 20250603070000_create_coaches_and_billing.sql

-- =========================
-- 1. Coach Table
-- =========================

-- Coaches table (main user entities)
CREATE TABLE coaches (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL, -- Supabase auth user UUID
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    display_name VARCHAR(255), -- Computed or custom display name
    avatar VARCHAR(512), -- Profile picture URL
    timezone VARCHAR(100) DEFAULT 'UTC',

    -- Account management
    account_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, SUSPENDED, BANNED, PENDING_VERIFICATION, INCOMPLETE
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at TIMESTAMP,

    -- Standard timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP -- Soft delete timestamp
);

-- Create indexes for efficient querying
CREATE INDEX idx_coaches_user_id ON coaches(user_id);
CREATE INDEX idx_coaches_email ON coaches(email);
CREATE INDEX idx_coaches_deleted_at ON coaches(deleted_at);
CREATE INDEX idx_coaches_account_status ON coaches(account_status);

-- =========================
-- 2. Coach Billing Table
-- =========================

CREATE TABLE coach_billing (
    id SERIAL PRIMARY KEY,
    coach_id INTEGER UNIQUE NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,

    -- Stripe integration
    stripe_customer_id VARCHAR(255), -- Stripe customer ID
    subscription_status VARCHAR(50) NOT NULL DEFAULT 'TRIAL', -- TRIAL, ACTIVE, PAST_DUE, CANCELED, UNPAID, INCOMPLETE, INCOMPLETE_EXPIRED, PAUSED
    subscription_tier VARCHAR(50) NOT NULL DEFAULT 'FREE', -- FREE, STARTER, PROFESSIONAL, ENTERPRISE
    subscription_start_date TIMESTAMP,
    subscription_end_date TIMESTAMP,
    trial_end_date TIMESTAMP,
    billing_email VARCHAR(255),

    -- Usage tracking and limits
    monthly_athlete_limit INTEGER NOT NULL DEFAULT 5,
    current_athlete_count INTEGER NOT NULL DEFAULT 0,
    monthly_session_log_limit INTEGER NOT NULL DEFAULT 50,
    current_session_log_count INTEGER NOT NULL DEFAULT 0,
    ai_credits_remaining INTEGER DEFAULT 100,
    usage_reset_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Billing metadata
    last_payment_date TIMESTAMP,
    next_billing_date TIMESTAMP,
    billing_cycle_day INTEGER DEFAULT 1, -- Day of month for billing (1-28)
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create indexes for efficient querying
CREATE INDEX idx_coach_billing_coach_id ON coach_billing(coach_id);
CREATE INDEX idx_coach_billing_stripe_customer_id ON coach_billing(stripe_customer_id);
CREATE INDEX idx_coach_billing_subscription_status ON coach_billing(subscription_status);
CREATE INDEX idx_coach_billing_subscription_tier ON coach_billing(subscription_tier);
CREATE INDEX idx_coach_billing_deleted_at ON coach_billing(deleted_at);

-- =========================
-- 3. Constraints and Comments
-- =========================

-- Add check constraints for enum values
ALTER TABLE coaches
ADD CONSTRAINT chk_coaches_account_status
CHECK (account_status IN ('ACTIVE', 'SUSPENDED', 'BANNED', 'PENDING_VERIFICATION', 'INCOMPLETE'));

ALTER TABLE coach_billing
ADD CONSTRAINT chk_subscription_status
CHECK (subscription_status IN ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'UNPAID', 'INCOMPLETE', 'INCOMPLETE_EXPIRED', 'PAUSED'));

ALTER TABLE coach_billing
ADD CONSTRAINT chk_subscription_tier
CHECK (subscription_tier IN ('FREE', 'STARTER', 'PROFESSIONAL'));

ALTER TABLE coach_billing
ADD CONSTRAINT chk_billing_cycle_day
CHECK (billing_cycle_day BETWEEN 1 AND 28);

ALTER TABLE coach_billing
ADD CONSTRAINT chk_usage_limits_positive
CHECK (monthly_athlete_limit >= 0 AND current_athlete_count >= 0 AND monthly_session_log_limit >= 0 AND current_session_log_count >= 0);

-- Add helpful comments
COMMENT ON TABLE coaches IS 'Coach entities representing authenticated users who own athletes and training data';
COMMENT ON COLUMN coaches.user_id IS 'References Supabase auth user UUID';
COMMENT ON COLUMN coaches.display_name IS 'Computed or custom display name for the coach';
COMMENT ON COLUMN coaches.account_status IS 'Current status of the coach account';
COMMENT ON COLUMN coaches.onboarding_completed IS 'Whether initial setup is done';

COMMENT ON TABLE coach_billing IS 'Billing and subscription management for coaches, integrated with Stripe';
COMMENT ON COLUMN coach_billing.coach_id IS 'Foreign key to coaches table';
COMMENT ON COLUMN coach_billing.stripe_customer_id IS 'Stripe customer ID for payment processing';
COMMENT ON COLUMN coach_billing.subscription_status IS 'Current state of the billing subscription';
COMMENT ON COLUMN coach_billing.subscription_tier IS 'Current plan level and feature access';
COMMENT ON COLUMN coach_billing.monthly_athlete_limit IS 'Maximum athletes allowed per month for this tier';
COMMENT ON COLUMN coach_billing.current_athlete_count IS 'Current number of active athletes';
COMMENT ON COLUMN coach_billing.ai_credits_remaining IS 'AI feature usage credits remaining';
COMMENT ON COLUMN coach_billing.billing_cycle_day IS 'Day of month for billing (1-28)';

-- =========================
-- 4. Triggers for updated_at
-- =========================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_coaches_updated_at
    BEFORE UPDATE ON coaches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coach_billing_updated_at
    BEFORE UPDATE ON coach_billing
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();