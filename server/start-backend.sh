#!/bin/bash

# BuiltCred Backend Startup Script

echo "🚀 Starting BuiltCred Backend..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed or not in PATH."
    echo "   Please ensure MongoDB is running on localhost:27017"
    echo "   Or install it: https://docs.mongodb.com/manual/installation/"
fi

# Navigate to server directory
cd "$(dirname "$0")/" || exit

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ Created .env - you may need to update it with your settings"
fi

# Create virtual environment if it doesn't exist
if [ ! -d venv ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/upgrade dependencies
echo "📚 Installing dependencies..."
pip install -q -r requirements.txt
echo "✅ Dependencies installed"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Backend is ready to start!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Before starting, ensure MongoDB is running:"
echo "  mongod  (on Linux/Mac)"
echo "  mongod.exe  (on Windows)"
echo "  or Docker: docker run -d -p 27017:27017 mongo:latest"
echo ""
echo "📡 Starting Flask server on http://localhost:5000"
echo "🌐 Frontend is running on http://localhost:5174"
echo ""

# Start Flask application
python app.py
