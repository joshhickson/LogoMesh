---
status: ARCHIVED
archived: 2026-01-31
type: Spec
---
> **Context:**
> *   [2026-01-31]: Archived copy of the single source of truth for the LogoMesh project as of January 31, 2026. For the latest version, see docs/00_CURRENT_TRUTH_SOURCE.md.

# 00. Current Truth Source (Master Index) [ARCHIVED 2026-01-31]

## 1. Top-Level Strategic Directives (The "Why")

*   **Mission:** Win the AgentX AgentBeats Competition (Green Track).
*   **Core Thesis:** "Contextual Debt" is the primary liability of AI code. We measure it via the "Contextual Integrity Score (CIS)."
*   **Current Phase:** **"Iron Sharpens Iron" (Arena Mode).**
    *   We are building an **Agent Arena** where Red Agents attack Purple Agents, and the Green Agent judges the outcome.
*   **Submission Deadline:** January 15, 2026.

## 2. Immediate Tactical Goals (The "What")

*   **Lambda Test:** **COMPLETE (2026-01-03).** Green Agent successfully deployed on H100 GPU in Lambda Cloud.
*   **Vector Scoring:** Implement `Rationale Integrity` using Cosine Similarity (not just LLM vibes).
*   **Adversarial Defense:** Prevent "Context Stuffing" using KL Divergence.
*   **Documentation:** Migrate to RST/ReadTheDocs for professional presentation.
*   **Session Persistence:** **CRITICAL (P0).** Implement crash-proof filing system for battle logs.

## 3. Team Workspaces & Roles (The "Who")

**Protocol:** Agents must ask for the **Instructor's Name** at the start of a session to locate the correct workspace.

| Role | Name | Workspace Folder | Primary Focus |
| :--- | :--- | :--- | :--- |
| **Team Lead** | **Josh** | [docs/Archive/Intent-Log/Josh/](Archive/Intent-Log/Josh/) | Strategy, Architecture, Submission |
| **Data Scientist** | **Deepti** | [docs/Archive/Intent-Log/Deepti/](Archive/Intent-Log/Deepti/) | CIS Metrics, Decay Theorem, Presentation |
| **Green Agent Lead** | **Alaa** | [docs/Archive/Intent-Log/Alaa/](Archive/Intent-Log/Alaa/) | Evaluator Logic, Vector Math |
| **Builder/Dev** | **Garrett** | [docs/Archive/Intent-Log/Garrett/](Archive/Intent-Log/Garrett/) | Implementation, Docker, Tooling |
| **Green Agent Dev** | **Samuel** | [docs/Archive/Intent-Log/Samuel/](Archive/Intent-Log/Samuel/) | Python Codebase, A2A Protocol |
| **System Architect** | **Mark (Kuan Zhou)** | [docs/Archive/Intent-Log/Mark/](Archive/Intent-Log/Mark/) | Security, AWS/Lambda, Red Agent Lead |
| **Backend Dev** | **Oleksander**| [docs/Archive/Intent-Log/Oleksander/](Archive/Intent-Log/Oleksander/) | Orchestration, Sidecar, API |

## 4. Key Documentation Indices

### Strategy & IP
*   [Contextual Debt Paper (Draft)](00-Strategy/IP/20251118-Copyright-Edition-Contextual-Debt-Paper.md): The core theory.
*   **Paper Versioning Protocol (G-001):** Before any paper update, copy current to archive with timestamp. All versions tracked in this file.
    - **Current Version:** v1 (2026-01-14) - Validates Stage 2 Campaign (77 battles)
    - **Archive:** [00-Strategy/IP/archive/](00-Strategy/IP/archive/)
    - **Process:** `cp paper.md archive/paper_v[N]_YYYY-MM-DD.md` before edits; update CURRENT_TRUTH_SOURCE.md after
*   [Competition Requirements](05-Competition/20251221-Submission-Requirements-Matrix.md): The rules we must follow.

### Architecture
*   [Judges Start Here](./05-Competition/Judges-Start-Here.md): **START HERE** - Quick overview for competition judges.
*   [Agent Architecture Guide](./05-Competition/Agent-Architecture.md): Full technical architecture of the 3-agent arena.
*   [Agent Arena Upgrade Plan](Archive/Intent-Log/Technical/20260101-Agent-Arena-Upgrade-Plan.md): The technical roadmap for the competition.
*   [Embedding Vectors Specs](04-Operations/Dual-Track-Arena/Embedding-Vectors/README.md): Mathematical specifications for CIS.
*   **CIS Metrics Tracking (A-002):**
    - **Formula (Post-B-002):** `CIS = (0.25 × R) + (0.25 × A) + (0.25 × T) + (0.25 × L)`
    - **Components:** rationale_score (Intent↔Rationale), architecture_score, testing_score, logic_score (anchored to sandbox success per B-001)
    - **New Diagnostic (A-002):** `intent_code_similarity` (cos(task_description, source_code)) stored separately in evaluation JSON
    - **Purpose:** Intent↔Code metric reserved for validation analysis to test against Intent↔Rationale for R(Δ) definition accuracy
    - **Status:** Non-breaking addition; preserved Stage 2 comparability; enables future R(Δ) refinement post-validation

*   **Agent Arena Architecture (2026-01-15):**
    - **Green Agent (Judge):** Orchestrates battles, assigns tasks, computes CIS scores, runs sandbox. Port 9000.
    - **Purple Agent (Defender):** Generates code solutions with rationale and tests. Port 9001.
    - **Red Agent V2 (Attacker):** Hybrid 3-layer vulnerability detection (Static→Smart→Reflection). Port 9021.
    - **vLLM Brain:** Qwen2.5-Coder-32B-Instruct-AWQ on Port 8000.
    - **Key Features:** Tautology detection, authorization bypass detection, constraint violation checking.
    - **Deployment:** `./scripts/bash/launch_arena.sh` on Lambda H100/A100.

### Operations
*   [Master Log](Archive/Intent-Log/Technical/20251231-Polyglot-Consolidation-Master-Log.md): History of the Polyglot merge.
*   [Lambda Test Protocol](Archive/Intent-Log/Josh/20260101-Lambda-Test-Protocol.md): How to run the test.
*   [Instance Restart Guide](Archive/Intent-Log/Josh/20260103-Instance-Restart-Guide.md): **CRITICAL** procedure for recovering the ephemeral H100 environment.
*   [Team Briefing Draft](Archive/Intent-Log/Josh/20260101-Team-Briefing-Draft.md): Announcement of the "Red Zone" sprint.
*   **Phase 2.7: C-NEW-001 Infrastructure Setup (2026-01-14)**
    - [Setup & Execution Log](Archive/Intent-Log/Josh/Phase2.7-C-NEW-001-Infrastructure-Setup-20260114.md): Sequential deployment of Mistral/Qwen/gpt-oss trio
    - Status: **READY FOR EXECUTION** (25 battles × 3 tiers, ~12-16 hours)
    - Automation: `scripts/run_c_new_001_diversity_test.sh`, `scripts/analyze_c_new_001_results.py`
    - Expected CIS deltas: 0.33 (Tier 1→3), validates metric hypothesis

---

## 5. Deprecation & Pivot Log

*   **Deprecated:** `PROJECT_PLAN.md` (Old commercial strategy).
*   **Deprecated:** "Auth0 Sponsorship" (Expired/Irrelevant).
*   **Deprecated:** `docs/04-Operations/green-agent/`, `docs/04-Operations/purple-agent/`, `docs/04-Operations/agentbeats-lambda/` (Code migrated to `src/`).
*   **Deprecated:** `Llama-3-70B` and `gpt-oss-20b` (Replaced by `Qwen/Qwen2.5-Coder-32B-Instruct` for 16k context compliance).
*   **Pivot:** Moved from "SaaS Tool" to "Competition Benchmark."
