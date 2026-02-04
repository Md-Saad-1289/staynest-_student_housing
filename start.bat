@echo off
REM Quick Start Script for Windows - Student Housing MVP

echo.
echo ======================================
echo.  Student Housing MVP - Quick Start
echo ======================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo ERROR: Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo OK - Node.js found
echo.

REM Start Backend
echo Starting Backend...
cd backend

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
)

echo Starting backend server on port 5000...
start cmd /k npm start

REM Wait for backend to start
timeout /t 3 /nobreak

REM Start Frontend
echo.
echo Starting Frontend...
cd ..\frontend

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

echo Starting frontend server on port 3000...
start cmd /k npm start

REM Wait for frontend to start
timeout /t 3 /nobreak

echo.
echo ======================================
echo OK - Both servers are running!
echo ======================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Test Credentials:
echo   Student: karim@example.com / student123456
echo   Owner:   ahmed@example.com / owner123456
echo   Admin:   admin@example.com / admin123456
echo.
echo Dashboards:
echo   Student: http://localhost:3000/dashboard/student
echo   Owner:   http://localhost:3000/dashboard/owner
echo   Admin:   http://localhost:3000/dashboard/admin
echo.
echo Press any key to continue...
pause
