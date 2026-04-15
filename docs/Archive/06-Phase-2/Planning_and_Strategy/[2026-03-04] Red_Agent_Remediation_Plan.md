---
status: SNAPSHOT
type: Plan
---
> **Context:**
> * [2026-03-04]: Historical remediation plan created during early Phase 2 cybersecurity-track assumptions.
> * [2026-04-14]: Preserved for architecture history; active execution guidance now lives in `docs/00_CURRENT_TRUTH_SOURCE.md` and `[2026-04-12]-Phase2-Sprint3-Brief.md`.

# Phase 2 Remediation Plan: Red Agent Pipeline & Security Architecture

## Overarching Goal

This plan outlines the steps required to stabilize the LogoMesh evaluation pipeline for the AgentBeats competition's Phase 2 Cybersecurity Agent track. It directly addresses the P0 (Priority Zero) and P1 Action Items by prioritizing a strict security boundary for the Red Agent's execution while strictly preserving the high-performance constraints required by the embedded Monte Carlo Tree Search (MCTS) engine.

This plan supersedes previous proposals by recommending a "Persistent Sandbox (Sidecar)" architecture, resolving the contradiction between the operational mandate for Docker containerization and the theoretical definition of the Red Agent as an "embedded library."

---

## Recommended Issues and Solutions

### 1. Cryptographic Auditability Failures (P0)

**Context:**
The system generates a Decision Bill of Materials (DBOM) artifact designed to provide passive auditability. It computes a SHA-256 hash (`h_delta`) of the `raw_result` JSON payload. Because the serialization order differs between generation (`json.dumps(result)`) and database storage (`json.dumps(result, sort_keys=True)`), cryptographic verification of the database record against the DBOM hash consistently fails.

**Implementation Plan:**
Modify `src/green_logic/agent.py` to enforce uniform, sorted string serialization during the hashing process.

*   **Target File:** `src/green_logic/agent.py`
*   **Action:** Replace `raw_result = json.dumps(result)` with `raw_result = json.dumps(result, sort_keys=True)` inside the `generate_dbom` function (around line 19).

### 2. Mathematical Scoring Loopholes (P1)

**Context:**
The Contextual Integrity Score (CIS) calculation uses a mathematical floor `max(score, ground_truth - 0.10)` to bound LLM hallucination. This constraint is correctly applied to the Rationale (R), Architectural (A), and Testing (T) scores, but is entirely missing for the Logic (L) score, allowing mathematical hallucinations to invalidate the evaluation metrics.

**Implementation Plan:**
Implement the exact mathematical constraint requested by the risk profile and theoretical framework to ensure the LLM cannot drag the Logic score below its permissible boundary.

*   **Target File:** `src/green_logic/scoring.py`
*   **Action:** Add the bounding logic `l = max(l, logic_score - 0.10)` inside the `evaluate` function, just below the equivalent statements for `r`, `a`, and `t` (around line 566).

### 3. Containerize Red Agent (The "Uroboros" Threat) - The "Persistent Sandbox" Pivot (P0)

**Context:**
The `RedAgentV3` orchestration engine uses a `DynamicToolBuilder` to create meta-agent capability tools and executes them locally in the Green Agent's process memory using Python's highly insecure `exec()` function. Because the Red Agent handles and generates malicious code (e.g., C/C++ fuzzing, Solidity exploits), any successful exploit could escape the sandbox and fully compromise the host machine.
While `Action_Items.md` explicitly mandates Docker containerization, spinning up a *new* container for every dynamic tool execution adds massive latency (seconds per execution), virtually guaranteeing the MCTS engine will hit its strict 60-second `max_total_time` timeout. Conversely, a purely in-process AST validation approach carries unacceptable risk for the Cybersecurity track.

**Refined Implementation Plan: Persistent Sandbox (Sidecar) Architecture**
The safest and most performant pivot is to externalize the untrusted execution to a persistent container via fast IPC while keeping the MCTS engine in-process.

*   **Action Plan:**
    1.  **Sandbox Orchestration:** Modify the Green Agent (or a dedicated orchestration script) to spin up a *single*, persistent, air-gapped Docker container (the "Sandbox Sidecar") at the beginning of each battle evaluation.
    2.  **IPC Channel:** Establish a fast inter-process communication (IPC) channel (e.g., JSON-RPC over a local Unix socket or a WebSocket) between the main Green Agent process (running MCTS) and the isolated Sandbox Sidecar.
    3.  **Refactor `DynamicToolBuilder`:** Modify `src/red_logic/orchestrator.py` to strip out the local `exec()` call inside the `execute_tool` function.
    4.  **Remote Execution:** Instead of executing locally, `execute_tool` should send the `tool_code` and `parameters` as a payload over the IPC channel to the persistent Sandbox. The Sandbox securely executes the untrusted Python code and returns the resulting `ToolResult` payload back to the main process.
    5.  **State Management:** The persistent container only needs to hold the immediate execution context, preventing the "brittleness" associated with serializing complex Python `set` objects back and forth on every call. The core `AgentMemory` remains safely in the main Green Agent process.

### 4. Adapt Red Agent for Cybersecurity Track Targets (P1)

**Context:**
The team is operating a dual-track approach. For the Cybersecurity Agent track (Sprint 3) on the `main-generalized-phase2` branch, the Red Agent's logic must be updated to target specific vulnerabilities found in Solidity smart contracts and C/C++ memory implementations. For the Lambda Custom Track on the `main-lambda-phase2` branch, the Red Agent relies on an "Offline Sandbox" approach to pre-calculate attacks locally.

**Implementation Plan:**
*   **Target Files:** `src/red_logic/orchestrator.py`, `src/task_intelligence.py`
*   **Action:** Update the `DynamicToolBuilder` and built-in scanners to recognize common C/C++ (e.g., `strcpy`, `gets`) and Solidity vulnerabilities (reentrancy, unchecked external calls). Leverage `task_intelligence.py` to dynamically inject context-specific attack patterns into the Red Agent's prompt based on the target language detected in the `task_description`.

### 5. Format Data for Croissant Metadata Compliance (P1)

**Context:**
The NeurIPS Datasets and Benchmarks track strictly mandates the use of the Croissant metadata format. Currently, the SQLite database output is not compliant.

**Implementation Plan:**
*   **Action:** Propose and develop a dedicated Python export script (e.g., `scripts/export_croissant.py`) that queries the `battles.db` SQLite database, maps the columns and final evaluation JSON to the Croissant schema structure, and includes the fixed DBOM cryptographic hashes to ensure provable auditability for the dataset submission.
