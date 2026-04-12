---
status: DRAFT
type: Spec
---
> **Context:**
> *   [2025-12-31]: Definition of Current vs. Future state for Testing Integrity.

# Testing Integrity ($T$): Implementation Roadmap

**Testing Integrity** measures the quality and relevance of the tests provided with the code. It answers the question: *Do the tests actually verify the intent, or are they just "vanity metrics" that run lines of code without asserting value?*

---

## 1. Current State: LLM-as-a-Judge (Qualitative)

Currently, `src/green_logic/scoring.py` uses an LLM to review the provided `testCode`.

*   **Mechanism:** The LLM reads the test code and the requirements.
*   **Prompt Instruction:** "Do the tests cover the requirements? Are edge cases handled?"
*   **Output:** A float value between 0.0 and 1.0.
*   **Pros:** Can understand "intent" of a test (e.g., "This test checks for invalid emails").
*   **Cons:** Cannot verify if the tests actually *pass*, nor can it strictly measure coverage. It relies on the LLM's ability to simulate code execution mentally.

### Current Code Snippet (`src/green_logic/scoring.py`)
```python
# Conceptual representation
prompt = f"""
Requirements: {task_description}
Test Code: {test_code}
Evaluate Testing Verification (0.0 - 1.0):
"""
score = llm.predict(prompt)
```

---

## 2. Future State: Semantic Coverage (Quantitative)

The target state combines traditional code coverage with semantic analysis to penalize "assertion-free" tests.

*   **Mechanism:** Execute the tests to measure code coverage, then use vector embeddings to measure the semantic overlap between Test Assertions and Acceptance Criteria.
*   **Formula:**

$$T(\Delta) = \text{Coverage}(\Delta) \times \text{Sim}(\vec{v}_{test}, \vec{v}_{criteria})$$

### Implementation Details

#### A. Code Coverage ($\text{Coverage}(\Delta)$)
1.  **Execution:** Run the provided `testCode` against the `sourceCode` using a tool like `pytest` with `coverage.py`.
2.  **Metric:** Extract the percentage of lines covered (0.0 to 1.0).
3.  **Constraint:** If tests fail, Coverage = 0.

#### B. Semantic Similarity ($\text{Sim}(\vec{v}_{test}, \vec{v}_{criteria})$)
1.  **Extraction:** Parse the `testCode` to extract the **Assertions** (e.g., `assert result == False`, `expect(x).toBe(y)`).
2.  **Embedding:** Generate a vector embedding for the extracted assertions ($\vec{v}_{test}$).
3.  **Comparison:** Compare this against the vector embedding of the Task Requirements ($\vec{v}_{criteria}$).
4.  **Goal:** This ensures that the tests are checking the specific conditions requested (e.g., "must contain @ symbol"), rather than just running the code to bump up coverage numbers.

#### C. The Combined Score

$$T = \text{Coverage_Percentage} \times \text{Cosine_Similarity}(\text{Assertions}, \text{Requirements})$$

*   **Scenario 1 (Good):** 100% coverage + Tests check all requirements. $T = 1.0 \times 1.0 = 1.0$.
*   **Scenario 2 (Vanity):** 100% coverage + Tests have no assertions (just run the function). $T = 1.0 \times 0.1 = 0.1$.
*   **Scenario 3 (Broken):** Tests fail. $T = 0$.

---

## 3. Migration Plan

To move from Current to Future state in the Security Arena:

1.  **Test Runner:** Implement a secure sandbox (e.g., Docker container or gVisor) to actually *execute* the submitted `testCode`.
2.  **Coverage Tooling:** Integrate `pytest-cov` (Python) or `nyc` (Node.js) into the runner.
3.  **Assertion Parser:** Write a simple AST parser to extract assertion statements from the test code.
4.  **Integration:** Update `scoring.py` to use the execution results and embedding similarity instead of the raw LLM judgment.
