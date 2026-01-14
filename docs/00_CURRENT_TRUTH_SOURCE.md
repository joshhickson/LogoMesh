---
status: ACTIVE
type: Spec
---
> **Context:**
> *   [2025-12-21]: The absolute single source of truth for the LogoMesh project. All agents must check this file first.

# 00. Current Truth Source (Master Index)

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
| **Team Lead** | **Josh** | [docs/04-Operations/Intent-Log/Josh/](../04-Operations/Intent-Log/Josh/) | Strategy, Architecture, Submission |
| **Data Scientist** | **Deepti** | [docs/04-Operations/Intent-Log/Deepti/](../04-Operations/Intent-Log/Deepti/) | CIS Metrics, Decay Theorem, Presentation |
| **Green Agent Lead** | **Alaa** | [docs/04-Operations/Intent-Log/Alaa/](../04-Operations/Intent-Log/Alaa/) | Evaluator Logic, Vector Math |
| **Builder/Dev** | **Garrett** | [docs/04-Operations/Intent-Log/Garrett/](../04-Operations/Intent-Log/Garrett/) | Implementation, Docker, Tooling |
| **Green Agent Dev** | **Samuel** | [docs/04-Operations/Intent-Log/Samuel/](../04-Operations/Intent-Log/Samuel/) | Python Codebase, A2A Protocol |
| **System Architect** | **Mark (Kuan Zhou)** | [docs/04-Operations/Intent-Log/Mark/](../04-Operations/Intent-Log/Mark/) | Security, AWS/Lambda, Red Agent Lead |
| **Backend Dev** | **Oleksander**| [docs/04-Operations/Intent-Log/Oleksander/](../04-Operations/Intent-Log/Oleksander/) | Orchestration, Sidecar, API |

## 4. Key Documentation Indices

### Strategy & IP
*   [Contextual Debt Paper (Draft)](../00-Strategy/IP/20251118-Copyright-Edition-Contextual-Debt-Paper.md): The core theory.
*   **Paper Versioning Protocol (G-001):** Before any paper update, copy current to archive with timestamp. All versions tracked in this file.
    - **Current Version:** v1 (2026-01-14) - Validates Stage 2 Campaign (77 battles)
    - **Archive:** [00-Strategy/IP/archive/](../00-Strategy/IP/archive/)
    - **Process:** `cp paper.md archive/paper_v[N]_YYYY-MM-DD.md` before edits; update CURRENT_TRUTH_SOURCE.md after
*   [Competition Requirements](../05-Competition/20251221-Submission-Requirements-Matrix.md): The rules we must follow.

### Architecture
*   [Agent Arena Upgrade Plan](../04-Operations/Intent-Log/Technical/20260101-Agent-Arena-Upgrade-Plan.md): The technical roadmap for the competition.
*   [Embedding Vectors Specs](../04-Operations/Embedding-Vectors/README.md): Mathematical specifications for CIS.

### Operations
*   [Master Log](../04-Operations/Intent-Log/Technical/20251231-Polyglot-Consolidation-Master-Log.md): History of the Polyglot merge.
*   [Lambda Test Protocol](../04-Operations/Intent-Log/Josh/20260101-Lambda-Test-Protocol.md): How to run the test.
*   [Instance Restart Guide](../04-Operations/Intent-Log/Josh/20260103-Instance-Restart-Guide.md): **CRITICAL** procedure for recovering the ephemeral H100 environment.
*   [Team Briefing Draft](../04-Operations/Intent-Log/Josh/20260101-Team-Briefing-Draft.md): Announcement of the "Red Zone" sprint.

---

## 5. Deprecation & Pivot Log

*   **Deprecated:** `PROJECT_PLAN.md` (Old commercial strategy).
*   **Deprecated:** "Auth0 Sponsorship" (Expired/Irrelevant).
*   **Deprecated:** `docs/04-Operations/green-agent/`, `docs/04-Operations/purple-agent/`, `docs/04-Operations/agentbeats-lambda/` (Code migrated to `src/`).
*   **Deprecated:** `Llama-3-70B` and `gpt-oss-20b` (Replaced by `Qwen/Qwen2.5-Coder-32B-Instruct` for 16k context compliance).
*   **Pivot:** Moved from "SaaS Tool" to "Competition Benchmark."
