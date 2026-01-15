---
status: ACTIVE
type: Plan
date: 2026-01-15
---

> **Context:**
> *   [2026-01-15]: Briefing for team review of C-NEW-001 Tier 1-3 results.
> *   **Action Required:** Verify Tier 1 data integrity before analysis.

# C-NEW-001 Battle Results Review Briefing

## Executive Summary

This document provides the exact locations and configuration details for the completed C-NEW-001 Model Diversity Test (Tiers 1-3). The review team should focus on the SQLite databases listed below.

**⚠️ CRITICAL WARNING FOR TIER 1:** 
The Tier 1 database file currently contains API error records (Score 0.16). Do not use `data/battles_tier1_mistral.db` for final analysis without first validating its contents against `results/c_new_001_diversity_test/tier1_execution_clean.log`.

---

## Data Sources & Configuration

### Tier 1: Mistral-7B (Baseline)
*   **Database File:** `data/battles_tier1_mistral.db`
*   **Status:** 🔴 **REQUIRES AUDIT** - Current file contains API Key errors.
*   **Backup File:** `data/battles_tier1_complete_backup.db` (Contains 0.0 scores, likely initialization artifacts).
*   **CIS Formula:** *Unverifiable in current DB* (Presumed Equal Weighting).
*   **Analysis Action:** Re-run Tier 1 or reconstruct from `results/` logs before final metrics.

### Tier 2: Qwen-32B (Competitor)
*   **Database File:** `data/battles_tier2_qwen.db`
*   **Status:** ✅ **VERIFIED** - Contains valid scores (~0.69 avg).
*   **CIS Formula:** **Equal Weighting**
    *   $CIS = 0.25 \cdot R + 0.25 \cdot A + 0.25 \cdot T + 0.25 \cdot L$
    *   *Verified against Battle ID `tier2-qwen-001`.*

### Tier 3: gpt-oss-20b (SOTA proxy)
*   **Database File:** `data/battles_tier3_gptoss.db`
*   **Status:** ✅ **VERIFIED** - Contains valid scores (~0.77 avg).
*   **CIS Formula:** **Equal Weighting**
    *   $CIS = 0.25 \cdot R + 0.25 \cdot A + 0.25 \cdot T + 0.25 \cdot L$
    *   *Verified against Battle ID `tier3-gptoss-001`.*

---

## Formula Verification Details

For Tiers 2 and 3, the Contextual Integrity Score (CIS) is calculated as a simple arithmetic mean of the four component scores.

**Component Legend:**
*   **R (Rationale):** Alignment of explanation with implementation.
*   **A (Architecture):** Compliance with constraints and structural clarity.
*   **T (Testing):** Quality and coverage of test cases.
*   **L (Logic):** Functional correctness and bug freedom.

**Verification Example (Tier 3):**
*   Battle: `tier3-gptoss-001`
*   Scores: R=0.8, A=0.75, T=0.7, L=0.85
*   Calculation: $(0.8 + 0.75 + 0.7 + 0.85) / 4 = 0.775$
*   DB Score: `0.775` (Match ✅)

## Next Steps for Review Team

1.  **Immediate:** Investigate `run_tier1_mistral.py` configuration to fix the "Incorrect API key provided: EMPTY" error causing data corruption in Tier 1.
2.  **Analysis:** Proceed with Tier 2 and Tier 3 comparative analysis using the Equal Weighting formula.
3.  **Recovery:** If Tier 1 cannot be re-run immediately, parse `results/c_new_001_diversity_test/tier1_execution_clean.log` to recover battle IDs and pass/fail states, though full component scores may be missing if not explicitly logged.
