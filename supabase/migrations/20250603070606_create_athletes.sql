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