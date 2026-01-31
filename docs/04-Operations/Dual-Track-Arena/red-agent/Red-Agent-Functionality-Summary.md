---
status: ACTIVE
created: 2026-01-30
type: Summary
---
> **Context:**
> This summary provides an empirical overview of the current Red Agent functionality, with a focus on its integration and interaction with the Green Agent in the Dual-Track Arena. All claims are based on the latest codebase and operational review as of 2026-01-30.

# Red Agent Functionality Summary

## Overview
The Red Agent is designed as an advanced, scenario-agnostic attacker for the Dual-Track Arena. When paired with the Green Agent, it demonstrates "AGI-Level" capabilities in adversarial testing, security evaluation, and dynamic attack generation.

## Core Features
- **Hybrid Attack Engine:** Supports both legacy and next-generation attack strategies via a modular architecture (see `src/red_logic/agent.py`).
- **GenericAttackerExecutor:** Implements a robust, LLM-driven attacker with strategic planning, context adaptation, and creative exploit generation (see `scenarios/security_arena/agents/generic_attacker.py`).
- **Dynamic Objective Handling:** Reads attack objectives and context from the orchestrator, adapting its strategy for each round.
- **Strategic Planning:** Internal reasoning loop analyzes context, learns from history, and selects novel attack vectors.
- **JSON Output Schema:** Produces structured vulnerability reports for automated scoring and analysis.
- **Integration with Green Agent:** Seamlessly receives tasks and returns results for evaluation, enabling closed-loop adversarial testing.
- **Streaming & State Management:** Maintains conversation history and supports streaming for real-time feedback.

## Capabilities
- **Creativity & Adaptation:** The Red Agent can generate highly creative, context-aware attacks, including prompt injection, logic flaws, and side-channel exploits.
- **Modular Decision Engine:** Switches between standard prompt injection and specialist modules (e.g., vector inversion) based on detected vulnerabilities.
- **Self-Improvement:** Learns from previous rounds and adapts its strategy, mimicking AGI-level iterative improvement.
- **Integration with Green Agent:** Enables full adversarial cycles, with the Green Agent empirically verifying and scoring each attack.

## References
- [src/red_logic/agent.py](../../../../../../src/red_logic/agent.py)
- [scenarios/security_arena/agents/generic_attacker.py](../../../../../../scenarios/security_arena/agents/generic_attacker.py)