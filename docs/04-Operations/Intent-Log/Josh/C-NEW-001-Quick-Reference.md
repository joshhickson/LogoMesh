---
status: ACTIVE
type: Guide
date: 2026-01-14
---

# C-NEW-001 Quick Reference Guide

## One-Command Execution

```bash
bash /home/ubuntu/LogoMesh/scripts/run_c_new_001_diversity_test.sh
```

This single command orchestrates:
- Tier 1: Mistral-7B-Instruct-v0.3 (25 battles) → ~2 hours
- Tier 2: Qwen-2.5-Coder-32B (25 battles) → ~2 hours  
- Tier 3: gpt-oss-20b (25 battles) → ~4 hours
- Analysis: Statistical report generation → ~1 hour
- **Total: ~9-12 hours**

---

## Monitoring During Execution

Open **three separate terminals**:

```bash
# Terminal 1: Watch Tier 1 startup
tail -f /tmp/mistral_server.log

# Terminal 2: Watch Tier 2 startup  
tail -f /tmp/qwen_server.log

# Terminal 3: Watch Tier 3 startup
tail -f /tmp/gptoss_server.log
```

---

## Results Location

After execution:
```
/home/ubuntu/LogoMesh/results/c_new_001_diversity_test/
├── tier1_mistral_battles.log          # Raw Tier 1 results
├── tier2_qwen_battles.log             # Raw Tier 2 results
├── tier3_gptoss_battles.log           # Raw Tier 3 results
├── tier1_stdout.log                   # Tier 1 execution log
├── tier2_stdout.log                   # Tier 2 execution log
├── tier3_stdout.log                   # Tier 3 execution log
└── analysis.log                       # Analysis script output

/home/ubuntu/LogoMesh/results/c_new_001_analysis.md   # FINAL REPORT
```

---

## Reading the Final Report

```bash
cat /home/ubuntu/LogoMesh/results/c_new_001_analysis.md
```

**Key Section:** Validation Criteria Met
- Criterion 1: Statistical Significance (delta ≥ 0.20)
- Criterion 2: Tier Ordering (T1 < T2 < T3)
- Criterion 3: Expected Range Coverage

**Success Condition:** All three criteria PASS → Proceed to Stage 3

---

## Expected Results Summary

| Metric | Expected | Purpose |
|:-------|:--------:|:--------|
| Tier 1 mean CIS | 0.48-0.65 | Weak models correctly detected |
| Tier 2 mean CIS | 0.76-0.87 | Baseline remains stable |
| Tier 3 mean CIS | 0.85-0.93 | Strong models + Harmony rewarded |
| Tier 1→3 delta | ≥0.20 | **PASS CRITERION** |

---

## Troubleshooting

### Server won't start?
```bash
# Check logs
tail -50 /tmp/{mistral,qwen,gptoss}_server.log

# Check free memory
nvidia-smi | grep MiB | grep -v "0 MiB"

# Manual cleanup if needed
pkill -f "vllm serve"
sleep 10
nvidia-smi
```

### Harmony parsing issues?
Look for `[Harmony]` prefixed messages in tier3_stdout.log
- Expected: "Extracted XXX chars from <|channel|final>"
- Fallback: "Non-Harmony format detected, treating as standard output"

### Results missing?
Check if script reached analysis phase:
```bash
ls -la /home/ubuntu/LogoMesh/results/c_new_001_diversity_test/
# Should have all 7 files listed above
```

---

## Decision Gates

### PASS Path (delta ≥ 0.20)
1. ✅ C-NEW-001 validation complete
2. → Create Stage 3 Launch Approval document (E-004)
3. → Prepare AgentX submission
4. → Run full 200+ battle campaign

### FAIL Path (delta < 0.20)
1. ❌ Statistical significance not achieved
2. → Diagnose root cause (CIS calibration? Model selection?)
3. → Phase D: Re-calibrate or choose alternative Tier 1
4. → Re-run C-NEW-001 with adjustments

---

## Files Modified This Session

- **scripts/run_c_new_001_diversity_test.sh** - NEW (180 lines)
- **scripts/analyze_c_new_001_results.py** - NEW (220 lines)
- **docs/04-Operations/Intent-Log/Josh/Phase2.7-C-NEW-001-Infrastructure-Setup-20260114.md** - NEW
- **docs/00_CURRENT_TRUTH_SOURCE.md** - UPDATED (Phase 2.7 section)

---

## Harmony Protocol Parsing (Why This Matters)

gpt-oss-20b outputs structured reasoning via channels:
```
<|channel|analysis|>
Here's my approach: I'll implement a rate limiter using...
<|channel|end|>

<|channel|final|>
def rate_limiter(...):
    # Code here
<|channel|end|>
```

The Harmony parser extracts:
- **Analysis channel** → Measures Requirements (R) intent alignment
- **Final channel** → Measures Logic (L) implementation correctness

This **explicit separation** is what allows gpt-oss-20b to score higher on R while maintaining strong L.

---

## Contact & Questions

For issues during execution, refer to:
- **Infrastructure Strategy:** Phase2.7-C-NEW-001-Infrastructure-Setup-20260114.md
- **Model Selection Rationale:** 20260114-Model-Selection-for-CIS-Validation.md
- **Harmony Implementation:** Phase2.6-Harmony-Implementation-20260114.md

---

**Session Started:** 2026-01-14  
**Phase 2.7 Status:** READY FOR EXECUTION ✅  
**Estimated Completion:** 2026-01-15 (18:00 UTC)
