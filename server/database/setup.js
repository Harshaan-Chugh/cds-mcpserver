import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pool } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupDatabase() {
  try {
    console.log('📋 Setting up database schema...');
    
    const schemaSQL = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
    
    await pool.query(schemaSQL);
    
    console.log('✅ Database schema created successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();
