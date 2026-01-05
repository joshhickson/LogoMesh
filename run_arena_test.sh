#!/bin/bash
set -e

# Start vLLM
echo "Starting vLLM..."
# Note: --quantization awq is usually auto-detected for AWQ models, but good to be explicit if needed.
# However, vLLM might complain if the model config says otherwise.
# I'll rely on auto-detection first, but if it fails I might need to add it.
# Actually, for AWQ models, vLLM usually just works.
nohup uv run vllm serve Qwen/Qwen2.5-Coder-32B-Instruct-AWQ --port 8000 --host 0.0.0.0 --max-model-len 16384 > vllm.log 2>&1 &
VLLM_PID=$!

# Wait for vLLM
echo "Waiting for vLLM to be ready..."
for i in {1..120}; do
    if curl -s http://localhost:8000/v1/models > /dev/null; then
        echo "vLLM is ready!"
        break
    fi
    sleep 5
    echo "Waiting... ($i/120)"
done

# Check if vLLM is still running
if ! kill -0 $VLLM_PID 2>/dev/null; then
    echo "vLLM failed to start. Check vllm.log"
    cat vllm.log
    exit 1
fi

# Run Scenario
echo "Running Scenario..."
export OPENAI_BASE_URL="http://localhost:8000/v1"
export OPENAI_API_KEY="token"
uv run agentbeats-run scenarios/security_arena/scenario_debugdump.toml --show-logs

# Cleanup
echo "Stopping vLLM..."
kill $VLLM_PID
