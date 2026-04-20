#!/bin/bash
# PC Heartbeat Script for Linux
# Installer sur chaque PC Linux des employes

MATRICULE="$1"

if [ -z "$MATRICULE" ]; then
    echo "Usage: ./heartbeat.sh ARIS-0001"
    exit 1
fi

API_URL="https://apiv2.aris-cc.com/api/pc-status/heartbeat"

echo "PC Heartbeat started for $MATRICULE"
echo "Press Ctrl+C to stop"

while true; do
    RESPONSE=$(curl -s -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -d "{\"badge_code\": \"$MATRICULE\"}" \
        --connect-timeout 5 \
        --max-time 10)
    
    if echo "$RESPONSE" | grep -q "ok"; then
        echo "[$(date '+%H:%M:%S')] Heartbeat OK - PC marked as online"
    else
        echo "[$(date '+%H:%M:%S')] Heartbeat failed: $RESPONSE"
    fi
    
    sleep 60
done
