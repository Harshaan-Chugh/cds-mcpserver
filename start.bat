@echo off
echo.
echo ========================================
echo   CDS Database Backend - Setup Wizard
echo ========================================
echo.
echo This will help you set up your database
echo.
pause

echo.
echo [Step 1/3] Setting up database schema...
echo.
call npm run setup
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Database setup failed!
    echo Make sure PostgreSQL is running and cds_db database exists.
    echo.
    echo Run this command first:
    echo   psql -U postgres -c "CREATE DATABASE cds_db;"
    echo.
    pause
    exit /b 1
)

echo.
echo [Step 2/3] Seeding sample data...
echo.
call npm run seed
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Data seeding failed!
    pause
    exit /b 1
)

echo.
echo [Step 3/3] Opening test interface...
echo.
start test.html

echo.
echo ========================================
echo   Setup Complete! Starting server...
echo ========================================
echo.
echo The test interface should open in your browser.
echo Once the server starts, you can:
echo   - Click buttons to view data
echo   - Execute custom SQL queries
echo   - Explore statistics
echo.
echo Press Ctrl+C to stop the server
echo.
call npm start
