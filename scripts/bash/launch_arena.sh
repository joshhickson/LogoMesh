#!/bin/bash

# terminal colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# using 32b awq for better logic on the lambda gpu
MODEL="Qwen/Qwen2.5-Coder-32B-Instruct-AWQ"

echo -e "${BLUE}[arena] starting the full setup...${NC}"

# 0. build the polyglot docker image
echo -e "${GREEN}[LaunchArena] Building Docker Image...${NC}"
sudo docker build -t polyglot-agent:latest -f Dockerfile.gpu .

# 1. remove old containers to avoid conflicts
echo -e "${BLUE}[arena] cleaning up old containers...${NC}"
sudo docker rm -f vllm-server green-agent purple-agent > /dev/null 2>&1

# 2. start the vllm brain
echo -e "${BLUE}[arena] launching vllm with ${MODEL}...${NC}"
sudo docker run --gpus all --network host --name vllm-server -d \
  polyglot-agent:latest \
  uv run vllm serve $MODEL \
  --port 8000 --trust-remote-code

# 3. wait for the server to actually start
echo -e "${BLUE}[arena] waiting for vllm to be ready (usually takes 2 mins)...${NC}"
until curl -s http://localhost:8000/v1/models > /dev/null; do
    echo -n "."
    sleep 5
done
echo -e "\n${GREEN}[ok] brain is online.${NC}"

# Create the data folder on your host if it doesn't exist
mkdir -p $(pwd)/data

# 4. start the judge (green agent)
echo -e "${BLUE}[arena] launching the judge on port 9000...${NC}"
sudo docker run -d --name green-agent --network host \
  -v $(pwd)/data:/app/data \
  -e OPENAI_BASE_URL=http://localhost:8000/v1 \
  -e OPENAI_API_KEY=EMPTY \
  -e MODEL_NAME=$MODEL \
  polyglot-agent:latest \
  uv run python main.py --role GREEN --port 9000

# 5. start the defender (purple agent)
echo -e "${BLUE}[arena] launching the defender on port 9001...${NC}"
sudo docker run -d --name purple-agent --network host \
  -e OPENAI_BASE_URL=http://localhost:8000/v1 \
  -e OPENAI_API_KEY=EMPTY \
  -e OPENAI_MODEL=$MODEL \
  polyglot-agent:latest \
  uv run python main.py --role PURPLE --host localhost --port 9001

echo -e "${GREEN}[success] arena is live and ready.${NC}"
echo -e "${GREEN}------------------------------------------${NC}"
echo -e "judge:    http://localhost:9000"
echo -e "defender: http://localhost:9001"
echo -e "brain:    http://localhost:8000"
echo -e "${GREEN}------------------------------------------${NC}"
echo -e "you can run the battle curl command now."
