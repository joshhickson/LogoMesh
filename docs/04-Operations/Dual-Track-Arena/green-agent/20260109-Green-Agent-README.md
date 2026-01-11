---
status: ACTIVE
type: Documentation
created: 2026-01-09
supersedes: README.md
context: Green Agent Documentation
---

# Green Agent (The Judge)

## Role
The Green Agent is the **Orchestrator** and **Evaluator** for the AgentBeats competition.
*   **Track:** Custom Track (Creating a New Benchmark).
*   **Function:** It sends coding/security tasks to the Purple Agent, optionally sends the solution to the Red Agent for attacking, and then calculates the **Contextual Integrity Score (CIS)**.

## Architecture & Specifications (Updated 2026-01-09)
The Green Agent has been upgraded with three core subsystems to support the research paper's claims:

1.  **[CIS Vector Math](20260109-CIS-Vector-Math-Spec.md):**
    *   Uses `sentence-transformers` (Cosine Similarity) to mathematically measure the alignment between Intent, Rationale, and Code.
    *   Moves beyond "vibes" to quantifiable vectors.

2.  **[Decision Bill of Materials (DBOM)](20260109-DBOM-Specification.md):**
    *   Generates a cryptographic proof (`h_delta`, `v_intent`) for every evaluation.
    *   Ensures traceability and immutability of the benchmark scores.

3.  **[Persistence Layer](20260109-Persistence-Architecture.md):**
    *   Uses SQLite with **Write-Ahead Logging (WAL)** for crash-proof data storage.
    *   Decouples cryptographic artifacts (JSON files) from relational data (SQL).

4.  **Runtime Sandbox (New):**
    *   **Isolation:** Docker-based execution using `python:3.12-slim`.
    *   **Mechanism:** Uses **File Injection** (tarball via `put_archive`) instead of volume mounts to ensure stability in Cloud/Docker-in-Docker environments.
    *   **Constraint:** Adds ~2-3 minutes overhead per run due to container initialization.

## Usage
### Requirements
*   **OS:** Ubuntu (Optimized for Lambda Cloud/Debian environments).

### Running the Agent
See the **[Evaluation Tasklist](20260109-Evaluation-Tasklist.md)** for detailed steps on verifying the system in a production/docker environment.

### API Endpoints
*   `POST /actions/send_coding_task`: Main entry point. Supports random tasks or **Multi-File Injection** (New).
*   `POST /actions/report_result`: Legacy endpoint for manual reporting.

## Implementation Status
| Feature | Status | Notes |
| :--- | :--- | :--- |
| **A2A Protocol** | ✅ Live | JSON-RPC over HTTP. |
| **Vector Math** | ✅ Live | `all-MiniLM-L6-v2` model integrated. |
| **DBOM Generator** | ✅ Live | SHA256 Hashing & JSON persistence. |
| **Multi-File Support**| ✅ Live | Input contract defined in `server.py`. |
| **Runtime Sandbox** | ✅ Live | Docker + File Injection. |

## Source Code Map
*   `src/green_logic/server.py`: FastAPI Entrypoint (Port 9000).
*   `src/green_logic/agent.py`: Orchestrator & DBOM Generator.
*   `src/green_logic/scoring.py`: CIS Logic (LLM + Vectors).
*   `src/green_logic/compare_vectors.py`: Vector Math Implementation.
