#!/bin/bash

# Seed script for RBAC users - Simple wrapper for seed_roles.py
# Usage: ./seed_roles.sh

echo "=========================================="
echo "RBAC User Seeding Script"
echo "=========================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed"
    echo "Please install Python 3 first"
    exit 1
fi

# Check if seed_roles.py exists
if [ ! -f "seed_roles.py" ]; then
    echo "❌ Error: seed_roles.py not found in current directory"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Check if required packages are installed
echo "Checking dependencies..."

python3 -c "import pymongo" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  pymongo not found. Installing..."
    pip3 install pymongo
fi

python3 -c "import werkzeug" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  werkzeug not found. Installing..."
    pip3 install werkzeug
fi

echo ""
echo "Running seed script..."
echo ""

# Run the seed script
python3 seed_roles.py
