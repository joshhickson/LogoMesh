---

status: DEPRECATED
type: Log
verified: 2026-01-30
superseded_by: ../../../../src/red_logic/agent.py
---
> **DEPRECATION NOTICE (2026-01-30):**
> This Q&A log is DEPRECATED and SUPERSEDED by the Red Agent implementation and documentation in [src/red_logic/agent.py](../../../../src/red_logic/agent.py) and [scenarios/security_arena/agents/generic_attacker.py](../../../../scenarios/security_arena/agents/generic_attacker.py). All current Red Agent Q&A and verification are maintained in those locations.

# Questions for Mark (Kuan Zhou)

## 1. Generic Defender as Base for Purple Agent?
We identified `scenarios/security_arena/agents/generic_defender.py` in your repo.
*   **Question:** Is this intended to be the base implementation for our "Mock Purple Agent" (Defender) in the Custom Track?
*   **Context:** We prefer its explicit Python structure over the CLI-based approach because it allows us to inject specific vulnerabilities or "Contextual Debt" for the Green Agent to detect.

## 2. Local Model Support (vLLM)
The current implementation uses `AsyncOpenAI` with `gpt-4o-mini`.
*   **Question:** Have you planned the migration to local models (e.g., using vLLM)?
*   **Context:** The competition (and our cost constraints) requires running local inference (e.g., `gpt-oss-20b`). Should we abstract the client in `GenericDefenderExecutor` to support this?
*   **Update (Dec 27):** You mentioned testing `gpt-oss-20b` on A100 40GB. Does this mean `gpt-oss-20b` is the *exact* model we must use, or is `Llama-3-70B` (which fits our H100 target) considered "equivalent" and allowed?

## 3. General / Process (New)
*   **Question:** Where is the `ad_attack` scenario code? It is listed as required in the spec but is missing from `external/TEAM`.
*   **Question:** How do we submit multiple scenarios? Is it a single Pull Request containing all scenario folders, or separate submissions?

## 4. Rationale Injection
For the Green Agent to evaluate "Rationale Debt," the Purple Agent needs to output a "Rationale" field alongside its code.
*   **Question:** How should we modify the `generic_defender.py` prompt or schema to ensure it outputs JSON with a `rationale` field?
*   **Suggestion:** We might need to enforce a structured output schema (e.g., Pydantic or JSON mode) in the `execute` method.

## 4. Orchestration Compatibility
*   **Question:** Does the `generic_attacker.py` require a specific message format from the Orchestrator?
*   **Context:** Our Green Agent (Evaluator) will need to send messages to this Attacker to initiate Red Teaming rounds.
