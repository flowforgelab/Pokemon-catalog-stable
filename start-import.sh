#!/bin/bash

# Start the Pokemon TCG data import in the background

echo "Starting Pokemon TCG data import..."
echo "This will run in the background and take 3-5 hours to complete."
echo ""

# Make sure we're in the right directory
cd "$(dirname "$0")"

# Start the import in background
nohup node scripts/import-game-data-resume.js > import.log 2>&1 &

# Get the process ID
PID=$!
echo "Import started with process ID: $PID"
echo ""

# Save PID to file for later reference
echo $PID > import.pid

echo "Commands to monitor progress:"
echo "  Check status:  node scripts/check-import-status.js"
echo "  Watch logs:    tail -f import.log"
echo "  Stop import:   kill $PID"
echo ""
echo "The import will continue even if you close this terminal."