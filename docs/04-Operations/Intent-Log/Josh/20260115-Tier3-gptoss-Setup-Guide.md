---
status: ACTIVE
type: Guide
date: 2026-01-15
---

> **Context:**
> *   [2026-01-15]: Tier 3 (gpt-oss-20b) preparation and execution guide for model diversity validation.

# Tier 3 (gpt-oss-20b) Setup & Execution Guide

## Quick Start

### Step 1: Setup Infrastructure (One-Time)
```bash
bash scripts/setup_tier3_gptoss.sh
```

This script:
- Installs vLLM 0.10.1+gptoss (special build for MXFP4 quantization)
- Starts gpt-oss-20b server on port 8002
- Verifies Harmony protocol support
- Takes ~10-15 minutes total

### Step 2: Run 25 Tier 3 Battles
```bash
uv run python scripts/run_tier3_gptoss.py
```

Output:
- Database: `data/battles_tier3_gptoss.db` (25 results)
- Log: `results/c_new_001_diversity_test/tier3_gptoss_battles.log`
- Expected duration: ~2.5 hours (25 battles × ~6 min/battle)

---

## Architecture Overview

### Model Stack
| Tier | Model | Port | Quantization | Backend |
|:-----|:------|:-----|:-------------|:--------|
| **1** | Mistral-7B | 8001 | AWQ | vLLM (standard) |
| **2** | Qwen-32B | 8000 | AWQ | vLLM (standard) |
| **3** | gpt-oss-20b | 8002 | MXFP4 | vLLM 0.10.1+gptoss |

### Key Differences: gpt-oss-20b

**Architecture:**
- **Type:** Mixture-of-Experts (MoE)
- **Total Params:** 21B
- **Active Params:** 3.6B (only active per token)
- **Implication:** Fast inference despite large model size

**Quantization:**
- **Standard:** AWQ (4-bit Activation-aware)
- **gpt-oss:** MXFP4 (4-bit Microscaling Format)
- **Benefit:** Optimized for H100 hardware

**Output Format:**
- **Standard Models:** Raw text output
- **gpt-oss-20b:** Harmony Protocol with structured channels
  - `<|channel|analysis|>` — Reasoning trace (Chain-of-Thought)
  - `<|channel|final|>` — Final answer/code
  - `<|channel|end|>` — Channel terminator

**CIS Impact:**
- **Requirements (R):** Can measure from `analysis` channel (explicit reasoning)
- **Architecture (A):** Evaluated from `final` channel (implementation)
- **Testing (T):** From test code in `final`
- **Logic (L):** Correctness of code in `final`

---

## Expected Results

### Predicted CIS Scores

Based on model capability and Harmony advantages:

| Metric | Tier 1 (Mistral) | Tier 2 (Qwen) | Tier 3 (gpt-oss) |
|:-------|:---------------:|:-------------:|:----------------:|
| Min Score | 0.30-0.40 | 0.42 | 0.60 |
| Max Score | 0.70-0.80 | 0.84 | 0.92 |
| Mean Score | **0.55-0.65** | **0.667** | **0.80-0.88** |
| Reason | Weak logic | Dense baseline | MoE + Harmony |

### Validation Criterion

**Success:** `Tier3_mean - Tier1_mean >= 0.20`

Current projection: `0.83 - 0.60 = 0.23` ✅ (exceeds 0.20 threshold)

---

## Troubleshooting

### Issue: vLLM install fails

**Error:** `No matching distribution found for vllm==0.10.1+gptoss`

**Solution:**
```bash
uv pip install --pre "vllm==0.10.1+gptoss" \
    --extra-index-url "https://wheels.vllm.ai/gpt-oss/" \
    --index-strategy unsafe-best-match --force-reinstall
```

### Issue: Server won't start

**Error:** `Engine core initialization failed`

**Solution:**
1. Check free GPU memory: `nvidia-smi`
2. Kill other processes: `pkill -f "vllm serve"`
3. Restart: `bash scripts/setup_tier3_gptoss.sh`

### Issue: Harmony protocol not detected

**Error:** "Non-Harmony format detected" in logs

**Expected Behavior:** gpt-oss-20b should always use Harmony format. If not:
1. Check model loaded: `curl http://localhost:8002/v1/models`
2. Verify: Should show `openai/gpt-oss-20b`

---

## Performance Notes

### Why gpt-oss-20b is Fast

MoE + MXFP4 = High throughput:
- **Mistral-7B:** ~50 tok/s
- **Qwen-32B:** ~30 tok/s
- **gpt-oss-20b:** ~100 tok/s (2-3x faster!)

**Trade-off:** Speed + Reasoning (Harmony protocol) at cost of slight quality variance.

---

## Next Steps After Tier 3

### 1. Verify Results
```bash
sqlite3 data/battles_tier3_gptoss.db \
  "SELECT COUNT(*), AVG(score) FROM battles;"
```

Expected: `25 | 0.80-0.88`

### 2. Compare Tiers
```bash
# Run analysis script
python scripts/analyze_c_new_001_results.py \
  results/c_new_001_diversity_test \
  results/c_new_001_analysis.md
```

### 3. Decision Gate
- **If delta ≥ 0.20:** CIS VALIDATED ✅ → Proceed to Stage 3
- **If delta < 0.20:** CIS needs refinement → Phase D (re-calibration)

---

## Reference Files

- **Setup Script:** `scripts/setup_tier3_gptoss.sh`
- **Runner Script:** `scripts/run_tier3_gptoss.py`
- **Harmony Parser:** `src/green_logic/harmony_parser.py`
- **Model Info:** `docs/04-Operations/Intent-Log/Josh/20260114-Model-Selection-for-CIS-Validation.md`

---

**Date Created:** 2026-01-15  
**Status:** READY FOR EXECUTION  
**Est. Duration:** 2-3 hours total (setup + 25 battles)

