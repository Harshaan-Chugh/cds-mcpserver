#!/bin/bash

# --- Display Header ---
echo ""
echo "========================================"
echo "  CDS AI Assistant - Startup Script"
echo "========================================"
echo ""

# --- Step 1: Install Dependencies ---
echo "[1/4] Installing Backend Dependencies..."
npm install --silent

echo "[2/4] Installing Frontend Dependencies..."
cd client
npm install --silent
cd ..

# --- Step 2: Database Setup ---
echo ""
echo "[3/4] Setting up Database..."
# Run setup and seed. If they fail, warn the user but don't crash (idempotent)
npm run setup
if [ $? -eq 0 ]; then
    npm run seed
    echo "✅ Database seeded successfully."
else
    echo "⚠️  Database setup skipped or failed (make sure Postgres is running)."
fi

# --- Step 3: Launch App ---
echo ""
echo "[4/4] Starting Application..."
echo "========================================"
echo "🚀 Backend: http://localhost:3001"
echo "✨ Frontend: http://localhost:5173"
echo "========================================"
echo "Press Ctrl+C to stop."
echo ""

# Run both the backend and frontend concurrently
# We use & to background the server, then run the client
npm run dev & 
PID_SERVER=$!

# Wait a moment for server to warm up
sleep 2

# Start the client
cd client
npm run dev

# When user hits Ctrl+C, kill the background server too
kill $PID_SERVER