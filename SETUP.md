# Backend Setup Guide

## Prerequisites

1. **Node.js** (v16 or higher)
2. **PostgreSQL** (v12 or higher)

## Installation Steps

### 1. Install PostgreSQL

**Windows:**
- Download from https://www.postgresql.org/download/windows/
- Run the installer and remember your password for the postgres user
- Default port is 5432

### 2. Create Database

Open PowerShell or Command Prompt and run:

```powershell
# Connect to PostgreSQL
psql -U postgres

# In the PostgreSQL prompt, create the database:
CREATE DATABASE cds_db;

# Exit PostgreSQL
\q
```

Alternatively, you can use pgAdmin (GUI tool installed with PostgreSQL).

### 3. Configure Environment

```powershell
# Copy the example environment file
cp .env.example .env

# Edit .env and update your database credentials
# Especially update DB_PASSWORD with your PostgreSQL password
```

### 4. Install Dependencies

```powershell
npm install
```

### 5. Setup Database Schema

```powershell
npm run setup
```

### 6. Seed Database with Sample Data

```powershell
npm run seed
```

### 7. Start the Server

```powershell
# Development mode (with auto-restart)
npm run dev

# Or production mode
npm start
```

The server will start on http://localhost:3001

## Verify Installation

Open your browser and visit:
- http://localhost:3001/health - Check if server and database are connected
- http://localhost:3001/api/users - View all users
- http://localhost:3001/api/products - View all products
- http://localhost:3001/api/orders - View all orders

## API Endpoints

### General
- `GET /health` - Health check
- `GET /api/tables` - List all database tables
- `GET /api/tables/:tableName/schema` - Get table schema
- `POST /api/query` - Execute custom SQL query (SELECT only)

### Users
- `GET /api/users` - Get all users
- `GET /api/stats/users` - Get user statistics

### Products
- `GET /api/products` - Get all products with categories
- `GET /api/categories` - Get all categories with product counts

### Orders
- `GET /api/orders` - Get all orders with user info
- `GET /api/orders/:orderId` - Get order details with items
- `GET /api/stats/sales` - Get sales statistics

## Database Schema

The database includes the following tables:

1. **users** - User accounts
2. **categories** - Product categories
3. **products** - Product catalog
4. **orders** - Customer orders
5. **order_items** - Items in each order

## Sample Data

The seed script creates:
- 10 users
- 6 product categories
- 22 products
- 14 orders with various statuses
- 28 order items

## Testing SQL Queries

You can test SQL queries using the API:

```javascript
// Example: POST to /api/query
{
  "sql": "SELECT * FROM users WHERE is_active = true LIMIT 5"
}
```

## Troubleshooting

**Connection refused:**
- Make sure PostgreSQL service is running
- Check your .env file has correct credentials

**Database doesn't exist:**
- Run `CREATE DATABASE cds_db;` in PostgreSQL

**Permission denied:**
- Make sure the database user has proper permissions

**Port already in use:**
- Change PORT in .env file or stop the other application

## Development

To reset the database:

```powershell
# Reconnect to PostgreSQL and drop/recreate
psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS cds_db;"
psql -U postgres -d postgres -c "CREATE DATABASE cds_db;"

# Then run setup and seed again
npm run setup
npm run seed
```

## Authors

- Vedanta Jain (vj88)
- Harshaan Chugh (hsc53)
- Naijei Jiang (nj277)
