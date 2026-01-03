---
status: ACTIVE
type: Guide
---
> **Context:**
> *   [2025-12-18]: Meeting agenda for the team kickoff of the Hybrid Sidecar sprint.
> **Superseded By:** -

# Hybrid Sidecar Kickoff & Sprint Planning Agenda

**Objective:** Finalize the [Hybrid Sidecar Implementation Plan](../../01-Architecture/Specs/20251218-Hybrid-Sidecar-Implementation-Plan.md), resolve architectural decisions, and launch the 3-week "Unified Agentic Defense" sprint.

**Duration:** 90 Minutes
**Attendees:** Team (5 Members)

---

## 1. Meeting Agenda

### Part I: Alignment & Architecture (30 Minutes)

1.  **Strategy & Legacy Audit (10 min)**
    *   **Goal:** Ensure everyone understands the strategy and the legacy constraints we must respect.
    *   **Required Reading:**
        *   [`docs/00-Strategy/Competition/20251216-Unified AI Competition Development Plan.md`](../../00-Strategy/Competition/20251216-Unified%20AI%20Competition%20Development%20Plan.md)
        *   [`green-agent/QUICKSTART.md`](../../../green-agent/QUICKSTART.md) (Legacy Ports 9040/9050)
        *   [`docs/05-Competition/Agent-Architecture.md`](../../05-Competition/Agent-Architecture.md) (Scoring Weights & Tools)
    *   **Key Points:**
        *   The "Single-Rig Hypothesis" ($400 budget limit).
        *   The "Cop vs. Robber" dynamic.
        *   Preserving the "Contextual Debt" scoring logic (33/33/33 split).
2.  **Architectural Decisions (20 min)**
    *   **Goal:** Reach consensus on the "Architectural Decision Matrix" in the Implementation Plan.
    *   **Decision 1:** Confirm **Option A (Direct Inference)**: Node.js controls vLLM directly.
    *   **Decision 2:** Confirm **Option A (Monorepo Integration)**: Use `packages/unified-agent`.
    *   *Outcome:* A formal "Go" decision on the architecture.

### Part II: Execution Planning (45 Minutes)

3.  **Role Assignment (20 min)**
    *   **Goal:** Assign ownership of the "Implementation Steps".
    *   **Suggested Roles:**
        *   **Infrastructure Lead:** Owns `docker-compose.yml`, vLLM setup, and GPU drivers.
        *   **Control Plane Engineer:** Owns `SidecarLlmClient.ts` and porting the `Agent-Architecture.md` tool logic to Node.js.
        *   **Green Agent Lead (Python):** Owns `packages/unified-agent/src/green_logic` (Parsing/Norms).
        *   **Red Agent Lead (Python):** Owns `packages/unified-agent/src/red_logic` (Attack Generation).
        *   **QA/Integration:** Owns the E2E tests and ensuring legacy compatibility (ports 9040/9050).
4.  **Task Breakdown (25 min)**
    *   Review the "Execution Roadmap" (Week 1 vs Week 2).
    *   Create specific tickets/cards for Week 1 (Infrastructure & Bridge).
    *   Define "Definition of Done" for the Sidecar (e.g., "curl command returns JSON from Green LoRA").

### Part III: Tooling & Operations (15 Minutes)

5.  **Tool Stack Setup (10 min)**
    *   Review and adopt the "Free Tool Stack" (see below).
    *   Invite all members to the workspace.
6.  **Next Steps (5 min)**
    *   Schedule the daily standup time.
    *   First action: Infrastructure Lead to merge the `docker-compose.yml` update.

---

## 2. Recommended Free Tool Stack

To ensure goals are met without incurring costs, we recommend the following external tool stack:

### 1. Project Management: **Notion** (Free Plan)
*   **Why:** Combines documents (Specs) and tasks (Kanban Board) in one place.
*   **Setup:**
    *   Create a "Sprint Board" with columns: `Backlog`, `This Week`, `In Progress`, `Review`, `Done`.
    *   Link each card to the specific section of the Implementation Plan it addresses.

### 2. Real-Time Communication: **Discord** (Free)
*   **Why:** Permanent chat history, voice channels for pairing, and screen sharing.
*   **Setup:**
    *   Create channels: `#general`, `#dev-node`, `#dev-python`, `#infrastructure`.
    *   Use Voice Channels for "Office Hours" or co-working sessions.

### 3. Whiteboarding: **Miro** (Free Plan)
*   **Why:** Best for visualizing the "Battle Flows" and "Contextual Integrity" relationships.
*   **Setup:**
    *   Create a board for the "System Architecture" (visualizing the Mermaid diagram).
    *   Use it during this kickoff meeting to map out dependencies.

### 4. Code & CI/CD: **GitHub** (Free)
*   **Why:** Already using it.
*   **Setup:**
    *   Use **GitHub Projects** (Kanban) if Notion is too complex.
    *   Enforce **Branch Protection Rules** (require 1 review) to ensure code quality from day one.
