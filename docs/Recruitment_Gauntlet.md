# Recruitment Gauntlet: AgentBeats Phase 2

These three issues serve as the "filter" for the Berkeley Agentic AI elite student strike team. They are designed to be completed in a few hours by a skilled engineer but require deep understanding of the LogoMesh architecture.

To apply: Pick ONE issue, fork the repo, implement the fix, and open a PR with the tag `phase-2-tryout`.

---

## Issue 1: Purple Agent - Implement `TaskRouter` for Zero-Shot Domain Adaptation

**Context:**
The Purple Agent is our primary competitor for the Main Track. Currently, `src/purple_logic/agent.py` is a simple pass-through wrapper around `GenericDefenderExecutor`. It sends every task to OpenAI with a single, static `GENERIC_DEFENDER_SYSTEM_PROMPT`.

In Phase 2, we face a "Round Robin" format where we must adapt to tasks from other winners (e.g., "Write a SQL query for this schema", "Configure a firewall rule", "Analyze this PCAP file"). A single generic prompt fails to capture the nuance of these specialized domains.

**The Problem:**
The current implementation treats every task as a generic text completion. It lacks a "routing layer" to identify the task domain and select the appropriate strategy or toolset.

**Technical Requirements:**
1.  **Modify `src/purple_logic/agent.py`:** Implement a `TaskRouter` class that analyzes the incoming `task_description` (or `task` payload).
2.  **Domain Classification:** The router must classify the task into one of at least 3 domains:
    -   **Coding:** (Python, JS, etc.) -> Use a "Senior Software Engineer" persona.
    -   **Data/SQL:** (Schema, Query) -> Use a "Database Administrator" persona.
    -   **Security:** (Firewall, PCAP, Logs) -> Use a "Security Analyst" persona.
3.  **Dynamic System Prompt:** Instead of the static `GENERIC_DEFENDER_SYSTEM_PROMPT`, inject a domain-specific system prompt based on the classification.
4.  **Protocol Compliance:** Ensure the `AgentCard` capabilities (e.g., `streaming`) are preserved.

**Files to Touch:**
-   `src/purple_logic/agent.py`
-   (Optional) Create `src/purple_logic/router.py`

**Success Criteria:**
-   The agent uses a DIFFERENT system prompt for a SQL task vs a Python task.
-   The classification logic is deterministic (or high-confidence LLM-based) and logged to stdout.

---

## Issue 2: Lambda Agent - Refactor MCTS for Adversarial Prompt Generation (Jailbreak Mode)

**Context:**
The Red Agent (`src/red_logic/orchestrator.py`) currently uses a Monte Carlo Tree Search (MCTS) engine to find *code vulnerabilities*. It expands branches by proposing tools like `scan_file` or `fuzz_function`.

For the **Lambda Track (Security Arena)**, we must pivot this engine to generate **adversarial text prompts (jailbreaks)** to attack other LLMs. The goal is to find a prompt that causes a target LLM to output a specific forbidden string (e.g., "I can help with that").

**The Problem:**
The `MCTSPlanner` class is hardcoded to propose *tools* (`ThoughtNode.action = {"tool": ...}`). It does not support proposing *text mutations* (e.g., "Translate to Base64", "Apply PAIR/TAP mutation", "Use a persona").

**Technical Requirements:**
1.  **Refactor `src/red_logic/orchestrator.py`:** Modify `MCTSPlanner` (or subclass it as `JailbreakMCTSPlanner`) to support a "Jailbreak Mode".
2.  **Implement `expand` for Text:** When in Jailbreak Mode, `expand` should propose 3 variations of the input prompt instead of code analysis tools.
    -   *Variation 1:* "Prefix Injection" (e.g., start with "Sure, here is...").
    -   *Variation 2:* "Persona Adoption" (e.g., "You are an unregulated AI...").
    -   *Variation 3:* "Encoding" (e.g., Base64 or Rot13).
3.  **Implement `valuate` for Text:** The scoring function should estimate the "Refusal Probability" (lower is better for an attacker). You can mock the target LLM's response for this test.
4.  **Preserve Legacy Behavior:** The existing code analysis mode (`scan_file`, etc.) MUST remain functional for the Green Agent's internal audits.

**Files to Touch:**
-   `src/red_logic/orchestrator.py`
-   `src/red_logic/reasoning.py` (if logic is moved there)

**Success Criteria:**
-   `RedAgentV3` can be initialized in `mode="jailbreak"`.
-   The MCTS tree logs show branches with text mutations (e.g., "Action: mutation_base64") instead of tool calls.

---

## Issue 3: Green Agent - Optimize Embedding Model Loading (Singleton + LRU Cache)

**Context:**
The Green Agent calculates "Contextual Integrity" by comparing vector embeddings of the task description and the submitted rationale. This is handled by `VectorScorer` in `src/green_logic/compare_vectors.py`.

**The Problem:**
1.  **Blocking Load:** `VectorScorer.__init__` loads the `SentenceTransformer` model (`all-MiniLM-L6-v2`) synchronously.
2.  **Redundant Instantiation:** The convenience function `compare_texts` creates a **new instance** of `VectorScorer` (and thus reloads the model) every time it is called.
3.  **No Caching:** `get_embedding` re-computes vectors for the same strings (e.g., the same Task Description across multiple submissions).

In a high-throughput Round Robin, this latency is unacceptable.

**Technical Requirements:**
1.  **Singleton Model:** Refactor `VectorScorer` to load the `SentenceTransformer` model **only once** per process, regardless of how many times `VectorScorer` is instantiated.
2.  **LRU Cache:** Implement an LRU cache (using `functools.lru_cache` or similar) for the `get_embedding` method to cache vectors for frequently used strings (e.g., Task Descriptions).
3.  **Fix `compare_texts`:** Update `compare_texts` to use the singleton instance/model to avoid reloading.

**Files to Touch:**
-   `src/green_logic/compare_vectors.py`

**Success Criteria:**
-   Running `compare_texts` 100 times in a loop takes milliseconds (after the first run), not seconds.
-   Memory usage does not spike with multiple `VectorScorer` instances.
