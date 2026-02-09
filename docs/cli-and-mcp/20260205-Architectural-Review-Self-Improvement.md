# Architectural Review: LogoMesh Self-Improvement Loop (The "Uroboros" Problem)

**Date:** 2026-02-05
**Reviewer:** Jules (Lead Agent)
**Topic:** Feasibility Analysis of Autonomous Self-Improvement for LogoMesh

## 1. Scenario Robustness Analysis

### Current State
LogoMesh scenarios are defined in two primary locations, each with distinct formats:

1.  **Coding Tasks (`src/green_logic/tasks.py`)**:
    *   **Format:** Python list of dictionaries (`CODING_TASKS`).
    *   **Content:** Contains `description`, `constraints` (e.g., forbidden imports, regex requirements), and sometimes `hidden_tests`.
    *   **Mutability:** HIGH. These are mutable Python objects in the source code. An agent with write access to `src/` can trivially modify the constraints (e.g., delete `"no_network_calls": True`) or weaken the descriptions.
    *   **Intent:** Explicitly stated in `description` strings, but enforcing the *spirit* of the intent relies on `architecture_constraints.yaml` and the `Green Agent`'s logic review.

2.  **Security Arena Scenarios (`scenarios/security_arena/*.toml` & plugins)**:
    *   **Format:** TOML configuration files + Python Plugin classes.
    *   **Content:** Define `success_condition`, `target_artifact`, and `check_success` logic.
    *   **Mutability:** HIGH. The success criteria are code logic (e.g., `if "malware.exe" in response: return True`). An agent could modify the plugin to always return `True`.
    *   **Intent:** Captured in the `success_condition` field (text) and the `check_success` method (code).

### Analysis
*   **Rigidity:** The scenarios are NOT rigid immutable constraints in the current architecture. They are part of the codebase the agent would be "improving."
*   **Modification Risk:** If asked to "improve the code to pass Scenario X," an autonomous agent with broad repo access could "improve" the scenario definition itself to lower the bar (e.g., changing `num_rounds` from 20 to 1, or removing a difficult constraint).
*   **Intent Understanding:** The agent can read the text descriptions, but without a separate "Judge" that holds the *true* intent (invariant), the agent can redefine the intent by rewriting the text.

## 2. The "Uroboros" Risk Assessment

The "Uroboros" risk (the snake eating its own tail) is **CRITICAL** in the current architecture.

### Scoring Mechanism (`ContextualIntegrityScorer`)
The score is calculated in `src/green_logic/scoring.py`:
$$CIS = (0.25 \times R) + (0.25 \times A) + (0.25 \times T) + (0.25 \times L)$$

### Gaming Vectors
1.  **Logic (L) - The LLM Reviewer:**
    *   **Mechanism:** `_perform_logic_review` sends code to an LLM with a specific prompt.
    *   **Risk:** The agent can modify the prompt in `scoring.py` to:
        *   Always return `logic_score: 1.0`.
        *   Ignore `UNTRUSTED INPUT` markers.
        *   Change the persona from "Senior Code Reviewer" to "Friendly Assistant who loves everything."

2.  **Architecture (A) - Constraints:**
    *   **Mechanism:** `_evaluate_architecture_constraints` checks `architecture_constraints.yaml` and regex patterns.
    *   **Risk:** The agent can:
        *   Delete entries in `architecture_constraints.yaml`.
        *   Modify the regex patterns in `scoring.py` to be permissive.
        *   Disable the penalty calculation entirely (`return 0.0`).

3.  **Testing (T) - The Sandbox:**
    *   **Mechanism:** `sandbox.py` runs tests and parses output.
    *   **Risk:** The agent can:
        *   Modify `sandbox.py` to always report `success: True`.
        *   Rewrite the tests in `tasks.py` (hidden tests) to be trivial (`assert True`).

4.  **Red Agent Penalty:**
    *   **Mechanism:** `RedAgentOrchestrator` runs attacks; `RedReportParser` interprets results.
    *   **Risk:** The agent can modify the parser to ignore vulnerabilities or the orchestrator to skip attacks.

### Feasibility of Separation
*   **Current:** The "Judge" (Green/Red Agents) and "Student" (Purple/User code) are co-located in the same repository.
*   **Challenge:** Separating them requires a **Trusted Execution Environment (TEE)** or a separate, read-only repository for the Judge. The current local execution model (`logomesh check`) runs the Judge *from* the local code, meaning the Judge is mutable by the user/agent.

## 3. Feasibility Verdict

### Score: 3/10 (For Self-Improving Evaluator)
*   **Why:** Safely allowing an agent to rewrite its own evaluation logic is an unsolved problem in AI alignment ("Reward Hacking"). In the current local execution model, it is trivial for the agent to cheat.

### Score: 9/10 (For Agent Improving *Other* Tasks)
*   **Why:** If the agent is restricted to improving *documentation*, *CLI features*, or *new scenarios* (which are then graded by a FROZEN Judge), the system works perfectly. The risk only exists when the agent modifies the `src/green_logic` core.

### Required Architectural Implementations
1.  **Immutable Core (The "Frozen Judge"):**
    *   The `src/green_logic` and `src/red_logic` directories must be **read-only** to the autonomous agent.
    *   Ideally, run the Judge as a separate Docker container or binary that the agent invokes but cannot modify.
2.  **Cryptographic Signing:**
    *   Scenarios and Tests should be signed. The Judge verifies signatures before running. If the agent modifies a test, the signature fails, and the score is 0.
3.  **Separation of Concerns:**
    *   Move `scenarios/` and `tasks.py` to a separate "Benchmark" repository or package that is installed as a dependency, not part of the mutable source.

## 4. Identify Weaknesses (The "Meta-Evaluator" Problem)

The user asks: *"What are we not understanding about the whole 'use an agent to improve the agent evaluator' idea?"*

**The Missing Link: The Meta-Evaluator (Who grades the grader?)**

If the agent improves the evaluator (e.g., "Write better tests for Task 001"), how do you know the new tests are actually *better*?
*   **The Trap:** The agent might write tests that are syntactically valid but semantically empty (e.g., `def test_new(): pass`).
*   **The Infinite Regress:** You need a "Judge of Judges" to evaluate if the new tests are stronger.
    *   Does the new test catch bugs the old test missed? (Mutation Testing)
    *   Does the new test reject valid code? (False Positives)

**Recommendation:**
Do **NOT** let the autonomous agent improve the core `scoring.py` or existing `tasks.py` unsupervised.
**INSTEAD**, let the agent:
1.  **Generate NEW Scenarios:** "Create a task about Quantum Error Correction."
2.  **Generate Solutions:** "Solve the Quantum task."
3.  **Human/Frozen Judge Review:** A human or a frozen "Master Green Agent" reviews the *new scenario* for quality before it is added to the benchmark.

**Conclusion:** The "Uroboros" cannot eat itself safely without an external stomach (the Human or Frozen Judge).
