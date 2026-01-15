#!/bin/bash
# scripts/finish_the_job.sh
# Automates the sequence of Tier 1 and Tier 3 reruns after Tier 2 completes.
# Usage: nohup ./scripts/finish_the_job.sh > /tmp/finish.log 2>&1 &

TIER2_PID=199187
LOG_FILE="/tmp/finish_the_job.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "--- STARTING QUEUED NIGHTLY JOB ---"
log "Waiting for Tier 2 (PID $TIER2_PID) to finish..."

# Loop until PID is gone
while ps -p $TIER2_PID > /dev/null; do
    sleep 60
done

log "Tier 2 process finished. Beginning transition to Tier 1."

# ==============================================================================
# TIER 1: MISTRAL-NEMO (Weak/Architectural Baseline)
# ==============================================================================
log ">>> PREPARING TIER 1 (MISTRAL) <<<"

# 1. Clean up existing vLLM (Qwen)
log "Stopping Qwen vLLM..."
pkill -f "vllm serve"
sleep 10
pkill -9 -f "vllm serve" || true

# 2. Start Mistral vLLM on Port 8001
# Using 8001 to maintain consistency with current recovery topology
log "Starting Mistral-Nemo-Instruct on Port 8001..."
export OPENAI_API_KEY="EMPTY"
nohup uv run vllm serve mistralai/Mistral-Nemo-Instruct-2407 \
  --port 8001 \
  --trust-remote-code \
  --max-model-len 16384 \
  > /tmp/vllm_mistral.log 2>&1 &
VLLM_PID=$!

# 3. Wait for Healthy Endpoint
log "Waiting for Mistral readiness probe..."
READY=0
for i in {1..60}; do
    if curl -s http://localhost:8001/v1/models | grep -q "object"; then
        READY=1
        break
    fi
    sleep 10
done

if [ $READY -eq 0 ]; then
    log "❌ CRITICAL: Mistral failed to start. Aborting."
    exit 1
fi
log "✅ Mistral is ready."

# 4. Reconfigure Docker Agents
log "Reconfiguring Agents for Mistral..."
sudo docker rm -f green-agent purple-agent || true

# Purple Agent (The Evaluated Subject)
sudo docker run -d --name purple-agent \
  --restart unless-stopped \
  --net=host \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e OPENAI_API_BASE=http://localhost:8001/v1 \
  -e OPENAI_API_KEY=EMPTY \
  -e OPENAI_MODEL=mistralai/Mistral-Nemo-Instruct-2407 \
  polyglot-agent:latest uv run python main.py --role PURPLE --port 9001

# Green Agent (The Judge)
sudo docker run -d --name green-agent \
  --restart unless-stopped \
  --net=host \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e OPENAI_API_BASE=http://localhost:8001/v1 \
  -e OPENAI_API_KEY=EMPTY \
  -e MODEL_NAME=mistralai/Mistral-Nemo-Instruct-2407 \
  polyglot-agent:latest uv run python main.py --role GREEN --port 9000

log "Waiting for Green Agent to be ready..."
AGENT_READY=0
for i in {1..30}; do
    if curl -s http://localhost:9000/docs > /dev/null; then
        AGENT_READY=1
        break
    fi
    sleep 2
done

if [ $AGENT_READY -eq 0 ]; then
    log "❌ Green Agent failed to start. logs:"
    sudo docker logs green-agent | tail -n 20 | tee -a "$LOG_FILE"
    exit 1
fi
log "✅ Green Agent is ready."

sleep 5

# 5. Run Tier 1 Battles
log "Executing Tier 1 Battles (25 rounds)..."
uv run python scripts/run_tier1_mistral.py >> "$LOG_FILE" 2>&1
log "✅ Tier 1 Complete."

# ==============================================================================
# TIER 3: GPT-OSS (Strong/Harmony Baseline)
# ==============================================================================
log ">>> PREPARING TIER 3 (GPT-OSS) <<<"

# 1. Clean up Mistral
log "Stopping Mistral vLLM..."
kill $VLLM_PID
pkill -f "vllm serve"
sleep 10

# 2. Install Custom vLLM if required (Check derived from setup_tier3_gptoss.sh)
if ! python3 -c "import vllm; print(vllm.__version__)" | grep -q "gptoss"; then
    log "Installing vLLM gpt-oss fork (One-time setup)..."
    uv pip install --pre "vllm==0.10.1+gptoss" \
      --extra-index-url "https://wheels.vllm.ai/gpt-oss/" \
      --index-strategy unsafe-best-match >> "$LOG_FILE" 2>&1
fi

# 3. Start GPT-OSS vLLM on Port 8001
# Reusing 8001 simplifies Docker networking (no need to change Agents' API_BASE)
log "Starting gpt-oss-20b on Port 8001..."
nohup uv run vllm serve openai/gpt-oss-20b \
  --port 8001 \
  --trust-remote-code \
  > /tmp/vllm_gptoss.log 2>&1 &
VLLM_PID=$!

log "Waiting for gpt-oss readiness probe..."
READY=0
for i in {1..60}; do # Slower start time for MoE
    if curl -s http://localhost:8001/v1/models | grep -q "object"; then
        READY=1
        break
    fi
    sleep 10
done

if [ $READY -eq 0 ]; then
    log "❌ CRITICAL: gpt-oss failed to start. Aborting."
    exit 1
fi
log "✅ gpt-oss is ready."

# 4. Reconfigure Docker Agents
log "Reconfiguring Agents for gpt-oss..."
sudo docker rm -f green-agent purple-agent || true

sudo docker run -d --name purple-agent \
  --restart unless-stopped \
  --net=host \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e OPENAI_API_BASE=http://localhost:8001/v1 \
  -e OPENAI_API_KEY=EMPTY \
  -e OPENAI_MODEL=openai/gpt-oss-20b \
  polyglot-agent:latest uv run python main.py --role PURPLE --port 9001

sudo docker run -d --name green-agent \
  --restart unless-stopped \
  --net=host \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e OPENAI_API_BASE=http://localhost:8001/v1 \
  -e OPENAI_API_KEY=EMPTY \
  -e MODEL_NAME=openai/gpt-oss-20b \
  polyglot-agent:latest uv run python main.py --role GREEN --port 9000

sleep 10

# 5. Run Tier 3 Battles
log "Executing Tier 3 Battles (25 rounds)..."
uv run python scripts/run_tier3_gptoss.py >> "$LOG_FILE" 2>&1
log "✅ Tier 3 Complete."

log "--- NIGHTLY JOB SUCCESSFUL ---"
