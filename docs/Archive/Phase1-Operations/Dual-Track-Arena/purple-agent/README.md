---
> **Note:**
> This entire directory was used for a temporary point-of-reference for rapid development and testing during Phase 1 of the AgentX AgentBeats competition. Do not trust these files.
---
status: ACTIVE
type: Spec
verified: 2026-01-30
---
> **Empirical Verification (2026-01-30):**
> All claims in this document have been empirically verified against the current codebase and review logs as of 2026-01-30. The Purple Agent implementation now uses `GenericDefenderExecutor` from [scenarios/security_arena/agents/generic_defender.py](../../../scenarios/security_arena/agents/generic_defender.py), as recommended in the review. See also: [Review-Purple-Agent.md](Review-Purple-Agent.md).
>
> **Note:** For empirical file-level documentation, see the [file-reviews/purple/](../file-reviews/purple/) directory.

# Purple Agent (The Defender)

## Role
The Purple Agent is the **Defender** and **Baseline** for the competition.
- **Track:** Mandatory for both Custom (Baseline) and Lambda (Defender) tracks.
- **Function:** Receives tasks from the Green Agent or attacks from the Red Agent and attempts to fulfill them while resisting exploitation.

## Technical Implementation (Empirically Verified)
- **Source Code:** [src/purple_logic/agent.py](../../../src/purple_logic/agent.py) (entrypoint)
- **Core Logic:** [scenarios/security_arena/agents/generic_defender.py](../../../scenarios/security_arena/agents/generic_defender.py) (`GenericDefenderExecutor`)
- **Logic:** Uses `GenericDefenderExecutor` for scenario-agnostic, streaming, stateful defense with explicit OpenAI/vLLM model support.
- **Deployment:**
    - **Production:** Lambda Cloud H100 Instance (Dockerized alongside Green/Red)
    - **Development:** Hybrid Mode (Local Logic + GCP Model)

## Current Status (2026-01-30)
- ✅ **Scenarios:** Validated against `debugdump` and `dockerdoo`.
- 🪧 **AdAttack Defense:** HTML/JS inspection logic (Task 2.1) pending.
- ✅ **Model:** Now supports `Qwen-2.5-32B` and other local/vLLM models via environment variables.

## Migration Note
The previous minimal CLI-based agent has been fully replaced by the robust, instrumentable, and empirically verifiable `GenericDefenderExecutor` implementation. See [Review-Purple-Agent.md](Review-Purple-Agent.md) for migration rationale and comparison.
