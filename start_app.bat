@echo off
title Smart Water & Energy Manager Launcher
echo ==============================================================
echo  Launching Smart Water & Energy Manager (HydoVolt)
echo ==============================================================

start "HydoVolt Backend (FastAPI :8000)" powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0run_backend.ps1"
timeout /t 2 /nobreak >nul
start "HydoVolt Frontend (Vite :5173)" powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0run_frontend.ps1"

echo.
echo Both servers have been launched in separate terminals:
echo  - Backend API: http://127.0.0.1:8000 (Docs at /docs)
echo  - Frontend UI: http://localhost:5173
echo.
pause
