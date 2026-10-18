@echo off
title BizConnect - Launch All Services
echo ===================================================
echo           Starting BizConnect Platform
echo ===================================================
echo.

echo [1/2] Launching Backend (Spring Boot on port 8080)...
start "BizConnect Backend (Port 8080)" cmd /k "cd /d "%~dp0backend" && mvn spring-boot:run"

echo [2/2] Launching Frontend (Vite on port 5173)...
start "BizConnect Frontend (Port 5173)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ===================================================
echo Backend and Frontend have been launched in separate windows!
echo Once Vite starts, visit: http://localhost:5173
echo ===================================================
pause
