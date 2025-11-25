#!/bin/bash

# GlamorByBee - Generate Master Data
# This script runs the Python data generator (excel/generate_master.py)

echo "🐝 GlamorByBee - Generating Master Data"
echo "========================================"

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: python3 not found. Please install Python 3 first."
    exit 1
fi

# Navigate to excel directory
PROJECT_ROOT="$(dirname "$0")/.."
cd "$PROJECT_ROOT/excel" || exit 1

echo "📊 Running excel/generate_master.py..."
python3 generate_master.py

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Master data generated successfully!"
    echo "📁 Files created:"
    echo "   • excel/master.xlsx"
    echo "   • json/customers.json"
    echo "   • json/addresses.json"
    echo "   • json/appointments.json"
    echo "   • json/products.json"
    echo "   • json/invoices.json"
    echo "   • json/staff.json"
    echo "   • json/master_data.json"
else
    echo "❌ Failed to generate data"
    exit 1
fi
