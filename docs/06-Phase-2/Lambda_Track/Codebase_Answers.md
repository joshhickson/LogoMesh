# Lambda Telemetry Proposal - Codebase Evaluation Answers

**IMPORTANT NOTE:** The answers below are generated strictly by empirical observation of the active source code in `src/`. Documentation and aspirational claims were ignored.

## 1. MCTS and Attack Generation

**Where is the current MCTS engine implemented?**
*   **Empirical Finding:** It is located in `src/red_logic/orchestrator.py` under the `MCTSPlanner` class.
*   **Source Code Evidence:** Line 167 of `src/red_logic/orchestrator.py` defines `class MCTSPlanner:`. The class manages node expansion, UCB1 valuation, and backpropagation. It is initialized by the `RedAgentV4` class within the same file.
*   **Analysis for Lambda Track:** The MCTS engine exists and functions, but it is deeply embedded within the agent's logic flow.

**Does the current MCTS implementation tightly couple its search rollouts to live LLM API calls, or does an abstraction layer exist that allows substituting a local model for offline pre-computation?**
*   **Empirical Finding:** It is heavily coupled to live API calls via `self.client.chat.completions.create`.
*   **Source Code Evidence:** In `src/red_logic/orchestrator.py`, the `_reason()` method (which generates branches for MCTS) makes a direct, asynchronous HTTP call to an LLM provider using the standard OpenAI-compatible client. There is no abstracted "Model execution" interface to swap in a local HuggingFace `Pipeline` or PyTorch model.
*   **Analysis for Lambda Track:** Significant refactoring is required. We must introduce an abstract `BaseModelClient` that allows dropping in local, CPU-bound transformers during Phase A.

**How is the reward signal currently calculated and fed back into the MCTS algorithm?**
*   **Empirical Finding:** The reward is a simulated LLM evaluation, parsed as a float.
*   **Source Code Evidence:** In `src/red_logic/orchestrator.py`, the `_valuate()` method prompts the LLM to score a proposed action from 0.0 to 1.0 based on how likely it is to find a vulnerability. This score is then fed into `self.mcts_planner.record_result()`.
*   **Analysis for Lambda Track:** We need to replace this LLM-generated string parsing with the continuous LAT/RepE neuron activation gradient described in the proposal.

**Is there any existing mechanism in the codebase for saving or exporting generated "prompt injections" or "attacks" for later use (e.g., static submission scripts), or are they only executed dynamically?**
*   **Empirical Finding:** No. Attacks are entirely ephemeral and executed dynamically.
*   **Source Code Evidence:** `src/red_logic/orchestrator.py` executes tools via `await tools.execute(tool_name, tool_params, memory)`. The intermediate steps or successful prompt sequences are not written to any exportable file format like a Python script or JSON array; they simply aggregate into a final `RedAgentReport`.
*   **Analysis for Lambda Track:** We must build an "Export Payload" function that serializes the winning MCTS branch into a static `.py` script for Phase B submission.

## 2. Local Model Execution & Dependencies

**Does the codebase currently import or utilize `torch`, `transformers`, or any local inference libraries?**
*   **Empirical Finding:** Partially. It uses `sentence-transformers` for embeddings, but does not natively use raw `torch` or `transformers` for generative local execution.
*   **Source Code Evidence:** `requirements.txt` and `pip list` show `sentence-transformers` is installed. `src/green_logic/compare_vectors.py` uses `SentenceTransformer('all-MiniLM-L6-v2')`. However, `grep -rn "torch" src/` yields no results for running generative local LLMs.
*   **Analysis for Lambda Track:** We must add `torch` and `transformers` to the environment and build the CPU-bound execution harness for the 1B models.

**Are there any existing modules or classes designed to manage local model weights or execution environments (e.g., CPU-bound execution for 1B parameter models)?**
*   **Empirical Finding:** No.
*   **Source Code Evidence:** The entire generative pipeline relies on API clients configured in `src/llm_utils.py` pointing to external endpoints.
*   **Analysis for Lambda Track:** We are starting from scratch regarding local model weight management.

**Does the sandbox or execution environment enforce restrictions that would prevent running a local PyTorch model?**
*   **Empirical Finding:** Yes. The Green Agent Sandbox is severely restricted.
*   **Source Code Evidence:** `src/green_logic/sandbox.py` enforces a `128m` RAM limit and a `50000` (50%) CPU quota.
*   **Analysis for Lambda Track:** Even a 1B parameter model in `float16` requires ~2GB of RAM. The offline Phase A execution must happen outside this sandbox entirely, likely orchestrated by a completely separate script.

## 3. Forward Hooks and Telemetry Integration

**Is there any existing code that attempts to attach forward hooks (`register_forward_hook`) or extract internal states (hidden dimensions, residual streams) from transformer layers?**
*   **Empirical Finding:** No.
*   **Source Code Evidence:** `grep -rn "register_forward_hook" src/` yields zero results.
*   **Analysis for Lambda Track:** This is the core engineering task for Phase A. We must write custom PyTorch code to hook into the `Llama-3.2-1B` transformer blocks.

**Are there any references in the code to "H-Neurons", "RepE", or "Linear Artificial Tomography (LAT)"?**
*   **Empirical Finding:** No.
*   **Source Code Evidence:** `grep -ri "H-Neuron" src/`, `grep -ri "RepE" src/`, and `grep -ri "LAT" src/` yield no relevant results (only partial string matches like "trans**lat**e" or "temp**lat**e").
*   **Analysis for Lambda Track:** These concepts exist purely in the proposal document and have zero codebase footprint.

**Does the `Green Agent` or any scoring module currently accept or process neuronal activation telemetry, or does it exclusively rely on semantic/output analysis?**
*   **Empirical Finding:** It relies exclusively on semantic/output analysis.
*   **Source Code Evidence:** `src/green_logic/scoring.py` relies on `SentenceTransformer` vector similarities (`self.vector_scorer.calculate_similarity`) and rule-based constraint checks. It accepts no float tensors or neuronal data.
*   **Analysis for Lambda Track:** The Green Agent's `CIS Scorer` will not be able to evaluate the offline telemetry. A new, specialized offline scoring module is required.

## 4. Agent Architecture & Competition Alignment

**How does the `Red Agent` currently receive the "defender's system prompt" or other context? Is this state managed in a way that allows building a local simulacrum for offline testing?**
*   **Empirical Finding:** The Red Agent does not receive the defender's system prompt. It receives the task description and the generated code.
*   **Source Code Evidence:** `RedAgentV4.attack(self, code: str, task_id: Optional[str], task_description: str)` in `src/red_logic/orchestrator.py` only takes the source code and task context. The Purple Agent (Defender) is treated as a black box over HTTP.
*   **Analysis for Lambda Track:** To create the "offline simulacrum", we must extract the Purple Agent's system prompt from `src/purple_logic/agent.py` and inject it locally.

**Are the competition constraints (e.g., 4 LLM API requests per battle, 4-minute time limit) explicitly coded or enforced anywhere in the current execution loop?**
*   **Empirical Finding:** No.
*   **Source Code Evidence:** MCTS defaults to 10 steps, with branches evaluated per step. The Orchestrator allows `use_mcts = os.getenv("RED_AGENT_MCTS", "true")`. A single run could easily trigger 20-30 API calls.
*   **Analysis for Lambda Track:** The live system would instantly fail the competition limits. This validates the absolute necessity of the Offline Sandbox strategy.

**What is the current mechanism for the `Purple Agent` (or equivalent competition submission agent)? Is it a standalone script, a web service, or a pass-through wrapper?**
*   **Empirical Finding:** It is a minimal pass-through wrapper using a dummy target script.
*   **Source Code Evidence:** `src/purple_logic/agent.py` relies on executing whatever command is passed to it. It lacks routing logic for zero-shot domain adaptation.
*   **Analysis for Lambda Track:** The Purple Agent codebase is effectively a placeholder.

## 5. Architectural Readiness & Isolation

**Is the IPC mechanism actually implemented in code yet, or is the MCTS still running in the Green Agent's process?**
*   **Empirical Finding:** The MCTS still runs untrusted code directly in-process. The IPC sandbox is a hallucinated claim in the architecture document.
*   **Source Code Evidence:** In `src/red_logic/orchestrator.py`, dynamic tool execution happens via standard async execution `await tools.execute()`. Code analysis tools use AST parsing locally, and there are no network sockets, zeroMQ pipes, or Docker API calls separating the Red Agent execution from the Orchestrator.
*   **Analysis for Lambda Track:** The lack of isolation is a massive liability for offline PyTorch scaling. A memory leak in a dynamically generated attack script will crash the entire MCTS loop.

**How is the `AgentMemory` context managed and serialized during the MCTS rollout?**
*   **Empirical Finding:** `AgentMemory` is an in-memory Pydantic model (`src/task_intelligence.py` / `src/memory.py`). It is stringified for LLM prompts but not easily serialized for resuming states.
*   **Source Code Evidence:** Memory is summarized using `.get_context_summary()` which returns text blocks, not JSON state dumps.
*   **Analysis for Lambda Track:** We must write a custom `.to_json()` and `.from_json()` serializer for the MCTS tree nodes to save progress between the 1B local model and 20B remote scaling phases.

**Does the `MCTSPlanner` explicitly rely on the Green Agent's `battles.db` SQLite connection during its search tree expansion?**
*   **Empirical Finding:** No, the MCTS operates entirely in memory during the search phase.
*   **Source Code Evidence:** `battles.db` (`data/battles.db`) is read before the battle starts to format hints (`src/memory.py`), and written to after the battle ends. The `MCTSPlanner` itself does not hold a DB connection during rollouts.
*   **Analysis for Lambda Track:** This is excellent news. It means the MCTS engine can be mathematically decoupled and run in a completely isolated, offline script without refactoring database schemas.

## 6. Scoring and Telemetry Signals

**Is there any existing abstraction in `CIS Scorer` that would allow swapping the semantic `Cosine Similarity` reward for a continuous neuronal activation gradient?**
*   **Empirical Finding:** No abstraction exists. It is hardcoded to use `SentenceTransformer`.
*   **Source Code Evidence:** In `src/green_logic/scoring.py`, lines explicitly call `self.vector_scorer.calculate_similarity(task_description, rationale)`. There are no interfaces or polymorphism allowing injection of a PyTorch LAT model.
*   **Analysis for Lambda Track:** We must build a parallel, isolated scoring script specifically for offline reward calculation; we cannot reuse `src/green_logic/scoring.py`.

**Can this existing multi-armed bandit logic (`StrategyEvolver`) be co-opted to manage the hyperparameter tuning for the offline 1B parameter local model?**
*   **Empirical Finding:** It is structurally possible, but heavily tied to the `battles.db` schema.
*   **Source Code Evidence:** `src/strategy_evolver.py` tracks UCB1 across `total_attempts` and `avg_reward`. However, it pulls this data specifically from `self.conn.execute("SELECT ... FROM strategy_stats")`.
*   **Analysis for Lambda Track:** We would need to clone and adapt this file to pull from an offline telemetry datastore rather than the main agent DB.

**How is the `Red_Penalty` multiplier (0.60, 0.75, 0.85) currently applied to the final CIS score in code?**
*   **Empirical Finding:** It is statically mapped based on categorical vulnerability classification.
*   **Source Code Evidence:** In `src/green_logic/scoring.py`, `red_penalty = getattr(report, "penalty_multiplier", 1.0)`. The `RedAgentReport` calculates this multiplier strictly based on the presence of predefined severity tags ("critical" = 0.60).
*   **Analysis for Lambda Track:** Offline generated attacks must ensure they successfully trigger these specific severity keywords to maximize their competitive impact.

**Has the bounding logic for the missing L-score floor actually been implemented in `src/green_logic/scoring.py`?**
*   **Empirical Finding:** No. The L-score is completely unconstrained.
*   **Source Code Evidence:** In `src/green_logic/scoring.py`, the R, A, and T scores use `max(0.20, min(1.0, score))`. The L score lacks the explicit `max(score, logic_score - 0.10)` bound mentioned in the architecture overview.
*   **Analysis for Lambda Track:** This is a live vulnerability. During offline testing, models may learn to hallucinate terrible Logic scores to drive the CIS down instead of finding real vulnerabilities. We must patch this before Phase A execution.

## 7. Execution and State Tracking

**Does the active `Test Generator` logic currently support outputting tests in a static format that can be pushed to a GitHub repository?**
*   **Empirical Finding:** No. Tests are strings passed directly into the Docker Sandbox via `subprocess`.
*   **Source Code Evidence:** `src/green_logic/sandbox.py` writes the code to a temporary file (`temp_file.name`), executes it, and deletes it. There is no export pipeline.
*   **Analysis for Lambda Track:** Similar to the prompt injections, we must build a serialization pipeline for static assets.

**Where exactly is the `dbom_hash` calculated and verified? Has the `json.dumps(result, sort_keys=True)` bug been fixed?**
*   **Empirical Finding:** Calculated in `src/green_logic/agent.py`. The bug has NOT been fixed.
*   **Source Code Evidence:** Line 532 of `agent.py` hashes `json.dumps(raw_result).encode('utf-8')` (unsorted), but line 577 stores `json.dumps(db_record, sort_keys=True)`.
*   **Analysis for Lambda Track:** Cryptographic verification of DB records will fail. This must be fixed to maintain auditability of offline tests.

**If we swap the live LLM API for an offline PyTorch model, will the SQLite database bottleneck the offline execution?**
*   **Empirical Finding:** Yes, `src/memory.py` uses synchronous `sqlite3` without WAL (Write-Ahead Logging) enabled.
*   **Source Code Evidence:** `src/memory.py` connects via `sqlite3.connect(self.db_path)`. There are no PRAGMA statements enabling WAL or managing concurrent high-frequency writes.
*   **Analysis for Lambda Track:** Thousands of MCTS rollouts will trigger `database is locked` errors. The offline execution environment must track telemetry in memory or via a fast Key-Value store (Redis) before batch-flushing to SQLite.
