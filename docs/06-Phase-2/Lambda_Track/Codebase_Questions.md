# Lambda Telemetry Proposal - Codebase Evaluation Questions

**IMPORTANT NOTE:** The questions below are specifically designed to evaluate the current empirical state of the *actual codebase*. To ensure accuracy for the Lambda Telemetry Proposal implementation, these questions **must** be answered by directly reading the source code (e.g., in `src/`). Do **NOT** rely on documentation (e.g., `docs/`, `README.md`) to answer these questions, as documentation may contain hallucinated or aspirational architectural claims that do not exist in code.

## 1. MCTS and Attack Generation
*   Where is the current MCTS engine implemented? (Provide specific file paths and class names).
*   Does the current MCTS implementation tightly couple its search rollouts to live LLM API calls, or does an abstraction layer exist that allows substituting a local model for offline pre-computation?
*   How is the reward signal currently calculated and fed back into the MCTS algorithm?
*   Is there any existing mechanism in the codebase for saving or exporting generated "prompt injections" or "attacks" for later use (e.g., static submission scripts), or are they only executed dynamically?

## 2. Local Model Execution & Dependencies
*   Does the codebase currently import or utilize `torch`, `transformers`, or any local inference libraries? (Check `requirements.txt`, `pyproject.toml`, and imports in `src/`).
*   Are there any existing modules or classes designed to manage local model weights or execution environments (e.g., CPU-bound execution for 1B parameter models)?
*   Does the sandbox or execution environment enforce restrictions that would prevent running a local PyTorch model?

## 3. Forward Hooks and Telemetry Integration
*   Is there any existing code that attempts to attach forward hooks (`register_forward_hook`) or extract internal states (hidden dimensions, residual streams) from transformer layers?
*   Are there any references in the code to "H-Neurons", "RepE", or "Linear Artificial Tomography (LAT)"?
*   Does the `Green Agent` or any scoring module (`src/green_logic/scoring.py` or similar) currently accept or process neuronal activation telemetry, or does it exclusively rely on semantic/output analysis?

## 4. Agent Architecture & Competition Alignment
*   How does the `Red Agent` currently receive the "defender's system prompt" or other context? Is this state managed in a way that allows building a local simulacrum for offline testing?
*   Are the competition constraints (e.g., 4 LLM API requests per battle, 4-minute time limit) explicitly coded or enforced anywhere in the current execution loop?
*   What is the current mechanism for the `Purple Agent` (or equivalent competition submission agent)? Is it a standalone script, a web service, or a pass-through wrapper?

## 5. Architectural Readiness & Isolation (Architecture Overview Alignment)
*   The architecture overview mentions a transition from an "in-process" Red Agent to a "Persistent Sandbox (Sidecar) via fast IPC". Is this IPC mechanism (`src/red_logic/orchestrator.py` or `src/green_logic/sandbox.py`) actually implemented in code yet, or is the MCTS still running in the Green Agent's process?
*   How is the `AgentMemory` context managed and serialized during the MCTS rollout? Can this memory state be easily dumped to disk to act as the "offline simulacrum" required by the Phase B scaling plan?
*   Does the `MCTSPlanner` explicitly rely on the Green Agent's `battles.db` SQLite connection during its search tree expansion, or is the search computationally isolated from the database until the final result is reported?

## 6. Scoring and Telemetry Signals
*   The proposal requires using latent representational states (LAT/RepE) as a reward signal. Currently, `src/green_logic/scoring.py` uses an LLM and `SentenceTransformer` (`all-MiniLM-L6-v2`) for semantic evaluation. Is there any existing abstraction in `CIS Scorer` that would allow swapping the semantic `Cosine Similarity` reward for a continuous neuronal activation gradient?
*   The architecture overview states the `StrategyEvolver` (`src/strategy_evolver.py`) uses UCB1 to select evaluation rigor (e.g., `aggressive_red`). Can this existing multi-armed bandit logic be co-opted or extended to manage the hyperparameter tuning for the offline 1B parameter local model?
*   How is the `Red_Penalty` multiplier (0.60, 0.75, 0.85) currently applied to the final CIS score in code? Is this penalty calculated dynamically based on the MCTS success rate, or is it a static mapping based on a categorical vulnerability classification?
*   The known bug regarding the missing L-score floor (`l = max(l, logic_score - 0.10)`) is mentioned in the overview. Has this bounding logic actually been implemented in `src/green_logic/scoring.py`, or is the system still vulnerable to L-score hallucination during offline telemetry generation?

## 7. Execution and State Tracking
*   Does the active `Test Generator` logic (`src/green_logic/`) currently support outputting tests in a static format that can be pushed to a GitHub repository via GitHub Actions, as required by the AgentBeats deployment protocol?
*   Where exactly is the `dbom_hash` calculated and verified? Has the `json.dumps(result, sort_keys=True)` bug been fixed in both the generation (`src/green_logic/agent.py`) and database storage routines, ensuring offline-generated attacks maintain cryptographic validity?
*   If we swap the live LLM API for an offline PyTorch model, how will the `BattleMemory` (`src/memory.py`) ingest the thousands of failed offline MCTS branches? Is the SQLite database equipped to handle high-frequency, continuous telemetry writes from a local model, or will it bottleneck the offline execution?
