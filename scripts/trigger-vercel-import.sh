#!/bin/bash

# Script to manually trigger the Vercel import endpoint

VERCEL_URL="https://pokemon-catalog-stable.vercel.app"

echo "🚀 Manually triggering Vercel game data import..."
echo "URL: $VERCEL_URL/api/admin/import-game-data"

# Make the POST request
response=$(curl -X POST "$VERCEL_URL/api/admin/import-game-data" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}" \
  -s)

echo "Response:"
echo "$response"

# Check status
echo -e "\n📊 Checking import status..."
curl -s "$VERCEL_URL/api/admin/import-game-data" | jq '.' 2>/dev/null || echo "Status check failed"