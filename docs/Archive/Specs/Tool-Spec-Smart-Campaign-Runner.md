---
status: DRAFT
type: Specification
created: 2026-01-12
context: Operations / Tooling
---

# Tool Spec: Smart Campaign Runner (`smart_campaign.py`)

## 1. Purpose
To replace the simple `bash` loop with an intelligent Python script that manages test coverage state using the existing SQLite database.

## 2. Dependencies
- Python 3.10+
- `httpx` (for API requests)
- `sqlite3` (std lib)
- `rich` (for beautiful console output - optional but recommended for monitoring)

## 3. Core Logic

### A. Initialization
- Load `CODING_TASKS` from `src.green_logic.tasks`.
- Connect to `data/battles.db`.
- Check if the `battles` table exists (graceful exit if not).

### B. The Loop
1.  **State Check:**
    - Execute SQL: `SELECT task_title, COUNT(*) FROM battles GROUP BY task_title` (Note: We might need to parse `raw_result` to get task ID if not stored in a dedicated column, or just rely on `battle_id` conventions).
    - *Refinement:* The current `battles` schema does NOT have a `task_id` column. We will need to either:
        -   Parse `raw_result` JSON in the SQL query (slow).
        -   Or simply parse the `raw_result` in Python for the last N records to estimate state.
        -   **Better:** Add a specific "target" map in the script configuration and track the session's progress in memory, assuming the DB is the source of truth for *total* history.

2.  **Target Selection:**
    - Identify which task is furthest from `TARGET_SAMPLES` (Default: 100).
    - If all targets met -> **EXIT** (Success).

3.  **Execution:**
    - Construct payload: `{"battle_id": "auto_gen_X", ...}`.
    - Call Green Agent API (`POST /actions/send_coding_task`).
    - *Critical:* The API currently picks a random task unless we hack it.
    - **Requirement:** We must modify `src/green_logic/server.py` to accept a `task_id` override in the request payload.
    - *Fallback:* If we cannot modify the server, we just run random loops until the buckets fill up. (Daoist acceptance).

4.  **Error Handling:**
    - If API returns 500 or timeout:
        - Log error.
        - Increment `consecutive_errors`.
        - If `consecutive_errors > 5`: **EMERGENCY STOP**.

## 4. Output
- Real-time console dashboard (using `rich`):
  - "Task 1: [||||||....] 60%"
  - "Task 2: [||........] 20%"
  - "Last Result: CIS 0.82 (Pass)"
