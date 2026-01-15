#!/bin/bash

# Configuration
GREEN_AGENT_URL="http://localhost:9000/actions/send_coding_task"
PURPLE_AGENT_URL="http://localhost:9001"
RED_AGENT_URL="http://localhost:9021"
ITERATIONS=50
SLEEP_SECONDS=5

echo "Starting Campaign Mode: ${ITERATIONS} battles..."

for ((i=1; i<=ITERATIONS; i++))
do
    BATTLE_ID="campaign_gen1_battle_${i}"
    echo "[${i}/${ITERATIONS}] initiating battle: ${BATTLE_ID}"
    
    # Send request with timeout
    RESPONSE=$(curl -m 600 -s -X POST "${GREEN_AGENT_URL}" \
         -H "Content-Type: application/json" \
         -d "{
               \"battle_id\": \"${BATTLE_ID}\",
               \"purple_agent_url\": \"${PURPLE_AGENT_URL}\",
               \"red_agent_url\": \"${RED_AGENT_URL}\"
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
    
    # Extract Score and Red Agent penalty using Python since we don't have jq
    SCORE=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('evaluation', {}).get('cis_score', 'N/A'))" 2>/dev/null)
    RED_PENALTY=$(echo "$RESPONSE" | python3 -c "import sys, json; e=json.load(sys.stdin).get('evaluation', {}); print(f\"{e.get('red_penalty_applied', 0)*100:.0f}%\" if e.get('red_penalty_applied') else 'N/A')" 2>/dev/null)
    RED_SEV=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('evaluation', {}).get('red_analysis', {}).get('max_severity', 'none'))" 2>/dev/null)
    echo "   -> cis_score: ${SCORE} | red_penalty: ${RED_PENALTY} (${RED_SEV})"

    sleep $SLEEP_SECONDS
done

echo "Campaign Complete."
