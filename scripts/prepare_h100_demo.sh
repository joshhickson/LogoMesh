#!/bin/bash
# H100 Demo Preparation Script for AgentBeats/LogoMesh
# Designed for Nvidia H100 Lambda Instance - Ubuntu/Debian
# Runs Task 015 (Event Sourcing) Live Demo

set -e

# 1. Check for API Key
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ Error: OPENAI_API_KEY is not set."
    echo "Please export your key:"
    echo "  export OPENAI_API_KEY='sk-...'"
    echo "  (or add to .env file)"
    exit 1
fi

echo "✅ API Key found."

# 2. Install Dependencies (assuming uv or pip available)
echo "📦 Installing dependencies..."
if command -v uv &> /dev/null; then
    uv sync
    RUN_CMD="uv run"
else
    pip install -r requirements.txt || pip install -e .
    RUN_CMD="python"
fi

# 3. Cleanup Stale Processes
echo "🧹 Cleaning up old agents..."
pkill -f "main.py --role PURPLE" || true
pkill -f "main.py --role GREEN" || true
sleep 2

# 4. Start Agents
echo "🚀 Starting Agents..."

# Start Green Agent (Judge) on 9040
$RUN_CMD main.py --role GREEN --host 0.0.0.0 --port 9040 > green_agent.log 2>&1 &
GREEN_PID=$!
echo "   - Green Agent started (PID $GREEN_PID, Port 9040)"

# Start Purple Agent (Candidate) on 9010
$RUN_CMD main.py --role PURPLE --host 0.0.0.0 --port 9010 > purple_agent.log 2>&1 &
PURPLE_PID=$!
echo "   - Purple Agent started (PID $PURPLE_PID, Port 9010)"

# Wait for startup
echo "⏳ Waiting 10s for agents to initialize..."
sleep 10

# 5. Execute Live Demo Run (Task 015)
echo "🎬 STARTING LIVE DEMO RUN: Task 015 (Event Sourcing / CQRS)"
echo "---------------------------------------------------------------"

# Using curl to stream the interaction
# We are asking Green to audit Purple on Task 015
curl -s -X POST http://localhost:9040/actions/send_coding_task \
  -H "Content-Type: application/json" \
  -d '{
    "battle_id": "demo-h100-live",
    "purple_agent_url": "http://localhost:9010/",
    "task_id": "task-015",
    "config": {
        "red_agent_mcts": true
    }
  }' | tee demo_result.json

echo ""
echo "---------------------------------------------------------------"
echo "✅ Demo Complete."
echo "   - Result saved to demo_result.json"
echo "   - Agent logs: green_agent.log, purple_agent.log"

# 6. Optional: Cleanup
# echo "🛑 Stopping agents..."
# kill $GREEN_PID $PURPLE_PID
