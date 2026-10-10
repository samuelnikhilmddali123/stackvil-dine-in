@echo off
title Canteen Services - KOT POS & Kitchen Terminal
color 0A

echo ========================================================
echo   MILITARY CANTEEN SERVICES - KOT POS KITCHEN SYSTEM
echo   Restaurant Counter & Kitchen Terminal Launcher
echo ========================================================
echo.

cd /d "%~dp0backend"

echo [1/3] Checking Node.js environment...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Node.js is not installed on this PC!
    echo Please download and install Node.js (LTS version) from:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [2/3] Checking dependencies...
if not exist "node_modules" (
    echo Installing backend dependencies, please wait...
    call npm install --omit=dev
)

echo [3/3] Launching KOT POS Server on Port 5001...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5001" ^| findstr /i "listening"') do (
    if "%%a" neq "0" taskkill /F /PID %%a >nul 2>&1
)

start "Canteen KOT Server" /B node server.js

timeout /t 3 /nobreak >nul

echo.
echo ========================================================
echo   KOT POS IS NOW RUNNING SUCCESSFULLY!
echo   Opening Kitchen POS Display in Browser...
echo ========================================================
echo.

:: Open KOT POS in Google Chrome (App Mode) or default browser
start chrome --app=http://localhost:5001/admin/kot/ || start http://localhost:5001/admin/kot/

exit /b 0
