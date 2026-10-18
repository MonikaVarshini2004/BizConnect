@echo off
title BizConnect Frontend
cd /d "%~dp0frontend"
echo Starting BizConnect Frontend on http://localhost:5173 ...
npm run dev
pause
