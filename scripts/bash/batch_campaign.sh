#!/bin/bash

# Configuration
GREEN_AGENT_URL="http://localhost:9000/actions/send_coding_task"
PURPLE_AGENT_URL="http://localhost:9001"
ITERATIONS=50
SLEEP_SECONDS=5

echo "Starting Campaign Mode: ${ITERATIONS} battles..."

for ((i=1; i<=ITERATIONS; i++))
do
    BATTLE_ID="campaign_gen1_battle_${i}"
    echo "[${i}/${ITERATIONS}] initiating battle: ${BATTLE_ID}"
    
    # Send request with timeout
    RESPONSE=$(curl -m 120 -s -X POST "${GREEN_AGENT_URL}" \
         -H "Content-Type: application/json" \
         -d "{
               \"battle_id\": \"${BATTLE_ID}\",
               \"purple_agent_url\": \"${PURPLE_AGENT_URL}\",
               \"red_agent_url\": null
             }")
    
    # Debug output
    echo "DEBUG: Response length: ${#RESPONSE}"
    
    # Simple check if success
    if echo "$RESPONSE" | grep -q '"success":true'; then
        echo "   -> sandbox: SUCCESS"
    else
        echo "   -> sandbox: FAILED or OTHER (Check DB)"
        # Print failure reason if possible
        echo "$RESPONSE" | grep -o '"output":"[^"]*"' | head -c 200
        echo ""
    fi
    
    # Extract Score using Python since we don't have jq
    SCORE=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('evaluation', {}).get('cis_score', 'N/A'))" 2>/dev/null)
    echo "   -> cis_score: ${SCORE}"

    sleep $SLEEP_SECONDS
done

echo "Campaign Complete."
