> **Status:** ACTIVE
> **Type:** Spec
> **Context:**
> * [2025-12-17]: Defines DBOM and Core IP (Keep Active).

# Core IP Definition (v0.2 - Protocol Edition)

This document defines the core intellectual property of LogoMesh. These definitions serve as the basis for patent applications and the "Contextual Debt" copyright registration.

## 1. The Contextual Integrity Score (CIS) v0.2

The Contextual Integrity Score (CIS) is a computable probability function that quantifies the extent to which a software artifact preserves its original intent. It is not a qualitative rubric but a weighted summation of three vector-space measurements:

$$CIS(\Delta) = w_r \cdot R(\Delta) + w_a \cdot A(\Delta) + w_t \cdot T(\Delta)$$

### 1.1 Rationale Integrity ($R$)
**Definition:** The cosine similarity between the vector embedding of the code change ($\vec{v}_{code}$) and the vector embedding of the documented requirement ($\vec{v}_{intent}$).
**Formula:** $R(\Delta) = \frac{\vec{v}_{code} \cdot \vec{v}_{intent}}{\|\vec{v}_{code}\| \|\vec{v}_{intent}\|} \cdot \mathbb{I}(Link_{exists})$

### 1.2 Architectural Integrity ($A$)
**Definition:** A binary compliance function scaled by graph centrality. It enforces the "Critical Veto," rejecting any change that introduces dependencies violating the predefined system graph $G$.
**Formula:** $A(\Delta) = \prod_{e \in E_{new}} (1 - P(Violation | e))$

### 1.3 Testing Integrity ($T$)
**Definition:** The semantic overlap between the test case assertions and the requirement's acceptance criteria, ensuring tests validate intent, not just execution.
**Formula:** $T(\Delta) = \text{Coverage}(\Delta) \times \text{Sim}(\vec{v}_{test}, \vec{v}_{criteria})$

---

## 2. The Agent-as-a-Judge Protocol (v0.2)

The Agent-as-a-Judge is not a single AI model but a **"Glass Box" Governance Protocol** implemented via a Multi-Agent Orchestrator-Worker (MA-OW) topology.

**Core Components:**
1.  **The Orchestrator ($O$):** Manages state and constraints; does not generate code.
2.  **The Worker ($W$):** Generates code $\Delta$ to satisfy constraints.
3.  **The Judge ($J$):** An adversarial agent that evaluates $\Delta$ against the CIS function.

**The Governance Function:**
The system accepts a change if and only if the Judge validates the Orchestrator's constraint against the Worker's output:
$$J(O(C), W(\Delta)) \to \{Accept \mid Reject\}$$

---

## 3. The Decision Bill of Materials (DBOM)

**Definition:** An immutable, cryptographic log that tracks the causality ("why") of a code change, not just its components. It serves as the primary evidentiary artifact for proving "duty of care."

**Structure:**
For every commit $\Delta_i$, the DBOM records:
$$DBOM_i = \langle H(\Delta_i), \vec{v}_{intent}, \text{Score}_{CIS}, \sigma_{Judge} \rangle$$

*   $H(\Delta_i)$: Hash of the code.
*   $\vec{v}_{intent}$: Vector embedding of the rationale.
*   $\text{Score}_{CIS}$: The computed Contextual Integrity Score.
*   $\sigma_{Judge}$: Digital signature of the Judge Agent.
