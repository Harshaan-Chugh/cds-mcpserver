import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './database/db.js';
import apiRoutes from './routes/api.js';

dotenv.config();

// Fix for __dirname in ES Modules (because you are using 'import')
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// ---------------------------------------------------------
// 1. API ROUTES FIRST
// ---------------------------------------------------------

// Health check (Consolidated version)
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Health Check Failed:', error);
    res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

// Main API routes
app.use('/api', apiRoutes);

// ---------------------------------------------------------
// 2. FRONTEND STATIC FILES (The "Glue")
// ---------------------------------------------------------

// Serve static files from the React build folder
app.use(express.static(path.join(__dirname, '../client/dist')));

// Handle React routing - Send all other requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// ---------------------------------------------------------
// 3. ERROR HANDLING & START
// ---------------------------------------------------------

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Database: ${process.env.DB_NAME || 'Unknown'}`);
});