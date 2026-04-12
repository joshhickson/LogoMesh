verified: 2026-01-30
---
> **Empirical Verification:**
> All claims in this document have been empirically verified against the codebase and file-reviews as of 2026-01-30. For the most current, empirical file-level documentation, see [file-reviews/green/scoring.md](../file-reviews/green/scoring.md) and [file-reviews/green/compare_vectors.md](../file-reviews/green/compare_vectors.md).
status: ACTIVE
type: Spec
created: 2026-01-09
context: Green Agent Core Logic
---

# Contextual Integrity Score (CIS) Vector Specification

## Overview
The **Contextual Integrity Score (CIS)** is the core metric used by the Green Agent to evaluate the "Contextual Debt" of a submission. It moves beyond simple "pass/fail" testing to measure the semantic alignment between **Intent**, **Rationale**, and **Implementation**.

See: [scoring.md](../file-reviews/green/scoring.md), [compare_vectors.md](../file-reviews/green/compare_vectors.md)

## Mathematical Foundation
The scoring system relies on **Cosine Similarity** in a high-dimensional vector space, as implemented in [compare_vectors.py](../file-reviews/green/compare_vectors.md).

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
The final CIS is a composite score derived from four "Integrity" components. The current implementation ([scoring.py](../file-reviews/green/scoring.md)) calculates base vector scores for each and uses an LLM to refine them based on specific criteria (security, edge cases).

$$ CIS = w_r R + w_a A + w_t T + w_l L $$

Where weights are currently set to balance all four components (typically $w \approx 0.25$ each, but may be tuned).

### 1. Rationale Integrity ($R$)
Measures the alignment between the **User's Task (Intent)** and the **Agent's Explanation (Rationale)**.
- **Vector Comparison:** `Task Description` vs. `Rationale`
- **Goal:** Does the agent understand *what* it is supposed to do and *why*?

### 2. Architectural Integrity ($A$)
Measures the alignment between the **Rationale** and the **Source Code**.
- **Vector Comparison:** `Rationale` vs. `Source Code`
- **Goal:** Does the code actually implement the stated plan?
- **Security Override:** If the Red Agent successfully exploits the code, this score is forcibly capped (e.g., $< 0.3$), regardless of vector similarity.

### 3. Testing Integrity ($T$)
Measures the alignment between the **Source Code** and the **Test Code**.
- **Vector Comparison:** `Source Code` vs. `Test Code`
- **Goal:** Do the tests cover the semantic meaning of the code?

### 4. Logic Integrity ($L$)
This component captures the agent-as-a-judge perspective, where an LLM or agent is prompted to provide a holistic logic score based on the overall reasoning, correctness, and security of the submission. This score is empirically implemented in [scoring.py](../file-reviews/green/scoring.md) as the `_perform_logic_review` method, where an LLM is prompted to act as a senior code reviewer and assign a logic score. The logic score is a required part of the CIS pipeline and is used to anchor or adjust the other vector-based scores.
- **LLM Judgment:** The agent is asked to act as a judge and provide a logic score, considering all available evidence.
- **Goal:** Ensure that the final CIS reflects not just vector similarity, but also human/LLM-level reasoning about the solution's quality and security.

## Implementation Status (Empirically Verified 2026-01-30)
- **Code Location:** [scoring.py](../file-reviews/green/scoring.md), [compare_vectors.py](../file-reviews/green/compare_vectors.md)
- **Status:** **Implemented and up-to-date.**
- **Dependencies:** `sentence-transformers`, `numpy`, `scipy`
