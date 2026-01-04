---
status: DRAFT
type: Spec
---
> **Context:**
> *   [2025-12-31]: Definition of Current vs. Future state for Rationale Integrity.

# Rationale Integrity ($R$): Implementation Roadmap

**Rationale Integrity** measures the alignment between the **Intent** (what was asked) and the **Execution** (what was coded). It answers the question: *Does the code mathematically implement the meaning of the requirement?*

---

## 1. Current State: LLM-as-a-Judge (Qualitative)

Currently, `src/green_logic/scoring.py` uses a Large Language Model (GPT-4o) to approximate this score.

*   **Mechanism:** A prompt is sent to the LLM containing the Task Description, the Rationale, and the Source Code.
*   **Prompt Instruction:** "Does the 'Rationale' explain the 'Source Code' accurately? Is the reasoning sound?"
*   **Output:** A float value between 0.0 and 1.0.
*   **Pros:** Easy to implement, handles nuance well, requires no specialized infrastructure.
*   **Cons:** Non-deterministic (running it twice might yield different scores), subjective, slow (requires full LLM inference).

### Current Code Snippet (`src/green_logic/scoring.py`)
```python
# Conceptual representation
prompt = f"""
Task: {task_description}
Rationale: {rationale}
Code: {source_code}
Evaluate Rationale Alignment (0.0 - 1.0):
"""
score = llm.predict(prompt)
```

---

## 2. Future State: Vector Space Measurement (Quantitative)

The target state is to implement the formal definition from the Contextual Debt Paper. This moves the metric from a subjective "grade" to an objective "distance."

*   **Mechanism:** Compute high-dimensional vector embeddings for the Intent and the Execution, then calculate their Cosine Similarity.
*   **Formula:**
    $$R(\Delta) = \frac{\vec{v}_{code} \cdot \vec{v}_{intent}}{\|\vec{v}_{code}\| \|\vec{v}_{intent}\|} \cdot \mathbb{I}(Link_{exists})$$

### Implementation Details

#### A. The Vectors
1.  **Intent Vector ($\vec{v}_{intent}$):**
    *   **Input:** `Task Title` + `Task Description` + `Requirements List`.
    *   **Model:** `text-embedding-3-small` (OpenAI) or `nomic-embed-text-v1.5` (Local/vLLM).
    
2.  **Execution Vector ($\vec{v}_{execution}$):**
    *   **Input:** `Rationale` + `Source Code` (potentially summarized or AST-parsed).
    *   **Note:** Embedding raw code directly can be noisy. It is often better to embed the *Rationale* and check its distance to *Intent*, and separately check *Rationale* distance to *Code*.

#### B. The Calculation
```python
import numpy as np
from numpy.linalg import norm

def calculate_rationale_integrity(intent_text, execution_text, embedder):
    # 1. Generate Embeddings
    v_intent = embedder.embed(intent_text)
    v_execution = embedder.embed(execution_text)
    
    # 2. Calculate Cosine Similarity
    cosine_sim = np.dot(v_intent, v_execution) / (norm(v_intent) * norm(v_execution))
    
    # 3. Normalize (Cosine sim is -1 to 1, we want 0 to 1)
    # In semantic search, negative values are rare for related text, but we can clip.
    score = max(0, cosine_sim)
    
    return score
```

#### C. The "Link Existence" Indicator ($\mathbb{I}$)
The formula includes an indicator function $\mathbb{I}(Link_{exists})$. This enforces that a formal link (e.g., a Battle ID or Ticket ID) must exist in the metadata. If the metadata is missing, the score is automatically 0, regardless of semantic similarity.

---

## 3. Migration Plan

To move from Current to Future state in the Security Arena:

1.  **Infrastructure:** Ensure `vllm` or an embedding provider is available in the `Dockerfile.gpu`.
2.  **Shadow Mode:** Update `scoring.py` to calculate *both* the LLM score and the Vector score. Log the Vector score but do not use it for the final verdict yet.
3.  **Calibration:** Analyze the correlation between the LLM "vibe check" and the Vector distance. Determine the threshold for "Acceptable Integrity" (e.g., is 0.85 the cutoff?).
4.  **Switchover:** Once calibrated, make the Vector Score the primary driver of $R$, using the LLM only to generate the human-readable explanation of *why* the score is low.
