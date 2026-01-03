> **Status:** ACTIVE
> **Type:** Plan
> **Context:**
> *   [2025-12-31]: Roadmap for upgrading CIS from qualitative to quantitative.

# Embedding Vectors Roadmap

This directory tracks the technical roadmap for upgrading the **Contextual Integrity Score (CIS)** from its current "LLM-as-a-Judge" implementation to the rigorous "Vector Space" implementation defined in the [Contextual Debt Paper](../../00-Strategy/IP/20251118-Copyright-Edition-Contextual-Debt-Paper.md).

## The Goal: From "Vibe Check" to "Computable Probability"

Currently, the Green Agent uses an LLM (GPT-4o) to "grade" the submission. While effective, this is subjective and non-deterministic. The goal is to move to a mathematical model where "Integrity" is a computable distance between vectors.

## Components

1.  **[Rationale Integrity ($R$)](./Rationale_Integrity.md):** Measuring the semantic distance between Intent and Execution.
2.  **Architectural Integrity ($A$):** (Planned) Measuring graph centrality and illegal edges.
3.  **Testing Integrity ($T$):** (Planned) Measuring semantic coverage of test cases against requirements.

## Implementation Strategy

The transition will happen in phases:
1.  **Phase 1 (Current):** LLM-based approximation (Qualitative).
2.  **Phase 2 (Hybrid):** LLM scoring + Shadow Vector calculation (Data Collection).
3.  **Phase 3 (Vector):** Pure Vector calculation with LLM used only for explanation generation.
