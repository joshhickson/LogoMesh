#!/bin/bash
# Run the LogoMesh Green Agent

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Load .env file from parent directory if it exists
if [ -f "../.env" ]; then
    set -a
    source "../.env"
    set +a
fi

# Check for OPENAI_API_KEY
if [ -z "$OPENAI_API_KEY" ]; then
    echo "Error: OPENAI_API_KEY environment variable not set"
    echo "Create a .env file in the repository root with:"
    echo "  OPENAI_API_KEY=sk-proj-..."
    exit 1
fi

# Default model settings (can be overridden)
MODEL_TYPE=${MODEL_TYPE:-openai}
MODEL_NAME=${MODEL_NAME:-gpt-4o-mini}
AGENT_PORT=${AGENT_PORT:-9040}

echo "Starting LogoMesh Green Agent..."
echo "  Port: $AGENT_PORT"
echo "  Model: $MODEL_TYPE/$MODEL_NAME"
echo ""

agentbeats run_agent agent_card.toml \
    --agent_host 0.0.0.0 \
    --agent_port $AGENT_PORT \
    --model_type $MODEL_TYPE \
    --model_name $MODEL_NAME \
    --tool tools.py
