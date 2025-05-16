-- Drop tables if they exist (drop join tables first to avoid FK errors)
DROP TABLE IF EXISTS training_plan_session_logs;
DROP TABLE IF EXISTS training_plan_goals;
DROP TABLE IF EXISTS training_plan_assistants;
DROP TABLE IF EXISTS goal_session_logs;
DROP TABLE IF EXISTS ai_metadata;
DROP TABLE IF EXISTS session_logs;
DROP TABLE IF EXISTS goals;
DROP TABLE IF EXISTS assistants;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS training_plans;

-- Assistants table
CREATE TABLE assistants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sport VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    strengths TEXT[] NOT NULL,
    bio TEXT NOT NULL,
    prompt_template TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Fixture data for assistants (basketball)
INSERT INTO assistants (id, name, sport, role, strengths, bio, prompt_template, created_at, updated_at) VALUES
(1, 'Coach Maverick', 'Basketball', 'Guard', ARRAY['Ball Handling', 'Basketball IQ', 'Pick-and-Roll Execution'], 'A seasoned floor general who teaches guards how to read defenses, run plays, and lead the offense with precision.', 'Create a 1-week training plan to enhance {goal} for a basketball guard. Focus on ball handling and decision-making under pressure.', NOW(), NOW()),
(2, 'Coach Titan', 'Basketball', 'Center', ARRAY['Rim Protection', 'Post Defense', 'Shot Blocking'], 'A defensive anchor with a focus on timing, footwork, and paint dominance. Teaches how to protect the rim without fouling.', 'Design a training schedule to boost rim protection skills for a basketball center. Include shot-blocking drills and positioning strategies.', NOW(), NOW()),
(3, 'Coach Blaze', 'Basketball', 'Wing', ARRAY['Shooting', 'Off-Ball Movement', 'Shot Creation'], 'An offensive specialist who trains players to create space, move without the ball, and become lethal from the perimeter.', 'Build a custom training routine to improve shooting consistency and off-ball awareness for a basketball wing.', NOW(), NOW()),
(4, 'Coach Nova', 'Basketball', 'Forward', ARRAY['Transition Offense', 'Finishing', 'Athleticism'], 'Brings explosive energy and speed-focused drills to enhance fast breaks, driving lanes, and above-the-rim finishes.', 'Develop a 5-day plan for boosting transition scoring and finishing at the rim for an athletic forward.', NOW(), NOW()),
(5, 'Coach Ice', 'Basketball', 'Guard', ARRAY['Clutch Performance', 'Free Throws', 'End-of-Game Execution'], NULL, 'Outline a training strategy to build composure and efficiency in clutch moments for a basketball guard.', NOW(), NOW()),
(6, 'Coach Atlas', 'Basketball', 'Center', ARRAY['Rebounding', 'Strength Training', 'Box Out Fundamentals'], 'A physicality-first coach who teaches players to control the glass with technique, strength, and hustle.', 'Craft a strength-focused training plan that emphasizes rebounding technique and box-out fundamentals.', NOW(), NOW()),
(7, 'Coach Vibe', 'Basketball', 'Wing', ARRAY['Team Chemistry', 'Communication', 'Court Awareness'], 'Believes that great players make their teammates better. Focuses on awareness, unselfish play, and leadership.', 'Generate a training routine that builds communication, team cohesion, and court awareness for a versatile wing.', NOW(), NOW()),
(8, 'Coach Spark', 'Basketball', 'Guard', ARRAY['Quickness', 'Agility', 'Full-Court Pressure'], 'A high-energy coach who thrives on intensity. Trains guards to press, harass ball handlers, and change pace effectively.', 'Prepare a high-intensity plan to improve quickness, agility, and pressure defense for a basketball guard.', NOW(), NOW()),
(9, 'Coach Prism', 'Basketball', 'Forward', ARRAY['Defensive Switching', 'Versatility', 'Tactical IQ'], NULL, 'Design a week-long training block for a forward focused on defensive switching, versatility, and tactical IQ.', NOW(), NOW()),
(10, 'Coach Echo', 'Basketball', 'Any', ARRAY['Film Study', 'Self-Assessment', 'Growth Mindset'], 'A reflective coach focused on reviewing past performances to drive future improvement through self-awareness.', 'Generate a training program that includes film breakdown, reflection prompts, and self-assessment for any basketball role.', NOW(), NOW());

-- Clients table
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    tags TEXT[],
    notes TEXT,
    birthday VARCHAR(255),
    gender VARCHAR(50),
    fitness_level VARCHAR(50),
    training_history TEXT,
    height FLOAT,
    weight FLOAT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Fixture data for clients
INSERT INTO clients (user_id, first_name, last_name, email, tags, notes, birthday, gender, fitness_level, training_history, height, weight, created_at, updated_at, deleted_at) VALUES
('123', 'Alice', 'Smith', 'alice.smith1@example.com', ARRAY['athlete','yoga'], 'Loves yoga. See https://placekitten.com/200/200', '1990-01-01', 'Female', 'Intermediate', '5 years of yoga', 165.0, 60.0, NOW(), NOW(), NULL),
('123', 'Bob', 'Johnson', 'bob.johnson2@example.com', ARRAY['runner'], 'Marathon runner. https://placekitten.com/201/200', '1985-05-12', 'Male', 'Advanced', '10 marathons', 180.0, 75.0, NOW(), NOW(), NULL),
('123', 'Carol', 'Williams', 'carol.williams3@example.com', ARRAY['swimmer'], 'Competitive swimmer.', '1992-03-15', 'Female', 'Advanced', 'Swims daily', 170.0, 62.0, NOW(), NOW(), NULL),
('123', 'David', 'Brown', 'david.brown4@example.com', ARRAY['basketball'], 'Plays center.', '1988-07-22', 'Male', 'Intermediate', 'Plays in local league', 200.0, 95.0, NOW(), NOW(), NULL),
('123', 'Eva', 'Jones', 'eva.jones5@example.com', ARRAY['triathlete'], 'Training for first triathlon.', '1995-11-30', 'Female', 'Beginner', 'New to triathlon', 168.0, 58.0, NOW(), NOW(), NULL),
('123', 'Frank', 'Garcia', 'frank.garcia6@example.com', ARRAY['soccer'], 'Midfielder.', '1991-09-10', 'Male', 'Intermediate', 'Plays weekly', 175.0, 70.0, NOW(), NOW(), NULL),
('123', 'Grace', 'Martinez', 'grace.martinez7@example.com', ARRAY['tennis'], 'Loves doubles.', '1987-04-18', 'Female', 'Advanced', 'Competes in tournaments', 160.0, 55.0, NOW(), NOW(), NULL),
('123', 'Henry', 'Rodriguez', 'henry.rodriguez8@example.com', ARRAY['cycling'], 'Road cyclist.', '1983-12-05', 'Male', 'Advanced', 'Rides 200km/week', 178.0, 72.0, NOW(), NOW(), NULL),
('123', 'Ivy', 'Lee', 'ivy.lee9@example.com', ARRAY['climbing'], 'Bouldering enthusiast.', '1996-06-21', 'Female', 'Intermediate', 'Climbs 3x/week', 162.0, 54.0, NOW(), NOW(), NULL),
('123', 'Jack', 'Walker', 'jack.walker10@example.com', ARRAY['crossfit'], 'Crossfit regular.', '1993-08-14', 'Male', 'Intermediate', 'Crossfit 4x/week', 182.0, 80.0, NOW(), NOW(), NULL),
('123', 'Kara', 'Hall', 'kara.hall11@example.com', ARRAY['pilates'], 'Pilates instructor.', '1989-02-27', 'Female', 'Advanced', 'Teaches pilates', 167.0, 57.0, NOW(), NOW(), NULL),
('123', 'Liam', 'Allen', 'liam.allen12@example.com', ARRAY['swimming'], 'Open water swimmer.', '1994-10-09', 'Male', 'Intermediate', 'Swims lakes', 176.0, 68.0, NOW(), NOW(), NULL),
('123', 'Mia', 'Young', 'mia.young13@example.com', ARRAY['yoga'], 'Yoga teacher.', '1990-05-19', 'Female', 'Advanced', 'Teaches vinyasa', 164.0, 56.0, NOW(), NOW(), NULL),
('123', 'Noah', 'King', 'noah.king14@example.com', ARRAY['basketball'], 'Point guard.', '1986-03-23', 'Male', 'Advanced', 'Plays semi-pro', 188.0, 85.0, NOW(), NOW(), NULL),
('123', 'Olivia', 'Wright', 'olivia.wright15@example.com', ARRAY['running'], 'Trail runner.', '1997-07-30', 'Female', 'Intermediate', 'Runs trails', 169.0, 59.0, NOW(), NOW(), NULL),
('123', 'Paul', 'Lopez', 'paul.lopez16@example.com', ARRAY['cycling'], 'Mountain biker.', '1984-11-11', 'Male', 'Intermediate', 'Rides weekends', 181.0, 77.0, NOW(), NOW(), NULL),
('123', 'Quinn', 'Hill', 'quinn.hill17@example.com', ARRAY['rowing'], 'Rowing club.', '1992-01-05', 'Non-binary', 'Beginner', 'New to rowing', 172.0, 65.0, NOW(), NOW(), NULL),
('123', 'Ruby', 'Scott', 'ruby.scott18@example.com', ARRAY['dance'], 'Ballet dancer.', '1995-09-17', 'Female', 'Advanced', 'Performs ballet', 158.0, 50.0, NOW(), NOW(), NULL),
('123', 'Sam', 'Green', 'sam.green19@example.com', ARRAY['football'], 'Quarterback.', '1989-06-02', 'Male', 'Advanced', 'Plays in league', 190.0, 90.0, NOW(), NOW(), NULL),
('123', 'Tina', 'Baker', 'tina.baker20@example.com', ARRAY['yoga','running'], 'Yoga and running.', '1993-12-25', 'Female', 'Intermediate', 'Mixes yoga and running', 166.0, 58.0, NOW(), NOW(), NULL);

-- Goals table
CREATE TABLE goals (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    due_date TIMESTAMP,
    progress_notes TEXT
);

-- SessionLogs table
CREATE TABLE session_logs (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    date TIMESTAMP NOT NULL,
    notes TEXT,
    transcript TEXT,
    summary TEXT,
    action_items TEXT[],
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Join table: goal_session_logs (many-to-many)
CREATE TABLE goal_session_logs (
    goal_id INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    session_log_id INTEGER NOT NULL REFERENCES session_logs(id) ON DELETE CASCADE,
    PRIMARY KEY (goal_id, session_log_id)
);

-- AIMetadata table (one-to-one with session_logs)
CREATE TABLE ai_metadata (
    session_log_id INTEGER PRIMARY KEY REFERENCES session_logs(id) ON DELETE CASCADE,
    summary_generated BOOLEAN NOT NULL,
    next_steps_generated BOOLEAN NOT NULL
);

-- TrainingPlans table
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