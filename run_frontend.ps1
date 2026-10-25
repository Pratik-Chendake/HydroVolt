# Start Smart Water & Energy Manager Frontend (Vite + React)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptDir\frontend"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Starting Smart Water & Energy Manager Frontend (Vite)..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

npm run dev
