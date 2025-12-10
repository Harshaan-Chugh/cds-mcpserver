#!/bin/bash

# --- Display Header ---
echo ""
echo "========================================"
echo "  CDS Database Backend - Setup Wizard"
echo "========================================"
echo ""
echo "This will help you set up your database"
echo ""

# Wait for user input (equivalent to 'pause')
read -rp "Press [Enter] to continue..."

# --- Step 1/3: Setting up database schema ---
echo ""
echo "[Step 1/3] Setting up database schema..."
echo ""

# The 'call' command is not used in shell scripts; we just execute the command directly.
# The 'npm run setup' command is assumed to be available.
npm run setup

# Check the exit status of the last executed command ($? is 0 if successful)
if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Database setup failed!"
    echo "Make sure PostgreSQL is running and cds_db database exists."
    echo ""
    echo "Run this command first:"
    echo "  psql -U postgres -c \"CREATE DATABASE cds_db;\""
    echo ""
    read -rp "Press [Enter] to exit..."
    exit 1 # Exit with error code 1
fi

# --- Step 2/3: Seeding sample data ---
echo ""
echo "[Step 2/3] Seeding sample data..."
echo ""

npm run seed

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Data seeding failed!"
    echo ""
    read -rp "Press [Enter] to exit..."
    exit 1 # Exit with error code 1
fi

# --- Step 3/3: Opening test interface ---
echo ""
echo "[Step 3/3] Opening test interface..."
echo ""

# Use 'xdg-open' (Linux), 'open' (macOS), or 'start' (WSL/Cygwin)
# A robust script often checks which command is available.
if command -v xdg-open >/dev/null; then
    xdg-open test.html &
elif command -v open >/dev/null; then
    open test.html &
else
    echo "Warning: Cannot automatically open test.html. Please open it manually in your browser."
fi
# The '&' runs the browser command in the background, allowing the script to continue.

# --- Setup Complete: Starting server ---
echo ""
echo "========================================"
echo "  Setup Complete! Starting server..."
echo "========================================"
echo ""
echo "The test interface should open in your browser."
echo "Once the server starts, you can:"
echo "  - Click buttons to view data"
echo "  - Execute custom SQL queries"
echo "  - Explore statistics"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the main application server
npm start