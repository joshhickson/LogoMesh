---
status: ACTIVE
type: Spec
created: 2026-01-09
context: Green Agent Operations
---

# Persistence Architecture

## Overview
The Green Agent uses a **hybrid persistence strategy** to ensure data durability and auditability. It combines a relational database for queryable metrics with a flat-file system for cryptographic artifacts.

## Storage Layer: SQLite + WAL
The primary data store is a local SQLite database configured for high durability and concurrency.

*   **Database File:** `data/battles.db`
*   **Journal Mode:** `WAL` (Write-Ahead Logging). This is critical for preventing database corruption during crashes or power failures, ensuring "Crash-Proof" logging.

### Schema: `battles` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | INTEGER PK | Auto-incrementing primary key. |
| `battle_id` | TEXT | Unique session ID. |
| `timestamp` | TEXT | ISO 8601 timestamp. |
| `score` | REAL | The final CIS score. |
| `breakdown` | TEXT | Detailed explanation of the score (from LLM). |
| `raw_result` | TEXT | Full JSON dump of the input/output. |
| `dbom_hash` | TEXT | Foreign key link to the DBOM (`h_delta`). |

## Artifact Layer: DBOMs
Cryptographic proofs are stored as individual JSON files to decouple them from the database logic. This allows the DBOMs to be easily zipped, shared, or verified independently of the application state.

*   **Location:** `data/dboms/`
*   **Format:** `dbom_{battle_id}.json`

## Data Flow
1.  **Evaluation:** The Green Agent calculates scores.
2.  **Artifact Generation:** `generate_dbom()` creates the JSON file in `data/dboms/` and calculates the hash.
3.  **Atomic Write:** `submit_result()` opens a connection to `data/battles.db`, writes the record (including the DBOM hash), and commits.

## Backup & Recovery
*   **Database:** The `battles.db` file is a standard SQLite file and can be backed up by copying. WAL files (`battles.db-wal`) should be included in snapshots if the database is active.
*   **Artifacts:** The `data/dboms/` directory should be backed up regularly.

## Status
*   **Status:** **Implemented**.
*   **Location:** `src/green_logic/agent.py`.
