#!/bin/bash
# A2A-Compliant Agent Runner for LogoMesh

set -e

echo "🚀 Starting LogoMesh Green Agent (A2A-Compliant)"

# 1. Install Dependencies
echo "📦 Installing dependencies..."
# Using pip install -e . to ensure all project packages are available.
pip install -e .

# 2. Set Environment Variables
# The port the A2A server will run on.
export A2A_PORT=${A2A_PORT:-9040}
# The publicly accessible URL for this agent.
# This is crucial for the AgentBeats platform to communicate with us.
# It can be overridden by an environment variable for production.
export A2A_CARD_URL=${A2A_CARD_URL:-"http://localhost:$A2A_PORT"}

# 3. Launch the A2A Server
echo "🛰️  Launching A2A Server on port $A2A_PORT..."
echo "    Card URL advertised: $A2A_CARD_URL"

# We will create this server script in the next step.
python3 src/a2a_server.py --host 0.0.0.0 --port $A2A_PORT --card-url $A2A_CARD_URL
