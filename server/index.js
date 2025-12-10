import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './database/db.js';
import apiRoutes from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

// API routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Database: ${process.env.DB_NAME}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

// DEBUG HEALTH CHECK
app.get('/health', async (req, res) => {
  try {
    // 1. Log what the code actually sees (Safe version, hides the password)
    const dbUrl = process.env.DATABASE_URL;
    console.log('🔍 DEBUG: Checking Connection...');
    console.log('   - Environment: ' + (process.env.NODE_ENV || 'development'));
    console.log('   - Has DATABASE_URL: ' + (!!dbUrl)); // Will print "true" or "false"
    
    // 2. Try to connect
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
    
  } catch (error) {
    console.error('❌ CONNECTION ERROR DETAIL:', error); // This prints the REAL reason to logs
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected', 
      error: error.message,
      // Pass back if we found the URL or not
      debug_has_url: !!process.env.DATABASE_URL 
    });
  }
});
