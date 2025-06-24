const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Load questions data
let questionsData = [];
try {
  const questionsPath = path.join(__dirname, 'data/big5_hexaco_questions.json');
  const questionsFile = fs.readFileSync(questionsPath, 'utf8');
  questionsData = JSON.parse(questionsFile).questions;
  console.log(`Loaded ${questionsData.length} questions`);
} catch (error) {
  console.error('Error loading questions:', error);
}

// Routes
app.get('/api/questions', (req, res) => {
  try {
    res.json(questionsData);
  } catch (error) {
    console.error('Error serving questions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/responses', async (req, res) => {
  try {
    const { sessionId, responses } = req.body;
    
    // Save responses to database
    for (const response of responses) {
      await pool.query(
        'INSERT INTO responses (session_id, question_id, selected_option, selected_factor) VALUES ($1, $2, $3, $4)',
        [sessionId, response.questionId, response.selectedOption, response.selectedFactor]
      );
    }

    // Calculate scores
    const factorCounts = { C: 0, A: 0, E: 0, O: 0, N: 0, H: 0 };
    responses.forEach(response => {
      factorCounts[response.selectedFactor]++;
    });

    const values = Object.values(factorCounts);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Save results to database
    await pool.query(
      'INSERT INTO results (session_id, c_score, a_score, e_score, o_score, n_score, h_score) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [sessionId, factorCounts.C, factorCounts.A, factorCounts.E, factorCounts.O, factorCounts.N, factorCounts.H]
    );

    res.json({
      ...factorCounts,
      stdDev: stdDev.toFixed(2)
    });
  } catch (error) {
    console.error('Error saving responses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Database connection test
pool.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Database connection error:', err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});