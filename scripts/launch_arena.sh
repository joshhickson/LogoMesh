#!/bin/bash

# --- Color Definitions ---
GREEN='\033[0;32m' # DOCKER RUNNING OK
RED='\033[0;31m' # DOCKET RUNNING ERROR
NC='\033[0m' # No Color

echo -e "${GREEN}[LaunchArena] Starting Arena setup checks...${NC}"

# 1. Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}[Error] Docker is not running. Please start Docker first.${NC}"
    exit 1
fi
echo -e "${GREEN}[OK] Docker is running.${NC}"

# 2. Check if GPU is available
if ! nvidia-smi > /dev/null 2>&1; then
    echo -e "${RED}[Error] No NVIDIA GPU detected or drivers are missing.${NC}"
    exit 1
fi
echo -e "${GREEN}[OK] GPU is available.${NC}"

# 3. Cleanup existing Green Agent container
echo -e "${GREEN}[LaunchArena] Cleaning up old containers...${NC}"
docker rm -f green-agent > /dev/null 2>&1

# 4. Launch Green Agent
echo -e "${GREEN}[LaunchArena] Launching Green Agent (Judge)...${NC}"
# Note: Using the 7B model configuration we verified earlier
docker run -d --name green-agent --network host \
  -e OPENAI_BASE_URL=http://localhost:8000/v1 \
  -e OPENAI_API_KEY=EMPTY \
  -e MODEL_NAME=Qwen/Qwen2.5-Coder-7B-Instruct \
  polyglot-agent:latest \
  uv run python main.py --role GREEN --port 9000

if [ $? -eq 0 ]; then
    echo -e "${GREEN}[Success] Green Agent is running in detached mode.${NC}"
    echo -e "${GREEN}[LaunchArena] Tailing logs (Ctrl+C to stop)...${NC}"
    docker logs -f green-agent
else
    echo -e "${RED}[Error] Failed to launch Green Agent.${NC}"
    exit 1
fi
