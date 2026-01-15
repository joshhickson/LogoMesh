#!/bin/bash
#=============================================================================
# C-NEW-001 Model Diversity Test Executor
# Purpose: Run 25 battles per model (Tier 1, Tier 2, Tier 3) to validate CIS
# Date: 2026-01-14
# Author: Josh
#=============================================================================

set -e

REPO_DIR="/home/ubuntu/LogoMesh"
RESULTS_DIR="${REPO_DIR}/results/c_new_001_diversity_test"
BATTLES_PER_TIER=25

# Create results directory
mkdir -p "${RESULTS_DIR}"

echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                  C-NEW-001 MODEL DIVERSITY TEST SUITE                  ║"
echo "║                                                                        ║"
echo "║  Objective: Validate CIS can distinguish between model capability     ║"
echo "║  Tiers: Mistral-7B (Weak) → Qwen-32B (Baseline) → gpt-oss (Strong)   ║"
echo "║  Battles: ${BATTLES_PER_TIER} per tier (${BATTLES_PER_TIER} × 3 = 75 total)                 ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

#=============================================================================
# TIER 1: Mistral-7B-Instruct-v0.3 (Weak - Lower Bound)
#=============================================================================
echo "🚀 TIER 1: Mistral-7B-Instruct-v0.3 (Weak Tier)"
echo "   Expected CIS: 0.48-0.65 (detects architecture/test weakness)"
echo ""

# Kill any existing Qwen process
pkill -f "vllm serve Qwen" || true
sleep 5

# Start Mistral-7B
echo "   [1/3] Starting Mistral-7B on port 8001..."
cd "${REPO_DIR}"
export OPENAI_API_KEY="EMPTY"
nohup uv run vllm serve mistralai/Mistral-7B-Instruct-v0.3 \
  --dtype bfloat16 \
  --port 8001 \
  --tensor-parallel-size 1 \
  > /tmp/mistral_server.log 2>&1 &

MISTRAL_PID=$!
sleep 60  # Allow time for model loading

# Verify Mistral is running
if ! curl -s http://localhost:8001/v1/models > /dev/null 2>&1; then
  echo "   ❌ ERROR: Mistral server failed to start. Check /tmp/mistral_server.log"
  exit 1
fi
echo "   ✅ Mistral-7B server ready on port 8001"

# Execute Tier 1 battles
echo "   [2/3] Executing ${BATTLES_PER_TIER} battles with Mistral-7B..."
TIER1_LOG="${RESULTS_DIR}/tier1_mistral_battles.log"
python "${REPO_DIR}/main.py" \
  --role GREEN \
  --port 9000 \
  --model-port 8001 \
  --model-name "mistralai/Mistral-7B-Instruct-v0.3" \
  --battles ${BATTLES_PER_TIER} \
  --output "${TIER1_LOG}" \
  2>&1 | tee -a "${RESULTS_DIR}/tier1_stdout.log"

TIER1_RESULT=$?
echo "   ✅ Tier 1 battles complete (exit code: ${TIER1_RESULT})"
echo ""

# Stop Mistral
kill ${MISTRAL_PID} 2>/dev/null || true
sleep 10

#=============================================================================
# TIER 2: Qwen-2.5-Coder-32B-Instruct-AWQ (Baseline - Control)
#=============================================================================
echo "🚀 TIER 2: Qwen-2.5-Coder-32B-Instruct-AWQ (Baseline Tier)"
echo "   Expected CIS: 0.76-0.87 (defines standard for coding quality)"
echo ""

# Start Qwen-32B
echo "   [1/3] Starting Qwen-2.5-Coder-32B on port 8000..."
cd "${REPO_DIR}"
nohup uv run vllm serve Qwen/Qwen2.5-Coder-32B-Instruct-AWQ \
  --quantization awq \
  --max-model-len 16384 \
  --port 8000 \
  > /tmp/qwen_server.log 2>&1 &

QWEN_PID=$!
sleep 120  # Allow time for model loading (larger model)

# Verify Qwen is running
if ! curl -s http://localhost:8000/v1/models > /dev/null 2>&1; then
  echo "   ❌ ERROR: Qwen server failed to start. Check /tmp/qwen_server.log"
  exit 1
fi
echo "   ✅ Qwen-32B server ready on port 8000"

# Execute Tier 2 battles
echo "   [2/3] Executing ${BATTLES_PER_TIER} battles with Qwen-32B..."
TIER2_LOG="${RESULTS_DIR}/tier2_qwen_battles.log"
python "${REPO_DIR}/main.py" \
  --role GREEN \
  --port 9000 \
  --model-port 8000 \
  --model-name "Qwen/Qwen2.5-Coder-32B-Instruct-AWQ" \
  --battles ${BATTLES_PER_TIER} \
  --output "${TIER2_LOG}" \
  2>&1 | tee -a "${RESULTS_DIR}/tier2_stdout.log"

TIER2_RESULT=$?
echo "   ✅ Tier 2 battles complete (exit code: ${TIER2_RESULT})"
echo ""

# Stop Qwen
kill ${QWEN_PID} 2>/dev/null || true
sleep 10

#=============================================================================
# TIER 3: openai/gpt-oss-20b (Strong - Upper Bound with Harmony Protocol)
#=============================================================================
echo "🚀 TIER 3: openai/gpt-oss-20b (Strong Tier - MoE + Harmony)"
echo "   Expected CIS: 0.85-0.93 (rewards agentic reasoning)"
echo ""

# Start gpt-oss-20b (requires vLLM 0.10.1+gptoss)
echo "   [1/3] Starting gpt-oss-20b on port 8002 (with Harmony protocol)..."
cd "${REPO_DIR}"

# Install gpt-oss vLLM build if not already present
if ! python -c "import vllm; print(vllm.__version__)" | grep -q "gptoss"; then
  echo "   ⚠️  Installing vLLM 0.10.1+gptoss..."
  uv pip install --pre "vllm==0.10.1+gptoss" \
    --extra-index-url "https://wheels.vllm.ai/gpt-oss/" \
    --index-strategy unsafe-best-match 2>&1 | tail -5
fi

nohup uv run vllm serve openai/gpt-oss-20b \
  --trust-remote-code \
  --port 8002 \
  > /tmp/gptoss_server.log 2>&1 &

GPTOSS_PID=$!
sleep 120  # Allow time for model loading

# Verify gpt-oss is running
if ! curl -s http://localhost:8002/v1/models > /dev/null 2>&1; then
  echo "   ❌ ERROR: gpt-oss server failed to start. Check /tmp/gptoss_server.log"
  exit 1
fi
echo "   ✅ gpt-oss-20b server ready on port 8002"

# Execute Tier 3 battles
echo "   [2/3] Executing ${BATTLES_PER_TIER} battles with gpt-oss-20b (Harmony protocol)..."
TIER3_LOG="${RESULTS_DIR}/tier3_gptoss_battles.log"
python "${REPO_DIR}/main.py" \
  --role GREEN \
  --port 9000 \
  --model-port 8002 \
  --model-name "openai/gpt-oss-20b" \
  --battles ${BATTLES_PER_TIER} \
  --output "${TIER3_LOG}" \
  2>&1 | tee -a "${RESULTS_DIR}/tier3_stdout.log"

TIER3_RESULT=$?
echo "   ✅ Tier 3 battles complete (exit code: ${TIER3_RESULT})"
echo ""

# Stop gpt-oss
kill ${GPTOSS_PID} 2>/dev/null || true

#=============================================================================
# RESULTS AGGREGATION
#=============================================================================
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                   C-NEW-001 TEST EXECUTION COMPLETE                    ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 RESULTS SUMMARY:"
echo "   Tier 1 (Mistral-7B):     Exit code ${TIER1_RESULT} - ${TIER1_LOG}"
echo "   Tier 2 (Qwen-32B):       Exit code ${TIER2_RESULT} - ${TIER2_LOG}"
echo "   Tier 3 (gpt-oss-20b):    Exit code ${TIER3_RESULT} - ${TIER3_LOG}"
echo ""
echo "📁 Full results directory: ${RESULTS_DIR}/"
echo ""

# Call analysis script
echo "📈 Generating CIS analysis report..."
python "${REPO_DIR}/scripts/analyze_c_new_001_results.py" \
  "${RESULTS_DIR}" \
  "${REPO_DIR}/results/c_new_001_analysis.md" \
  2>&1 | tee -a "${RESULTS_DIR}/analysis.log"

echo ""
echo "✨ C-NEW-001 diversity test complete!"
echo ""
