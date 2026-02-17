@echo off
REM Seed script for RBAC users - Windows batch wrapper for seed_roles.py
REM Usage: seed_roles.bat

echo ==========================================
echo RBAC User Seeding Script
echo ==========================================
echo.

REM Check if Python is installed
python3 --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python 3 is not installed
    echo Please install Python 3 first from https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check if seed_roles.py exists
if not exist "seed_roles.py" (
    echo Error: seed_roles.py not found in current directory
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

REM Check and install required packages
echo Checking dependencies...

python3 -c "import pymongo" 2>nul
if errorlevel 1 (
    echo Installing pymongo...
    pip3 install pymongo
)

python3 -c "import werkzeug" 2>nul
if errorlevel 1 (
    echo Installing werkzeug...
    pip3 install werkzeug
)

echo.
echo Running seed script...
echo.

REM Run the seed script
python3 seed_roles.py

pause
