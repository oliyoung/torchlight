-- Add coach role field to support different coaching modes
-- Migration: 20250622000000_add_coach_role.sql

-- =========================
-- 1. Add coach role enum type
-- =========================

-- Create enum type for coach roles
CREATE TYPE coach_role AS ENUM (
    'PROFESSIONAL',  -- Professional coach - unlimited athletes, full features
    'PERSONAL',      -- Personal coach (parent) - up to 3 athletes, simplified UI  
    'SELF'           -- Self-coached athlete - 1 athlete (themselves), personal dashboard
);

-- =========================
-- 2. Add role column to coaches table
-- =========================

-- Add role column with default PROFESSIONAL for existing coaches
ALTER TABLE coaches 
ADD COLUMN role coach_role NOT NULL DEFAULT 'PROFESSIONAL';

-- Create index for efficient role-based queries
CREATE INDEX idx_coaches_role ON coaches(role);

-- =========================
-- 3. Update billing limits based on role
-- =========================

-- Function to set athlete limits based on coach role
-- Values correspond to COACH_ROLE_CONFIG constants in lib/utils/coach-role-limits.ts
CREATE OR REPLACE FUNCTION set_athlete_limits_by_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Update billing limits based on role
    UPDATE coach_billing 
    SET monthly_athlete_limit = CASE 
        WHEN NEW.role = 'PROFESSIONAL' THEN 999999  -- Matches COACH_ROLE_CONFIG.PROFESSIONAL.maxAthletes (Number.MAX_SAFE_INTEGER)
        WHEN NEW.role = 'PERSONAL' THEN 3           -- Matches COACH_ROLE_CONFIG.PERSONAL.maxAthletes
        WHEN NEW.role = 'SELF' THEN 1               -- Matches COACH_ROLE_CONFIG.SELF.maxAthletes
        ELSE monthly_athlete_limit                  -- Keep existing for unknown
    END
    WHERE coach_id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update limits when role changes
CREATE TRIGGER update_athlete_limits_on_role_change
    AFTER INSERT OR UPDATE OF role ON coaches
    FOR EACH ROW
    EXECUTE FUNCTION set_athlete_limits_by_role();

-- =========================
-- 4. Update existing coach billing limits
-- =========================

-- Update existing coaches to have appropriate limits based on default PROFESSIONAL role
UPDATE coach_billing 
SET monthly_athlete_limit = 999999
WHERE coach_id IN (SELECT id FROM coaches WHERE role = 'PROFESSIONAL');

-- =========================
-- 5. Add helpful comments
-- =========================

COMMENT ON COLUMN coaches.role IS 'Coach role determining UI mode and athlete limits: PROFESSIONAL (unlimited), PERSONAL (max 3), SELF (max 1)';
COMMENT ON TYPE coach_role IS 'Enum defining coach role types for different coaching modes and athlete limits';