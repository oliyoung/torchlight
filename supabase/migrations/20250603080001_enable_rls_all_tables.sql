-- Enable RLS on all main tables and create user scoping policies
-- Migration: 20250603080001_enable_rls_all_tables.sql

-- =========================
-- 1. Enable RLS on all tables
-- =========================

ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistants ENABLE ROW LEVEL SECURITY;

-- Join tables also need RLS
ALTER TABLE goal_session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plan_assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plan_goals ENABLE ROW LEVEL SECURITY;

-- =========================
-- 2. Athletes table policies
-- =========================

CREATE POLICY select_own_athletes ON athletes
FOR SELECT USING (coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid()::text));

CREATE POLICY insert_own_athletes ON athletes
FOR INSERT WITH CHECK (coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid()::text));

CREATE POLICY update_own_athletes ON athletes
FOR UPDATE USING (coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid()::text));

CREATE POLICY delete_own_athletes ON athletes
FOR DELETE USING (coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid()::text));

-- =========================
-- 3. Goals table policies
-- =========================

CREATE POLICY select_own_goals ON goals
FOR SELECT USING (coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid()::text));

CREATE POLICY insert_own_goals ON goals
FOR INSERT WITH CHECK (coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid()::text));

CREATE POLICY update_own_goals ON goals
FOR UPDATE USING (coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid()::text));

CREATE POLICY delete_own_goals ON goals
FOR DELETE USING (coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid()::text));

-- =========================
-- 4. Session logs table policies
-- =========================

CREATE POLICY select_own_session_logs ON session_logs
FOR SELECT USING (coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid()::text));

CREATE POLICY insert_own_session_logs ON session_logs
FOR INSERT WITH CHECK (coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid()::text));

CREATE POLICY update_own_session_logs ON session_logs
FOR UPDATE USING (coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid()::text));

CREATE POLICY delete_own_session_logs ON session_logs
FOR DELETE USING (coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid()::text));

-- =========================
-- 5. Training plans table policies
-- =========================

CREATE POLICY select_own_training_plans ON training_plans
FOR SELECT USING (coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid()::text));

CREATE POLICY insert_own_training_plans ON training_plans
FOR INSERT WITH CHECK (coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid()::text));

CREATE POLICY update_own_training_plans ON training_plans
FOR UPDATE USING (coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid()::text));

CREATE POLICY delete_own_training_plans ON training_plans
FOR DELETE USING (coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid()::text));

-- =========================
-- 6. Assistants table policies (global read access)
-- =========================

-- Assistants are globally available to all authenticated users
CREATE POLICY select_assistants ON assistants
FOR SELECT USING (auth.role() = 'authenticated');

-- Only allow system/admin to modify assistants (for now)
-- In the future, this could be expanded to allow coaches to create custom assistants

-- =========================
-- 7. Join table policies
-- =========================

-- Goal-SessionLog relationships: accessible if user owns the goal
CREATE POLICY select_own_goal_session_logs ON goal_session_logs
FOR SELECT USING (
  goal_id IN (
    SELECT id FROM goals
    WHERE coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid()::text)
  )
);

CREATE POLICY insert_own_goal_session_logs ON goal_session_logs
FOR INSERT WITH CHECK (
  goal_id IN (
    SELECT id FROM goals
    WHERE coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid()::text)
  )
);

CREATE POLICY update_own_goal_session_logs ON goal_session_logs
FOR UPDATE USING (
  goal_id IN (
    SELECT id FROM goals
    WHERE coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid()::text)
  )
);

CREATE POLICY delete_own_goal_session_logs ON goal_session_logs
FOR DELETE USING (
  goal_id IN (
    SELECT id FROM goals
    WHERE coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid()::text)
  )
);

-- Training Plan-Assistant relationships: accessible if user owns the training plan
CREATE POLICY select_own_training_plan_assistants ON training_plan_assistants
FOR SELECT USING (
  training_plan_id IN (
    SELECT id FROM training_plans
    WHERE coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid()::text)
  )
);

CREATE POLICY insert_own_training_plan_assistants ON training_plan_assistants
FOR INSERT WITH CHECK (
  training_plan_id IN (
    SELECT id FROM training_plans
    WHERE coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid()::text)
  )
);

CREATE POLICY update_own_training_plan_assistants ON training_plan_assistants
FOR UPDATE USING (
  training_plan_id IN (
    SELECT id FROM training_plans
    WHERE coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid()::text)
  )
);

CREATE POLICY delete_own_training_plan_assistants ON training_plan_assistants
FOR DELETE USING (
  training_plan_id IN (
    SELECT id FROM training_plans
    WHERE coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid()::text)
  )
);

-- Training Plan-Goal relationships: accessible if user owns the training plan
CREATE POLICY select_own_training_plan_goals ON training_plan_goals
FOR SELECT USING (
  training_plan_id IN (
    SELECT id FROM training_plans
    WHERE coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid()::text)
  )
);

CREATE POLICY insert_own_training_plan_goals ON training_plan_goals
FOR INSERT WITH CHECK (
  training_plan_id IN (
    SELECT id FROM training_plans
    WHERE coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid()::text)
  )
);

CREATE POLICY update_own_training_plan_goals ON training_plan_goals
FOR UPDATE USING (
  training_plan_id IN (
    SELECT id FROM training_plans
    WHERE coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid()::text)
  )
);

CREATE POLICY delete_own_training_plan_goals ON training_plan_goals
FOR DELETE USING (
  training_plan_id IN (
    SELECT id FROM training_plans
    WHERE coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid()::text)
  )
);

-- =========================
-- 8. Comments for documentation
-- =========================

COMMENT ON POLICY select_own_athletes ON athletes IS 'Allow coaches to select only their own athletes';
COMMENT ON POLICY select_own_goals ON goals IS 'Allow coaches to select only goals for their athletes';
COMMENT ON POLICY select_own_session_logs ON session_logs IS 'Allow coaches to select only session logs for their athletes';
COMMENT ON POLICY select_own_training_plans ON training_plans IS 'Allow coaches to select only their own training plans';
COMMENT ON POLICY select_assistants ON assistants IS 'Allow all authenticated users to view assistants (global resources)';