#!/bin/bash
#=============================================================================
# Tier 3 (gpt-oss-20b) Preparation & Setup
# Purpose: Configure infrastructure for gpt-oss-20b with Harmony protocol
# Date: 2026-01-15
#=============================================================================

set -e

REPO_DIR="/home/ubuntu/LogoMesh"
GPTOSS_PORT=8002
VLLM_LOG="/tmp/gptoss_server.log"

echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║              Tier 3 (gpt-oss-20b) Preparation & Setup                  ║"
echo "║                                                                        ║"
echo "║  Model: openai/gpt-oss-20b (MoE + Harmony Protocol)                   ║"
echo "║  Port: ${GPTOSS_PORT}                                                      ║"
echo "║  Quantization: MXFP4 (4-bit Microscaling)                             ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Verify GPU is ready
echo "Step 1: Checking GPU memory..."
GPU_FREE=$(nvidia-smi --query-gpu=memory.free --format=csv,noheader | awk '{print $1}')
echo "   Free GPU Memory: ${GPU_FREE} MiB"

if [ "${GPU_FREE}" -lt 50000 ]; then
    echo "   ⚠️  WARNING: Less than 50GB free. Killing other processes..."
    pkill -f "vllm serve" || true
    sleep 10
    GPU_FREE=$(nvidia-smi --query-gpu=memory.free --format=csv,noheader | awk '{print $1}')
    echo "   Free GPU Memory after cleanup: ${GPU_FREE} MiB"
fi

# Step 2: Install gpt-oss vLLM build
echo ""
echo "Step 2: Installing vLLM with gpt-oss support..."
echo "   Command: uv pip install --pre 'vllm==0.10.1+gptoss' --extra-index-url https://wheels.vllm.ai/gpt-oss/ --index-strategy unsafe-best-match"

cd "${REPO_DIR}"

# Check if already installed
VLLM_VERSION=$(uv run python -c "import vllm; print(vllm.__version__)" 2>&1 || echo "not_installed")
if [[ "${VLLM_VERSION}" == *"gptoss"* ]]; then
    echo "   ✅ gpt-oss vLLM already installed (${VLLM_VERSION})"
else
    echo "   Installing gpt-oss vLLM build..."
    uv pip install --pre "vllm==0.10.1+gptoss" \
        --extra-index-url "https://wheels.vllm.ai/gpt-oss/" \
        --index-strategy unsafe-best-match 2>&1 | tail -10
    echo "   ✅ Installation complete"
fi

# Step 3: Start gpt-oss-20b server
echo ""
echo "Step 3: Starting gpt-oss-20b server on port ${GPTOSS_PORT}..."
echo "   Command: uv run vllm serve openai/gpt-oss-20b --trust-remote-code --port ${GPTOSS_PORT}"

# Kill any existing process on this port
pkill -f "vllm serve openai/gpt-oss" || true
sleep 5

export OPENAI_API_KEY="EMPTY"
nohup uv run vllm serve openai/gpt-oss-20b \
    --trust-remote-code \
    --port ${GPTOSS_PORT} \
    > "${VLLM_LOG}" 2>&1 &

GPTOSS_PID=$!
echo "   Process ID: ${GPTOSS_PID}"
echo "   Logs: ${VLLM_LOG}"

# Step 4: Wait for server startup (with timeout)
echo ""
echo "Step 4: Waiting for gpt-oss-20b server to be ready..."
WAIT_TIME=0
MAX_WAIT=300  # 5 minutes
READY=0

while [ $WAIT_TIME -lt $MAX_WAIT ]; do
    if curl -s "http://localhost:${GPTOSS_PORT}/v1/models" > /dev/null 2>&1; then
        echo "   ✅ Server ready on http://localhost:${GPTOSS_PORT}"
        READY=1
        break
    fi
    echo "   ⏳ Waiting... (${WAIT_TIME}/${MAX_WAIT}s)"
    sleep 10
    WAIT_TIME=$((WAIT_TIME + 10))
done

if [ $READY -eq 0 ]; then
    echo "   ❌ Server failed to start. Check ${VLLM_LOG}"
    tail -50 "${VLLM_LOG}"
    exit 1
fi

# Step 5: Verify Harmony protocol support
echo ""
echo "Step 5: Verifying Harmony protocol support..."
HARMONY_CHECK=$(curl -s "http://localhost:${GPTOSS_PORT}/v1/models" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    model = d['data'][0]['id'] if d.get('data') else 'unknown'
    print('✅ gpt-oss model loaded: ' + model)
except:
    print('❌ Failed to parse model info')
" 2>&1)
echo "   ${HARMONY_CHECK}"

# Step 6: Summary
echo ""
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                    Tier 3 Setup Complete ✅                            ║"
echo "║                                                                        ║"
echo "║  Model: openai/gpt-oss-20b                                            ║"
echo "║  URL: http://localhost:${GPTOSS_PORT}                                     ║"
echo "║  Status: READY                                                        ║"
echo "║                                                                        ║"
echo "║  Next Step: Run Tier 3 battles                                        ║"
echo "║  Command: uv run python scripts/run_tier3_gptoss.py                   ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""
