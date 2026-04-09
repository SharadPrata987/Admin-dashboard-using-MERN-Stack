@echo off
echo ========================================
echo   Nexus Admin Dashboard - Quick Start
echo ========================================
echo.

echo [1/3] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo ✓ Node.js installed

echo.
echo [2/3] Installing dependencies...
cd backend
if not exist node_modules (
    echo Installing packages...
    call npm install
) else (
    echo ✓ Dependencies already installed
)

echo.
echo [3/3] Starting backend server...
echo.
echo ========================================
echo   Backend running on http://localhost:5000
echo   Open index.html in your browser
echo ========================================
echo.
call npm start
