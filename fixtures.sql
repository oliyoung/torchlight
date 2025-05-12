-- Insert Clients
INSERT INTO clients (first_name, last_name, email, tags, notes, birthday, gender, fitness_level, training_history, height, weight)
VALUES
('Alex', 'Smith', 'alex.smith@example.com', ARRAY['basketball', 'youth'], 'Youth basketball player', '2013-05-10', 'Male', 'Beginner', 'None', 140.0, 40.0),
('Jamie', 'Johnson', 'jamie.johnson@example.com', ARRAY['basketball', 'youth'], 'Youth basketball player', '2012-08-15', 'Female', 'Beginner', 'None', 145.0, 42.0),
('Chris', 'Lee', 'chris.lee@example.com', ARRAY['basketball', 'youth'], 'Youth basketball player', '2011-03-22', 'Male', 'Intermediate', '1 year', 150.0, 45.0),
('Taylor', 'Brown', 'taylor.brown@example.com', ARRAY['basketball', 'youth'], 'Youth basketball player', '2010-11-30', 'Female', 'Intermediate', '2 years', 155.0, 48.0),
('Jordan', 'Davis', 'jordan.davis@example.com', ARRAY['basketball', 'youth'], 'Youth basketball player', '2013-01-05', 'Male', 'Beginner', 'None', 135.0, 38.0),
('Morgan', 'Wilson', 'morgan.wilson@example.com', ARRAY['basketball', 'youth'], 'Youth basketball player', '2012-06-18', 'Female', 'Beginner', 'None', 142.0, 41.0),
('Casey', 'Moore', 'casey.moore@example.com', ARRAY['basketball', 'youth'], 'Youth basketball player', '2011-09-25', 'Male', 'Intermediate', '1 year', 148.0, 44.0),
('Riley', 'Taylor', 'riley.taylor@example.com', ARRAY['basketball', 'youth'], 'Youth basketball player', '2010-04-12', 'Female', 'Intermediate', '2 years', 153.0, 47.0),
('Drew', 'Anderson', 'drew.anderson@example.com', ARRAY['basketball', 'youth'], 'Youth basketball player', '2013-07-19', 'Male', 'Beginner', 'None', 138.0, 39.0),
('Peyton', 'Thomas', 'peyton.thomas@example.com', ARRAY['basketball', 'youth'], 'Youth basketball player', '2012-02-28', 'Female', 'Beginner', 'None', 144.0, 43.0);

-- Insert Goals
INSERT INTO goals (client_id, title, description, status, due_date, progress_notes)
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
INSERT INTO session_logs (client_id, date, notes, transcript, summary, action_items)
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