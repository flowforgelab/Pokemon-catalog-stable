#!/bin/bash
# Setup script for daily game data import

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
IMPORT_SCRIPT="$SCRIPT_DIR/import-game-data-daily.js"

echo "🔧 Setting up daily Pokemon TCG data import"
echo "=========================================="
echo ""

# Make import script executable
chmod +x "$IMPORT_SCRIPT"

# Check if API key is set
if ! grep -q "POKEMON_TCG_API_KEY=" "$PROJECT_DIR/.env.local"; then
    echo "❌ ERROR: POKEMON_TCG_API_KEY not found in .env.local"
    exit 1
fi

echo "✅ API key found in .env.local"
echo ""

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - use launchd
    echo "📱 Detected macOS - Setting up with launchd"
    
    PLIST_FILE="$HOME/Library/LaunchAgents/com.pokemon-catalog.daily-import.plist"
    
    cat > "$PLIST_FILE" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.pokemon-catalog.daily-import</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>$IMPORT_SCRIPT</string>
    </array>
    <key>WorkingDirectory</key>
    <string>$PROJECT_DIR</string>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>2</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>$PROJECT_DIR/logs/daily-import.log</string>
    <key>StandardErrorPath</key>
    <string>$PROJECT_DIR/logs/daily-import-error.log</string>
</dict>
</plist>
EOF
    
    # Create logs directory
    mkdir -p "$PROJECT_DIR/logs"
    
    # Load the launch agent
    launchctl unload "$PLIST_FILE" 2>/dev/null
    launchctl load "$PLIST_FILE"
    
    echo "✅ Daily import scheduled for 2:00 AM every day"
    echo "   Config: $PLIST_FILE"
    echo "   Logs: $PROJECT_DIR/logs/"
    echo ""
    echo "To check status: launchctl list | grep pokemon-catalog"
    echo "To stop: launchctl unload $PLIST_FILE"
    
else
    # Linux - use cron
    echo "🐧 Detected Linux - Setting up with cron"
    
    # Add to crontab
    CRON_JOB="0 2 * * * cd $PROJECT_DIR && /usr/bin/node $IMPORT_SCRIPT >> $PROJECT_DIR/logs/daily-import.log 2>&1"
    
    # Check if already exists
    if crontab -l 2>/dev/null | grep -q "import-game-data-daily.js"; then
        echo "⚠️  Cron job already exists. Updating..."
        (crontab -l 2>/dev/null | grep -v "import-game-data-daily.js"; echo "$CRON_JOB") | crontab -
    else
        (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    fi
    
    echo "✅ Daily import scheduled for 2:00 AM every day"
    echo "   Cron job added to crontab"
    echo "   Logs: $PROJECT_DIR/logs/"
    echo ""
    echo "To check: crontab -l"
    echo "To remove: crontab -e (and delete the line)"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Run manually first: node scripts/import-game-data-daily.js"
echo "2. Check progress: tail -f logs/daily-import.log"
echo "3. Monitor daily at 2 AM local time"
echo ""
echo "The import will run up to 950 cards per day until complete."