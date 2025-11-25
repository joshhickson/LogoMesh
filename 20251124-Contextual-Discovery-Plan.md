# 20251124-Contextual-Discovery-Plan (Revised)

## 1. Objective: The Discovery Sprint

This document outlines a one-week "Discovery Sprint" to validate the core hypotheses of the `20251118-Strategic-Pivot-Plan`. Our goal is **not to implement features**, but to reduce risk by answering critical open questions.

Success for this sprint is defined as **Risk Reduction via Falsification**. We will produce a set of "Decision Records"—memos, proofs-of-concept, and formal audits—that give us the confidence to proceed with the math-based pivot, or the evidence needed to pivot again safely. Each task's deliverable is **evidence**, not production code.

## 2. Discovery Track 1: The "Derivative Trap" (Validation of Rationale Integrity)

**Context:** The pivot proposes using Vector Embeddings and Cosine Similarity to measure the alignment between intent and code.
**The Core Question:** Is our approach genuinely novel from both a product and mathematical standpoint?

*   **Experiment 1.1: The Product Novelty Audit**
    *   **Assignee:** Product/Applied DS (Deepti).
    *   **Task:** Produce a "Product Novelty Memo" that rigorously differentiates our project from a market perspective against competitors like DeepEval. The focus is on features, use cases, and defensible product claims.
    *   **Deliverable:** A 1-page memo containing a comparative table ("DeepEval Features vs. Our Proposed Features") and a clear argument for our unique value proposition.

*   **Experiment 1.2: The Embedding Feasibility Spike**
    *   **Assignee:** Product/Applied DS (Deepti).
    *   **Task:** Create a proof-of-concept (POC) in a Jupyter notebook to generate vector embeddings for a representative code diff and a related requirements document to uncover practical constraints.
    *   **Deliverable:** A working notebook and a short summary answering: What embedding models are suitable? What are the token limits? What are the potential costs and performance bottlenecks?

*   **Experiment 1.3: The Mathematical Proof of Novelty**
    *   **Assignee:** The Auditor (Alaa).
    *   **Task:** Produce a formal mathematical proof demonstrating that our proposed CIS formulas are distinct from standard cosine similarity and other common RAG/QA metrics. Leverage background in bias quantification to analyze potential failure modes.
    *   **Deliverable:** A formal proof document (e.g., LaTeX PDF or markdown with embedded equations) that can be reviewed by other experts.

## 3. Discovery Track 2: The "Vaporware" Risk (Validation of Security Architecture)

**Context:** The strategic paper promises a cryptographic "Decision Bill of Materials" (DBOM). We will use a "spec-first" approach to validate this.
**The Core Question:** Can we formally specify and then successfully implement a forensically useful, signed artifact for a code change?

*   **Experiment 2.1 (Spec-First): The Minimal DBOM Schema**
    *   **Assignee:** The Safety Architect (Hadiza).
    *   **Task:** Define the minimal, formal data structure for the DBOM. As a formal verification expert, specify the absolute minimum set of fields required for the payload to be cryptographically sound and forensically useful.
    *   **Deliverable:** A simple, well-documented, and formally structured JSON schema file representing the required DBOM structure. This schema is the official constraint for Experiment 2.2.

*   **Experiment 2.2 (Implementation): The Crypto-Signature POC**
    *   **Assignee:** The Verifiable Product-Builder (Samuel).
    *   **Task:** Build a proof-of-concept that implements Hadiza's DBOM schema. The task is to prove that a real-world cryptographic library (e.g., Auth0, `jose`) can be used to generate a verifiable signature for an artifact that strictly adheres to the schema from Experiment 2.1.
    *   **Deliverable:** A "Crypto Implementation Report" with a working script that ingests the DBOM schema, validates a sample payload against it, and successfully generates/verifies a signature.

## 4. Discovery Track 3: The "Math Gap" (Bridging Team Knowledge)

**Context:** The pivot introduces advanced mathematical concepts (Graph Theory, Vector Math) that are not yet common knowledge within the team.
**The Core Question:** Are the formulas in the paper correct and computable, and can we translate them into practical algorithms?

*   **Experiment 3.1: The Formal Formula Audit**
    *   **Assignee:** The Auditor (Alaa) and Formal Logic/LTL (Hadiza).
    *   **Task:** Conduct a rigorous review of the CIS formulas presented in the revised paper (`Section-2.2`). The audit must confirm that the formulas are mathematically sound, consistent, and theoretically computable.
    *   **Deliverable:** A formal audit report with a "Pass," "Pass with Modifications," or "Fail" verdict for each distinct formula, including a brief justification.

*   **Experiment 3.2: The Computability Explainer**
    *   **Assignee:** The Auditor (Alaa).
    *   **Task:** Translate the abstract mathematical formulas for the CIS into concrete pseudocode or a simple Python script using numerical examples (e.g., with NumPy arrays). This artifact is for the internal team to bridge the knowledge gap.
    *   **Deliverable:** A markdown document or notebook that a non-expert can read to understand how the math would be implemented in practice.

## 5. Discovery Track 4: Documentation Graphing (The Meta-Layer)

**Context:** We aim to treat our documentation repository as a mission-critical, auditable system of record.
**The Core Question:** Can we model our documentation workflow as an event-driven system to ensure its integrity and traceability?

*   **Experiment 4.1: The Document Event Schema**
    *   **Assignee:** The Logistics Architect (Aron).
    *   **Task:** Leveraging expertise in warehouse management and event-driven systems, design an event schema for our documentation repository. Model the repository as a "warehouse" and define the immutable events that track "inventory movements" (e.g., `file.created`, `file.renamed`, `link.updated`).
    *   **Deliverable:** A formal schema (e.g., in JSON Schema or Avro) for the key events that would allow us to reconstruct the state of the documentation graph at any point in time.

*   **Experiment 4.2: The Node-and-Edge Schema**
    *   **Assignee:** The TPM (Deepti).
    *   **Task:** Define a simple, clear data model for the documentation graph itself, which would be the consumer of the events defined by Aron. What constitutes a "node" (e.g., a file, a section header)? What constitutes an "edge" (e.g., an explicit markdown link)?
    *   **Deliverable:** A JSON schema or TypeScript interface definition that represents the target data structure of the graph.

## 6. Knowledge Gaps

*This section is intentionally blank. Please add any new questions or uncertainties that arise during the Discovery Sprint.*

- ...
- ...
