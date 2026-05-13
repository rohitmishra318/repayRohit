#!/bin/bash
# Quick setup script for RepaySignal Authentication

echo "============================================"
echo "RepaySignal Authentication Setup"
echo "============================================"
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed or not in PATH"
    echo "Please install Python 3.8+ and add it to PATH"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js 16+ and add it to PATH"
    exit 1
fi

echo
echo "[1/5] Setting up Backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
echo "Installing dependencies..."
pip install -r requirements.txt -q

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "NOTE: Review .env and change JWT_SECRET for production"
fi

echo
echo "[2/5] Creating database..."
python scripts/setup_db.py
if [ $? -ne 0 ]; then
    echo "ERROR: Database setup failed"
    exit 1
fi

echo
echo "[3/5] Seeding demo data..."
echo "Running seed_demo.py..."
python scripts/seed_demo.py 2>/dev/null
if [ $? -eq 0 ]; then
    echo "Running seed_users.py..."
    python scripts/seed_users.py
fi

echo
cd ..
echo "[4/5] Setting up Frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install -q
fi
cd ..

echo
echo "============================================"
echo "Setup Complete!"
echo "============================================"
echo
echo "To start the application:"
echo
echo "Terminal 1 - Backend:"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  python -m uvicorn backend.main:app --reload"
echo
echo "Terminal 2 - Frontend:"
echo "  cd frontend"
echo "  npm run dev"
echo
echo "Then open: http://localhost:5173"
echo
echo "Demo Credentials:"
echo "  Email: admin@test.com"
echo "  Password: demo123"
echo
