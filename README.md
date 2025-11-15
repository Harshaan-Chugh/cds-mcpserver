# CDS MCP Server

CDS onboarding project with PostgreSQL backend and React frontend.

## Team Members
- Vedanta Jain (vj88)
- Harshaan Chugh (hsc53)
- Naijei Jiang (nj277)

## Project Structure

```
cds-mcpserver/
├── server/                           # Backend server
│   ├── index.js                     # Express server entry point
│   ├── database/                    # Database configuration and scripts
│   │   ├── db.js                   # PostgreSQL connection pool
│   │   ├── schema.sql              # Database schema
│   │   ├── setup.js                # Schema setup script
│   │   └── seed.js                 # Data seeding script
│   └── routes/
│       └── api.js                  # API endpoints
├── client/                          # Frontend React component
│   ├── src/
│   │   └── components/
│   │       └── PostgreSQLQueryAssistant.jsx
│   └── README.md
├── test.html                        # Simple API test interface
├── package.json                     # Dependencies and scripts
├── .env                            # Environment variables (not committed)
├── .env.example                    # Environment variables template
├── SETUP.md                        # Detailed setup instructions
└── README.md                       # This file
```

## Quick Start

1. **Install PostgreSQL** (if not already installed)
   - Download from https://www.postgresql.org/download/
   - Remember your postgres user password

2. **Create Database**
   ```bash
   psql -U postgres
   CREATE DATABASE cds_db;
   \q
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Install Dependencies**
   ```bash
   npm install
   ```

5. **Setup Database**
   ```bash
   npm run setup
   npm run seed
   ```

6. **Start Server**
   ```bash
   npm start
   # Or for development with auto-reload:
   npm run dev
   ```

7. **Test the API**
   - Visit http://localhost:3001/health
   - Visit http://localhost:3001/api/users
   - Visit http://localhost:3001/api/products

## Features

### Backend
- ✅ Express.js REST API
- ✅ PostgreSQL database with connection pooling
- ✅ Seeded with sample data (users, products, orders)
- ✅ Multiple API endpoints for querying data
- ✅ Health check endpoint
- ✅ Custom SQL query execution (SELECT only for security)

### Database Schema
- **Users** - Customer accounts with authentication info
- **Categories** - Product categories
- **Products** - Product catalog with pricing and inventory
- **Orders** - Customer orders with status tracking
- **Order Items** - Line items for each order

### Sample Data
- 10 users with realistic data
- 6 product categories (Electronics, Books, Clothing, etc.)
- 22 products across all categories
- 14 orders in various states (completed, shipped, processing, etc.)
- 28 order items

## API Endpoints

### Database Exploration
- `GET /health` - Check server and database status
- `GET /api/tables` - List all database tables
- `GET /api/tables/:tableName/schema` - Get schema for a specific table
- `POST /api/query` - Execute custom SQL SELECT queries

### Data Access
- `GET /api/users` - Get all users
- `GET /api/products` - Get all products with categories
- `GET /api/categories` - Get all categories with product counts
- `GET /api/orders` - Get all orders with user information
- `GET /api/orders/:orderId` - Get detailed order with items
- `GET /api/stats/users` - Get user statistics
- `GET /api/stats/sales` - Get sales statistics

## Example Queries

Try these queries in your frontend or via curl:

```bash
# Get all users
curl http://localhost:3001/api/users

# Get products
curl http://localhost:3001/api/products

# Get sales statistics
curl http://localhost:3001/api/stats/sales

# Execute custom query
curl -X POST http://localhost:3001/api/query \
  -H "Content-Type: application/json" \
  -d '{"sql": "SELECT * FROM users WHERE is_active = true LIMIT 5"}'
```

## Development

See [SETUP.md](SETUP.md) for detailed setup instructions and troubleshooting.

### Reset Database
```bash
psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS cds_db;"
psql -U postgres -d postgres -c "CREATE DATABASE cds_db;"
npm run setup
npm run seed
```

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Frontend**: React (see main.js)
- **Libraries**: pg (node-postgres), cors, dotenv

## License

ISC
