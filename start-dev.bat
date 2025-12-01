@echo off
echo ========================================
echo  Smart Info Tech - Development Setup
echo ========================================
echo.

echo [1/4] Checking MongoDB...
net start MongoDB >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ MongoDB is running
) else (
    echo ✗ MongoDB is not running. Please start MongoDB first.
    pause
    exit
)

echo.
echo [2/4] Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 3 >nul

echo.
echo [3/4] Starting Frontend Server...
start "Frontend Server" cmd /k "npm run dev"
timeout /t 3 >nul

echo.
echo [4/4] Setup Complete!
echo.
echo ========================================
echo  Servers are running:
echo ========================================
echo  Frontend: http://localhost:3000
echo  Backend:  http://localhost:5000
echo  Admin:    http://localhost:3000/admin-login
echo ========================================
echo.
echo Press any key to stop all servers...
pause >nul

taskkill /FI "WindowTitle eq Backend Server*" /T /F >nul 2>&1
taskkill /FI "WindowTitle eq Frontend Server*" /T /F >nul 2>&1
echo All servers stopped.
