#!/bin/bash

# GlamorByBee - Clean Generated Data
# This script removes all generated test data files

echo "🐝 GlamorByBee - Clean Generated Data"
echo "======================================"

PROJECT_ROOT="$(dirname "$0")/.."

echo "⚠️  This will delete all generated test data files:"
echo "   • excel/master.xlsx"
echo "   • json/customers.json"
echo "   • json/addresses.json"
echo "   • json/appointments.json"
echo "   • json/products.json"
echo "   • json/invoices.json"
echo "   • json/staff.json"
echo "   • json/master_data.json"
echo ""
read -p "Are you sure you want to continue? (y/N) " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 0
fi

cd "$PROJECT_ROOT" || exit 1

echo "🧹 Cleaning generated files..."

# Remove Excel file
if [ -f "excel/master.xlsx" ]; then
    rm "excel/master.xlsx"
    echo "✅ Removed excel/master.xlsx"
fi

# Remove JSON files
for file in customers addresses appointments products invoices staff master_data; do
    if [ -f "json/${file}.json" ]; then
        rm "json/${file}.json"
        echo "✅ Removed json/${file}.json"
    fi
done

echo ""
echo "✨ Cleanup complete!"
echo ""
echo "To regenerate data, run:"
echo "   ./bash_scripts/generate_data.sh"
