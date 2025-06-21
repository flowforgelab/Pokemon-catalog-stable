#!/bin/bash

# Script to manually trigger the Vercel import with temporary auth bypass

VERCEL_URL="https://pokemon-catalog-stable.vercel.app"

echo "🚀 Manually triggering Vercel game data import (with manual trigger param)..."
echo "URL: $VERCEL_URL/api/admin/import-game-data?trigger=manual"

# Make the POST request with manual trigger
response=$(curl -X POST "$VERCEL_URL/api/admin/import-game-data?trigger=manual" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}" \
  -s)

echo "Response:"
echo "$response"

echo -e "\n📊 Checking import status..."
curl -s "$VERCEL_URL/api/import/status" | jq '.' 2>/dev/null || echo "Status check failed"

echo -e "\n⚠️  Note: Remove the manual trigger bypass after initial setup!"