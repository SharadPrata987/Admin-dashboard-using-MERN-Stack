@echo off
title Nexus Admin Dashboard - Startup
color 0A

echo.
echo ================================================
echo    NEXUS ADMIN DASHBOARD - STARTING...
echo ================================================
echo.

REM Check if MongoDB is running
echo [1/3] Checking MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] MongoDB is already running
) else (
    echo [!] MongoDB not running. Starting MongoDB...
    start "MongoDB" mongod
    timeout /t 3 /nobreak >nul
    echo [OK] MongoDB started
)

echo.
echo [2/3] Starting Backend Server...
cd backend
start "Nexus Backend" cmd /k "npm start"
timeout /t 2 /nobreak >nul
echo [OK] Backend server starting on http://localhost:5000

echo.
echo [3/3] Opening Frontend...
cd ..
start chrome index.html
echo [OK] Frontend opened in browser

echo.
echo ================================================
echo    ALL SERVICES STARTED SUCCESSFULLY!
echo ================================================
echo.
echo Backend API: http://localhost:5000
echo Frontend: index.html (opened in browser)
echo MongoDB: mongodb://localhost:27017/nexus-admin
echo.
echo Press any key to view logs or close this window...
pause >nul