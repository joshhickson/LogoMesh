#!/bin/bash
# H100 Demo Preparation Script for AgentBeats/LogoMesh
# Designed for Nvidia H100 Lambda Instance - Ubuntu/Debian
# Runs Task 015 (Event Sourcing) Live Demo

set -e

# 1. Check for API Key
# if [ -z "$OPENAI_API_KEY" ]; then
#     echo "❌ Error: OPENAI_API_KEY is not set."
#     echo "Please export your key:"
#     echo "  export OPENAI_API_KEY='sk-...'"
#     echo "  (or add to .env file)"
#     exit 1
# fi

echo "✅ API Key check skipped. Assuming key is provided to Docker containers."

# 2. Install Dependencies (assuming uv or pip available)
echo "📦 Installing dependencies..."
if command -v uv &> /dev/null; then
    uv sync
    RUN_CMD="uv run"
else
    pip install -r docs/requirements.txt || pip install -e .
    RUN_CMD="python"
fi

# 4. Start Agents with Docker Compose
echo "🚀 Starting Agents via Docker Compose..."
sudo docker-compose -f docker-compose.agents.yml up -d --build

# Wait for startup
echo "⏳ Waiting 15s for agents to initialize..."
sleep 15

# 5. Execute Live Demo Run (Task 015)
echo "🎬 STARTING LIVE DEMO RUN: Task 015 (Event Sourcing / CQRS)"
echo "---------------------------------------------------------------"

# Using curl to stream the interaction
# We are asking Green to audit Purple on Task 015
curl -s -X POST http://localhost:9040/actions/send_coding_task \
  -H "Content-Type: application/json" \
  -d '{
    "battle_id": "demo-h100-live-1",
    "purple_agent_url": "http://purple:9010",
    "task_id": "task-015",
    "config": {
        "red_agent_mcts": true
    }
  }' | tee results/final_submission/run_1_result.json

echo ""
echo "---------------------------------------------------------------"
echo "✅ Demo Complete."
echo "   - Result saved to results/final_submission/run_1_result.json"
echo "   - Agent logs: green_agent.log, purple_agent.log"

sleep 10

echo "🎬 STARTING LIVE DEMO RUN 2: Task 015 (Event Sourcing / CQRS)"
echo "---------------------------------------------------------------"

curl -s -X POST http://localhost:9040/actions/send_coding_task \
  -H "Content-Type: application/json" \
  -d '{
    "battle_id": "demo-h100-live-2",
    "purple_agent_url": "http://purple:9010",
    "task_id": "task-015",
    "config": {
        "red_agent_mcts": true
    }
  }' | tee results/final_submission/run_2_result.json

echo ""
echo "---------------------------------------------------------------"
echo "✅ Demo 2 Complete."
echo "   - Result saved to results/final_submission/run_2_result.json"
echo "   - Agent logs: green_agent.log, purple_agent.log"


# 6. Optional: Cleanup
# echo "🛑 Stopping agents..."
# kill $GREEN_PID $PURPLE_PID

# 7. Update Leaderboard
# echo "📊 Updating leaderboard..."
# python3 scripts/update_leaderboard.py
