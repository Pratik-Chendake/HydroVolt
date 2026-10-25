# Start Smart Water & Energy Manager Backend (FastAPI + SQLite + PySerial)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Starting Smart Water & Energy Manager Backend API..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$env:PYTHONPATH = "$scriptDir\backend"
$pythonPath = "$scriptDir\backend\venv\Scripts\python.exe"

if (-not (Test-Path $pythonPath)) {
    Write-Host "Error: Virtual environment not found at $pythonPath" -ForegroundColor Red
    exit 1
}

& $pythonPath -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
