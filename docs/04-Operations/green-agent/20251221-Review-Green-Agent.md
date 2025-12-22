> **Status:** REVIEW
> **Type:** Log
> **Context:**
> *   [2025-12-21]: Review of the `green-agent` directory (Samuel) to assess its readiness as the Evaluator in the Dual Track strategy.

# Review: Green Agent (Evaluator)

## 1. Component Overview
The `green-agent/` directory contains a streamlined implementation of the Green Agent using the `agentbeats` CLI and a `tools.py` file for task definition.

## 2. Code Structure Analysis
*   **Entry Point:** `run.sh` calls `agentbeats run_agent` using `agent_card.toml`.
*   **Logic:** `tools.py` defines the agent's capabilities:
    *   `send_coding_task`: Selects a random task (Email Validator, Rate Limiter, LRU Cache) and POSTs it to a Purple Agent.
    *   `report_result`: Prints the evaluation score.

## 3. Key Findings

### 3.1. Orchestration Logic
The "Orchestration" is currently embedded in the `send_coding_task` tool.
*   **Flow:** The LLM decides to call `send_coding_task`. The tool executes an HTTP POST to the `purple_agent_url`.
*   **Limitation:** It is currently hardcoded to talk only to a `purple_agent_url`. To support the "Hybrid Sidecar" (Red Teaming), it needs to also talk to a `red_agent_url`.

### 3.2. Evaluation Logic
The `report_result` tool accepts a score and breakdown, but the *calculation* of that score is not visible in the Python code.
*   **Hypothesis:** The "Evaluation" is performed by the LLM (Green Agent) itself, processing the Purple Agent's response in its context window and then calling `report_result` with its judgment.
*   **Risk:** This relies entirely on "LLM-as-a-Judge" without the external "RationaleWorker" or "ArchitecturalWorker" verifications defined in the Hybrid Sidecar Plan.

## 4. Comparison with Hybrid Sidecar Specs
The Hybrid Sidecar Plan (`docs/01-Architecture/Specs/20251218-Hybrid-Sidecar-Implementation-Plan.md`) envisions a Node.js Orchestrator handling the heavy lifting of evaluation (calling specialized workers).
*   **Gap:** The current `green-agent` is a monolithic "LLM-as-Manager". It does not appear to delegate evaluation to external workers.
*   **Migration:** To align with the plan, the `tools.py` needs to be expanded or replaced to make API calls to the Node.js Control Plane (e.g., `call_rationale_worker`, `call_architectural_worker`) instead of just asking the LLM to judge.

## 5. Conclusion
The `green-agent` is a good "skeleton" for the CLI-based approach, but it lacks the deep integration required for the "Contextual Integrity Score" (CIS). It currently relies on the LLM's raw judgment, which may not meet the "Verifiable" requirement of the competition.
