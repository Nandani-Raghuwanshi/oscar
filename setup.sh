#!/bin/bash

# BuiltCred Project Setup Script

echo "================================"
echo "BuiltCred Setup Script"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Setup Backend
echo "📦 Setting up Backend..."
cd server
npm install
echo "✅ Backend dependencies installed"
echo ""

# Setup Frontend
echo "📦 Setting up Frontend..."
cd ../client
npm install
echo "✅ Frontend dependencies installed"
echo ""

# Return to root
cd ..

echo "================================"
echo "✅ Setup Complete!"
echo "================================"
echo ""
echo "Next Steps:"
echo "1. Start MongoDB:"
echo "   docker-compose up -d"
echo ""
echo "2. Start Backend (in server/ directory):"
echo "   npm run dev"
echo ""
echo "3. Start Frontend (in client/ directory, in another terminal):"
echo "   npm run dev"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
