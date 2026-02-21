#!/bin/bash

# Backend Test Runner Script
# Run all tests or specific test suites

set -e

cd "$(dirname "$0")/server"

echo "🧪 BuiltCred Backend Test Runner"
echo "================================="
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install it first."
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

# Parse command line arguments
TEST_SUITE=$1

case "$TEST_SUITE" in
    "auth")
        echo "🔐 Running Authentication tests..."
        NODE_ENV=test pnpm test:auth
        ;;
    "admin")
        echo "👤 Running Admin module tests..."
        NODE_ENV=test pnpm test:admin
        ;;
    "builder")
        echo "🏗️  Running Builder module tests..."
        NODE_ENV=test pnpm test:builder
        ;;
    "advocate")
        echo "👥 Running Project Advocate tests..."
        NODE_ENV=test pnpm test:advocate
        ;;
    "brand")
        echo "🏆 Running Brand Advocate tests..."
        NODE_ENV=test pnpm test:brand
        ;;
    "crm")
        echo "💼 Running CRM module tests..."
        NODE_ENV=test pnpm test:crm
        ;;
    "notifications")
        echo "🔔 Running Notifications tests..."
        NODE_ENV=test pnpm test:notifications
        ;;
    "analytics")
        echo "📊 Running Analytics tests..."
        NODE_ENV=test pnpm test:analytics
        ;;
    "cross-cutting")
        echo "🔗 Running Cross-cutting validation tests..."
        NODE_ENV=test pnpm test:cross-cutting
        ;;
    "coverage")
        echo "📈 Running all tests with coverage..."
        NODE_ENV=test pnpm test:coverage
        ;;
    "watch")
        echo "👀 Running tests in watch mode..."
        NODE_ENV=test pnpm test:watch
        ;;
    *)
        echo "🚀 Running all tests..."
        NODE_ENV=test pnpm test
        ;;
esac

echo ""
echo "✅ Tests completed!"
