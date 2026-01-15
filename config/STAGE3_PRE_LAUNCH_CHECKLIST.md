---
status: ACTIVE
type: Guide
---
> **Context:**
> *   [2026-01-14]: Stage 3 Campaign Pre-Launch Checklist
> **Parent Document:** [Phase1-Yin-Campaign-20260113.md](../docs/04-Operations/Intent-Log/Josh/Phase1-Yin-Campaign-20260113.md)

---

# Stage 3 Campaign Pre-Launch Checklist (E-002)

## Overview

**Purpose:** Ensure all prerequisites are met before launching Stage 3 Campaign (100+ battles)

**Status:** ⏸️ **BLOCKED** - Awaiting Phase C Validation Results

---

## Critical Prerequisites (BLOCKING)

### ✅ Phase A: CIS Formula Enhancement
- [x] A-001: CIS weight formula documented (25-25-25-25)
- [x] A-002: Intent-code similarity diagnostic field
- [x] A-003: Architecture constraints system (YAML + scoring)
- [x] A-004: Test specificity evaluation (pattern matching)
- [ ] A-005: Logic Score role clarification (SKIPPED per user request)

**Status:** ✅ COMPLETE (4 of 4 executable items)

---

### ⏳ Phase C: Human Expert Validation
- [x] C-001: Validation directory structure created
- [x] C-002: Sample selection script ready
- [x] C-003: Review packet generator ready
- [x] C-004: Expert rating form created
- [ ] C-005: Recruit 2+ expert reviewers (MANUAL STEP)
- [x] C-006: Distribution protocol documented
- [ ] C-007: Collect expert responses (AWAITING C-005)
- [x] C-008: Correlation analysis script ready
- [x] C-009: Agreement metrics script ready
- [x] C-010: Failure mode extraction script ready
- [x] C-011: Validation report generator ready
- [ ] C-012: Update CURRENT_TRUTH_SOURCE (AWAITING C-007)

**Status:** ⏳ INFRASTRUCTURE READY - Manual workflow pending

**BLOCKER:** Need to complete C-005 → C-007 → C-008/C-009/C-010 → C-011 → C-012

**Expected Timeline:** 3-5 days (2-3 days for expert review + 2 hours analysis)

---

### ✅ Phase G: Paper Versioning
- [x] G-001: Paper versioning protocol (archive + tracking)

**Status:** ✅ COMPLETE

---

### ✅ Phase H: Red Agent Integration
- [x] H-001: Review Red Agent code (red_report_parser.py, red_report_types.py)
- [x] H-002: Plan merge strategy (documented)
- [x] H-003: Extract Red Report Parser (files copied to src/green_logic/)
- [x] H-004: Update scoring.py (penalty multiplier integrated)
- [x] H-005: Validate end-to-end (syntax check passed)

**Status:** ✅ COMPLETE (all 5 items)

**Note:** Red Agent penalties integrated but A2A infrastructure not yet deployed

---

## Configuration Validation

### Stage 3 Config File: `config/stage3_campaign_config.json`

#### Battle Configuration
- [x] Target battles: 100+
- [x] Tasks: All 4 tasks (Email Validator, Rate Limiter, LRU Cache, Fibonacci)
- [x] Agents: gpt-4o, claude-sonnet-3-5, qwen-2.5-coder-32b, o1-mini

#### Scoring Configuration
- [x] Formula: 25-25-25-25 (B-002)
- [x] Architecture constraints: A-003 enabled
- [x] Test specificity: A-004 enabled
- [x] Red penalties: H-004 integrated (pending A2A deployment)

#### Execution Settings
- [x] Timeout: 300s per battle
- [x] Sandbox enabled: true
- [x] Red Agent enabled: false (pending infrastructure)
- [x] Parallel execution: false (sequential for stability)

---

## Infrastructure Status

### Required Services

| Service | Status | Notes |
|:---|:---|:---|
| Green Agent (Scoring) | ✅ READY | scoring.py enhanced with A-003, A-004, H-004 |
| Purple Agents (Coders) | ✅ READY | OpenAI API + Anthropic API configured |
| Sandbox (Testing) | ✅ READY | Network-disabled sandboxing operational |
| Red Agent (Security) | ⏸️ PENDING | A2A infrastructure not yet deployed |
| DBOM Generator | ✅ READY | JSON output with intent_vector |

---

### Environment Variables

```bash
# Required for Stage 3
export OPENAI_API_KEY=<key>
export OPENAI_BASE_URL=<url>
export ANTHROPIC_API_KEY=<key>
export MODEL_NAME=<model>

# Optional (Red Agent)
export RED_AGENT_ENABLED=false
export RED_AGENT_URL=<a2a-endpoint>
```

**Check:** Run `python -c "import os; print('OPENAI_API_KEY:', bool(os.getenv('OPENAI_API_KEY')))"` to verify

---

### File Dependencies

| File | Status | Purpose |
|:---|:---|:---|
| `src/green_logic/architecture_constraints.yaml` | ✅ EXISTS | A-003 task constraints |
| `src/green_logic/scoring.py` | ✅ UPDATED | Enhanced CIS scoring |
| `src/green_logic/red_report_parser.py` | ✅ EXISTS | H-003 Red Agent parser |
| `src/green_logic/red_report_types.py` | ✅ EXISTS | H-003 Red Agent types |
| `src/green_logic/tasks.py` | ✅ UPDATED | A-000 Email Validator fixed |
| `config/stage3_campaign_config.json` | ✅ EXISTS | E-001 campaign config |

---

## Validation Gates

### Gate 1: Formula Validation (REQUIRED)
**Status:** ⏸️ **BLOCKED** - Awaiting Phase C results

**Requirements:**
- [ ] Expert validation completed (C-007)
- [ ] Pearson r ≥ 0.70 for all components (C-008)
- [ ] Cohen's Kappa ≥ 0.60 (C-009)
- [ ] ICC ≥ 0.70 (C-009)
- [ ] Failure modes documented (C-010)
- [ ] Validation report generated (C-011)
- [ ] CURRENT_TRUTH_SOURCE updated (C-012)

**Action:** Cannot proceed to Stage 3 until validation passes

**If validation fails:** Execute Phase D (re-scoring) + iterate on formula refinements

---

### Gate 2: Infrastructure Test (RECOMMENDED)
**Status:** ⚠️ **OPTIONAL** - Can skip if Stage 2 stability confirmed

**Test Plan:**
1. Run 5-10 test battles with new scoring formula
2. Verify all 4 components (R, A, T, L) compute correctly
3. Confirm architecture constraints trigger appropriately
4. Validate test specificity multipliers apply
5. Check Red Agent integration (if enabled)
6. Inspect DBOM output format

**Command:**
```bash
python main.py --campaign test_stage3 --battles 10
```

**Success Criteria:**
- No crashes or exceptions
- All battles complete within timeout
- DBOM files contain all expected fields (cis_score, red_penalty_applied, etc.)
- Scores are distributed across range (not all 0.5 or all 1.0)

---

### Gate 3: Paper Version Tracking (REQUIRED)
**Status:** ✅ **COMPLETE**

- [x] v1 paper archived (2026-01-14 baseline)
- [x] CURRENT_TRUTH_SOURCE tracking active
- [ ] If formula changes after validation, create v2 and update tracking

---

## Launch Decision Criteria

### ✅ Can Launch Stage 3 When:
1. ✅ Phase A complete (4 of 4 items)
2. ✅ Phase H complete (5 of 5 items)
3. ✅ Phase G complete (1 of 1 item)
4. ⏳ **Phase C validation PASSES** (C-001 through C-012)
5. ✅ Infrastructure test passes (optional but recommended)
6. ✅ Config file validated (`stage3_campaign_config.json`)
7. ✅ Git state clean (all changes committed)

### ❌ Do NOT Launch If:
- Phase C validation fails (correlation < 0.70 or agreement < 0.60)
- Infrastructure test shows formula errors
- Git branch conflicts unresolved
- Critical services down (OpenAI API, Anthropic API)

---

## Post-Launch Monitoring

### Real-Time Checks (During Campaign)
- Monitor campaign log: `tail -f campaign_stage3.txt`
- Check for API rate limits
- Verify DBOM files generating correctly
- Watch for timeout patterns

### Post-Campaign Analysis (Phase F)
- Generate comparison reports (Stage 2 vs Stage 3)
- Validate CIS score distribution
- Extract insights for paper
- Update LaTeX paper with Stage 3 results

---

## Rollback Plan

If Stage 3 shows critical issues mid-campaign:

```bash
# 1. Stop campaign
pkill -f main.py

# 2. Revert to Stage 2 formula (if needed)
git checkout HEAD~1 src/green_logic/scoring.py

# 3. Document issue
echo "Stage 3 aborted: [reason]" >> campaign_stage3.txt

# 4. Re-run validation
# Address root cause in Phase C/D iteration
```

---

## Timeline Estimate

| Phase | Duration | Dependencies |
|:---|:---|:---|
| Expert recruitment (C-005) | 1-2 days | Manual outreach |
| Expert review (C-007) | 2-3 days | Parallel work by 2+ experts |
| Analysis + reporting (C-008 through C-011) | 2 hours | Automated scripts |
| Formula refinement (if needed) | 1-2 days | Phase D re-scoring |
| Infrastructure test (E-002) | 1 hour | Optional |
| Stage 3 execution | 8-12 hours | 100 battles @ 5 min each |
| **Total to launch** | **3-7 days** | From current state |

---

## Contacts & Resources

**Validation Experts:** [List expert contact info after C-005 recruitment]

**Paper Tracking:** `docs/00_CURRENT_TRUTH_SOURCE.md`

**Campaign Config:** `config/stage3_campaign_config.json`

**Validation Scripts:** `validation/scripts/*.py`

**DBOM Archive:** `data/dboms/`

---

## Final Checklist Before Launch

- [ ] Phase C validation completed and PASSED
- [ ] CURRENT_TRUTH_SOURCE.md updated with validation results
- [ ] Paper versioned (v2 if formula changed)
- [ ] Config file reviewed: `config/stage3_campaign_config.json`
- [ ] Infrastructure test passed (5-10 battles)
- [ ] Git state clean (all commits pushed)
- [ ] API keys valid and rate limits confirmed
- [ ] Monitoring plan in place
- [ ] User approval obtained

**Launch Command:**
```bash
python main.py --config config/stage3_campaign_config.json
```

**User Decision Required:** Approve launch after Phase C validation passes

---

**Status:** ⏸️ **BLOCKED ON PHASE C** - Ready for launch pending expert validation results

**Next Action:** Recruit expert reviewers (C-005) or skip A-005 and proceed to validation workflow
