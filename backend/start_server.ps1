# PowerShell script to start the backend server
Write-Host "Starting Student Feedback Analyzer Backend..." -ForegroundColor Green

# Navigate to backend directory
Set-Location $PSScriptRoot

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment and start server
Write-Host "Activating virtual environment and starting server..." -ForegroundColor Yellow
.\venv\Scripts\python.exe app.py

