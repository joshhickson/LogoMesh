---
status: ACTIVE
type: Plan
date: 2026-01-15
---

> **Context:**
> *   [2026-01-15]: Execution plan to finalize the "Green Agent" (Security Benchmark) submission.
> *   **Source:** `docs/04-Operations/Intent-Log/Technical/20260115-Submission-Gap-Analysis-Report.md`
> *   **Architectural Note:** This is a UNIFIED security assessment framework. Red/Purple logic are internal components of the Green Agent benchmark, not separate submissions.

# Final Submission Preparation Plan

## 0. Architectural Philosophy (Critical Context)

**What We're Submitting:** ONE Green Agent - a comprehensive security assessment benchmark.

**Architecture:**
- **Green Agent (Orchestrator):** Main submission - evaluation workflow, scoring, reporting
- **Red Logic (Attack Engine):** Internal component - generates adversarial attacks
- **Purple Logic (Defense Interface):** Internal component - standardized defender interface

**Analogy:** Like JUnit contains both "test runner" and "assertions", our security benchmark contains orchestration, attack generation, and defense evaluation as integrated modules.

## 1. Repository Cleanup (The "Clean Branch")
*   [ ] **Remove Junk:** Delete `campaign_*.txt`, stale `*.log` files.
*   [ ] **Organize Root:** Move `mock_purple.py`, `verify_persistence.py` to `tests/` or `scripts/`.
*   [ ] **Remove Legacy:** Delete `auth0-ai-samples/` if confirmed unused.
*   [ ] **Verify Notebooks:** Ensure `notebooks/` contains only relevant analysis or remove.

## 2. Documentation Enhancements (Critical for Judges)

### README.md Updates
*   [ ] **Add "What is This Benchmark?" Section:**
    *   Title: "Security Assessment Benchmark with Integrated Adversarial Testing"
    *   Explain: Green Agent orchestrates security evaluations using internal Red (attack) and Purple (defense) components
    *   Emphasize: This is ONE unified benchmark, not three separate agent submissions
*   [ ] **Add Architectural Diagram:** Visual showing Green Agent as orchestrator with Red/Purple as internal components.
*   [ ] **Update Abstract:** Emphasize security testing, adversarial evaluation, Contextual Integrity Score (CIS).
*   [ ] **Add Video Link:** Insert placeholder or actual YouTube link for 3-min demo.
*   [ ] **Clarify Docker Usage:** Document that `--role GREEN` launches the full benchmark orchestrator.

### JUDGES_START_HERE.md
*   [ ] **Add Architecture Explanation:** First section should explain the unified benchmark design.
*   [ ] **Emphasize Security Focus:** Clarify this evaluates defenders against adversarial attacks.

## 3. AgentBeats Configuration
*   [ ] **Create `leaderboard.json`:** Implement the SQL query for security benchmark metrics.
    *   *Formula:* `CIS = 0.25*R + 0.25*A + 0.25*T + 0.25*L` (Rationale, Architecture, Testing, Learnability)
    *   Add security-specific columns: attack_success_rate, defense_robustness, scenario_coverage
*   [ ] **Create `agentbeats_profile.json`:** Define agent metadata.
    *   Name: "LogoMesh Security Benchmark" or similar
    *   Category: "Cybersecurity Agent" + "Custom Track - Lambda's Agent Security"
    *   Abstract: Emphasize adversarial testing, CIS measurement, integrated attack/defense framework

## 4. Docker Configuration
*   [ ] **Verify `Dockerfile`:** Ensure it correctly builds all components (Green orchestrator + Red/Purple modules).
*   [ ] **Update Entrypoint:** Default CMD should launch Green Agent: `["python3", "main.py", "--role", "GREEN"]`
*   [ ] **Test Build:** Verify `docker build` completes without errors.
*   [ ] **Test Run:** Verify `docker run` launches the Green Agent server on expected port.

## 5. Final Verification Checklist
*   [ ] **Structural Integrity:**
    - Root directory is clean (no campaign logs, stale files)
    - All source code is in appropriate directories
    - Test/utility scripts are in `scripts/` or `tests/`
*   [ ] **Documentation Completeness:**
    - README clearly explains unified security benchmark architecture
    - JUDGES_START_HERE provides quick-start guide
    - Abstract emphasizes security, adversarial testing, CIS
    - Demo video link is present (even if placeholder)
*   [ ] **Technical Requirements:**
    - Dockerfile builds successfully
    - Default docker run launches Green Agent
    - AgentBeats config files present
    - Leaderboard configuration includes security metrics
*   [ ] **Reproducibility:**
    - All dependencies documented
    - Clear build/run instructions
    - Example evaluation commands provided

## 6. Research Paper Finalization (Extended Deadline)
*   [ ] **Review Contextual Debt Paper:** `docs/00-Strategy/IP/20251118-Copyright-Edition-Contextual-Debt-Paper.md`
*   [ ] **Align with Submission:** Ensure paper's "Cyber-Sentinel" and "Agent-as-a-Judge" concepts align with the implemented Green Agent architecture.
*   [ ] **Add Implementation Section:** Document how the LogoMesh Security Benchmark demonstrates the paper's theoretical framework.
*   [ ] **Update Case Studies:** Include specific scenarios (DockerDoo, SolarSpike, DebugDump, AdAttack) as real-world examples.
*   [ ] **Verify CIS Formula:** Ensure mathematical formalization in Section 3 matches implementation.
*   [ ] **Proofread & Polish:** Final editorial pass for submission.
*   [ ] **Submit Paper:** Follow extended deadline submission process.
