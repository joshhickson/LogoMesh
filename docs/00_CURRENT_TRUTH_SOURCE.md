> **Status:** ACTIVE
> **Type:** System of Record
> **Context:** Single Source of Truth (Post-Gap Analysis)
> **Last Updated:** 2025-12-03

# Current Truth Source

## 1. Strategic Pillars
*   **The Mission:** We are building **AgentBeats**, an open-source **benchmark** for the AgentX competition.
*   **The Pivot:** We have explicitly rejected the "Commercial SaaS" (LogoMesh as a product) strategy in favor of a "Public Good" research instrument.
*   **The Core Innovation:** **Contextual Integrity**, a measurable protocol for "Agent Safety" and "Cybersecurity".

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
*   **The Math ($CIS$):** Contextual Integrity Score is a composite function:
    $$ CIS(c) = w_r I_r + w_a I_a + w_t I_t $$
    *   **$I_r$ (Rationale):** Vector Cosine Similarity (Implementation vs Intent).
    *   **$I_a$ (Architecture):** Graph Centrality/Veto (Structural Risk).
    *   **$I_t$ (Testing):** Semantic Alignment (Implementation vs Specs).
*   **Infrastructure:**
    *   **Runtime:** Docker (Required).
    *   **Language:** Node.js v20/v22 (Downgraded from v24 for Mac/Docker compatibility).
    *   **Communication:** Redis Message Queue (Mission Control Protocol).
    *   **Security:** `isolated-vm` for sandboxing.
    *   **Authentication:** **None.** Auth0 is DEAD. Use `jose` library only for DBOM signing.

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

## 8. Contextual Header System
All markdown files in `docs/` must start with this header:

```markdown
> **Status:** [ACTIVE | DRAFT | REVIEW | SNAPSHOT | DEPRECATED | SUPERSEDED]
> **Type:** [Plan | Spec | Log | Minutes | Research | Guide]
> **Context:**
> *   [YYYY-MM-DD]: [Brief description of strategic context or "why"]
> **Superseded By:** [Link] (if SUPERSEDED)
```
