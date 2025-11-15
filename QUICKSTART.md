# 🚀 Quick Start Guide

## Step 1: Install Dependencies

```powershell
npm install
```

## Step 2: Setup PostgreSQL Database

Make sure PostgreSQL is installed and running, then create the database:

```powershell
# Option A: Using psql command line
psql -U postgres -c "CREATE DATABASE cds_db;"

# Option B: Using pgAdmin GUI
# Open pgAdmin, right-click Databases, create new database named "cds_db"
```

## Step 3: Configure Database Connection

Edit `.env` file and update your PostgreSQL password:

```env
DB_PASSWORD=your_postgres_password
```

## Step 4: Setup Database Schema

```powershell
npm run setup
```

## Step 5: Seed Sample Data

```powershell
npm run seed
```

## Step 6: Start the Backend Server

```powershell
npm start
```

You should see:
```
🚀 Server running on http://localhost:3001
📊 Database: cds_db
🏥 Health check: http://localhost:3001/health
```

## Step 7: Visualize and Test! 🎉

### Option 1: Simple HTML Interface (Recommended for Quick Testing)

1. Open `test.html` in your browser
2. Click the buttons to explore your data!

Features:
- ✅ Health check
- 👥 View all users
- 📦 View all products
- 🛒 View all orders
- 📊 View statistics
- ✍️ Execute custom SQL queries

### Option 2: API Endpoints (Direct Browser Access)

Visit these URLs in your browser:

- **Health Check**: http://localhost:3001/health
- **All Users**: http://localhost:3001/api/users
- **All Products**: http://localhost:3001/api/products
- **All Orders**: http://localhost:3001/api/orders
- **All Categories**: http://localhost:3001/api/categories
- **User Stats**: http://localhost:3001/api/stats/users
- **Sales Stats**: http://localhost:3001/api/stats/sales
- **Database Tables**: http://localhost:3001/api/tables

### Option 3: Using curl (Terminal)

```powershell
# Get all users
curl http://localhost:3001/api/users

# Get all products
curl http://localhost:3001/api/products

# Get sales statistics
curl http://localhost:3001/api/stats/sales

# Execute custom query
curl -X POST http://localhost:3001/api/query `
  -H "Content-Type: application/json" `
  -d '{"sql": "SELECT * FROM users LIMIT 5"}'
```

## 📊 What Data is Available?

The seeded database includes:

- **10 Users** - Customer accounts with emails, names, signup dates
- **6 Categories** - Electronics, Books, Clothing, Home & Garden, Sports, Toys
- **22 Products** - Various products across all categories with prices
- **14 Orders** - Orders in different statuses (completed, shipped, processing)
- **28 Order Items** - Line items for each order

## 🔍 Example SQL Queries to Try

Open `test.html` and try these queries in the custom SQL section:

```sql
-- Get all active users
SELECT * FROM users WHERE is_active = true;

-- Get products under $50
SELECT name, price, stock_quantity FROM products WHERE price < 50;

-- Get recent orders
SELECT o.id, u.username, o.total_amount, o.status, o.created_at 
FROM orders o 
JOIN users u ON o.user_id = u.id 
ORDER BY o.created_at DESC 
LIMIT 10;

-- Get top selling products
SELECT p.name, SUM(oi.quantity) as total_sold, SUM(oi.quantity * oi.price_at_time) as revenue
FROM products p
JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id, p.name
ORDER BY total_sold DESC;

-- Get user order summary
SELECT u.username, COUNT(o.id) as order_count, SUM(o.total_amount) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username
ORDER BY total_spent DESC;
```

## 🛠️ Troubleshooting

**"Connection refused" error:**
- Make sure PostgreSQL is running
- Check `.env` has correct credentials

**"Database does not exist" error:**
- Run: `psql -U postgres -c "CREATE DATABASE cds_db;"`

**"Port 3001 already in use" error:**
- Change PORT in `.env` file to 3002 or another port

**Need to reset the database:**
```powershell
psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS cds_db;"
psql -U postgres -d postgres -c "CREATE DATABASE cds_db;"
npm run setup
npm run seed
```

## 📱 React Component

The React component is available in `client/src/components/PostgreSQLQueryAssistant.jsx` if you want to integrate it into a full React application later.

## 🎯 Development Mode

Use this for auto-restart on code changes:

```powershell
npm run dev
```

---

**Happy querying! 🎉**
