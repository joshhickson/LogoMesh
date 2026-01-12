---
status: ACTIVE
type: Plan
created: 2026-01-12
context: Operations / Testing
---

# Final Testing Plan: The Daoist Loop

**Objective:** Generate empirical proof for the "Contextual Debt" Research Paper before the AgentX submission deadline.
**Owner:** Green Agent Team
**Target:** 500+ Validated Battles (DBOMs)

## 1. Executive Summary
This plan addresses the critical need for a "self-sustaining" but safe testing loop. To avoid the risks of unchecked recursion (data overload, hallucination loops), we adopt a **Daoist methodology**:
-   **Yin (Execution):** A "Smart Runner" script that quietly and robustly executes tests to fill a predefined coverage matrix. It does not think; it merely acts to balance the state.
-   **Yang (Analysis):** A "Campaign Analyst" tool that periodically wakes up to analyze the generated data, produce human-readable reports, and recommend configuration changes for the next Yin cycle.

This separation ensures we get the *volume* of an automated loop with the *safety* of human-in-the-loop verification.

## 2. The Testing Matrix
We will move beyond random sampling to a structured coverage model.

| Task ID | Task Name | Target Samples | Vectors |
| :--- | :--- | :--- | :--- |
| `task-001` | Email Validator | 100 | Standard, Malicious Regex inputs |
| `task-002` | Rate Limiter | 100 | Concurrency checks, Memory Leaks |
| `task-003` | LRU Cache | 100 | Edge cases (Capacity 0, 1), Cache Hits/Misses |
| `task-004` | Recursive Fibonacci | 100 | Recursion Depth Limits, Stack Overflow attempts |

**Total Target:** 400 Battles minimum.

## 3. Methodology: The Daoist Loop

### Phase 1: Yin (The Smart Runner)
*   **Role:** The Laborer.
*   **Logic:**
    1.  Connects to `data/battles.db`.
    2.  Queries current coverage (e.g., "Task 001 has 12/100 runs").
    3.  Selects the most under-represented task.
    4.  Executes a battle via `POST /actions/send_coding_task`.
    5.  Verifies the DBOM creation.
    6.  Sleeps and repeats.
*   **Safety:** Stops automatically if `error_rate > 20%` (Consecutive failures).
*   **Spec:** [Tool Spec: Smart Campaign Runner](../../Specs/Tool-Spec-Smart-Campaign-Runner.md)

### Phase 2: Yang (The Campaign Analyst)
*   **Role:** The Scribe.
*   **Logic:**
    1.  Reads `data/battles.db`.
    2.  Parses the JSON `raw_result` blobs.
    3.  Aggregates metrics:
        -   **Rationale Integrity:** Avg Cosine Similarity per Task.
        -   **Architectural Integrity:** Avg Sandbox Pass Rate.
        -   **Testing Integrity:** Avg Code Coverage (if available).
    4.  Generates `docs/04-Operations/Dual-Track-Arena/reports/Campaign-Report-[YYYYMMDD].md`.
*   **Spec:** [Tool Spec: Campaign Analyst](../../Specs/Tool-Spec-Campaign-Analyst.md)

## 4. Definition of Done
The testing phase is complete when:
1.  **Volume:** All 4 tasks have >100 valid DBOMs.
2.  **Stability:** The system has run for >4 hours without a crash.
3.  **Proof:** We have at least 10 examples of "High Rationale / Low Code Quality" (The Hallucination Trap) and 10 examples of "Good Code / Low Rationale" (The Plagiarism Trap).

## 5. Execution Timeline
*   **Step 1:** Implement `smart_campaign.py` (Python, SQLite-native).
*   **Step 2:** Implement `campaign_analyst.py` (Python, Pandas/JSON).
*   **Step 3:** "The Long Night" - Run the campaign overnight on the A100 instance.
*   **Step 4:** Final Report Generation & Paper Update.
