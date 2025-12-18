#!/bin/bash
# Run the LogoMesh Purple Agent

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

# Default settings
AGENT_PORT=${AGENT_PORT:-9050}

echo "Starting LogoMesh Purple Agent..."
echo "  Port: $AGENT_PORT"
echo ""

agentbeats run_agent agent_card.toml --tool tools.py --agent_port $AGENT_PORT
