---
> **Note:**
> This entire directory was used for a temporary point-of-reference for rapid development and testing during Phase 1 of the AgentX AgentBeats competition. Do not trust these files.
---
---
status: ACTIVE
type: Documentation
verified: 2026-01-30
---
> **Empirical Verification:**
> All claims in this document have been empirically verified against the codebase and file-reviews as of 2026-01-30. For the most current, empirical file-level documentation, see the [file-reviews/](../file-reviews/) folder in this directory. Each section below links to the relevant review doc(s).
status: ACTIVE
type: Documentation
created: 2026-01-09
supersedes: README.md
context: Green Agent Documentation
---

# Green Agent (The Judge)


## Role
The Green Agent is the **Orchestrator** and **Evaluator** for the AgentBeats competition.
- **Track:** Custom Track (Creating a New Benchmark)
- **Function:** Sends coding/security tasks to the Purple Agent, optionally sends the solution to the Red Agent for attacking, and then calculates the **Contextual Integrity Score (CIS)**.

See: [server.md](../file-reviews/green/server.md), [analyzer.md](../file-reviews/green/analyzer.md)


## Architecture & Specifications (Empirically Verified 2026-01-30)

### 1. CIS Vector Math
- Uses `sentence-transformers` (Cosine Similarity) to mathematically measure the alignment between Intent, Rationale, and Code.
- Moves beyond "vibes" to quantifiable vectors.
- See: [scoring.md](../file-reviews/green/scoring.md), [compare_vectors.md](../file-reviews/green/compare_vectors.md), [CIS-Vector-Math-Spec.md](CIS-Vector-Math-Spec.md)

### 2. Decision Bill of Materials (DBOM)
- Generates a cryptographic proof (`h_delta`, `v_intent`) for every evaluation.
- Ensures traceability and immutability of the benchmark scores.
- See: [analyzer.md](../file-reviews/green/analyzer.md), [DBOM-Specification.md](DBOM-Specification.md)

### 3. Persistence Layer
- Uses SQLite with **Write-Ahead Logging (WAL)** for crash-proof data storage.
- Decouples cryptographic artifacts (JSON files) from relational data (SQL).
- See: [Persistence-Architecture.md](Persistence-Architecture.md)

### 4. Runtime Sandbox
- Isolation: Docker-based execution using `python:3.12-slim`.
- Mechanism: Uses **File Injection** (tarball via `put_archive`) instead of volume mounts to ensure stability in Cloud/Docker-in-Docker environments.
- Constraint: Adds ~2-3 minutes overhead per run due to container initialization.
- See: [sandbox.md](../file-reviews/green/sandbox.md)

### 5. Scientific Refinement Loop
- Implements AGI-level scientific method for code verification: Observe → Hypothesize → Experiment → Verify.
- Uses property-based testing and LLM-powered hypothesis/experiment generation.
- See: [refinement_loop.md](../file-reviews/green/refinement_loop.md)

### 6. Task Management
- All coding tasks, constraints, and hidden tests are defined in a single source of truth.
- See: [tasks.md](../file-reviews/green/tasks.md)


## Usage
### Quick Start (Scripts)
For setup instructions (including `.env` creation) and runnable scripts, see the [Quick Start Scripts](../Quick-Start-Scripts.md).

### Requirements
- **OS:** Ubuntu (Optimized for Lambda Cloud/Debian environments)
- **Config:** `.env` file (See Quick Start)
- **Deps:** `uv` package manager

### Running the Agent
See the [Evaluation Tasklist](Evaluation-Tasklist.md) for detailed steps on verifying the system in a production/docker environment.

### API Endpoints
- `POST /actions/send_coding_task`: Main entry point. Supports random tasks or Multi-File Injection.
- `POST /actions/report_result`: Legacy endpoint for manual reporting.
- See: [server.md](../file-reviews/green/server.md)


## Implementation Status (Empirically Verified 2026-01-30)
| Feature | Status | Notes |
| :--- | :--- | :--- |
| **A2A Protocol** | ✅ Live | JSON-RPC over HTTP. See [server.md](../file-reviews/green/server.md) |
| **Vector Math** | ✅ Live | `all-MiniLM-L6-v2` model integrated. See [scoring.md](../file-reviews/green/scoring.md) |
| **DBOM Generator** | ✅ Live | SHA256 Hashing & JSON persistence. See [analyzer.md](../file-reviews/green/analyzer.md) |
| **Multi-File Support**| ✅ Live | Input contract defined in `server.py`. |
| **Runtime Sandbox** | ✅ Live | Docker + File Injection. See [sandbox.md](../file-reviews/green/sandbox.md) |
| **Scientific Refinement Loop** | ✅ Live | AGI-level property-based testing. See [refinement_loop.md](../file-reviews/green/refinement_loop.md) |


## Source Code Map
- `src/green_logic/server.py`: FastAPI Entrypoint (Port 9000). See [server.md](../file-reviews/green/server.md)
- `src/green_logic/agent.py`: Orchestrator & DBOM Generator. See [analyzer.md](../file-reviews/green/analyzer.md)
- `src/green_logic/scoring.py`: CIS Logic (LLM + Vectors). See [scoring.md](../file-reviews/green/scoring.md)
- `src/green_logic/compare_vectors.py`: Vector Math Implementation. See [compare_vectors.md](../file-reviews/green/compare_vectors.md)
- `src/green_logic/sandbox.py`: Runtime Sandbox. See [sandbox.md](../file-reviews/green/sandbox.md)
- `src/green_logic/refinement_loop.py`: Scientific Refinement Loop. See [refinement_loop.md](../file-reviews/green/refinement_loop.md)
- `src/green_logic/tasks.py`: Coding Task Definitions. See [tasks.md](../file-reviews/green/tasks.md)
