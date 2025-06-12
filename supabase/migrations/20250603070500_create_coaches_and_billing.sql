-- Create coaches and coach billing tables
-- Migration: 20250603070000_create_coaches_and_billing.sql

-- =========================
-- 1. Coach Table
-- =========================

-- Coaches table (main user entities)
CREATE TABLE coaches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) UNIQUE NOT NULL, -- Supabase auth user UUID
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    display_name VARCHAR(255), -- Computed or custom display name
    avatar VARCHAR(512), -- Profile picture URL
    timezone VARCHAR(100) DEFAULT 'UTC',

    -- Contact Information
    phone VARCHAR(20),
    bio TEXT,
    specializations TEXT[],
    certifications TEXT[],

    -- Professional Information
    years_experience INTEGER,
    coaching_philosophy TEXT,

    -- Account management
    account_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, SUSPENDED, BANNED, PENDING_VERIFICATION, INCOMPLETE
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at TIMESTAMP,

    -- Preferences
    preferred_language VARCHAR(10) DEFAULT 'en',
    notification_preferences JSONB DEFAULT '{}',

    -- Standard timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP, -- Soft delete timestamp

    -- Constraints
    CONSTRAINT chk_coaches_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_coaches_user_id_format CHECK (user_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
    CONSTRAINT chk_coaches_years_experience_positive CHECK (years_experience IS NULL OR years_experience >= 0),
    CONSTRAINT chk_coaches_timezone_not_empty CHECK (length(trim(timezone)) > 0)
);

-- Create indexes for efficient querying
CREATE INDEX idx_coaches_user_id ON coaches(user_id);
CREATE INDEX idx_coaches_email ON coaches(email);
CREATE INDEX idx_coaches_deleted_at ON coaches(deleted_at);
CREATE INDEX idx_coaches_account_status ON coaches(account_status);
CREATE INDEX idx_coaches_onboarding_completed ON coaches(onboarding_completed);
CREATE INDEX idx_coaches_last_login_at ON coaches(last_login_at) WHERE deleted_at IS NULL;

-- Full-text search for coaches
ALTER TABLE coaches ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(first_name, '') || ' ' ||
      coalesce(last_name, '') || ' ' ||
      coalesce(display_name, '') || ' ' ||
      coalesce(email, '') || ' ' ||
      coalesce(bio, '')
    )
  ) STORED;

CREATE INDEX idx_coaches_search ON coaches USING GIN(search_vector);

-- =========================
-- 2. Coach Billing Table
-- =========================

CREATE TABLE coach_billing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coach_id UUID UNIQUE NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,

    -- Stripe integration
    stripe_customer_id VARCHAR(255) UNIQUE, -- Stripe customer ID
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

    -- Payment history
    total_payments_made INTEGER DEFAULT 0,
    total_amount_paid DECIMAL(10,2) DEFAULT 0,

    -- Billing preferences
    auto_renew BOOLEAN DEFAULT TRUE,
    payment_method_type VARCHAR(50), -- 'card', 'bank_transfer', etc.

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    -- Constraints
    CONSTRAINT chk_billing_email_format CHECK (billing_email IS NULL OR billing_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_usage_limits_positive CHECK (
      monthly_athlete_limit >= 0 AND
      current_athlete_count >= 0 AND
      monthly_session_log_limit >= 0 AND
      current_session_log_count >= 0
    ),
    CONSTRAINT chk_usage_within_limits CHECK (
      current_athlete_count <= monthly_athlete_limit AND
      current_session_log_count <= monthly_session_log_limit
    ),
    CONSTRAINT chk_ai_credits_non_negative CHECK (ai_credits_remaining >= 0),
    CONSTRAINT chk_total_payments_non_negative CHECK (total_payments_made >= 0 AND total_amount_paid >= 0),
    CONSTRAINT chk_subscription_dates CHECK (
      subscription_start_date IS NULL OR
      subscription_end_date IS NULL OR
      subscription_start_date <= subscription_end_date
    )
);

-- Create indexes for efficient querying
CREATE INDEX idx_coach_billing_coach_id ON coach_billing(coach_id);
CREATE INDEX idx_coach_billing_stripe_customer_id ON coach_billing(stripe_customer_id);
CREATE INDEX idx_coach_billing_subscription_status ON coach_billing(subscription_status);
CREATE INDEX idx_coach_billing_subscription_tier ON coach_billing(subscription_tier);
CREATE INDEX idx_coach_billing_deleted_at ON coach_billing(deleted_at);
CREATE INDEX idx_coach_billing_next_billing_date ON coach_billing(next_billing_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_coach_billing_trial_end_date ON coach_billing(trial_end_date) WHERE deleted_at IS NULL;

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
CHECK (subscription_tier IN ('FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'));

ALTER TABLE coach_billing
ADD CONSTRAINT chk_billing_cycle_day
CHECK (billing_cycle_day BETWEEN 1 AND 28);

ALTER TABLE coach_billing
ADD CONSTRAINT chk_currency_code
CHECK (currency IN ('USD', 'EUR', 'GBP', 'CAD', 'AUD'));

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