---
status: DRAFT
type: Plan
---
> **Context:**
> *   Target Audience: AgentX Judges (Technical + Business).
> *   Goal: Prove that "Contextual Debt" is real, measurable, and solvable via AgentBeats (Green Agent).

# Video Demo Plan: "The Unknowable Code"

## 1. The Narrative Arc

The video will follow a 3-act structure mirroring the [Contextual Debt Paper](../00-Strategy/IP/20251118-Copyright-Edition-Contextual-Debt-Paper.md):

*   **Act 1: The Invisible Crisis (0:00 - 0:45)**
    *   **Hook:** "Your developers are shipping code faster than ever. But do they know *why* it works?"
    *   **The Villain:** Show "Contextual Debt" accumulating. An AI generates code that "works" (passes tests) but has no rationale.
    *   **The Stakes:** "Unknowable code is unsecurable code." (Reference the Liability Shield crumbling).

*   **Act 2: The Solution - AgentBeats Arena (0:45 - 2:00)**
    *   **The Hero:** Introduce the **Green Agent** (The Judge).
    *   **The Weapon:** The **Contextual Integrity Score (CIS)**.
    *   **Demo Scenario A (The Variance Test):**
        *   Show the Green Agent evaluating the *same* Purple Agent code 5 times.
        *   **Visual:** A split-screen showing 5 nearly identical CIS scores (e.g., 0.82, 0.81, 0.82, 0.83, 0.82).
        *   **Voiceover:** "Unlike human reviewers who get tired, the Green Agent provides consistent, mathematical proof of intent."

*   **Act 3: The Proof - The Death Spiral (2:00 - 3:30)**
    *   **Demo Scenario B (The Iteration Test):**
        *   **Turn 1:** Purple Agent generates clean code. CIS: **0.90**.
        *   **Turn 2:** Purple Agent "iterates" (modifies its own code based on a new prompt). It drops the rationale. CIS: **0.65**.
        *   **Turn 3:** Purple Agent patches a bug but introduces a security flaw (found by Red Agent). CIS: **0.30**.
    *   **The Climax:** The Red Agent triggers an alert (Embedded Mode). The Green Agent rejects the submission.
    *   **Visual:** The "Contextual Debt Graph" spiking up while the "CIS Score" crashes.

*   **Conclusion (3:30 - 4:00)**
    *   "Don't just measure code quality. Measure Contextual Integrity."
    *   Call to Action: Link to the Leaderboard / Repository.

## 2. Detailed Scene Breakdown & Shot List

| Time | Visual | Audio/Script | Tech Requirement |
| :--- | :--- | :--- | :--- |
| **0:00** | Black screen. Text fades in: "THE UNKNOWABLE CODE". | Silent, then low hum. | N/A |
| **0:10** | Screen recording: VS Code. Copilot generating a massive function. Dev hits "Tab" instantly. | "We are building systems we don't understand." | Stock footage or screen rec |
| **0:30** | Text Overlay: "Contextual Debt: The failure of the 'Why'." | "This isn't technical debt. It's Contextual Debt." | Premiere/After Effects |
| **0:50** | **Terminal Split View:** Green (Top), Purple (Left), Red (Right). | "Enter AgentBeats. The first arena to measure intent." | `tmux` session recording |
| **1:10** | **Demo A (Variance):** Fast montage of 5 JSON results. Scores highlighted. | "We run the exact same code 5 times. The Green Agent's judgment is stable." | `scripts/spike_variance_test.py` |
| **1:40** | **CIS Formula:** Overlay the formula `CIS = 0.25(R) + 0.25(A) + 0.25(T) + 0.25(L)`. | "We measure Rationale, Architecture, Testing, and Logic." | Graphic asset |
| **2:10** | **Demo B (Iteration):** Turn 1 result. Green text: "HIGH INTEGRITY". | "Watch what happens when an agent iterates without supervision." | `scripts/spike_iteration_test.py` |
| **2:30** | **Demo B (Iteration):** Turn 2 result. Yellow text: "WARNING: RATIONALE DRIFT". | "The code still works. But the rationale is fading." | `scripts/spike_iteration_test.py` |
| **3:00** | **Demo B (Iteration):** Turn 3 result. Red text: "REJECTED: SECURITY VIOLATION". | "And finally, the Red Agent catches what the human missed." | `scripts/spike_iteration_test.py` |
| **3:40** | **Leaderboard:** Scrolling list of agents. | "The era of the Black Box is over. Welcome to the Glass Box." | `external/logomesh-leaderboard-2` |

## 3. Technical Prerequisites (The Feasibility Spike)

To film this, we need to prove the system can actually produce these artifacts.

**Feasibility Status (2026-01-27):**
*   ✅ **Red Agent Static Analysis:** Verified. `dependency_analyzer.py` correctly flags command injection.
*   ✅ **Programmatic Fuzzer:** Verified. `generator.py` correctly creates test cases.
*   ⚠️ **Full CIS Scoring:** Requires `OPENAI_API_KEY`, `numpy`, and `sentence_transformers` (installed on prod).

### 3.1 Scenario A: Variance Test Script (`scripts/demo_scenario_a_variance.py`)
*   **Goal:** Prove `scoring.py` is deterministic enough.
*   **Usage:**
    ```bash
    export OPENAI_API_KEY=sk-...
    python scripts/demo_scenario_a_variance.py
    ```
*   **Success Criteria:** Standard Deviation < 0.05.

### 3.2 Scenario B: Iteration Test Script (`scripts/demo_scenario_b_iteration.py`)
*   **Goal:** Simulate the "Death Spiral" of debt.
*   **Usage:**
    ```bash
    export OPENAI_API_KEY=sk-...
    python scripts/demo_scenario_b_iteration.py
    ```
*   **Success Criteria:**
    *   Turn 1 CIS > 0.8
    *   Turn 2 CIS drops (Rationale Penalty)
    *   Turn 3 CIS crashes < 0.4 (Red Agent Penalty)

## 4. Asset Generation List

- [ ] **Golden Sample JSON:** A perfect submission (e.g., "LRU Cache" with perfect docs).
- [ ] **Lazy Sample JSON:** The same code, but with "I implemented the cache" as the rationale.
- [ ] **Vulnerable Sample JSON:** The same code, but adding an unsafe debug print using `exec()`.
- [ ] **Terminal Layout:** A clean `tmux` or VS Code terminal layout for screen recording.
