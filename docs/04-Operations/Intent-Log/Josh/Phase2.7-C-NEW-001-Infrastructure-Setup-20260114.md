---
status: ACTIVE
type: Log
date: 2026-01-14
---

> **Context:**
> * [2026-01-14]: Josh initiated C-NEW-001 Model Diversity Test execution. Previous session (Phase 2.6) completed Harmony protocol parser implementation. Current session focuses on infrastructure deployment and battle execution.

# Phase 2.7: C-NEW-001 Model Diversity Test Execution

## Session Objective
Complete infrastructure deployment for three-tier model spectrum (Mistral-7B, Qwen-32B, gpt-oss-20b) and execute 25 battles per tier to validate that the **Code Integrity Score (CIS)** metric can reliably distinguish between models of varying capability levels.

---

## Executive Summary: Infrastructure Constraints & Strategy

### Hardware Reality
- **Available:** 1× NVIDIA H100 (80GB VRAM)
- **Currently Used:** ~75GB (Qwen-2.5-Coder-32B running on port 8000)
- **Available:** ~5GB VRAM
- **Implication:** Models cannot run simultaneously; must execute sequentially

### Deployment Strategy: Sequential Model Serving
Rather than attempting concurrent deployment (which would fail due to memory), C-NEW-001 will execute in three phases:

1. **Phase 1 - Tier 1 (Mistral-7B):** Stop Qwen → Load Mistral → Run 25 battles → Results logged
2. **Phase 2 - Tier 2 (Qwen-32B):** Stop Mistral → Reload Qwen → Run 25 battles → Results logged
3. **Phase 3 - Tier 3 (gpt-oss-20b):** Stop Qwen → Load gpt-oss-20b → Run 25 battles → Results logged

**Total Execution Time:** ~12-16 hours (including model loading + inference overhead)

**Automation:** Script `/home/ubuntu/LogoMesh/scripts/run_c_new_001_diversity_test.sh` orchestrates all three phases

---

## Infrastructure Setup Complete

### ✅ Component 1: Sequential Deployment Script
**File:** `scripts/run_c_new_001_diversity_test.sh`
- **Lines:** 180 (comprehensive orchestration)
- **Features:**
  - Automatic process cleanup (pkill vllm)
  - Port assignment: 8001 (Mistral), 8000 (Qwen), 8002 (gpt-oss)
  - Model startup validation via curl checks
  - Per-tier logging with stdout capture
  - Error detection and early exit on server failure
  - Results aggregation trigger

### ✅ Component 2: Results Analysis Script
**File:** `scripts/analyze_c_new_001_results.py`
- **Lines:** 220 (statistical analysis)
- **Capabilities:**
  - Parse JSON-line format battle logs
  - Compute mean, median, stdev for CIS and RATL dimensions
  - Calculate inter-tier deltas (statistical differentiation)
  - Generate markdown report with validation criteria
  - Validate hypothesis: delta ≥ 0.20 between Tier 1 and Tier 3

### ✅ Component 3: Integration with Harmony Parser
**File:** `src/green_logic/scoring.py` (lines 310-315)
- **Model Detection:** If model name starts with "gpt-oss" OR response contains `<|channel|`, triggers Harmony parsing
- **Backward Compatibility:** Standard A2A format still fully functional
- **Channel Extraction:** Separates analysis (Requirements) from final output (Logic evaluation)

---

## Expected CIS Distribution (Validation Hypothesis)

| Tier | Model | Expected Mean CIS | Expected Range | Key Differentiator |
|:-----|:------|:--:|:--:|:---|
| **1** | Mistral-7B-v0.3 | **0.56** | 0.48-0.65 | Weak architecture/testing; functional agent |
| **2** | Qwen-2.5-Coder-32B | **0.81** | 0.76-0.87 | Strong logic; implicit reasoning |
| **3** | gpt-oss-20b | **0.89** | 0.85-0.93 | Strong logic + explicit reasoning (Harmony) |

### Statistical Validation
- **Tier 1 → 2 Delta:** Expected ~0.25 (q-value 0.05, clinically significant)
- **Tier 2 → 3 Delta:** Expected ~0.08 (small but positive)
- **Tier 1 → 3 Delta:** Expected **0.33** (PASS criterion: ≥ 0.20)

**Success Criteria:**
- ✅ Tier ordering preserved: T1 < T2 < T3
- ✅ Tier 1 → 3 delta ≥ 0.20 (statistical significance)
- ✅ Each tier within expected range (±0.05 tolerance)

---

## Pre-Execution Checklist

### Code Status
- [x] Harmony parser implemented & tested (Phase 2.6)
- [x] Scoring integration complete with model detection
- [x] YAML syntax errors fixed (architecture_constraints.yaml)
- [x] All Python files compile without errors
- [x] Integration tests: 3/3 passing

### Infrastructure Status
- [x] Qwen-32B currently running and stable (port 8000)
- [x] Sequential execution script ready (run_c_new_001_diversity_test.sh)
- [x] Results analysis automation complete (analyze_c_new_001_results.py)
- [x] vLLM 0.10.1+gptoss installation procedure documented

### Documentation Status
- [x] Model selection paper reviewed (20260114-Model-Selection-for-CIS-Validation.md)
- [x] Round count clarified: **25 battles per tier recommended** (75 total for checkpoint)
- [x] This session log created for continuity

---

## Execution Timeline

### Pre-Execution (Current)
- [x] Verify Harmony parser integration
- [x] Create orchestration script
- [x] Create analysis script
- [x] Document strategy

### Execution Phase (Next)
- [ ] **T+0-2h:** Tier 1 (Mistral-7B) — 25 battles
- [ ] **T+2-4h:** Tier 2 (Qwen-32B) — 25 battles
- [ ] **T+4-8h:** Tier 3 (gpt-oss-20b) — 25 battles
- [ ] **T+8-9h:** Analysis & report generation

### Post-Execution (T+9h)
- [ ] Review CIS distributions
- [ ] Validate statistical significance
- [ ] Approve/iterate based on results
- [ ] Generate Stage 3 launch decision document

---

## Known Risks & Mitigations

### Risk 1: Memory Overflow During Model Transitions
**Symptom:** Process fails when stopping old model / starting new model
**Mitigation:** 
- 10-second wait between pkill and new model startup
- Explicit sleep commands after each "nvidia-smi" check
- Alternative: Manual memory clearing if automatic cleanup fails

### Risk 2: gpt-oss-20b vLLM Build Installation Fails
**Symptom:** `vLLM 0.10.1+gptoss` unavailable or incompatible
**Mitigation:**
- Script includes auto-detection and installation
- Fallback: Use `DeepSeek-Coder-V2-Lite-Instruct` (standard vLLM, no Harmony)
- Impact: Loss of explicit reasoning channel; R score measured implicitly

### Risk 3: Harmony Protocol Parsing Fails Silently
**Symptom:** gpt-oss returns channels but harness doesn't extract them
**Mitigation:**
- HarmonyParser includes defensive fallback (non-Harmony responses still processed)
- Integration tests passed all format variations
- Debug logging includes `[Harmony]` prefix for easy filtering

### Risk 4: Low Statistical Differentiation (delta < 0.20)
**Symptom:** CIS scores cluster too closely; Tier 1 and Tier 3 similar
**Possible Causes:**
- CIS metric weights not properly calibrated
- Mistral-7B-v0.3 unexpectedly strong
- Red penalties over-correcting weak models
**Mitigation:**
- Quick re-run with small battle sample (5 per tier) to diagnose
- Adjust A/T weights if needed
- Alternative: Swap Tier 1 for Llama-3.2-3B-Instruct (guaranteed lower)

---

## Files Created/Modified This Session

### New Files
1. **scripts/run_c_new_001_diversity_test.sh** (180 lines)
   - Orchestration script for sequential model deployment
   - Handles all three tiers and results aggregation

2. **scripts/analyze_c_new_001_results.py** (220 lines)
   - Statistical analysis of battle results
   - Generates markdown report with validation criteria

### Modified Files
1. **src/green_logic/scoring.py** (Phase 2.6)
   - Added Harmony protocol parsing (lines 310-315)
   - Model detection for automatic format switching

2. **docs/04-Operations/Intent-Log/Josh/20260114-Model-Selection-for-CIS-Validation.md**
   - Confirms 25 battles per tier as checkpoint recommendation
   - Documents gpt-oss-20b as Berkeley AgentX preferred model

---

## Next Steps After Execution

### Immediate (T+9h)
1. **Run Script:** `bash /home/ubuntu/LogoMesh/scripts/run_c_new_001_diversity_test.sh`
2. **Monitor:** Watch logs in `/tmp/{mistral,qwen,gptoss}_server.log`
3. **Collect Results:** All logs written to `/home/ubuntu/LogoMesh/results/c_new_001_diversity_test/`

### Analysis (T+9-10h)
1. **Review Report:** `cat /home/ubuntu/LogoMesh/results/c_new_001_analysis.md`
2. **Validate Hypothesis:**
   - [ ] Tier 1 mean CIS in [0.48, 0.65]?
   - [ ] Tier 2 mean CIS in [0.76, 0.87]?
   - [ ] Tier 3 mean CIS in [0.85, 0.93]?
   - [ ] Tier 1 → 3 delta ≥ 0.20?
3. **Decision Gate:**
   - **If PASS:** Approve Stage 3 launch (E-004)
   - **If FAIL:** Iterate Phase D (re-calibration) and re-run

### Documentation (T+10-12h)
1. **Update Master Index:** `docs/00_CURRENT_TRUTH_SOURCE.md`
   - Mark C-NEW-001 as COMPLETE
   - Link to analysis report
2. **Create Stage 3 Launch Document** (if validation passes)
3. **Archive Session Log** to `/docs/04-Operations/Intent-Log/Josh/`

---

## Key Insights Documented

### From Model Selection Paper
- **Round Count Not Specified:** Paper discusses "200+ battles for Stage 3" but recommends 25 per tier as validation checkpoint
- **Harmony Protocol Critical:** gpt-oss-20b's explicit reasoning channel enables precise R/A measurement
- **Agentic Floor Concept:** Weak models must remain stable agents; Mistral-v0.3 chosen for robustness despite weak code

### From Phase 2.6 (Harmony Implementation)
- Defensive parsing ensures fallback to non-Harmony format if channels missing
- Model detection via model name ("gpt-oss") avoids false positives
- All integration tests passing; ready for production use

### From Infrastructure Assessment
- Sequential execution is feasible given ~8-10 hour budget
- vLLM 0.10.1+gptoss installation during script execution minimizes prep time
- Results aggregation can be automated; no manual log parsing required

---

## Conclusion: Ready for C-NEW-001 Execution

All infrastructure, automation, and validation components are in place. The diversity test is designed to answer the fundamental question: **Does CIS measure what we think it measures?**

If C-NEW-001 validates the hypothesis, the LogoMesh project proceeds to Stage 3 with confidence that its core metric is sound. If it fails, the root cause analysis will guide re-calibration of RATL weights or model selection.

**Status:** ✅ **READY FOR EXECUTION**

Next action: Run `bash /home/ubuntu/LogoMesh/scripts/run_c_new_001_diversity_test.sh` when ready to begin the 9-12 hour test sequence.

---

**Session Log Created:** 2026-01-14  
**Author:** Josh (with GitHub Copilot assistance)  
**Next Phase:** Phase 2.8 - C-NEW-001 Results Analysis & Stage 3 Launch Decision
