import express from 'express';
import { pool } from '../database/db.js';

const router = express.Router();

// Get all tables
router.get('/tables', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get table schema
router.get('/tables/:tableName/schema', async (req, res) => {
  try {
    const { tableName } = req.params;
    const result = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = $1 
      ORDER BY ordinal_position
    `, [tableName]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Execute custom SQL query
router.post('/query', async (req, res) => {
  try {
    const { sql, params = [] } = req.body;
    
    if (!sql) {
      return res.status(400).json({ error: 'SQL query is required' });
    }

    // Security: Only allow SELECT queries
    const trimmedSQL = sql.trim().toUpperCase();
    if (!trimmedSQL.startsWith('SELECT')) {
      return res.status(403).json({ 
        error: 'Only SELECT queries are allowed for security reasons' 
      });
    }

    const result = await pool.query(sql, params);
    res.json({
      rows: result.rows,
      rowCount: result.rowCount,
      fields: result.fields?.map(f => ({ name: f.name, dataTypeID: f.dataTypeID }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all products
router.get('/products', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all orders with user info
router.get('/orders', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.*, 
        u.username, 
        u.email,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id, u.username, u.email
      ORDER BY o.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get order details with items
router.get('/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Get order with user info
    const orderResult = await pool.query(`
      SELECT 
        o.*, 
        u.username, 
        u.email, 
        u.first_name, 
        u.last_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = $1
    `, [orderId]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Get order items
    const itemsResult = await pool.query(`
      SELECT 
        oi.*, 
        p.name as product_name, 
        p.description as product_description
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [orderId]);

    res.json({
      order: orderResult.rows[0],
      items: itemsResult.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get categories
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.*, 
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.name
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user statistics
router.get('/stats/users', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_active THEN 1 END) as active_users,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as new_users_last_month
      FROM users
    `);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sales statistics
router.get('/stats/sales', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as average_order_value,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as orders_last_month
      FROM orders
    `);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
