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