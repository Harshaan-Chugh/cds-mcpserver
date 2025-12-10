import express from 'express';
import { pool } from '../database/db.js';

const router = express.Router();

// --- Helper: Get Schema for AI ---
async function getDatabaseSchema() {
  const tablesRes = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  `);
  
  let schemaDescription = "Database Schema:\n";
  
  for (const row of tablesRes.rows) {
    const tableName = row.table_name;
    const colsRes = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = $1
    `, [tableName]);
    
    schemaDescription += `Table '${tableName}': ${colsRes.rows.map(c => `${c.column_name} (${c.data_type})`).join(', ')}\n`;
  }
  return schemaDescription;
}

// --- NEW: ChatGPT Query Endpoint ---
router.post('/ai-query', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // 1. Get the current DB Schema
    const schema = await getDatabaseSchema();

    // 2. Ask ChatGPT (Requires OPENAI_API_KEY in .env)
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY in server .env file" });
    }

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4o", // You can also use "gpt-3.5-turbo" for lower cost
        response_format: { type: "json_object" }, // Forces valid JSON
        messages: [
          {
            role: "system",
            content: `You are a PostgreSQL expert. Given the database schema below, write a valid SQL query to answer the user's question.
            
            Rules:
            1. Return ONLY a JSON object.
            2. JSON format: { "sql": "SELECT ...", "explanation": "Brief explanation" }
            3. Only generate SELECT queries. Never UPDATE/DELETE/DROP.
            
            ${schema}`
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const aiData = await aiResponse.json();
    
    if (aiData.error) {
      throw new Error(aiData.error.message);
    }

    // 3. Parse AI Response
    const content = aiData.choices[0].message.content;
    const parsed = JSON.parse(content);

    // 4. Execute the Generated SQL
    console.log("Executing Generated SQL:", parsed.sql);
    const dbResult = await pool.query(parsed.sql);

    // 5. Return everything to Frontend
    res.json({
      sql: parsed.sql,
      explanation: parsed.explanation,
      results: dbResult.rows
    });

  } catch (error) {
    console.error("AI Query Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- Existing Routes (Keep these for the simple tester) ---

router.get('/tables', async (req, res) => {
  try {
    const result = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/query', async (req, res) => {
  try {
    const { sql } = req.body;
    if (!sql.trim().toUpperCase().startsWith('SELECT')) {
      return res.status(403).json({ error: 'Only SELECT allowed' });
    }
    const result = await pool.query(sql);
    res.json({ rows: result.rows, rowCount: result.rowCount });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;