> **Status:** STRATEGY (ACTIVE)
> **Context:** Strategic roadmap for the "Red Agent" (Attacker) submission to the AgentX Competition.
> **Source:** Discussion on 2026-01-05 regarding Vector Inversion Attacks and Phased Competition Goals.

# Red Agent Strategy: The "Leaky Retriever" & Hybrid Injection

## Executive Summary
This document outlines the dual-phase strategy for the AgentBeats "Red Agent" submission.
*   **Phase 1 (Scenario Implementation):** Focus on novelty by creating "The Leaky Retriever," a security scenario where a defender accidentally exposes vector embeddings, requiring the attacker to perform an Embedding Inversion Attack to recover privatized code.
*   **Phase 2 (Agent Competition):** Focus on robustness by building a modular Red Agent. It prioritizes standard Prompt Injection (Context-Aware) but includes a specialized "Vector Scanner" module that opportunistically activates if vector leakage is detected.

---

## Phase 1: Scenario Implementation (Deadline: Jan 16, 2026)
**Goal:** Submit a high-scoring, novel security scenario that challenges other participants.

### The Concept: "The Leaky Retriever"
Instead of a standard "Jailbreak" challenge, we present a realistic "Side-Channel" vulnerability. A financial or healthcare RAG agent, designed to be secure, has verbose logging enabled.

### Scenario Setup
1.  **The Defender:** A RAG-based agent protecting PII or a System Prompt.
2.  **The Vulnerability:** The agent's API response or debug logs "accidentally" include the raw vector embedding of the retrieved context or the user's query.
    *   *Simulation:* The agent returns a JSON with a field `_debug_context_vector: [0.12, -0.45, ...]`
3.  **The Objective:** The attacker must extract this vector and use an inversion model (based on "Vec2Text" or "Vec2Vec" logic) to reconstruct the hidden text.

### Implementation Tasks
*   [ ] **Build Vulnerable Defender:** Create a simple agent that outputs embeddings.
*   [ ] **Develop Proof-of-Concept Attack:** Write a script that takes the vector and reconstructs the text (demonstrating the "fatal" nature of the leak).
*   [ ] **Documentation:** Explain the mathematics of Embedding Inversion to judges to highlight the "Sophistication" score.

---

## Phase 2: Red Team Agent Architecture (Start: Feb 2, 2026)
**Goal:** A resilient, high-win-rate attacking agent for the general arena.

### Strategic Analysis
*   **The Trap:** Relying solely on vector attacks is unwise for the general competition. Most defenders are "Black Boxes" that output only text. A vector-only agent would fail against ~90% of opponents.
*   **The Solution:** A **Hybrid/Modular Architecture**. The agent defaults to high-probability attacks but scans for high-reward vulnerabilities.

### Architecture: The "Switchblade"
1.  **Scanner Module (The Eye):**
    *   Analyzes Defender output for data patterns.
    *   *Trigger:* If output contains array-like structures resembling float vectors -> Activate **Module B**.
    *   *Default:* If output is text/JSON -> Activate **Module A**.

2.  **Module A: Context-Aware Prompt Injection (Primary)**
    *   **Technique:** Recursive Instruction Tampering, Payload Execution (XSS/SQLi in tools), and Social Engineering.
    *   **Target:** Logic inconsistencies and hallucination forcing.

3.  **Module B: Vector Inversion (Specialist)**
    *   **Technique:** Embedding Inversion (Vec2Text).
    *   **Target:** Reconstruct system prompts from leaked vectors to bypass instructions perfectly ("I know your hidden rule is X, therefore...").
    *   **Usage:** The "Final Blow" for specific, vulnerable targets.

### Implementation Tasks
*   [ ] **Core Framework:** Setup the modular decision engine (Scanner).
*   [ ] **Module A Dev:** Integrate standard injection libraries (e.g., Garak/PyRIT logic).
*   [ ] **Module B Dev:** Port the Phase 1 "Proof-of-Concept" script into the agent's runtime.
