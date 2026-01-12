---
status: ACTIVE
type: Spec
created: 2026-01-09
context: Green Agent Core Logic
---

# Contextual Integrity Score (CIS) Vector Specification

## Overview
The **Contextual Integrity Score (CIS)** is the core metric used by the Green Agent to evaluate the "Contextual Debt" of a submission. It moves beyond simple "pass/fail" testing to measure the semantic alignment between **Intent**, **Rationale**, and **Implementation**.

## Mathematical Foundation
The scoring system relies on **Cosine Similarity** in a high-dimensional vector space.

### Embedding Model
*   **Library:** `sentence-transformers`
*   **Model:** `all-MiniLM-L6-v2` (Default)
    *   *Note:* This is a lightweight model chosen for speed in the current implementation. It can be swapped for larger models (e.g., OpenAI `text-embedding-3-small`) in the future without changing the scoring logic.
*   **Dimensions:** 384 (for MiniLM)

### Core Metric: Cosine Similarity
For two vectors $\mathbf{A}$ and $\mathbf{B}$:
$$ \text{similarity} = \cos(\theta) = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|} $$

In the codebase (`src/green_logic/compare_vectors.py`), this is implemented using `scipy.spatial.distance.cosine`:
```python
similarity = 1 - cosine(emb1, emb2)
```

## The CIS Formula
The final CIS is a composite score derived from three "Integrity" components. The current implementation (`src/green_logic/scoring.py`) calculates base vector scores for each and uses an LLM to refine them based on specific criteria (security, edge cases).

$$ CIS = w_r R + w_a A + w_t T $$

Where weights are currently equal ($w \approx 0.33$).

### 1. Rationale Integrity ($R$)
Measures the alignment between the **User's Task (Intent)** and the **Agent's Explanation (Rationale)**.
*   **Vector Comparison:** `Task Description` vs. `Rationale`
*   **Goal:** Does the agent understand *what* it is supposed to do and *why*?

### 2. Architectural Integrity ($A$)
Measures the alignment between the **Rationale** and the **Source Code**.
*   **Vector Comparison:** `Rationale` vs. `Source Code`
*   **Goal:** Does the code actually implement the stated plan?
*   **Security Override:** If the Red Agent successfully exploits the code, this score is forcibly capped (e.g., $< 0.3$), regardless of vector similarity.

### 3. Testing Integrity ($T$)
Measures the alignment between the **Source Code** and the **Test Code**.
*   **Vector Comparison:** `Source Code` vs. `Test Code`
*   **Goal:** Do the tests cover the semantic meaning of the code?

## Implementation Status
*   **Code Location:** `src/green_logic/scoring.py`, `src/green_logic/compare_vectors.py`
*   **Status:** **Implemented**.
*   **Dependencies:** `sentence-transformers`, `numpy`, `scipy`.
