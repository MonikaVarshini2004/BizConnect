@echo off
title BizConnect Backend
cd /d "%~dp0backend"
echo Starting BizConnect Spring Boot Backend on http://localhost:8080 ...
mvn spring-boot:run
pause
