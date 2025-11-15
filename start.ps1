# CDS Database Backend - Setup and Run Script

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  CDS Database Backend - Setup Wizard" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "This will help you set up your database`n" -ForegroundColor Green

$continue = Read-Host "Press Enter to continue or Ctrl+C to cancel"

Write-Host "`n[Step 1/3] Setting up database schema...`n" -ForegroundColor Yellow
npm run setup

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nERROR: Database setup failed!" -ForegroundColor Red
    Write-Host "Make sure PostgreSQL is running and cds_db database exists.`n" -ForegroundColor Yellow
    Write-Host "Run this command first:" -ForegroundColor White
    Write-Host '  psql -U postgres -c "CREATE DATABASE cds_db;"' -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "`n[Step 2/3] Seeding sample data...`n" -ForegroundColor Yellow
npm run seed

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nERROR: Data seeding failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "`n[Step 3/3] Opening test interface...`n" -ForegroundColor Yellow
Start-Process "test.html"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete! Starting server..." -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "The test interface should open in your browser." -ForegroundColor Green
Write-Host "Once the server starts, you can:" -ForegroundColor White
Write-Host "  - Click buttons to view data" -ForegroundColor Gray
Write-Host "  - Execute custom SQL queries" -ForegroundColor Gray
Write-Host "  - Explore statistics`n" -ForegroundColor Gray

Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Yellow

npm start
