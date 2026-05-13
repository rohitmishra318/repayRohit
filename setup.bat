@echo off
REM Quick setup script for RepaySignal Authentication

echo ============================================
echo RepaySignal Authentication Setup
echo ============================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ and add it to PATH
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 16+ and add it to PATH
    pause
    exit /b 1
)

echo.
echo [1/5] Setting up Backend...
cd backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat
echo Installing dependencies...
pip install -r requirements.txt -q

if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo NOTE: Review .env and change JWT_SECRET for production
)

echo.
echo [2/5] Creating database...
python scripts/setup_db.py
if errorlevel 1 (
    echo ERROR: Database setup failed
    pause
    exit /b 1
)

echo.
echo [3/5] Seeding demo data...
echo Running seed_demo.py...
python scripts/seed_demo.py >nul 2>&1
if errorlevel 0 (
    echo Running seed_users.py...
    python scripts/seed_users.py
)

echo.
cd ..
echo [4/5] Setting up Frontend...
cd frontend
if not exist node_modules (
    echo Installing npm dependencies...
    call npm install -q
)
cd ..

echo.
echo ============================================
echo Setup Complete!
echo ============================================
echo.
echo To start the application:
echo.
echo Terminal 1 - Backend:
echo   cd backend
echo   venv\Scripts\activate.bat
echo   python -m uvicorn backend.main:app --reload
echo.
echo Terminal 2 - Frontend:
echo   cd frontend
echo   npm run dev
echo.
echo Then open: http://localhost:5173
echo.
echo Demo Credentials:
echo   Email: admin@test.com
echo   Password: demo123
echo.
pause
