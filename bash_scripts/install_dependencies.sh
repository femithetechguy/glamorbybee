#!/bin/bash

# GlamorByBee - Install Python Dependencies
# This script installs required Python packages for data generation

echo "🐝 GlamorByBee - Installing Python Dependencies"
echo "================================================"

# Check if pip3 is available
if ! command -v pip3 &> /dev/null; then
    echo "❌ Error: pip3 not found. Please install Python 3 first."
    exit 1
fi

echo "📦 Installing openpyxl for Excel file generation..."
pip3 install openpyxl

if [ $? -eq 0 ]; then
    echo "✅ openpyxl installed successfully!"
else
    echo "❌ Failed to install openpyxl"
    exit 1
fi

echo ""
echo "✨ All dependencies installed!"
echo "You can now run: ./bash_scripts/generate_data.sh"
