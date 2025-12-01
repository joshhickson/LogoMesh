# Team Onboarding Meeting Agenda
**Date:** November 20, 2025
**Location:** [Meeting Link]
**Facilitator:** Jules (AI Agent)

## Meeting Goals
1.  Connect as a team and confirm roles.
2.  Align on the high-level Mission ("Cyber-Sentinel") and Vision ("Agent-as-a-Judge").
3.  **Crucial:** Understand the current "Strategic Inflection Point" and the decision to prioritize Research Paper revisions.
4.  Overview of the current codebase state.

---

## Agenda

### 1. Welcome & Introductions (10 min)
*   **Icebreaker:** Name, background, and one thing you're excited to build.
*   **Role Confirmation:** Brief review of the 8 roles outlined in [PROJECT_PLAN.md](PROJECT_PLAN.md) (Section 4).
    *   *Team Lead, Narrative Strategist, Documentation Coord, UX Designer, Auth0 Specialist, Core Logic (Arch), Core Logic (Testing), Agent Engineer.*

### 2. Mission & Vision: The "Cyber-Sentinel" (10 min)
*   **The Problem:** "Contextual Debt"—AI code that works but lacks intent, reasoning, and safety.
*   **The Solution:** A "Green Agent" (Evaluator) for the AgentX competition.
    *   **Narrative:** "Cyber-Sentinel Agent"—focusing on cybersecurity to make the problem high-stakes and concrete.
    *   **Core Philosophy:** "Agent-as-a-Judge"—using AI to evaluate the *process* of other AIs.
*   **Reference:** [PROJECT_PLAN.md](PROJECT_PLAN.md)

### 3. **CRITICAL UPDATE:** The Strategic Pivot (15 min)
*   **The Situation:** We considered two paths: "Build immediately" vs. "Formalize the Science first."
*   **The Decision:** We chose **Option A: Blueprint-First**.
    *   *Why?* Our core metric (Contextual Integrity Score) needs to be a rigorous mathematical formula (vector embeddings/graph theory), not just a rubric.
    *   *Immediate Priority:* We are pausing purely tactical coding to **finalize the Research Paper revisions**. This paper is now our technical spec.
*   **Reference:** [../../02-Engineering/Verification/20251119-Recommendation-Report-Strategic-Path-Forward.md](../../02-Engineering/Verification/20251119-Recommendation-Report-Strategic-Path-Forward.md) (The definitive source of truth).

### 4. Technical Overview & "The Workshop" (10 min)
*   **The Stack:** TypeScript Monorepo (`@logomesh/*`), Node.js v20+, Docker, Redis.
*   **Architecture:** Multi-Agent System (Orchestrator delegating to Workers).
*   **Current Status:**
    *   *Infrastructure:* Solid (Monorepo builds, Docker Compose works).
    *   *Logic:* Prototypes exist, but the "Brain" (Analyzers) is waiting for the mathematical blueprint from the paper.
*   **Getting Started:** Follow the [README.md](README.md) for local setup.

### 5. Open Discussion & Next Steps (15 min)
*   **Q&A:** Open floor for questions about the pivot or the codebase.
*   **Action Items:**
    1.  **Read:** [../../Archive/Unsorted/20251119-Strategic-Master-Log.md](../../Archive/Unsorted/20251119-Strategic-Master-Log.md) (Your map).
    2.  **Read:** [../../02-Engineering/Verification/20251119-Recommendation-Report-Strategic-Path-Forward.md](../../02-Engineering/Verification/20251119-Recommendation-Report-Strategic-Path-Forward.md) (Your orders).
    3.  **Setup:** Clone repo and run `pnpm install` & `pnpm run build`.

---

## Key Links for Reference
*   **Strategic Map:** [../../Archive/Unsorted/20251119-Strategic-Master-Log.md](../../Archive/Unsorted/20251119-Strategic-Master-Log.md)
*   **Current Orders:** [../../02-Engineering/Verification/20251119-Recommendation-Report-Strategic-Path-Forward.md](../../02-Engineering/Verification/20251119-Recommendation-Report-Strategic-Path-Forward.md)
*   **Vision:** [PROJECT_PLAN.md](PROJECT_PLAN.md)
*   **Setup:** [README.md](README.md)
