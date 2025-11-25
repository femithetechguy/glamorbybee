#!/bin/bash

# GlamorByBee - Project Setup
# This script sets up the entire project environment

echo "🐝 GlamorByBee - Project Setup"
echo "==============================="

PROJECT_ROOT="$(dirname "$0")/.."

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: python3 not found. Please install Python 3 first."
    exit 1
fi

echo ""
echo "📦 Step 1: Installing Python dependencies..."
./bash_scripts/install_dependencies.sh

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "📊 Step 2: Generating test data..."
./bash_scripts/generate_data.sh

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate test data"
    exit 1
fi

echo ""
echo "✨ Project setup complete!"
echo ""
echo "🚀 To start the development server, run:"
echo "   ./bash_scripts/start_server.sh"
echo ""
echo "🌐 Then open: http://localhost:8000"
