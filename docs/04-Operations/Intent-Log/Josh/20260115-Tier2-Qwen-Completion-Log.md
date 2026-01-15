---
status: SNAPSHOT
type: Log
date: 2026-01-15
---

> **Context:**
> *   [2026-01-15 01:30 UTC]: Tier 2 (Qwen-2.5-Coder-32B) execution completed with 25 battles for model diversity validation.

# Tier 2 (Qwen) Completion Log

## Summary

**Execution Date:** 2026-01-15  
**Time Window:** ~2.5 hours (battles + infrastructure setup)  
**Model:** Qwen/Qwen2.5-Coder-32B-Instruct-AWQ  
**Battles:** 25 (all successful)  
**Database:** `data/battles_tier2_qwen.db` (dedicated to avoid confusion with other tiers)  
**Status:** ✅ **COMPLETE**

---

## Results Summary

| Metric | Value |
|:-------|:------|
| Total Battles | 25 |
| Unique Battle IDs | 25 |
| Min CIS Score | 0.42 |
| Max CIS Score | 0.84 |
| Avg CIS Score | **0.667** |
| Success Rate | 100% |

**Key Finding:** Qwen baseline (Tier 2) achieves mean CIS of **0.667**, establishing the control point for model diversity validation. This aligns with expectations for a state-of-the-art dense coding model.

---

## Infrastructure Setup

### Qwen vLLM Server
- **Model:** `Qwen/Qwen2.5-Coder-32B-Instruct-AWQ`
- **Port:** 8000
- **Quantization:** AWQ (4-bit)
- **Max Model Length:** 16384 tokens
- **Status:** ✅ Running successfully
- **GPU:** NVIDIA H100 (80GB VRAM)

### Agent Configuration
- **Green Agent (Evaluator):** http://localhost:9000 (Docker container, host network)
- **Purple Agent (Defender):** http://localhost:9001 (Docker container, Qwen backend)
  - `OPENAI_BASE_URL=http://localhost:8000/v1`
  - `OPENAI_MODEL=Qwen/Qwen2.5-Coder-32B-Instruct-AWQ`

---

## Execution Details

### Battle Timing
- **Avg Duration per Battle:** ~235 seconds (~4 minutes)
- **Fastest:** 152.9s (battle 16)
- **Slowest:** 303.8s (battle 18)
- **Total Execution Time:** ~59 minutes for 25 battles

### Score Distribution
- **0.4x Range:** 4 battles (16%)
- **0.5x Range:** 2 battles (8%)
- **0.6x Range:** 5 battles (20%)
- **0.7x Range:** 10 battles (40%)
- **0.8x Range:** 4 battles (16%)

**Observation:** Qwen shows consistent performance with concentration in 0.7-0.8 range, indicating stable code quality across tasks.

---

## Files Created/Modified

### New Files
- ✅ `scripts/run_tier2_qwen.py` — Dedicated Tier 2 battle orchestrator
- ✅ `data/battles_tier2_qwen.db` — Dedicated Tier 2 Qwen results database

### Log Files
- ✅ `results/c_new_001_diversity_test/tier2_qwen_battles.log` — Detailed per-battle log
- ✅ `results/c_new_001_diversity_test/tier2_stdout.log` — Execution stdout/stderr

### Documentation
- ✅ This file (20260115-Tier2-Qwen-Completion-Log.md)

---

## Data Integrity

### Database Verification
```bash
sqlite3 data/battles_tier2_qwen.db "SELECT COUNT(*) FROM battles;"
# Result: 25 ✅

sqlite3 data/battles_tier2_qwen.db "SELECT AVG(score) FROM battles;"
# Result: 0.667 ✅
```

### WAL Mode
- **Status:** Enabled (crash-proof)
- **Benefit:** All 25 records persisted safely

---

## Next Steps (Tier 3 Preparation)

### Pending Actions
1. ⏳ **Tier 3 (gpt-oss-20b):** Requires specialized vLLM build (vLLM 0.10.1+gptoss)
   - Need to provision separate Docker container or conda environment
   - Must implement Harmony protocol parser for output extraction
   
2. ⏳ **Analysis:** Compare Tier 1, Tier 2, Tier 3 CIS distributions
   - Expected: T1 (0.48-0.65) < T2 (0.667) < T3 (0.85+)
   - Statistical significance test on delta
   
3. ⏳ **Validation Gate:** If delta ≥ 0.20, proceed to Stage 3

### Branch Status
- **Working Branch:** `feature/stage2-campaign-completion-20260114`
- **Files to Commit:**
  - `scripts/run_tier2_qwen.py` (new)
  - `data/battles_tier2_qwen.db` (new)
  - `results/c_new_001_diversity_test/tier2_qwen_battles.log` (new)
  - `results/c_new_001_diversity_test/tier2_stdout.log` (new)
  - Documentation updates as needed

---

## Conclusion

✅ **Tier 2 (Qwen) is COMPLETE and VERIFIED**

The model diversity experiment is now half-way through:
- **Tier 1 (Mistral-7B):** Planned [pending infrastructure]
- **Tier 2 (Qwen-32B):** ✅ Complete (mean CIS = 0.667)
- **Tier 3 (gpt-oss-20b):** Pending [infrastructure build out]

All data is safely persisted in dedicated database (`battles_tier2_qwen.db`). Ready to proceed with Tier 3 or analysis as needed.

---

**Session Coordinator:** Josh  
**Execution Status:** ✅ **TIER 2 COMPLETE**  
**Next Review:** After Tier 3 execution

