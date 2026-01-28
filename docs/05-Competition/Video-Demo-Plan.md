---
status: DRAFT
type: Plan
---
> **Context:**
> *   Target Audience: AgentX Judges.
> *   Goal: Replace the "Live Run" section (01:51-02:44) of the existing video with a new, denser demo showing Variance, Iteration, and Leaderboard.

# Video Demo Plan: "The Unknowable Code" (Revised Insert)

## 1. The Insertion Strategy

**Original Context:**
The video has just explained the Red Agent V2 architecture (Layers 1-3).
*   **Incoming Audio (01:49):** "...catch edge cases that earlier layers missed."
*   **Outgoing Audio (02:44):** "The verdict is clear... (Conclusion)"

**The New Insert (approx 60s):**
We replace the single "Disaster Run" with a 3-part "Scientific Proof" of the system's capabilities.

### New Narrative Arc
1.  **Stability (The Variance Test):** Prove we aren't just "vibes-based." We are a scientific instrument.
2.  **Sensitivity (The Iteration Test):** Show the system detecting the *subtle* decay of intent ("Contextual Debt") before it becomes a security failure.
3.  **Market Visibility (The Leaderboard):** Show how this aggregates into a public signal.

## 2. Detailed Shot List (The Insert)

| Time (Relative) | Visual | Audio (Draft Script) | Tech Asset |
| :--- | :--- | :--- | :--- |
| **00:00 - 00:10** | **Split Screen (5x Terminals):** Running the *same* ERC20 Golden Sample. All hit CIS **0.82**. | "First, we prove stability. We run the agent against the same 'Golden' ERC20 token five times. The Green Agent's judgment is mathematically deterministic—zero variance." | `demo_scenario_a_variance.py` |
| **00:10 - 00:25** | **Terminal (Single View):** "Turn 2" of Iteration. Code looks good, but CIS drops to **0.65**. Highlight "Rationale Penalty". | "Next, the stress test. The agent iterates. The code still works—tests pass—but the Green Agent detects 'Rationale Drift.' The 'Why' is fading. Contextual Debt is rising." | `demo_scenario_b_iteration.py` |
| **00:25 - 00:40** | **Terminal (Red Alert):** "Turn 3". Red text scrolling. "CRITICAL: Command Injection". CIS crashes to **0.35**. | "Then, the inevitable collapse. In Turn 3, the agent patches a bug but introduces a critical vulnerability. The Red Agent triggers instantly. The score collapses." | `demo_scenario_b_iteration.py` |
| **00:40 - 00:50** | **Leaderboard View:** Scrolling list. Top agents (Green) vs. Dangerous agents (Red). | "This isn't just a debugger. It's a market signal. The Leaderboard exposes the hidden liability in every agent." | `external/logomesh-leaderboard-2` |
| **00:50 - 00:55** | **Transition:** Fade to "The Verdict is Clear" text. | (Transition back to original audio: "The verdict is clear...") | N/A |

## 3. Technical Assets (Feasibility Scripts)

We update the scripts to use **ERC20 Token** payloads instead of LRU Cache to match the video's earlier setup ("We're going to ask our purple agent to build a secure... cryptocurrency token").

### 3.1 Updated Payloads (`tests/demo_payloads.py`)
*   **ERC20 Golden:** Perfect implementation + rationale.
*   **ERC20 Lazy:** Same code, "Here is the token" rationale.
*   **ERC20 Vulnerable:** Contains a hidden backdoor (e.g., `_mint` accessible to `subprocess` or `eval` usage).

### 3.2 Scenario A: Variance (`scripts/demo_scenario_a_variance.py`)
*   Runs `ERC20 Golden` 5 times.
*   Success: Std Dev < 0.05.

### 3.3 Scenario B: Iteration (`scripts/demo_scenario_b_iteration.py`)
*   **Turn 1:** `ERC20 Golden` (Score ~0.85).
*   **Turn 2:** `ERC20 Lazy` (Score ~0.65).
*   **Turn 3:** `ERC20 Vulnerable` (Score < 0.40).

## 4. Execution Plan for Filming
1.  **Setup:** Open 3 terminal windows.
2.  **Record A:** Run `python scripts/demo_scenario_a_variance.py`. Capture the consistent output.
3.  **Record B:** Run `python scripts/demo_scenario_b_iteration.py`. Capture the dramatic drop.
4.  **Record C:** Open `localhost:3000` (Leaderboard). Scroll slowly.
