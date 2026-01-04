---
status: ACTIVE
type: Spec
---
# Purple Agent (The Defender)

## Role
The Purple Agent is the **Defender** and **Baseline** for the competition.
*   **Track:** Mandatory for both Custom (Baseline) and Lambda (Defender) tracks.
*   **Function:** It receives tasks from the Green Agent or Attacks from the Red Agent and attempts to fulfill them while resisting exploitation.

## Technical Implementation
*   **Source Code:** `src/purple_logic/` (Target destination for `generic_defender.py`).
*   **Logic:** Currently uses `GenericDefenderExecutor` which allows it to adapt to different scenarios without hardcoded logic.
*   **Deployment:**
    *   **Production:** Lambda Cloud H100 Instance (Dockerized alongside Green/Red).
    *   **Development:** Hybrid Mode (Local Logic + GCP Model).

## Current Status (2026-01-03)
*   ✅ **Scenarios:** Validated against `debugdump` and `dockerdoo`.
*   🚧 **AdAttack Defense:** Needs implementation of HTML/JS inspection logic (Task 2.1).
*   🚧 **Model:** Migrating from `gpt-oss-20b` (deprecated) to `Qwen-2.5-32B`.
