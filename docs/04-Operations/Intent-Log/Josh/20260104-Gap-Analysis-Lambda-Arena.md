---
status: ACTIVE
type: Plan
---
> **Context:**
> *   [2026-01-04]: Strategic Gap Analysis based on Meeting 9 Minutes, focused on Lambda Competition readiness.
> *   **Superseded By:** N/A

# 2026-01-04 Gap Analysis: Lambda Arena & Competition Readiness

## Executive Summary
This document outlines the strategic plan to bridge the gap between our current "Arena" prototype and a winning submission for the Lambda x Berkeley AgentBeats Competition (Phase 1 deadline: Jan 16, 2026). It addresses immediate documentation needs, technical verification of the arena, and the strategic implementation of Red/Green agents.

**Log Storage:** All execution logs for this plan will be stored in the dedicated directory: `docs/04-Operations/Dual-Track-Arena/`.

---

## Phase 1: Setup & Documentation (Team Onboarding)
**Goal:** Ensure any team member (specifically Alaa and Deepti) can spin up a Lambda instance and connect via VS Code with zero friction.

### 1.1 Reformat "Noob Guides"
*   **Files:**
    *   `docs/04-Operations/Intent-Log/Josh/20260101-Lambda-Noob-Guide.md` (Windows)
    *   `docs/04-Operations/Intent-Log/Josh/20260101-Lambda-Noob-Guide-MacOS.md` (MacOS)
*   **Actions:**
    *   Update headers to standard format.
    *   Ensure all links are explicit and "GitHub clickable".
    *   Consolidate if possible or clearly distinguish.

### 1.2 VS Code Remote & Debugging Insights (from Chat Logs)
*   **Source:** `docs/04-Operations/Intent-Log/Josh/20260104-Agent-Battle-Chat.json`
*   **Insight:** The agent logs confirm successful use of `vscode-remote://ssh-remote+...`.
*   **Action:** Add a "Troubleshooting & Nuances" section to the Noob Guides explicitly mentioning:
    *   **Extension:** `ms-vscode-remote.remote-ssh` is mandatory.
    *   **Workflow:** Connect -> Open Folder -> Install Extensions *on Remote* (Python, Pylance).
    *   **Network:** verify `nvidia-smi` functionality immediately upon connection to confirm GPU access before Docker builds.

---

## Phase 2: Arena Technical Verification (Submission Readiness)
**Goal:** Verify the `security_arena` structure matches the rigorous Phase 1 requirements.

### 2.1 Scenario Structure Audit
*   **Source:** `docs/05-Competition/Lambda × Berkeley AgentBeats Security Arena_ Building the Future of AI Security Testing.md`
*   **Checklist:**
    *   Does `scenarios/security_arena` match the expected PR structure?
    *   Do we have the required `attack_succeeded.json` output format?
    *   Are we using the correct model `gpt-oss-20b` (or `Qwen/Qwen2.5-Coder-32B-Instruct` as our proxy)?

### 2.2 Submission Workflow (Step 3)
*   **Problem:** We need to submit "Clean PRs" from a cloned repo, not our monorepo.
*   **Action:**
    *   Test the "Clone & Extract" workflow.
    *   Verify that `external/TEAM/agentbeats-lambda-[kzhou003-pull2-20251221]` logic is fully ported and reproducible in our arena.

---

## Phase 3: Lambda Track Strategy (Winning Phase 1)
**Goal:** Execute the "Dual Track" strategy (Red vs. Blue) to maximize points.

### 3.1 Red Agent Strategy (Step 4 & 5)
*   **Objective:** 1 Successful Attack (Min) to 15 Attempts (Max).
*   **Metric:** "Highly sophisticated, hard to find, deeply buried vulnerabilities."
*   **Action:**
    *   Analyze Mark's code (`external/TEAM/agentbeats-lambda-[kzhou003-pull2-20251221]`) as the "Gold Standard".
    *   Document the "Winning Logic" in `docs/04-Operations/Dual-Track-Arena/Red-Agent-Strategy.json`.

### 3.2 Green Agent Validation
*   **Objective:** Ensure Green Agent correctly identifies Purple Agent failures.
*   **Action:**
    *   Run scenarios where Purple Agent *should* fail and verify Green Agent catches it.

---

## Next Steps
1.  **Execute Phase 1 immediately:** Update the guides.
2.  **Run Audit:** Perform the check in Phase 2.1.
3.  **Log Progress:** Create `docs/04-Operations/Dual-Track-Arena/20260104-Execution-Log.md`.
