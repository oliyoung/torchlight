-- Enable RLS on coaches table
-- Migration: 20250603080002_rls_coaches.sql

-- =========================
-- Enable RLS on coaches table
-- =========================

ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;

-- =========================
-- Coaches table policies
-- =========================

-- Allow coaches to select their own record
CREATE POLICY select_own_coach ON coaches
FOR SELECT USING (user_id = auth.uid()::text);

-- Allow coaches to insert their own record (for registration)
CREATE POLICY insert_own_coach ON coaches
FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- Allow coaches to update their own record
CREATE POLICY update_own_coach ON coaches
FOR UPDATE USING (user_id = auth.uid()::text);

-- Allow coaches to delete their own record (soft delete)
CREATE POLICY delete_own_coach ON coaches
FOR DELETE USING (user_id = auth.uid()::text);

-- =========================
-- Comments for documentation
-- =========================

COMMENT ON POLICY select_own_coach ON coaches IS 'Allow coaches to select only their own coach record';
COMMENT ON POLICY insert_own_coach ON coaches IS 'Allow coaches to insert only their own coach record during registration';
COMMENT ON POLICY update_own_coach ON coaches IS 'Allow coaches to update only their own coach record';
COMMENT ON POLICY delete_own_coach ON coaches IS 'Allow coaches to delete only their own coach record';