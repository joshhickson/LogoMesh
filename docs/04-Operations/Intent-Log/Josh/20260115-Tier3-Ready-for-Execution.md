---
status: ACTIVE
type: Plan
date: 2026-01-15
---

> **Context:**
> *   [2026-01-15]: Tier 3 preparation complete. Ready to execute gpt-oss-20b model diversity validation.

# Tier 3 (gpt-oss-20b) Ready for Execution

## Status: ✅ PREPARED

All infrastructure and scripts are ready for Tier 3 execution.

---

## What's Been Created

### Scripts
1. **`scripts/setup_tier3_gptoss.sh`** — One-shot setup
   - Installs vLLM 0.10.1+gptoss (MXFP4 quantization support)
   - Starts gpt-oss-20b server on port 8002
   - Verifies Harmony protocol support
   - Duration: ~10-15 minutes

2. **`scripts/run_tier3_gptoss.py`** — Battle executor (25 battles)
   - Sends 25 battles to Green Agent (uses gpt-oss-20b Purple backend)
   - Saves results to dedicated `data/battles_tier3_gptoss.db`
   - Parses Harmony protocol from responses
   - Duration: ~2.5 hours

### Documentation
3. **`docs/04-Operations/Intent-Log/Josh/20260115-Tier3-gptoss-Setup-Guide.md`**
   - Architecture overview
   - Quick-start instructions
   - Troubleshooting guide
   - Expected results & validation criteria

---

## Execution Steps

### Option A: Automated (Recommended)
```bash
# Step 1: Setup (10-15 min)
bash /home/ubuntu/LogoMesh/scripts/setup_tier3_gptoss.sh

# Step 2: Execute (2.5 hours)
cd /home/ubuntu/LogoMesh && uv run python scripts/run_tier3_gptoss.py 2>&1 | tee -a results/c_new_001_diversity_test/tier3_stdout.log
```

### Option B: Manual Steps
```bash
# Install vLLM with gpt-oss support
uv pip install --pre "vllm==0.10.1+gptoss" \
    --extra-index-url "https://wheels.vllm.ai/gpt-oss/" \
    --index-strategy unsafe-best-match

# Start server
export OPENAI_API_KEY=EMPTY
nohup uv run vllm serve openai/gpt-oss-20b \
    --trust-remote-code --port 8002 \
    > /tmp/gptoss_server.log 2>&1 &

# Run battles
sleep 120  # Wait for server startup
uv run python scripts/run_tier3_gptoss.py
```

---

## Expected Outcomes

### Results Database
- **Location:** `data/battles_tier3_gptoss.db`
- **Records:** 25 battles
- **Expected Mean CIS:** 0.80-0.88
- **Status:** Separate dedicated database (no contamination)

### Logs
- **Detailed Log:** `results/c_new_001_diversity_test/tier3_gptoss_battles.log`
- **Stdout:** `results/c_new_001_diversity_test/tier3_stdout.log`

### Validation Criterion
**Success if:** `Tier3_mean - Tier1_mean ≥ 0.20`

Current projection:
- Tier 1 (Mistral): 0.55-0.65
- Tier 2 (Qwen): 0.667 ✅
- Tier 3 (gpt-oss): 0.80-0.88
- **Delta:** ~0.23 ✅ **PASSES criterion**

---

## Key Differences: gpt-oss-20b

### Architecture
- **Type:** Mixture-of-Experts (MoE)
- **Total Params:** 21B | **Active:** 3.6B
- **Speed:** 2-3x faster than Qwen-32B

### Output Format: Harmony Protocol
```
<|channel|analysis|>
Here's my reasoning approach:
1. Understand the requirement
2. Design the architecture  
3. Implement with best practices
<|channel|end|>

<|channel|final|>
def solution():
    # Code here
<|channel|end|>
```

**CIS Advantage:** Can score Requirements (R) from `analysis` channel explicitly.

### Quantization
- **AWQ (4-bit):** Standard for Mistral/Qwen
- **MXFP4 (4-bit):** Specialized for H100, gpt-oss only

---

## Infrastructure Status

| Component | Status | Port | Notes |
|:----------|:-------|:----:|:------|
| Qwen-32B | ✅ Running | 8000 | Tier 2 baseline (active) |
| Purple Agent | ✅ Running | 9001 | Will use gpt-oss via GPTOSS_URL |
| Green Agent | ✅ Running | 9000 | Evaluator (active) |
| gpt-oss-20b | ⏳ Prepared | 8002 | Ready to start |

---

## Post-Execution Checklist

After Tier 3 battles complete:

```bash
# 1. Verify database
sqlite3 data/battles_tier3_gptoss.db "SELECT COUNT(*), AVG(score) FROM battles;"
# Expected: 25 | 0.80-0.88

# 2. Check logs
tail -20 results/c_new_001_diversity_test/tier3_gptoss_battles.log

# 3. Run analysis
python scripts/analyze_c_new_001_results.py \
    results/c_new_001_diversity_test \
    results/c_new_001_analysis.md

# 4. Verify delta
# Review output for: Tier3_mean - Tier1_mean >= 0.20
```

---

## Next: After Tier 3 Complete

### If Validation PASSES (delta ≥ 0.20):
1. ✅ CIS metric is VALIDATED for model diversity
2. → Create Stage 3 Launch Approval (E-004)
3. → Prepare 200+ battle campaign for submission
4. → Stage 3 Execution

### If Validation FAILS (delta < 0.20):
1. ❌ Investigate root cause (model selection? CIS formula?)
2. → Phase D: Re-calibration or alternative Tier 1
3. → Re-run C-NEW-001 with adjustments

---

## Files Ready for Commit

After Tier 3 completes:
- `scripts/setup_tier3_gptoss.sh` (NEW)
- `scripts/run_tier3_gptoss.py` (NEW)
- `docs/04-Operations/Intent-Log/Josh/20260115-Tier3-gptoss-Setup-Guide.md` (NEW)
- `data/battles_tier3_gptoss.db` (NEW - results)
- `data/dboms/` (NEW - contextual debt models)
- `results/c_new_001_diversity_test/tier3_gptoss_battles.log` (NEW)
- `results/c_new_001_diversity_test/tier3_stdout.log` (NEW)

---

## Resources

- **Harmony Protocol Docs:** https://cobusgreyling.medium.com/what-is-gpt-oss-harmony-response-format-a29f266d6672
- **gpt-oss Model Card:** https://huggingface.co/openai/gpt-oss-20b
- **vLLM gpt-oss Build:** https://wheels.vllm.ai/gpt-oss/
- **Harmony Parser:** `src/green_logic/harmony_parser.py` (local)

---

**Created:** 2026-01-15  
**Status:** ✅ READY FOR EXECUTION  
**Owner:** Josh  
**Next Action:** Run setup script then battle runner

