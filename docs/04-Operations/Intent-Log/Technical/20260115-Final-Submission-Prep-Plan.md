---
status: ACTIVE
type: Plan
date: 2026-01-15
---

> **Context:**
> *   [2026-01-15]: Execution plan to resolve gaps and finalize the "Green Agent" submission.
> *   **Source:** `docs/04-Operations/Intent-Log/Technical/20260115-Submission-Gap-Analysis-Report.md`

# Final Submission Preparation Plan

## 1. Repository Cleanup (The "Clean Branch")
*   [ ] **Remove Red Agent:** Delete `src/red_logic/` and remove references in `main.py`.
*   [ ] **Remove Junk:** Delete `*.log`, `campaign_*.txt`.
*   [ ] **Organize Root:** Move `mock_purple.py`, `verify_persistence.py` to `tests/` or `scripts/`.
*   [ ] **Remove Legacy:** Delete `auth0-ai-samples/` if confirmed unused.

## 2. AgentBeats Configuration
*   [ ] **Create `leaderboard.json`:** Implement the SQL query for the "Equal Weighting" CIS formula.
    *   *Formula:* `CIS = 0.25*R + 0.25*A + 0.25*T + 0.25*L`.
*   [ ] **Create `agentbeats_profile.json`:** Define agent metadata (Name, Abstract, Image).

## 3. Documentation Updates (`README.md`)
*   [ ] **Add Abstract:** Insert the official Green Agent abstract.
*   [ ] **Add Video Link:** Insert placeholder for YouTube link.
*   [ ] **Update Build Instructions:** Provide clear `docker build -t green-agent .` and `docker run` commands.
*   [ ] **Remove Red References:** Scrub text mentioning "Red Agent" or "Attacker".

## 4. Docker Finalization
*   [ ] **Update `Dockerfile`:** Ensure it builds the Green Agent correctly without "Red" dependencies if possible, or at least works as a standalone assessor.

## 5. Final Verification
*   [ ] **Structure Check:** Verify root is clean.
*   [ ] **Content Check:** Verify README links and text.
