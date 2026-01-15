---
status: ACTIVE
type: Briefing
date: 2026-01-15
---

> **Context:**
> *   [2026-01-15]: Briefing for team review of C-NEW-001 Tier 1-3 results.
> *   **Source:** `docs/04-Operations/Team/20260115-LogoMesh-Meeting-[Alaa_Deepti_Josh].srt`
> *   **Action Required:** Execution of Action Items and Final Verification for AgentBeats Submission.

# C-NEW-001 Battle Results & Submission Briefing

## Executive Summary

This document outlines the status of the C-NEW-001 Model Diversity Test (Tiers 1-3) and the final action items required for the AgentBeats "Green Agent" submission (Due: Jan 15, 11:59 PM PST).

**Current Status (22:00 UTC):**
*   **Tier 2 (Qwen):** Rerun Complete (200s timeout fix applied). Validation pending.
*   **Tier 1 (Mistral):** Automation failed (`scripts/finish_the_job.sh`). **Requires Manual Rerun.**
*   **Tier 3 (GPT-OSS):** Pending Manual Execution.

---

## ⚡ Meeting Action Items

Derived from `20260115-LogoMesh-Meeting-[Alaa_Deepti_Josh].srt`.

### Critical Path: Submission (Owner: Josh)
- [ ] **Manual Rerun Tier 1 (Mistral):** Execute 25 battles manually (Automation script failed).
- [ ] **Manual Rerun Tier 3 (GPT-OSS):** Execute 25 battles manually.
- [ ] **Fix Scoring Weights:** Ensure all database scores reflect **Equal Weighting (0.25)** for the 4 components. (Correct the "40% Logic" weighting mentioned in previous logs).
- [ ] **Branch Cleanup:** Create a clean submission branch containing **only the Green Agent**.
    -   *Action:* Remove/Hide Red Agent code and "junk" files.
- [ ] **Video Production:** Create the submission video.
    -   *Format:* PowerPoint slides + Code/Visualization walkthrough (No face camera required).
- [ ] **Lambda Track Registration:** Register the team for the Lambda track immediately.

### Documentation & Assets (Owners: Team)
- [ ] **Alaa:** Convert the Research Paper (Markdown) to LaTeX/PDF using Overleaf.
- [ ] **Deepti:** Create a high-level "Green Agent" Diagram/Pictorial based on updated docs.

---

## ❓ Open Questions / Verification Needed

**1. Tier 2 (Qwen) Rerun Verification**
*   **Context:** The Tier 2 Rerun completed successfully (25/25 battles) after the timeout fix.
*   **Question:** What is the new Average CIS/Logic Score? (Must be verified against `data/battles_tier2_qwen.db`).
*   **Target:** Logic Score should be > 0.75 (up from 0.666).

**2. Email Validator Task Exclusion**
*   **Context:** The "Email Validator" task was skipped due to DNS/Network errors in the isolated environment.
*   **Question:** Should this limitation be explicitly documented in the submission README to explain the missing task?

**3. Red Agent Removal Specifics**
*   **Context:** We are submitting Green Agent only.
*   **Question:** Should the Red Agent code be *physically deleted* from the submission branch, or just disabled/hidden? (Transcript suggests "branch... where it's removed").

---

## Data Sources & Configuration

### Tier 1: Mistral-7B (Baseline)
*   **Database File:** `data/battles_tier1_mistral.db`
*   **Status:** 🔴 **FAILED / REQUIRES MANUAL RERUN**
    *   Previous attempts contained API errors.
    *   Automation script failed to execute.

### Tier 2: Qwen-32B (Competitor)
*   **Database File:** `data/battles_tier2_qwen.db`
*   **Status:** 🟡 **RERUN COMPLETE (Awaiting Score Validation)**
    *   Previous Run (Avg 0.667) had timeout bugs.
    *   Rerun (200s timeout) completed 25/25 battles.
*   **CIS Formula:** **Equal Weighting**
    *   $CIS = 0.25 \cdot R + 0.25 \cdot A + 0.25 \cdot T + 0.25 \cdot L$

### Tier 3: gpt-oss-20b (SOTA proxy)
*   **Database File:** `data/battles_tier3_gptoss.db`
*   **Status:** ⚪ **PENDING**
    *   Requires manual execution after Tier 1.
*   **CIS Formula:** **Equal Weighting**
    *   $CIS = 0.25 \cdot R + 0.25 \cdot A + 0.25 \cdot T + 0.25 \cdot L$

---

## Formula Verification Details

For Tiers 2 and 3, the Contextual Integrity Score (CIS) is calculated as a simple arithmetic mean of the four component scores.

**Component Legend:**
*   **R (Rationale):** Alignment of explanation with implementation.
*   **A (Architecture):** Compliance with constraints and structural clarity.
*   **T (Testing):** Quality and coverage of test cases.
*   **L (Logic):** Functional correctness and bug freedom.

**Verification Example (Tier 3 - Projected):**
*   Battle: `tier3-gptoss-001`
*   Calculation: $(R + A + T + L) / 4$
