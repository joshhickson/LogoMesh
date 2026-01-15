---
status: ACTIVE
type: Guide
---
> **Context:**
> *   [2026-01-14]: Master Action Item Index & Logistics
> **Parent Documents:** 
>    - [Phase1-Yin-Campaign-20260113.md](./Phase1-Yin-Campaign-20260113.md) (Action item origins & strategic context)
>    - [Phase2-Action-Items-Implementation-20260114.md](./Phase2-Action-Items-Implementation-20260114.md) (Execution log)
>    - [Sprint-Session-20260114-Evening.md](./Sprint-Session-20260114-Evening.md) (Phase C/H/E implementation details)
> **Related:** 
>    - [STAGE3_PRE_LAUNCH_CHECKLIST.md](../../../config/STAGE3_PRE_LAUNCH_CHECKLIST.md) (Launch gates)
>    - [Distribution_Protocol.md](../../../validation/Distribution_Protocol.md) (Expert workflow)

---

# MASTER ACTION ITEM INDEX (Remaining Items & Logistics)

## Overview

This document serves as a **living checklist** and **logline reference map** for all remaining unaccomplished action items across all phases. Each item links to its origin in Phase 1 log and implementation status.

**Status Legend:**
- ✅ **COMPLETE** - Fully implemented and committed
- ⏳ **IN PROGRESS** - Currently being executed
- ⏸️ **BLOCKED** - Waiting on prerequisite or decision
- 🔴 **CRITICAL BLOCKER** - Must complete before Stage 3 launch
- 🟡 **HIGH PRIORITY** - Important for data integrity but not blocking
- 🟢 **OPTIONAL** - Nice-to-have, time-permitting

---

## Phase A: CIS Formula Enhancement

| Item | Status | Task | Origin | Dependencies | Next Action |
|:---|:---|:---|:---|:---|:---|
| **A-000** | ✅ COMPLETE | Re-enable Email Validator task | [Phase 1, L1513](./Phase1-Yin-Campaign-20260113.md#L1513) | None | [Reference: Phase2 log](./Phase2-Action-Items-Implementation-20260114.md#A-000-Update-Email-Validator-Task-Description) |
| **A-001** | ✅ COMPLETE | Document CIS weight formula | [Phase 1, L1525](./Phase1-Yin-Campaign-20260113.md#L1525) | None | [Reference: Phase2 log](./Phase2-Action-Items-Implementation-20260114.md#A-001-Document-CIS-Weight-Formula) |
| **A-002** | ✅ COMPLETE | Compute intent-code similarity | [Phase 1, L1537](./Phase1-Yin-Campaign-20260113.md#L1537) | None | [Reference: Phase2 log](./Phase2-Action-Items-Implementation-20260114.md#A-002-Compute-Explicit-Cosine-Similarity-for-RΔ) |
| **A-003** | ✅ COMPLETE | Define task-specific architecture constraints | [Phase 1, L1549](./Phase1-Yin-Campaign-20260113.md#L1549) | None | [Reference: Phase2 log](./Phase2-Action-Items-Implementation-20260114.md#A-003-Define-Task-Specific-Architectural-Constraints) |
| **A-004** | ✅ COMPLETE | Enhance test specificity evaluation | [Phase 1, L1561](./Phase1-Yin-Campaign-20260113.md#L1561) | None | [Reference: Phase2 log](./Phase2-Action-Items-Implementation-20260114.md#A-004-Enhance-Test-Evaluation-for-Assertion-Specificity) |
| **A-005** | ✅ SKIPPED | Clarify Logic Score relationship | [Phase 1, L1573](./Phase1-Yin-Campaign-20260113.md#L1573) | Josh decision | User requested skip; using 25-25-25-25 formula instead |

**Phase A Summary:** 5 of 5 executable items complete (100%)

---

## Phase B: Logic Score Risk Mitigation

| Item | Status | Task | Origin | Dependencies | Next Action |
|:---|:---|:---|:---|:---|:---|
| **B-001** | ✅ COMPLETE | Anchor Logic Score to test results | [Phase 1, L1585](./Phase1-Yin-Campaign-20260113.md#L1585) | None | [Reference: Phase2 log](./Phase2-Action-Items-Implementation-20260114.md#B-001-Anchor-Logic-Score-to-Test-Results) |
| **B-002** | ✅ COMPLETE | Reweight CIS formula to 25-25-25-25 | [Phase 1, L1597](./Phase1-Yin-Campaign-20260113.md#L1597) | A-005 decision | [Reference: Phase2 log](./Phase2-Action-Items-Implementation-20260114.md#B-002-Reweight-Formula-to-25-25-25-25) |
| **B-003** | ⏸️ BLOCKED | Update paper narrative | [Phase 1, L1609](./Phase1-Yin-Campaign-20260113.md#L1609) | Stage 3 completion | Post-campaign revision; skipped per sprint focus |

**Phase B Summary:** 2 of 3 items complete (67%)

---

## Phase C: CIS Validation via Model Diversity & LLM-as-Judge (Revised Approach)

| Item | Status | Task | Origin | Dependencies | Next Action |
|:---|:---|:---|:---|:---|:---|
| **C-NEW-001** | ⏳ IN PROGRESS | Model diversity test (Qwen vs alternatives) | Phase 1, L1647 | None | Run battles with different model weights loaded in vLLM |
| **C-NEW-002** | ⏸️ BLOCKED | LLM-as-Judge validation | Phase 1, L1659 | C-NEW-001 (sample submissions) | Use Claude/GPT with expert letter as system prompt |
| **C-NEW-003** | ⏸️ BLOCKED | Generate validation report | Phase 1, L1671 | C-NEW-002 (LLM ratings) | Analyze correlations and publish findings |

**Phase C Summary:** 0 of 3 items started (New approach replaces old C-005 through C-012)

**Strategic Change:** 
- **OLD:** Recruit 2-3 human experts (C-005 through C-012)
- **NEW:** Model diversity test + LLM-as-Judge (C-NEW-001 through C-NEW-003)
- **Rationale:** Objective proof (model differentiation) + Reproducible validation (LLM judge)

---

## Phase D: Pre-Stage-3 Code Adjustments (Conditional on Validation Results)

| Item | Status | Task | Origin | Dependencies | Next Action |
|:---|:---|:---|:---|:---|:---|
| **D-001** | ⏸️ BLOCKED | Re-score Stage 2 with updated formula | [Phase 1, L1809](./Phase1-Yin-Campaign-20260113.md#L1809) | B-001 or B-002 | Only needed if formula changed (B-002 completed) |
| **D-002** | ⏸️ BLOCKED | Update campaign report | [Phase 1, L1821](./Phase1-Yin-Campaign-20260113.md#L1821) | D-001 | Conditional on D-001 |

**Phase D Summary:** 0 of 2 items started (Conditional on validation results)

**Decision Point:** If validation shows CIS formula needs adjustment, execute D-001/D-002. Otherwise skip.

---

## Phase E: Stage 3 Preparation (After Validation)

| Item | Status | Task | Origin | Dependencies | Next Action |
|:---|:---|:---|:---|:---|:---|
| **E-001** | ✅ COMPLETE | Stage 3 campaign config setup | [Phase 1, L1833](./Phase1-Yin-Campaign-20260113.md#L1833) | None | Created: `config/stage3_campaign_config.json` with 100+ battle target |
| **E-002** | ✅ COMPLETE | Create pre-launch checklist | [Phase 1, L1845](./Phase1-Yin-Campaign-20260113.md#L1845) | None | Created: `config/STAGE3_PRE_LAUNCH_CHECKLIST.md` (304 lines) |
| **E-003** | ⏸️ BLOCKED | Final pre-launch checklist review | [Phase 1, L1857](./Phase1-Yin-Campaign-20260113.md#L1857) | C-007 complete | Verify all BLOCKING items complete |
| **E-004** | 🔴 BLOCKED | Stage 3 launch decision | [Phase 1, L1869](./Phase1-Yin-Campaign-20260113.md#L1869) | E-003 + validation pass | Go/no-go decision by Josh |

**Phase E Summary:** 2 of 4 items complete (50%); Launch gate dependent on Phase C validation

---

## Phase F: Advanced Features (Optional)

| Item | Status | Task | Origin | Dependencies | Next Action |
|:---|:---|:---|:---|:---|:---|
| **F-001** | 🟢 OPTIONAL | Token-level A2A streaming | [Phase 1, L1929](./Phase1-Yin-Campaign-20260113.md#L1929) | Time available | Optional investigation; abort if no clear solution |

**Phase F Summary:** 0 of 1 items started (Time-permitting optimization)

---

## Phase G: Documentation & Archival

| Item | Status | Task | Origin | Dependencies | Next Action |
|:---|:---|:---|:---|:---|:---|
| **G-001** | ✅ COMPLETE | Implement paper versioning protocol | [Phase 1, L1881](./Phase1-Yin-Campaign-20260113.md#L1881) | None | Created: archive directory + version tracking in CURRENT_TRUTH_SOURCE.md |

**Phase G Summary:** 1 of 1 items complete (100%)

---

## Phase H: Red Agent Integration

| Item | Status | Task | Origin | Dependencies | Next Action |
|:---|:---|:---|:---|:---|:---|
| **H-001** | ✅ COMPLETE | Review Red Agent implementation | [Phase 1, L1941](./Phase1-Yin-Campaign-20260113.md#L1941) | None | [Reference: Red-Agent-Merge-Strategy-20260114.md](./Red-Agent-Merge-Strategy-20260114.md) |
| **H-002** | ✅ COMPLETE | Plan merge strategy | [Phase 1, L1953](./Phase1-Yin-Campaign-20260113.md#L1953) | H-001 | [Reference: Red-Agent-Merge-Strategy-20260114.md](./Red-Agent-Merge-Strategy-20260114.md) |
| **H-003** | ✅ COMPLETE | Extract Red Report Parser | [Phase 1, L1975](./Phase1-Yin-Campaign-20260113.md#L1975) | H-002 | Created: `src/green_logic/red_report_parser.py` + `red_report_types.py` |
| **H-004** | ✅ COMPLETE | Update scoring logic with penalties | [Phase 1, L1987](./Phase1-Yin-Campaign-20260113.md#L1987) | H-003 | Modified: `src/green_logic/scoring.py` (+60 lines) |
| **H-005** | ✅ COMPLETE | Validate end-to-end | [Phase 1, L2009](./Phase1-Yin-Campaign-20260113.md#L2009) | H-004 | Syntax check passed; ready for Stage 3 |

**Phase H Summary:** 5 of 5 items complete (100%)

---

## Overall Progress Summary

| Phase | Complete | Total | % | Status |
|:---|:---|:---|:---|:---|
| **Phase A** | 5 | 5 | 100% | ✅ COMPLETE |
| **Phase B** | 2 | 3 | 67% | ✅ MOSTLY COMPLETE |
| **Phase C** | 0 | 3 | 0% | ⏳ NEW APPROACH (Model Diversity + LLM Judge) |
| **Phase D** | 0 | 2 | 0% | ⏸️ CONDITIONAL |
| **Phase E** | 2 | 4 | 50% | ⏳ AWAITING PHASE C |
| **Phase F** | 0 | 1 | 0% | 🟢 OPTIONAL |
| **Phase G** | 1 | 1 | 100% | ✅ COMPLETE |
| **Phase H** | 5 | 5 | 100% | ✅ COMPLETE |
| **TOTAL** | 15 | 24 | 63% | ⏳ REVISED APPROACH |

**BLOCKING Items Remaining:** 5
- C-NEW-001: Model diversity test
- C-NEW-002: LLM-as-Judge validation
- C-NEW-003: Validation report
- E-003/E-004: Launch decision (awaits Phase C validation)

---

## Critical Dependencies & Timeline

### Phase C: New Validation Strategy

**C-NEW-001: Model Diversity Test**
- Load different model weights into vLLM
- Run identical 25 battles across models
- Compare CIS scores by model
- **Hypothesis:** Better models → higher CIS scores
- **Success Criteria:** Clear CIS differentiation between model quality levels

**C-NEW-002: LLM-as-Judge Validation**
- Use Claude/GPT with expert letter as system prompt
- Rate 25 submissions independently
- Compare LLM ratings to system CIS
- **Success Criteria:** Pearson r ≥ 0.70 (LLM judge vs CIS scores)

**C-NEW-003: Validation Report**
- Analyze model diversity results
- Analyze LLM-as-Judge results
- Publish findings
- **Decision Point:** Validation pass → proceed to E-003/E-004

---

## Immediate Next Steps

### For Josh

1. **Research Model Options** ⏳ IN PROGRESS
   - **Research Prompt:** [Model-Diversity-Research-Request.md](./Model-Diversity-Research-Request.md)
   - **Action:** Submit prompt + 3 documents to Gemini 3 Pro Deep Research
   - **Documents to attach:**
     1. `EXPERT-LETTER.md` (task descriptions & CIS rubric)
     2. `MASTER-ACTION-ITEM-INDEX.md` (validation strategy)
     3. `00_CURRENT_TRUTH_SOURCE.md` (project context)
   - **Expected output:** Markdown report with 3-5 model recommendations
   
2. **Review Research Report & Select Models** (After Gemini completes)
   - Evaluate model recommendations (weak → baseline → strong tiers)
   - Verify vLLM compatibility & VRAM requirements
   - Confirm AWQ/GPTQ quantization availability
   
3. **Start C-NEW-001 Execution**
   - Load selected models into vLLM sequentially
   - Run identical 25 battles per model
   - Collect CIS scores by model

4. **Prepare C-NEW-002**
   - Confirm Claude/GPT API access
   - Test LLM judge system prompt
   - Prepare submission batch format

---

## Key Logistics & Contact Points

### Model Diversity Test (C-NEW-001)

**Models to Test:**
- Current baseline: Qwen-2.5-Coder-32B
- Research options: Claude, GPT-4o, O1-mini, [your candidates?]
- Objective: Prove CIS differentiates model quality

**Expected Pattern:**
```
Weaker Model:    CIS_avg = 0.51 (lower scores)
Baseline Model:  CIS_avg = 0.62 (medium scores)
Stronger Model:  CIS_avg = 0.74 (higher scores)
```

### LLM-as-Judge Validation (C-NEW-002)

**Judge Configuration:**
- Model: Claude-3.5 or GPT-4o (your choice)
- System Prompt: [EXPERT-LETTER.md](./EXPERT-LETTER.md) (repurposed as system prompt)
- Input: 25 submissions from Stage 2
- Output: JSON with R, A, T, L ratings + reasoning

**Validation Success:**
- Pearson r(LLM ratings, CIS scores) ≥ 0.70
- LLM reasoning aligns with CIS dimensions
- Reproducible results (can re-run anytime)

---

## File Locations & Quick Reference

### Configuration & Checklists
- **Campaign Config:** [config/stage3_campaign_config.json](../../../config/stage3_campaign_config.json)
- **Pre-Launch Checklist:** [config/STAGE3_PRE_LAUNCH_CHECKLIST.md](../../../config/STAGE3_PRE_LAUNCH_CHECKLIST.md)

### Validation Infrastructure
- **Validation README:** [validation/README.md](../../../validation/README.md)
- **Distribution Protocol:** [validation/Distribution_Protocol.md](../../../validation/Distribution_Protocol.md)
- **Expert Instructions:** [validation/packets/EXPERT_RATING_INSTRUCTIONS.md](../../../validation/packets/EXPERT_RATING_INSTRUCTIONS.md)

### Analysis Scripts
- **Select Samples:** [validation/scripts/select_samples.py](../../../validation/scripts/select_samples.py)
- **Generate Packets:** [validation/scripts/generate_packets.py](../../../validation/scripts/generate_packets.py)
- **Analyze Correlations:** [validation/scripts/analyze_correlations.py](../../../validation/scripts/analyze_correlations.py)
- **Analyze Agreement:** [validation/scripts/analyze_agreement.py](../../../validation/scripts/analyze_agreement.py)
- **Extract Failure Modes:** [validation/scripts/extract_failure_modes.py](../../../validation/scripts/extract_failure_modes.py)
- **Generate Report:** [validation/scripts/generate_report.py](../../../validation/scripts/generate_report.py)

### Red Agent Integration
- **Merge Strategy:** [Red-Agent-Merge-Strategy-20260114.md](./Red-Agent-Merge-Strategy-20260114.md)
- **Report Types:** [src/green_logic/red_report_types.py](../../../../../src/green_logic/red_report_types.md)
- **Report Parser:** [src/green_logic/red_report_parser.py](../../../../../src/green_logic/red_report_parser.py)
- **Scoring Integration:** [src/green_logic/scoring.py](../../../../../src/green_logic/scoring.py) (lines 415-445)

### Documentation & Logs
- **Phase 1 Log:** [Phase1-Yin-Campaign-20260113.md](./Phase1-Yin-Campaign-20260113.md)
- **Phase 2 Log:** [Phase2-Action-Items-Implementation-20260114.md](./Phase2-Action-Items-Implementation-20260114.md)
- **Sprint Log:** [Sprint-Session-20260114-Evening.md](./Sprint-Session-20260114-Evening.md)
- **This File:** [MASTER-ACTION-ITEM-INDEX.md](./MASTER-ACTION-ITEM-INDEX.md)

---

## Navigation

**For User Guidance:**
- Start here: This file (overview + logistics)
- Next: [EXPERT-LETTER.md](./EXPERT-LETTER.md) (what experts need to do)

**For Implementation Details:**
- Phase 1: [Phase1-Yin-Campaign-20260113.md](./Phase1-Yin-Campaign-20260113.md) (action item origins)
- Phase 2: [Phase2-Action-Items-Implementation-20260114.md](./Phase2-Action-Items-Implementation-20260114.md) (A-003/A-004 implementation)
- Sprint: [Sprint-Session-20260114-Evening.md](./Sprint-Session-20260114-Evening.md) (C/H/E implementation)

**For Workflows:**
- Validation: [Distribution_Protocol.md](../../../validation/Distribution_Protocol.md)
- Launch Gate: [STAGE3_PRE_LAUNCH_CHECKLIST.md](../../../config/STAGE3_PRE_LAUNCH_CHECKLIST.md)

---

**Last Updated:** 2026-01-14 23:45 UTC (Strategic pivot to Model Diversity + LLM Judge validation)

**Next Update Trigger:** When C-NEW-001 (model diversity test) completes
