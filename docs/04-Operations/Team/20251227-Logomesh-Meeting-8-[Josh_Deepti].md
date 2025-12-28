> **Status:** SNAPSHOT
> **Type:** Meeting Minutes
> **Context:**
> *   [2025-12-27]: Sync on code consolidation, model selection, and competition strategy for AgentBeats.

# Meeting Minutes: AgentBeats Project Sync

**Date:** December 27, 2025
**Attendees:** Josh, Deepti
**Absent:** Mark, Samuel, Aladdin (Alaa)
**Subject:** Code Consolidation, Model Selection, and Competition Strategy

## 1. Executive Summary

The team is consolidating distinct agent codebases (Samuel's Green/Purple agents and Mark's Red/Blue agents) to satisfy requirements for the **Berkeley AgentBeats Competition**. The strategy involves a **dual-track submission**:

1.  **Lambda Track (Safety):** Submitting a Red Agent (Attacker) and Blue/Purple Agent (Defender).
2.  **Custom Track:** Submitting a Green Agent (Evaluator) with a Mock Purple Agent.

A key strategic decision is the **"Iron Sharpens Iron"** approach: utilizing the Red Agent to stress-test the Purple Agent, thereby validating the Green Agent's evaluation capabilities. If the Green Agent approves code that the Red Agent successfully attacks, we identify a "Ground Truth Gap."

## 2. Competition Context & Constraints

*   **Competition:** AgentX - AgentBeats (Green Agent due Jan 15, 2026; Purple Agent due Feb 22, 2026).
*   **Hardware Constraint:** Models must run on a single **NVIDIA H100 GPU (80GB VRAM)**.
    *   *implication:* Proprietary APIs (OpenAI/Anthropic) are likely disallowed for the core agent loop unless explicitly permitted. We must rely on open-weights models (e.g., Llama 3.1 70B, Qwen).
*   **Scoring:** "Presentation" is a significant scoring factor, motivating a shift from Terminal CLI to a Web UI.

## 3. Discussion Points

### A. Agent Architecture & Consolidation ("The Polyglot")

*   **Current State:**
    *   **Green Agent (Evaluator):** Currently uses ChatGPT API (Samuel's implementation). Needs refactoring to use a local model.
    *   **Purple Agent (Target/Defender):** Being created by consolidating Samuel's Purple Agent and Mark's Blue Agent.
    *   **Red Agent (Attacker):** Developed by Mark; used to attack the Purple Agent.
*   **Migration Plan:** Josh is centralizing code into a **Polyglot** structure:
    *   **Backend:** Dockerized Python environment for the Agents (Red/Blue/Green).
    *   **Frontend/Sidecar:** Node.js Web UI to replace the terminal prompt.

### B. Model Selection & Intelligence

*   **Llama Concerns:** Deepti raised concerns about **Llama-3-70B's** performance, citing benchmarks where it was "nowhere near the top" and describing it as a potential "failure" compared to other options.
*   **Hardware Reality:** Josh clarified the 80GB VRAM limit. A 70B model (approx. 40GB quantized) fits, but we must verify if it provides sufficient intelligence.
*   **AWS Kira:** It was noted that Mark is currently using **AWS Kira**, a terminal-based coding agent, on the Lambda instance. We need to investigate if this is a dependency we can carry forward or if we must switch.
*   **Alaa's Warning ("Playing with Fire"):** Alaa (Aladdin) previously warned that using a simple "LLM-as-a-Judge" is risky due to the "Ground Truth Gap." We need to go deeper than vibe-checking, potentially integrating **CI-Bench** datasets to calibrate the evaluator (as detailed in the Consolidation Summary).

### C. UI/UX Strategy

*   **Decision:** Shift from Terminal CLI to a **Node.js Web UI**.
*   **Rationale:** Presentation accounts for ~50% of the potential score. A graphical interface is critical for ranking higher than teams submitting raw terminal logs.

## 4. Action Items

| Owner | Task | Deadline |
| :--- | :--- | :--- |
| **Josh** | Consolidate Samuel’s and Mark’s code into the new Polyglot container structure. | Next Meeting |
| **Josh** | Verify H100 constraints (80GB VRAM) and confirm if Llama 3.1 70B is viable vs. other open models. | ASAP |
| **Josh** | Connect with Mark to clarify his use of **AWS Kira** and his work on the Lambda instance. | ASAP |
| **Deepti** | Meet with Mark and Samuel to review their implementations and the consolidation plan. | Before Next Meeting |
| **Deepti** | Update the Miro board architecture diagram to reflect the new 4-Agent structure (Green, Purple, Red, Blue). | Next Meeting |
| **Josh** | Schedule combined team meeting with Mark, Samuel, and Aladdin. | After Jan 1, 2026 |

## 5. References

*   **Consolidation Summary:** [20251227-Consolidation-Work-Summary.md](../Intent-Log/Technical/20251227-Consolidation-Work-Summary.md)
*   **Proposed Polyglot Plan:** [20251221-Proposed-Consolidation-Plan.md](../Intent-Log/Technical/20251221-Consolidation-Artifacts/20251221-Proposed-Consolidation-Plan.md)
