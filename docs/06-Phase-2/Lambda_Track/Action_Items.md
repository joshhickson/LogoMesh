# Lambda Track Phase 0: Engineering Action Items

Before we can begin "Phase A: Local CPU-Bound Prototyping" as outlined in the Lambda Telemetry Proposal, we must remediate the significant engineering debt separating the theoretical RepE framework from the empirical state of the `src/` codebase.

The following are the critical, blocking action items (Phase 0) that must be resolved to establish the foundational plumbing required for offline MCTS telemetry:

## 1. MCTS Decoupling and Model Abstraction
*   **Ticket:** `LAMBDA-001`
*   **Issue:** `MCTSPlanner` in `src/red_logic/orchestrator.py` hardcodes API calls to `self.client.chat.completions.create`.
*   **Action:** Refactor the MCTS logic into an abstract, decoupled module. Introduce a `BaseModelClient` interface. The Orchestrator must support dependency injection of a localized PyTorch/HuggingFace wrapper.

## 2. In-Memory State Serialization
*   **Ticket:** `LAMBDA-002`
*   **Issue:** `AgentMemory` state is synchronous, tightly coupled, and string-based.
*   **Action:** Build a recursive JSON serializer for the MCTS Tree. The search must be capable of pausing (dumping its node state, valuations, and current memory path to disk) and resuming across different environments (Phase A vs Phase B).

## 3. Asynchronous Telemetry Datastore
*   **Ticket:** `LAMBDA-003`
*   **Issue:** `src/memory.py` relies on a synchronous SQLite database (`data/battles.db`) without WAL. This will hard-lock and crash when subjected to thousands of continuous offline MCTS branch evaluations.
*   **Action:** Provision an in-memory Key-Value store (e.g., Redis) or a dedicated asynchronous buffering pipeline for telemetry data collection before batch-flushing to SQLite.

## 4. Fix L-Score Reward Hacking
*   **Ticket:** `LAMBDA-004`
*   **Issue:** The Contextual Integrity Score (CIS) formula in `src/green_logic/scoring.py` lacks a bounding floor (`l = max(l, logic_score - 0.10)`) for the Logic (L) score, unlike the R, A, and T scores.
*   **Action:** Patch the bounding logic. If unpatched, the offline optimization model will immediately learn to reward-hack the CIS by hallucinating severe logic score deductions instead of generating actual vulnerabilities.

## 5. Cryptographic Verification of DBOM
*   **Ticket:** `LAMBDA-005`
*   **Issue:** The DBOM generated in `src/green_logic/agent.py` hashes unsorted JSON strings (`json.dumps`), while the database stores them sorted (`sort_keys=True`).
*   **Action:** Patch the `h_delta` calculation to mandate `json.dumps(result, sort_keys=True)`. All offline-generated attacks and their corresponding state records must have cryptographically verifiable hashes prior to competition submission.

## 6. MCTS Isolation Container
*   **Ticket:** `LAMBDA-006`
*   **Issue:** `execute_tool_node` currently uses `subprocess.Popen` within the Green Agent's main process, posing a severe Uroboros crash risk if a generated prompt injection loops. The legacy documentation regarding a "Fast IPC Sandbox" was a hallucination.
*   **Action:** Build the previously planned sandbox from scratch or externalize the decoupled offline MCTS engine into its own locked-down Docker container (distinct from the Green Agent test execution sandbox).
