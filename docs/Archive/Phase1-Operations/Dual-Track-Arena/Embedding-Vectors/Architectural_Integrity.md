---
status: DRAFT
type: Spec
---
> **Context:**
> *   [2025-12-31]: Definition of Current vs. Future state for Architectural Integrity.

# Architectural Integrity ($A$): Implementation Roadmap

**Architectural Integrity** measures the adherence of the code to the system's structural constraints and security boundaries. It answers the question: *Does this change introduce illegal dependencies or structural vulnerabilities?*

---

## 1. Current State: LLM-as-a-Judge + Red Agent Audit (Qualitative)

Currently, `src/green_logic/scoring.py` uses a combination of LLM evaluation and the Red Agent's audit results to approximate this score.

*   **Mechanism:**
    1.  **LLM Evaluation:** The LLM reviews the code structure for efficiency and patterns.
    2.  **Red Agent Veto:** If the Red Agent successfully exploits the code, the score is heavily penalized (capped at < 0.5).
*   **Prompt Instruction:** "Is the code well-structured and efficient? **CRITICAL:** Did the Red Agent find a vulnerability?"
*   **Pros:** Directly incorporates "real-world" security testing via the Red Agent.
*   **Cons:** The "structure" evaluation by the LLM is subjective and doesn't strictly enforce architectural boundaries (e.g., "Frontend cannot talk to DB directly").

### Current Code Snippet (`src/green_logic/scoring.py`)
```python
# Conceptual representation
if red_agent_success:
    architecture_score = min(llm_score, 0.4) # Heavy penalty
else:
    architecture_score = llm_score
```

---

## 2. Future State: Graph Centrality Constraint (Quantitative)

The target state is to model the software architecture as a **Directed Graph** $G = (V, E)$ and mathematically calculate the integrity based on graph topology.

*   **Mechanism:** Analyze the code to extract the dependency graph. Compare new edges ($E_{new}$) against a set of allowed architectural constraints.
*   **Formula:**
    $$A(\Delta) = \prod_{e \in E_{new}} (1 - P(Violation | e))$$

### Implementation Details

#### A. The Graph Model ($G$)
1.  **Nodes ($V$):** Services, Modules, or Classes (e.g., `PaymentService`, `UserDB`).
2.  **Edges ($E$):** Dependencies or Calls (e.g., `PaymentService` calls `UserDB`).
3.  **Constraints:** A policy file defining allowed edges (e.g., "Layered Architecture: Presentation -> Business -> Data").

#### B. The Calculation
1.  **Static Analysis:** Use tools like `pydeps` or AST parsing to identify all imports and function calls in the new code ($\Delta$).
2.  **Edge Detection:** Identify the set of new edges $E_{new}$ introduced by the change.
3.  **Violation Probability ($P(Violation)$):**
    *   If an edge exists in the "Allowed List", $P=0$.
    *   If an edge is explicitly "Forbidden", $P=1$.
    *   If an edge is ambiguous, $P$ scales with the **Centrality** of the target node (touching a core component is riskier than a leaf node).

#### C. The "Critical Veto"
The product formula $\prod (1 - P)$ ensures that a single critical violation ($P=1$) drives the entire Architectural Integrity score to 0. This mathematically enforces the "Red Agent Veto" concept: if a security boundary is crossed, the architecture is invalid, no matter how pretty the code is.

---

## 3. Migration Plan

To move from Current to Future state in the Security Arena:

1.  **Dependency Mapping:** Create a tool (or use an existing one) to generate a dependency graph of the submitted code.
2.  **Policy Definition:** Define a simple `architecture_policy.yaml` for the arena tasks (e.g., "Solution must not import `os` or `subprocess`").
3.  **Hybrid Scoring:**
    *   Keep the Red Agent Veto (it is a practical proof of vulnerability).
    *   Add the Static Analysis check.
    *   Final Score = `Red_Agent_Factor * Graph_Compliance_Factor`.
