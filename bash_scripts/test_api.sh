#!/bin/bash
# Test booking API endpoints

echo "🧪 Testing GlamorByBee Booking API..."
echo ""

# Default to localhost, but allow override
API_URL="${1:-http://localhost:3000}"

echo "Testing against: $API_URL"
echo ""

# Test health endpoint
echo "1️⃣  Testing Health Endpoint..."
curl -s "$API_URL/api/health" | jq . || echo "Health check failed"
echo ""

# Test booking endpoint with sample data
echo "2️⃣  Testing Booking Endpoint..."
curl -X POST "$API_URL/api/booking" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+1234567890",
    "service_name": "Bridal Makeup",
    "date": "2025-12-20",
    "time": "10:00",
    "location": "studio",
    "serviceAddress": "",
    "notes": "Test booking"
  }' | jq . || echo "Booking submission failed"

echo ""
echo "✅ Tests completed!"
echo ""
echo "If you see success responses above, your API is working correctly."
echo ""
echo "For remote (Vercel) testing, replace $API_URL with your deployed URL:"
echo "  ./test_api.sh https://glamorbybee.com"
