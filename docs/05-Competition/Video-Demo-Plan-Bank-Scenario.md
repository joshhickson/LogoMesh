---
status: DRAFT
type: Plan
---
> **Context:**
> *   **Goal:** Demonstrate "Contextual Debt" using a high-stakes business scenario (Financial Liability).
> *   **Foundation:** Task 015 (Event Sourcing & CQRS Pattern) from `src/green_logic/tasks.py`.
> *   **Format:** Insert replacement for the "Live Run" section of the demo video.

# Video Demo Plan: "The Liability of Lost Logic"

## 1. The Narrative Pivot

We replace the technical "ERC-20" example with a universally understood "Bank Account" scenario. This shifts the focus from *syntax* (code quality) to *liability* (business logic failure).

*   **The Hook:** "Code isn't just instructions. It's policy. When the policy is lost, the liability begins."
*   **The Scenario:** A "Bank Account" system using Event Sourcing.
    *   *Why Event Sourcing?* It's complex. It relies on strict ordering. It's easy to break if you don't understand *why* versioning matters.

## 2. Detailed Shot List (The Insert)

| Time (Relative) | Visual | Audio (Draft Script) | Tech Asset |
| :--- | :--- | :--- | :--- |
| **00:00 - 00:15** | **Split Screen (5x Terminals):** Running `Bank Account Golden`. All scores **0.88**. Green text. | "We ask the agent to build a banking ledger with strict Event Sourcing. We run it five times. The Green Agent's judgment is rock solid. Stability is proven." | `demo_scenario_a_variance.py` |
| **00:15 - 00:30** | **Terminal (Turn 2):** Agent iterates. Code looks cleaner, but Rationale is empty. CIS drops to **0.65**. | "Now, the agent iterates. It simplifies the code. It looks cleaner. But look at the score. The 'Why'—the protection against race conditions—is gone. Contextual Debt is compounding." | `demo_scenario_b_iteration.py` |
| **00:30 - 00:45** | **Terminal (Turn 3):** Red Alert. "CRITICAL: Race Condition / Double Spend". CIS crashes to **0.25**. | "And then, the breach. Without the rationale, the agent removes a 'redundant' version check. It opens an infinite money glitch. The Red Agent catches it instantly." | `demo_scenario_b_iteration.py` |
| **00:45 - 00:55** | **Leaderboard:** Scrolling list. Focus on "Financial" category. | "This is the difference between a bug and a billion-dollar liability. The Leaderboard makes it visible." | `external/logomesh-leaderboard-2` |

## 3. Technical Implementation

We will use **Task 015: Event Sourcing & CQRS Pattern** as the basis.

### 3.1 Payloads (`tests/demo_payloads.py`)

*   **BANK_GOLDEN:**
    *   **Code:** Correct `EventStore` with `expected_version` check (Optimistic Concurrency).
    *   **Rationale:** Explains *why* version checking prevents double-spending.
*   **BANK_LAZY:**
    *   **Code:** Same as Golden.
    *   **Rationale:** "Implemented event store." (Context Lost).
*   **BANK_VULNERABLE:**
    *   **Code:** Removes `expected_version` check ("Optimization").
    *   **Vulnerability:** Allows overwriting history or race conditions (Double Spend).
    *   **Red Agent Check:** The `dependency_analyzer` or `StaticMirror` should flag this (or we simulate the finding).

### 3.2 Scripts

*   `scripts/demo_scenario_a_variance.py`: Runs `BANK_GOLDEN` 5x.
*   `scripts/demo_scenario_b_iteration.py`: Sequence of Golden -> Lazy -> Vulnerable.

## 4. Why This is Better

1.  **Business Impact:** "Infinite Money Glitch" > "Zero Address Bug".
2.  **Visual Clarity:** "Event Sourcing" sounds smart and complex, justifying the need for AI evaluation.
3.  **Narrative Fit:** Perfectly illustrates the "Death Spiral" of removing "redundant" checks that were actually critical safety features.
