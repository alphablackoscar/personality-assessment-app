-- Create responses table for storing user responses
CREATE TABLE IF NOT EXISTS responses (
    id SERIAL PRIMARY KEY,
    session_id UUID NOT NULL,
    question_id INTEGER NOT NULL,
    selected_option CHAR(1) NOT NULL, -- 'A' or 'B'
    selected_factor CHAR(1) NOT NULL, -- 'C', 'A', 'E', 'O', 'N', 'H'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create results table for storing final scores
CREATE TABLE IF NOT EXISTS results (
    id SERIAL PRIMARY KEY,
    session_id UUID UNIQUE NOT NULL,
    c_score INTEGER DEFAULT 0,
    a_score INTEGER DEFAULT 0,
    e_score INTEGER DEFAULT 0,
    o_score INTEGER DEFAULT 0,
    n_score INTEGER DEFAULT 0,
    h_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_responses_session_id ON responses(session_id);
CREATE INDEX IF NOT EXISTS idx_results_session_id ON results(session_id);