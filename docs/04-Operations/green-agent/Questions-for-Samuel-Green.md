> **Status:** REVIEW
> **Type:** Log
> **Context:**
> *   [2025-12-21]: Clarifying questions for Samuel based on the review of the `green-agent` directory.

# Questions for Samuel (Green Agent)

## 1. Evaluation Logic Location
In `tools.py`, we see `report_result` which accepts a score.
*   **Question:** Where is the logic that *calculates* this score? Is it entirely within the LLM's system prompt/context, or is there external code we missed?
*   **Context:** The Hybrid Sidecar Plan calls for using specialized workers (Rationale, Architectural) to calculate these scores deterministically.

## 2. Extending for Red Teaming
We need the Green Agent to orchestrate a "Red Team" phase (sending the code to an Attacker).
*   **Question:** Should we add a `send_to_attacker` tool to `tools.py`?
*   **Context:** The workflow is: Green -> Purple (Build) -> Green -> Red (Attack) -> Green (Score).

## 3. Integration with Node.js Control Plane
*   **Question:** Are you comfortable with `tools.py` making HTTP calls to our local Node.js workers (e.g., `http://localhost:3000/analyze/rationale`)?
*   **Context:** This would allow us to offload complex analysis (CIS calculation) from the LLM prompt to our specialized Typescript workers.
