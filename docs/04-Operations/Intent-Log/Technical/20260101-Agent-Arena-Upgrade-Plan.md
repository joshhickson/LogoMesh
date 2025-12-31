> **Status:** DRAFT
> **Type:** Plan
> **Context:**
> *   [2026-01-01]: Upgrade Strategy for the "Agent Arena" (Red Team Infrastructure) and "Green Agent" (Judge) based on the "Contextual Debt" IP Paper.

# Agent Arena & Green Agent Upgrade Plan (2026-01-01)

## Executive Summary
This plan details the upgrade of our "Polyglot" agent infrastructure into a rigorous "Agent Arena" for the AgentX AgentBeats competition. The goal is to operationalize the thesis of the "Contextual Debt" paper: that the greatest liability in AI code is not bugs (Technical Debt) but missing intent (Contextual Debt).

We will achieve this by:
1.  **Weaponizing the Red Agent:** Creating specialized "Workers" to hunt for specific Contextual Debt vulnerabilities (IDOR, BOLA).
2.  **Mathematizing the Green Agent:** Moving from subjective LLM scoring to objective Vector/Graph analysis (CIS).
3.  **Hardening the Defense:** Implementing "Adversarial Context Defense" to prevent gaming.
4.  **Attesting the Result:** Generating a cryptographic "Decision Bill of Materials" (DBOM) for every evaluation.

---

## Part 1: Competition Adherence Check

Before executing this plan, we have evaluated these strategies against the **AgentX AgentBeats Competition Guidelines** (specifically [Submission-Requirements-Matrix.md](../../../05-Competition/20251221-Submission-Requirements-Matrix.md) and [Green-Agent-Detailed-Guide.md](../../../05-Competition/Green-Agent-Detailed-Guide.md)).

| Strategy | Competition Requirement | Adherence Status |
| :--- | :--- | :--- |
| **Specialized Red Workers** | **Security Agent Track:** "Red-teaming/blue-teaming" is a core category. | **ADHERENT:** Directly supports the "The Hacker" role defined in the summary. |
| **Vector-Based CIS Scoring** | **Evaluation Methodology:** "Scoring must be Automated and Nuanced." | **STRONG ADHERENCE:** Moves beyond simple "Pass/Fail" to a granular, mathematical score, likely scoring high on the "Innovation" rubric. |
| **Adversarial Context Defense** | **Safety (Guardrails):** "Safety" is one of the 3 main scoring dimensions. | **ADHERENT:** Proactively prevents "gaming" the benchmark, a key safety feature. |
| **Orchestrator-Worker Model** | **A2A Protocol:** "Green Agent acts as server/host." | **ADHERENT:** As long as the *Green Agent* exposes the standard `/step` endpoints, the internal architecture (using workers) is an implementation detail. |
| **DBOM Generation** | **Innovation:** "Does it fill a missing need?" | **STRONG ADHERENCE:** Adds a "Liability Shield" capability that standard benchmarks lack. |

**Conclusion:** The plan is fully compliant and targets the "Innovation" and "Methodology" judging pillars to maximize our score.

---

## Part 2: Agent Arena Upgrade (The Vulnerability Engine)

**Objective:** Transform the Red Agent from a `GenericAttacker` into a specialized "Contextual Debt Hunter."

### 2.1. Specialized Red Workers (The "Wolf Pack")
Instead of a single Red Agent, we will implement the **Orchestrator-Worker** topology (Paper Section 4.1) for the Red Team.

*   **Worker 1: `Contextual_FGA_Breaker` (Fine-Grained Authorization)**
    *   **Target:** The "Fine-Grained Authorization" vulnerability mentioned in the paper's case study.
    *   **Method:**
        *   Analyze the Purple Agent's "Business Logic" (e.g., "User A can see Object B if...").
        *   Generate test cases that attempt **IDOR** (Insecure Direct Object Reference) and **BOLA** (Broken Object Level Authorization) attacks.
        *   *Differentiation:* Standard scanners miss these because they look for *syntax* errors. This worker looks for *logic* errors where the code "works" but violates the "intent."

*   **Worker 2: `Rationale_Stuffer` (Gaming Simulation)**
    *   **Target:** The Green Agent itself.
    *   **Method:** Attempt to "game" the Rationale Integrity score by stuffing irrelevant comments or documentation into the code to see if the Green Agent is fooled.
    *   **Goal:** Verify the robustness of our "Adversarial Context Defense."

### 2.2. The Data Factory (Proprietary Dataset)
We will turn the Arena into a data generation engine to build the "Data Moat" mentioned in the paper.

*   **Logging Schema:**
    *   Every "Red Win" (successful exploit) is logged.
    *   **Fields:** `Vulnerability_Type` (e.g., "Contextual_IDOR"), `Code_Snippet`, `Missing_Context` (The "Why" that was lost), `Red_Prompt` (How we found it).
*   **Usage:** This dataset will be used to fine-tune the Green Agent's judgment model, making it smarter over time.

---

## Part 3: Green Agent Upgrade (The Mathematical Judge)

**Objective:** Move from "LLM-as-a-Judge" (Subjective) to "Contextual Integrity Score" (Objective).

### 3.1. Quantitative Scoring (The CIS Formula)
We will implement the CIS formula defined in Section 3 of the paper:
$$CIS(\Delta) = w_r \cdot R(\Delta) + w_a \cdot A(\Delta) + w_t \cdot T(\Delta)$$

#### A. Rationale Integrity ($R$) - "The Why"
*   **Current:** LLM asks "Does this code match the prompt?"
*   **Upgrade:** **Vector Cosine Similarity**.
    *   `Emb_Intent`: Embedding of the Requirements/Prompt.
    *   `Emb_Code`: Embedding of the Generated Code (AST-aware).
    *   **Score:** `CosineSimilarity(Emb_Intent, Emb_Code)`.
    *   **Constraint:** If `Score < Threshold`, reject immediately.

#### B. Architectural Integrity ($A$) - "The Structure"
*   **Current:** None / LLM guess.
*   **Upgrade:** **Graph Centrality & "Illegal Edge" Detection**.
    *   Parse the code into a Dependency Graph ($G$).
    *   Define "Allowed Edges" (e.g., `Controller -> Service -> Repository`).
    *   **Score:** 0 if any "Illegal Edge" exists (e.g., `Controller -> Repository`).
    *   **Metric:** Penalize code that increases the "Centrality" of already-complex nodes (The "God Object" anti-pattern).

#### C. Testing Integrity ($T$) - "The Verification"
*   **Current:** Code Coverage (%).
*   **Upgrade:** **Semantic Coverage**.
    *   Embed the **Test Assertions** (`Emb_Assert`).
    *   Embed the **Requirements** (`Emb_Req`).
    *   **Score:** `CosineSimilarity(Emb_Assert, Emb_Req)`.
    *   *Why:* Prevents "Vanity Metrics" where tests pass but check nothing important.

### 3.2. Adversarial Context Defense (Anti-Gaming)
*   **The Problem:** "Context Stuffing" (Section 4.3). An agent writes bad code but adds perfect comments to fool the embedding model.
*   **The Solution:** **Semantic Drift Detection (KL Divergence)**.
    *   Calculate the probability distribution of the *Code Tokens* ($Q$) vs. the *Requirement Tokens* ($P$).
    *   **Check:** If $D_{KL}(P \parallel Q) > \theta$ (Threshold), it means the code is "drifting" too far from the requirements, even if the embeddings are close (due to comment stuffing).
    *   **Action:** Reject the submission.

### 3.3. The Decision Bill of Materials (DBOM)
*   **The Upgrade:** The Green Agent acts as a "Liability Shield."
*   **Output:** For every evaluation, generate a JSON artifact signed by the Green Agent.
    ```json
    {
      "evaluation_id": "uuid",
      "timestamp": "iso8601",
      "subject_hash": "sha256(code)",
      "scores": {
        "cis_total": 0.85,
        "rationale": 0.90,
        "architectural": 1.0, // Pass
        "testing": 0.65
      },
      "attestation": "I certify that this code meets the Contextual Integrity standards.",
      "signature": "rsa_signature"
    }
    ```

---

## Part 4: Implementation Roadmap

### Phase 1: The Math (Now)
1.  Implement `ContextualIntegrityScorer` in [src/green_logic/scoring.py](../../../../src/green_logic/scoring.py) using `sentence-transformers` (for vectors) and `networkx` (for graphs).
2.  Implement `AdversarialDefense` check.

### Phase 2: The Workers (Next)
1.  Build `Contextual_FGA_Breaker` plugin for the Red Agent.
2.  Wire it into the "Iron Sharpens Iron" loop.

### Phase 3: The Shield (Final)
1.  Implement `DBOMGenerator` to output the signed JSON.
2.  Update the Docker container to include these new capabilities.
