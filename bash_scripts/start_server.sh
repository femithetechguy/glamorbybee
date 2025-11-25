#!/bin/bash

# GlamorByBee - Start Development Server
# This script starts the Python HTTP server for local development

echo "🐝 GlamorByBee - Starting Development Server"
echo "============================================="

# Get the project root directory
PROJECT_ROOT="$(dirname "$0")/.."

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: python3 not found. Please install Python 3 first."
    exit 1
fi

# Navigate to project root
cd "$PROJECT_ROOT" || exit 1

echo "🌐 Starting server at http://localhost:8000"
echo "📂 Serving from: $(pwd)"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=================================="

# Start Python HTTP server
python3 -m http.server 8000
