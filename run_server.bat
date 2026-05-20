@echo off
REM NexusDAST Local Development Server Launcher for Windows
REM This script starts the HTTP server and opens the dashboard

setlocal enabledelayedexpansion

echo.
echo ============================================================
echo NexusDAST Development Server
echo ============================================================
echo.

REM Get the port from argument or use default
set PORT=8000
if not "%1"=="" set PORT=%1

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.9+ from https://www.python.org
    pause
    exit /b 1
)

REM Start the server
echo Starting server on port %PORT%...
echo.
echo Opening dashboard at: http://localhost:%PORT%/index.html
echo.
echo Press Ctrl+C to stop the server
echo.
echo ============================================================
echo.

python run_server.py %PORT%
if errorlevel 1 (
    echo.
    echo Error starting server. Try a different port:
    echo   %0 8080
    pause
)
