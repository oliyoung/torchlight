-- Schema Definitions

-- Athletes Table
CREATE TABLE IF NOT EXISTS athletes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  sport TEXT NOT NULL,
  tags TEXT[],
  notes TEXT,
  birthday DATE,
  gender TEXT,
  fitness_level TEXT,
  training_history TEXT,
  height FLOAT,
  weight FLOAT,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Goals Table
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES athletes(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  due_date DATE,
  progress_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Session Logs Table
CREATE TABLE IF NOT EXISTS session_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES athletes(id),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  transcript TEXT,
  summary TEXT,
  action_items TEXT[],
  ai_metadata JSONB,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Training Plans Table
CREATE TABLE IF NOT EXISTS training_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  overview TEXT,
  athlete_id UUID REFERENCES athletes(id),
  plan_json JSONB NOT NULL,
  source_prompt TEXT,
  generated_by TEXT,
  frequency TEXT,
  duration TEXT,
  summary TEXT,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Goal Session Logs Junction Table
CREATE TABLE IF NOT EXISTS goal_session_logs (
  goal_id UUID REFERENCES goals(id),
  session_log_id UUID REFERENCES session_logs(id),
  PRIMARY KEY (goal_id, session_log_id)
);

-- Training Plan Assistants Junction Table
CREATE TABLE IF NOT EXISTS training_plan_assistants (
  training_plan_id UUID REFERENCES training_plans(id),
  assistant_id UUID,
  PRIMARY KEY (training_plan_id, assistant_id)
);

-- Training Plan Goals Junction Table
CREATE TABLE IF NOT EXISTS training_plan_goals (
  training_plan_id UUID REFERENCES training_plans(id),
  goal_id UUID REFERENCES goals(id),
  PRIMARY KEY (training_plan_id, goal_id)
);

-- Fixture Data

-- Insert Athletes
INSERT INTO athletes (first_name, last_name, email, sport, tags, notes, birthday, gender, fitness_level, training_history, height, weight)
VALUES
('Alex', 'Smith', 'alex.smith@example.com', 'basketball', ARRAY['basketball', 'youth'], 'Youth basketball player', '2013-05-10', 'Male', 'Beginner', 'None', 140.0, 40.0),
('Jamie', 'Johnson', 'jamie.johnson@example.com', 'basketball', ARRAY['basketball', 'youth'], 'Youth basketball player', '2012-08-15', 'Female', 'Beginner', 'None', 145.0, 42.0),
('Chris', 'Lee', 'chris.lee@example.com', 'basketball', ARRAY['basketball', 'youth'], 'Youth basketball player', '2011-03-22', 'Male', 'Intermediate', '1 year', 150.0, 45.0),
('Taylor', 'Brown', 'taylor.brown@example.com', 'basketball', ARRAY['basketball', 'youth'], 'Youth basketball player', '2010-11-30', 'Female', 'Intermediate', '2 years', 155.0, 48.0),
('Jordan', 'Davis', 'jordan.davis@example.com', 'basketball', ARRAY['basketball', 'youth'], 'Youth basketball player', '2013-01-05', 'Male', 'Beginner', 'None', 135.0, 38.0),
('Morgan', 'Wilson', 'morgan.wilson@example.com', 'basketball', ARRAY['basketball', 'youth'], 'Youth basketball player', '2012-06-18', 'Female', 'Beginner', 'None', 142.0, 41.0),
('Casey', 'Moore', 'casey.moore@example.com', 'basketball', ARRAY['basketball', 'youth'], 'Youth basketball player', '2011-09-25', 'Male', 'Intermediate', '1 year', 148.0, 44.0),
('Riley', 'Taylor', 'riley.taylor@example.com', 'basketball', ARRAY['basketball', 'youth'], 'Youth basketball player', '2010-04-12', 'Female', 'Intermediate', '2 years', 153.0, 47.0),
('Drew', 'Anderson', 'drew.anderson@example.com', 'basketball', ARRAY['basketball', 'youth'], 'Youth basketball player', '2013-07-19', 'Male', 'Beginner', 'None', 138.0, 39.0),
('Peyton', 'Thomas', 'peyton.thomas@example.com', 'basketball', ARRAY['basketball', 'youth'], 'Youth basketball player', '2012-02-28', 'Female', 'Beginner', 'None', 144.0, 43.0);

-- Insert Goals
INSERT INTO goals (athlete_id, title, description, status, due_date, progress_notes)
VALUES
(1, 'Improve Dribbling Skills', 'Focus on ball control and speed', 'ACTIVE', '2024-06-01', 'Showing improvement in dribbling'),
(2, 'Increase Shooting Accuracy', 'Practice shooting from various distances', 'ACTIVE', '2024-06-01', 'Practicing daily'),
(3, 'Enhance Defensive Skills', 'Improve positioning and reaction time', 'ACTIVE', '2024-06-01', 'Better defensive awareness'),
(4, 'Develop Passing Techniques', 'Work on precision and timing', 'ACTIVE', '2024-06-01', 'Improved passing accuracy'),
(5, 'Boost Stamina', 'Increase endurance for longer play', 'ACTIVE', '2024-06-01', 'Running drills regularly'),
(6, 'Improve Free Throw Percentage', 'Focus on consistency and form', 'ACTIVE', '2024-06-01', 'Practicing free throws'),
(7, 'Enhance Agility', 'Work on quick footwork and agility', 'ACTIVE', '2024-06-01', 'Agility drills showing results'),
(8, 'Refine Shooting Form', 'Focus on technique and follow-through', 'ACTIVE', '2024-06-01', 'Better shooting form'),
(9, 'Increase Vertical Jump', 'Work on leg strength and jumping technique', 'ACTIVE', '2024-06-01', 'Jumping exercises daily'),
(10, 'Improve Team Play', 'Enhance communication and teamwork', 'ACTIVE', '2024-06-01', 'Better team coordination');

-- Insert Session Logs
INSERT INTO session_logs (athlete_id, date, notes, transcript, summary, action_items)
VALUES
(1, '2023-10-01', 'Focused on dribbling drills', 'Dribbling practice session', 'Improved control', ARRAY['Practice dribbling daily']),
(2, '2023-10-02', 'Shooting drills and accuracy', 'Shooting practice session', 'Better accuracy', ARRAY['Shoot 100 baskets daily']),
(3, '2023-10-03', 'Defensive skills training', 'Defense practice', 'Better positioning', ARRAY['Watch defensive videos']),
(4, '2023-10-04', 'Passing drills and technique', 'Passing practice session', 'Improved passing', ARRAY['Practice passing with a partner']),
(5, '2023-10-05', 'Stamina building exercises', 'Endurance training', 'Increased stamina', ARRAY['Run 2 miles daily']),
(6, '2023-10-06', 'Free throw practice', 'Free throw session', 'Better consistency', ARRAY['Shoot 50 free throws daily']),
(7, '2023-10-07', 'Agility and footwork drills', 'Agility session', 'Improved agility', ARRAY['Footwork drills daily']),
(8, '2023-10-08', 'Shooting form refinement', 'Shooting technique session', 'Better form', ARRAY['Focus on shooting form']),
(9, '2023-10-09', 'Vertical jump exercises', 'Jump training', 'Higher jumps', ARRAY['Jumping exercises daily']),
(10, '2023-10-10', 'Team play and communication', 'Team practice session', 'Better teamwork', ARRAY['Communicate during practice']);