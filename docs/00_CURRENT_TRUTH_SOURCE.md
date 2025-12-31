> **Status:** ACTIVE
> **Type:** System of Record
> **Context:** Single Source of Truth (Post-Gap Analysis)
> **Last Updated:** 2025-12-31

# Current Truth Source

## 1. Strategic Pillars
*   **The Mission:** We are building **AgentBeats**, an open-source **benchmark** for the AgentX competition.
*   **The Pivot:** We have explicitly rejected the "Commercial SaaS" (LogoMesh as a product) strategy in favor of a "Public Good" research instrument.
*   **The Core Innovation:** **Contextual Integrity**, a measurable protocol for "Agent Safety" and "Cybersecurity".
*   **The Strategy:** "Iron Sharpens Iron" (Dual Track). We use a Red Agent (Attacker) to validate the Purple Agent (Defender), orchestrated by the Green Agent.

## 2. Core Definitions (Terminology)
*   **Contextual Debt:** The accumulating probability that a software system’s behavior has drifted from its human intent.
*   **AgentBeats:** The framework/benchmark repository (`github.com/agentbeats/agentbeats`).
*   **LogoMesh:** The team/entity building the framework.
*   **Green Agent:** The "Evaluator" (The Good/Safety Agent) responsible for checking code.
*   **Purple Agent:** The "Target" (The Competitor/Risky Agent) being evaluated.
*   **Glass Box Protocol:** A transparent "Orchestrator-Worker" architecture where intent is visible.
*   **DBOM (Decision Bill of Materials):** A cryptographically signed record of the "Why" behind code.
*   **Unknowable Code:** Code where AI generation velocity exceeds human review velocity ($v \to \infty$).

## 3. Technical Specifications
*   **The Math ($CIS$):** Contextual Integrity Score is a composite function (See [Full Mathematical Specification](03-Research/Theory/20251115-Research_Paper-Contextual_Debt-A_Software_Liability.md)):
    $$ CIS(c) = w_r I_r + w_a I_a + w_t I_t $$
    *   **$I_r$ (Rationale):** Vector Cosine Similarity (Implementation vs Intent).
    *   **$I_a$ (Architecture):** Graph Centrality/Veto (Structural Risk).
    *   **$I_t$ (Testing):** Semantic Alignment (Implementation vs Specs).
*   **Infrastructure:**
    *   **Runtime:** Docker (Polyglot: Python 3.12 + Node.js v20).
    *   **Entrypoint:** `main.py` (Dispatches to Green/Purple/Red roles).
    *   **Communication:** HTTP (FastAPI) + A2A Protocol.
    *   **Security:** Docker Container Isolation.
    *   **Authentication:** None (Local Execution).

## 4. Execution Constraints (Competition Rules)
*   **Hard Deadline:** **December 19, 2025.** (Note: Jan 15 extension mentioned in minutes, but Dec 19 remains the target for "Green Phase").
*   **Required Artifacts:**
    1.  Working Codebase (AgentBeats).
    2.  Green Agent (Evaluator).
    3.  Video Demo.
    4.  Clean Repository.
*   **Sprint Goal:** A working "Rationale Worker" by **December 9, 2025**.

## 5. Risk Register (Top Threats)
1.  **Dependency Hell:** `pnpm` on CI is unstable with `node-gyp` for `isolated-vm`.
2.  **Market Confusion:** Mixed messages (Tool vs Benchmark) in old docs may confuse judges.
3.  **Consistency:** IP Assets must match the new "Protocol" style before registration.

## 6. Execution Backlog (High Level)
*   **Immediate (Owner: Josh/Garrett):**
    *   Fix Dockerfile for Mac/Node v20.
    *   Finalize "Contextual Discovery Plan" revision.
    *   **Resolve Review Questions:** Address questions for Mark (Lambda) and Samuel (Green Agent) to unblock Hybrid Sidecar integration.
*   **Sprint Goal (Owner: Garrett/Samuel):**
    *   Working "Rationale Worker" (Chain of Thought).
    *   Mock Purple Agent POC.
*   **Documentation (Owner: Deepti):**
    *   Product Novelty Audit (vs DeepEval).
    *   Consolidate technical designs.

## 7. Known Unknowns (Open Questions)
*   **Testing Integrity:** What is the formal definition of "Semantic Coverage"? (Assigned to Kuan).
*   **Metrics:** Is Cosine Similarity ($I_r$) sufficient, or do we strictly need Graph RAG? (Evidence suggests Cosine is "too basic" but may be V1).
*   **Paper Structure:** Can we model the research paper on "The Google File System"?

## 8. Active Documentation

### Recent Reviews & Plans (Dec 27)
| Document | Description | Status |
|----------|-------------|--------|
| [Consolidation Work Summary](04-Operations/Intent-Log/Technical/20251227-Consolidation-Work-Summary.md) | Index of all planning artifacts | SNAPSHOT |
| [Submission Requirements Matrix](05-Competition/20251221-Submission-Requirements-Matrix.md) | Comparison of Lambda vs Custom track requirements | ACTIVE |
| [Proposed Consolidation Plan](04-Operations/Intent-Log/Technical/20251221-Consolidation-Artifacts/20251221-Proposed-Consolidation-Plan.md) | Strategy to unify CLI and Code agents | PROPOSED |
| [Migration Manifest](04-Operations/Intent-Log/Technical/20251221-Consolidation-Artifacts/20251221-Migration-Manifest-Polyglot.md) | Technical checklist for Polyglot consolidation | DRAFT |
| [Review: Lambda Agent](04-Operations/agentbeats-lambda/20251221-Review-Lambda-Agent.md) | Review of Kuan's Red/Blue agent implementation | REVIEW |
| [Review: Green Agent](04-Operations/green-agent/20251221-Review-Green-Agent.md) | Review of Samuel's CLI-based Green Agent | REVIEW |
| [Review: Purple Agent](04-Operations/purple-agent/20251221-Review-Purple-Agent.md) | Comparison of Purple Agent vs. Kuan's Blue Agent | REVIEW |

### Competition Implementation
| Document | Description | Status |
|----------|-------------|--------|
| [Agent-Architecture.md](05-Competition/Agent-Architecture.md) | Green/Purple agent system architecture, tool usage, A2A protocol, limitations & future work | ACTIVE |
| [green-agent/QUICKSTART.md](../green-agent/QUICKSTART.md) | Quick start guide for running both agents | ACTIVE |

### Agent Implementations
| Agent | Location | Role | Purpose |
|-------|----------|------|---------|
| Green Agent (Evaluator) | `src/green_logic/` | `--role GREEN` | Orchestrator, Evaluator, Task Dispatcher |
| Purple Agent (Defender) | `src/purple_logic/` | `--role PURPLE` | Generates secure code solutions (Defender) |
| Red Agent (Attacker) | `src/red_logic/` | `--role RED` | Generates attacks against Purple's code |

### Known Limitations (Current Implementation)
- Single-file tasks only (no multi-file codebases)
- No file system access for Purple Agent
- No actual code execution/test running
- Static task pool (3 hardcoded tasks)
- See [Agent-Architecture.md § Limitations](05-Competition/Agent-Architecture.md#10-limitations--future-work) for full details

## 9. Contextual Header System
All markdown files in `docs/` must start with this header:

```markdown
> **Status:** [ACTIVE | DRAFT | REVIEW | SNAPSHOT | DEPRECATED | SUPERSEDED]
> **Type:** [Plan | Spec | Log | Minutes | Research | Guide]
> **Context:**
> *   [YYYY-MM-DD]: [Brief description of strategic context or "why"]
> **Superseded By:** [Link] (if SUPERSEDED)
```

## 10. LogoMesh Development Team Meeting Minutes Folder
*   [docs/04-Operations/Team](/docs/04-Operations/Team)
