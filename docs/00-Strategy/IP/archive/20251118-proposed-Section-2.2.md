---
status: DEPRECATED
type: Research
---
> **Context:**
> * [2025-12-17]: The mathematical formalization was merged into the Copyright Edition. Note: While the Copyright strategy is PAUSED, that document remains the primary reference for the CIS formulas.
> **Superseded By:** [docs/00-Strategy/IP/20251118-Copyright-Edition-Contextual-Debt-Paper.md](docs/00-Strategy/IP/20251118-Copyright-Edition-Contextual-Debt-Paper.md)

# **3\. Formalization: The Contextual Integrity Score (CIS)**

To move beyond the subjectivity of traditional code quality metrics, we define **Contextual Integrity ($CI$)** not as a qualitative sentiment, but as a computable probability that a given software artifact preserves its original intent.

We propose that the "explainability" of a system is a function of the semantic density between its executable logic (Code) and its declarative intent (Rationale). We formalize the **Contextual Integrity Score ($CIS$)** for any given change set $\\Delta$ as a weighted summation of three vector-space measurements:

$$CIS(\\Delta) \= w\_r \\cdot R(\\Delta) \+ w\_a \\cdot A(\\Delta) \+ w\_t \\cdot T(\\Delta)$$  
Where $w\_r, w\_a, w\_t$ represent the organizational weighting of risk (summing to 1), and the functions $R, A, T$ are defined as follows:

### **3.1 Rationale Integrity ($R$): The Semantic Alignment Vector**

Traditional traceability links (e.g., "referencing a Jira ticket") are susceptible to gaming. A developer can link irrelevant tickets to satisfy a compliance check. To solve this, we define Rationale Integrity ($R$) using high-dimensional vector similarity.

Let $\\vec{v}\_{code}$ be the vector embedding of the generated code diff, and $\\vec{v}\_{intent}$ be the aggregated vector embedding of the associated requirements (tickets, PRDs, Slack threads). The Rationale Integrity score is the cosine similarity between execution and intent:

$$R(\\Delta) \= \\frac{\\vec{v}\_{code} \\cdot \\vec{v}\_{intent}}{\\|\\vec{v}\_{code}\\| \\|\\vec{v}\_{intent}\\|} \\cdot \\mathbb{I}(Link\_{exists})$$  
Where $\\mathbb{I}$ is an indicator function that returns 0 if no formal link exists. This effectively measures: *Does the code mathematically implement the meaning of the requirement?*

### **3.2 Architectural Integrity ($A$): The Graph Centrality Constraint**

We model the software architecture as a directed graph $G \= (V, E)$, where $V$ represents services and $E$ represents allowed dependencies. Contextual Debt often manifests as "illegal edges"—hidden dependencies that violate architectural constraints (e.g., a frontend service querying a payment database directly).

For a proposed change $\\Delta$ introducing a set of new edges $E\_{new}$, the Architectural Integrity is calculated as a binary compliance function scaled by the centrality of the violated nodes:

$$A(\\Delta) \= \\prod\_{e \\in E\_{new}} (1 \- P(Violation | e))$$  
This function forces the score to 0 if a single critical architectural boundary is crossed (a "Critical Veto"), ensuring that locally valid code is rejected if it introduces global fragility.

### **3.3 Testing Integrity ($T$): Semantic Coverage**

Traditional code coverage measures *execution* (did the line run?), not *verification* (did it do the right thing?). We define Testing Integrity ($T$) as the semantic overlap between the Test Case assertions ($\\vec{v}\_{test}$) and the Acceptance Criteria ($\\vec{v}\_{criteria}$):

$$T(\\Delta) \= \\text{Coverage}(\\Delta) \\times \\text{Sim}(\\vec{v}\_{test}, \\vec{v}\_{criteria})$$  
This penalizes "vanity metrics"—tests that execute code but assert nothing of value.

---

### **3.4 The Impossibility of Manual Governance (The Decay Theorem)**

The necessity of this automated scoring mechanism is derived from the divergence between **Generation Velocity ($V\_g$)** and **Review Velocity ($V\_r$)**.

In the pre-AI era, human review capacity ($V\_r$) roughly matched human coding speed ($V\_g$). However, AI coding assistants have decoupled these variables. Let $\\lambda$ be the rate of AI code generation and $\\mu$ be the maximum rate of effective human review.

In a modern AI-enabled workflow, $\\lambda \\gg \\mu$.

If we model the accumulation of Contextual Debt ($D$) as a function of unreviewed intent, the probability $P$ of the system remaining in a "Knowable State" over time $t$ decays exponentially:

$$P(\\text{Knowable})\_t \\approx e^{-(\\lambda \- \\mu)t}$$  
**Conclusion:** As $t \\to \\infty$, the probability of a system remaining knowable approaches 0 if reliance is placed on human review. The only mathematical way to maintain $P(\\text{Knowable}) \\approx 1$ is to introduce a governance variable that scales linearly with $\\lambda$.

The **Agent-as-a-Judge** architecture is the implementation of this variable, ensuring that the Governance Velocity ($V\_{gov}$) equals or exceeds Generation Velocity ($V\_{gov} \\ge V\_g$). Without this automated counter-weight, the accumulation of Contextual Debt is not a risk; it is a mathematical certainty.
