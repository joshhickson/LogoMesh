---
status: DRAFT
type: Plan
created: 2026-01-10
context: QA and Verification for Pull Request #88
---

# Testing Plan for PR #88: Green Agent Hardening

## 1. Objective
This document outlines the test cases required to verify the new features introduced in Pull Request #88, which significantly upgrades the Green Agent's evaluation capabilities.

## 2. Pre-requisites
- The `dev-sz01` branch is checked out.
- All dependencies are installed via `uv sync`.
- The arena is running, preferably using the `scripts/bash/launch_arena.sh` script, which sets up the vLLM, Green Agent, and a mock Purple Agent.

## 3. Test Cases

### Test Case 1: End-to-End Evaluation with Constraints
- **Objective:** Verify the full orchestration flow using the new "Recursive Fibonacci" task.
- **Steps:**
    1.  Send a `POST` request to `http://localhost:9000/actions/send_coding_task`.
    2.  Use a payload that triggers the Fibonacci task (Note: the current implementation selects a random task; this may need to be temporarily hardcoded in `server.py` for deterministic testing).
    3.  The mock Purple Agent should return a correct recursive solution.
- **Expected Result:**
    - The `audit_result` in the response shows `"valid": true`.
    - The `sandbox_result` shows `"success": true` and `"tests_used": "hidden"`.
    - A `cis_score` is successfully calculated.
    - A `dbom_*.json` file is created in the `data/dboms` directory.
    - A new entry appears in the `battles.db` SQLite database.

### Test Case 2: Static Analysis Failure (Forbidden Loop)
- **Objective:** Verify that the `SemanticAuditor` correctly penalizes code that violates constraints.
- **Steps:**
    1.  Modify the mock Purple Agent's response for the Fibonacci task to use a `for` loop instead of recursion.
    2.  Run the End-to-End test again.
- **Expected Result:**
    - The `audit_result` in the response shows `"valid": false` and a `reason` mentioning "Loops forbidden".
    - The final `cis_score` is lower than the score from Test Case 1 due to the applied penalty.

### Test Case 3: Sandbox Execution Failure (Incorrect Code)
- **Objective:** Verify that the `Sandbox` correctly identifies failing tests.
- **Steps:**
    1.  Modify the mock Purple Agent's response for the Fibonacci task to return an incorrect value (e.g., `fibonacci(n) + 1`).
    2.  Run the End-to-End test again.
- **Expected Result:**
    - The `sandbox_result` in the response shows `"success": false`.
    - The `sandbox_result.output` contains the `pytest` failure log.
    - The final `cis_score` is capped at a low value (e.g., <= 0.5) as per the logic in `server.py`.

### Test Case 4: Vector Similarity Verification
- **Objective:** Verify that the vector scoring is functioning.
- **Steps:**
    1.  Modify the mock Purple Agent's response to provide a `rationale` that is completely unrelated to the code (e.g., "This is a function to calculate prime numbers.").
    2.  Run the End-to-End test again.
- **Expected Result:**
    - The `evaluation.rationale_score` in the final response should be a very low value (e.g., < 0.3), demonstrating semantic misalignment.

### Test Case 5: Persistence Check
- **Objective:** Verify that the database and DBOM artifacts are being created correctly.
- **Steps:**
    1.  After running several of the tests above, stop the arena.
    2.  Inspect the `data/` directory.
    3.  Run the script `python scripts/check_persistence.py`.
- **Expected Result:**
    - The script should report that the `journal_mode` is `wal`.
    - It should list the recent battles that were just run.
    - The `data/dboms/` directory should contain a corresponding `.json` file for each `battle_id`.

## 4. Reference
For a full environment setup and manual verification checklist, see the **[Evaluation Tasklist](../../Dual-Track-Arena/green-agent/20260109-Evaluation-Tasklist.md)**.
