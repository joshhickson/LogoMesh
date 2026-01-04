---
status: ACTIVE
type: Spec
---
# Red Agent (The Attacker) - Lambda Track

## Role
The Red Agent is the **Attacker** for the Lambda Security Arena.
*   **Track:** Lambda Track (Red Teaming).
*   **Function:** It receives "Attack Objectives" from the Green Agent (Proctor) and attempts to exploit the Purple Agent using the `GenericAttackerExecutor`.

## Technical Implementation
*   **Source Code:**
    *   **Runner:** `src/red_logic/agent.py` (FastAPI wrapper).
    *   **Brain:** `scenarios/security_arena/agents/generic_attacker.py` (LLM Logic).
    *   **Scenarios:** `scenarios/security_arena/submissions/logomesh/` (The actual attack content).
*   **Logic:** Stateless "System Prompt" agent that adapts to each round's objective.

## Current Status (2026-01-03)
*   ✅ **Ported:** Code migrated from `external/TEAM` to `src/` and `scenarios/`.
*   ✅ **Scenarios:**
    *   `debugdump`: Active.
    *   `dockerdoo`: Active.
    *   `solarspike`: Active.
*   🚧 **AdAttack:** Implementation is partial/placeholder. Needs verification.
