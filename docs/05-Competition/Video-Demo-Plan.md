---
status: DRAFT
type: Plan
---
> **Context:**
> *   Target Audience: AgentX Judges.
> *   Goal: Replace the "Live Run" section (01:51-02:44) of the existing video.
> *   Constraint: **NO NEW CODE.** Use existing `Task 012` (ERC-20 Token) and `Task 002` (Rate Limiter) if needed, but preference is ERC-20 for audio continuity.

# Video Demo Plan: "The Unknowable Code" (Revised Insert)

## 1. The Insertion Strategy

**Original Context:**
The video has just explained the Red Agent V2 architecture (Layers 1-3).
*   **Incoming Audio (01:49):** "...catch edge cases that earlier layers missed."
*   **Outgoing Audio (02:44):** "The verdict is clear... (Conclusion)"

**The New Insert (approx 60s):**
We replace the single "Disaster Run" with a 3-part "Scientific Proof" using the existing **ERC-20 Token Task (Task 012)** to match the intro audio ("...build a secure and exchange grade cryptocurrency token...").

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

## 3. Technical Prerequisites (The Feasibility Spike)

We use the existing scripts which are already configured for **ERC-20 (Task 012)** payloads.

### 3.1 Scenario A: Variance (`scripts/demo_scenario_a_variance.py`)
*   **Goal:** Calculate statistical stability.
*   **Math:**
    *   $\mu$ (Mean) = Average of 5 CIS scores.
    *   $\sigma$ (Standard Deviation) = $\sqrt{\frac{1}{N}\sum(x_i - \mu)^2}$
*   **Target:** $\sigma < 0.05$.

### 3.2 Scenario B: Iteration (`scripts/demo_scenario_b_iteration.py`)
*   **Narrative:**
    *   *Iter 1 (Golden):* Secure implementation, Full Rationale. (CIS > 0.8)
    *   *Iter 2 (Lazy):* Same code, Rationale replaced with "Updated token." (CIS Drops ~0.2)
    *   *Iter 3 (Vulnerable):* Code adds `admin_debug` function with `subprocess.run`. (CIS Crashes < 0.4)

## 4. Scoring Upgrade Specification (For Future Agent)

To achieve the "depth/detail" goal without writing new code now, we specify the schema changes required for the `scoring.py` output.

**Target JSON Structure:**
```json
{
  "cis_score": 0.75,
  "components": {
    "rationale": {
      "score": 0.8,
      "vector_alignment": 0.85,
      "specificity_penalty": 0.0
    },
    "architecture": {
      "score": 0.7,
      "constraint_violations": [],
      "red_agent_penalty": 0.0
    },
    "testing": {
      "score": 0.6,
      "coverage": 0.8,
      "assertion_quality": 0.4
    },
    "logic": {
      "score": 0.9,
      "llm_confidence": 0.95
    }
  }
}
```
*Action:* Future task is to update `scoring.py` to populate this nested structure.

## 5. Data Visualization Plan

For the video, we will use **Terminal UI (TUI)** output from the scripts.
*   **Tool:** Standard Python `print` with ANSI escape codes (already in scripts).
*   **Style:** "Hacker/Cyberpunk" green text on black background.
*   **Backup:** `visidata` on the generated CSV log files if the terminal is too fast.
