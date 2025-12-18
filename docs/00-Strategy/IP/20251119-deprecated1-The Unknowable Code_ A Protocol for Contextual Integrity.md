> **Status:** SNAPSHOT
> **Type:** Research
> **Context:**
> * [2025-12-17]: Historical snapshot of early theory. Commercial strategies PAUSED.

# **The Unknowable Code: A Protocol for Contextual Integrity in AI-Generated Software**

## **1\. Introduction: The Decoupling of Intent from Implementation**

Contemporary software engineering faces a divergence between code generation velocity and architectural coherence. While "Technical Debt" describes a failure of implementation (the *how*)—often a calculated tradeoff for speed—we identify a distinct and non-linear liability function: **Contextual Debt**. Contextual Debt is defined as the probabilistic decay of system intent over time, resulting in a codebase where the rationale ($R$), architectural constraints ($A$), and domain knowledge ($D$) are no longer retrievable from the implementation ($I$).1

This decoupling is accelerated by the adoption of Large Language Models (LLMs) in development workflows. AI agents generate implementation artifacts ($c$) without necessarily encoding the causal "theory" of the problem, creating a "comprehension debt" where the system's behavior is syntactically correct but semantically opaque. Unlike technical debt, which manifests as friction in modification, Contextual Debt manifests as a loss of system determinism and auditability.1

This paper proposes a formal framework for quantifying this liability through a **Contextual Integrity Score (CIS)** and introduces the **Audit Protocol**, a governance architecture designed to enforce "Proof-of-Intent" within the software supply chain.

## **2\. Mathematical Formalization of Contextual Integrity**

To manage Contextual Debt, we must move beyond qualitative rubrics to a verifiable metric. We define the **Contextual Integrity Score (CIS)** not as a static attribute of code quality, but as a function of the alignment between a discrete code artifact and its governing intent.

### **2.1 The CIS Function**

The Contextual Integrity of a code artifact $c$ is calculated as a weighted summation of three scalar values representing Rationale, Architecture, and Testing integrity.

$$CIS(c) \= \\omega\_r \\cdot R(c, I) \+ \\omega\_a \\cdot A(c, G) \+ \\omega\_t \\cdot T(c, S)$$  
Where:

* $c$ represents the code commit or artifact.  
* $I$ represents the documented Intent (e.g., issue ticket, PR description, ADR).  
* $G$ represents the Architectural Graph (the formal map of allowed dependencies).  
* $S$ represents the Specification or Test Suite.  
* $\\omega\_r, \\omega\_a, \\omega\_t$ are weighting coefficients such that $\\sum \\omega \= 1$.

### **2.2 Rationale Integrity $R(c, I)$**

Rationale Integrity measures the semantic coupling between the code change and its stated purpose. In high-contextual-debt systems, this value approaches zero as code is committed without linkage to business logic.1

We define $R(c, I)$ using vector similarity measures in a high-dimensional semantic space:

$$R(c, I) \= \\cos(\\vec{v}\_c, \\vec{v}\_I) \= \\frac{\\vec{v}\_c \\cdot \\vec{v}\_I}{\\|\\vec{v}\_c\\| \\|\\vec{v}\_I\\|}$$  
Where $\\vec{v}\_c$ is the embedding vector of the code diff and $\\vec{v}\_I$ is the embedding vector of the linked intent artifact.

* If $I \= \\emptyset$ (no linked intent), then $R(c, I) \= 0$.  
* A low score ($\< 0.5$) indicates "Semantic Drift," where the implementation deviates from the authorized intent, a common vector for "hallucinated" logic in AI-generated code.

### **2.3 Architectural Integrity $A(c, G)$**

Architectural Integrity quantifies the adherence of $c$ to the system's formal constraint graph $G$. This creates a deterministic check against the "Distributed Monolith" pattern, where microservices degrade into tightly coupled, unmapped dependencies.1

We model the system as a directed graph $G \= (V, E)$, where $V$ are services and $E$ are permitted communication paths.  
For a code artifact $c$ introducing a set of dependencies $D\_c$:  
$$A(c, G) \= 1 \- \\frac{|D\_c \\setminus E|}{|D\_c|}$$  
Where $D\_c \\setminus E$ represents the set of "illegal" dependencies introduced by $c$ that are not present in the authorized graph $E$.

* **Violation:** If an AI agent imports a library or calls a service not explicitly allowed in $G$, $A(c, G)$ decreases.  
* This metric acts as an entropy dampener, preventing the "software entropy" described by Lehman's laws.

### **2.4 Testing Integrity $T(c, S)$**

Testing Integrity measures the semantic coverage of the specification $S$ by the tests associated with $c$. Traditional code coverage measures execution paths, not intent verification.

$$T(c, S) \= \\frac{1}{|S\_{req}|} \\sum\_{i=1}^{|S\_{req}|} \\mathbb{I}(\\text{validates}(test\_c, req\_i))$$  
Where $\\mathbb{I}$ is an indicator function determined by an "Agent-as-a-Judge" evaluator that verifies if the test $test\_c$ semantically asserts the conditions required by requirement $req\_i$. This ensures that the tests validate the *why* (business rule), not just the *how* (execution).1

## **3\. The Audit Protocol: "Glass Box" Governance Architecture**

Operationalizing the CIS requires a shift from "Black Box" AI generation to a "Glass Box" governance architecture.1 We propose a closed-loop control system where an **Evaluator Agent** acts as a gatekeeper within the CI/CD pipeline.

### **3.1 The "Agent-as-a-Judge" Mechanism**

The architecture implements a multi-agent system (MAS) where the **Generator Agent** ($Ag\_{gen}$) and **Evaluator Agent** ($Ag\_{eval}$) operate in an adversarial relationship.

1. **Generation:** $Ag\_{gen}$ produces code $c$ based on prompt $P$.  
2. **Evaluation:** $Ag\_{eval}$ calculates $CIS(c)$ by retrieving the Context Graph $G$ and Intent $I$.  
3. **Adversarial Check:** $Ag\_{eval}$ specifically scans for "Context Stuffing"—attempts by $Ag\_{gen}$ to include irrelevant comments or logic to artificially inflate semantic similarity $R(c, I)$.  
4. **Decision:**  
   * If $CIS(c) \> \\tau$ (threshold), the code is merged.  
   * If $CIS(c) \\leq \\tau$, the code is rejected with a "Contextual Debt Report" detailing the specific vector of failure (Rationale, Architecture, or Testing).

### **3.2 The Decision Bill of Materials (DBOM)**

To satisfy emerging legal standards for "duty of care", the system generates a **Decision Bill of Materials (DBOM)** for every commit. Unlike an SBOM, which lists software components, the DBOM records the *causal chain* of the change:

* **Intent ID:** The immutable reference to the business requirement.  
* **Prompt Hash:** The cryptographic hash of the prompt used to generate $c$.  
* **CIS Vector:** The calculated values of $$.  
* **Approval Signature:** The cryptographic signature of the human or agent that authorized the merge.

This artifact renders the code "knowable" by preserving the lineage of intent, directly mitigating the "amnesiac system" failure mode.

## **4\. Conclusion: From Liability to Determinism**

The transition to AI-driven development necessitates a rigorous formalism for intent. By defining Contextual Debt not as a metaphor but as a measurable deviation in a vector space, organizations can deploy automated governance structures that scale with the velocity of generation. The CIS and DBOM provide the necessary artifacts to defend the "why" of the system, transforming software liability from an unmanaged risk into a verifiable protocol.

#### **Works cited**

1. Copyright-Edition-Contextual-Debt-Paper.txt