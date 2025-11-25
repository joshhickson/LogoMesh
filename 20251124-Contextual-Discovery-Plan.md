# 20251124-Contextual-Discovery-Plan (Revised)

## 1. Referenced Documents

This plan synthesizes and extends the strategic direction outlined in the following core documents. It is recommended to review them for full context:

- **The New Pivot:** `logs/ip_and_business/20251118-Strategic-Pivot-Plan-CIS-Formalization.md`
- **The Old Plan:** `logs/technical/20251113_RECOVERY_PLAN.md`
- **The Conflict Analysis:** `logs/technical/20251118-Gap-Analysis-Recovery-vs-Pivot.md`
- **Competition Strategy:** `docs/20251102-AgentX AgentBeats Competition Analysis.md`

## 2. Objective: The Discovery Sprint

This document outlines a one-week "Discovery Sprint" to validate the core hypotheses of the `logs/ip_and_business/20251118-Strategic-Pivot-Plan-CIS-Formalization.md`. Our goal is **not to implement features**, but to reduce risk by answering critical open questions across two domains: **Technical Feasibility** (Tracks 1-4) and **Competition Alignment** (Track 5).

Success for this sprint is defined as **Risk Reduction via Falsification**. We will produce a set of "Decision Records"—memos, proofs-of-concept, and formal audits—that give us the confidence to proceed, or the evidence needed to pivot again safely.

## 3. Discovery Track 1: The "Derivative Trap" (Validation of Rationale Integrity)

**Context:** The pivot proposes using Vector Embeddings and Cosine Similarity to measure the alignment between intent and code.
**The Core Question:** Is our approach genuinely novel from both a product and mathematical standpoint?

*   **Experiment 1.1: The Product Novelty Audit**
    *   **Assignee:** Product/Applied DS (Deepti).
    *   **Task:** Produce a "Product Novelty Memo" that rigorously differentiates our project from a market perspective against competitors like DeepEval.
    *   **Deliverable:** A 1-page memo containing a comparative table ("DeepEval Features vs. Our Proposed Features") and a clear argument for our unique value proposition.

*   **Experiment 1.2: The Embedding Feasibility Spike**
    *   **Assignee:** Product/Applied DS (Deepti).
    *   **Task:** Create a proof-of-concept (POC) in a Jupyter notebook to generate vector embeddings for a representative code diff and a related requirements document to uncover practical constraints.
    *   **Deliverable:** A working notebook and a short summary answering: What embedding models are suitable? What are the token limits? What are the potential costs and performance bottlenecks?

*   **Experiment 1.3: The Mathematical Proof of Novelty**
    *   **Assignee:** The Auditor (Alaa).
    *   **Task:** Produce a formal mathematical proof demonstrating that our proposed CIS formulas are distinct from standard cosine similarity and other common RAG/QA metrics.
    *   **Deliverable:** A formal proof document (e.g., LaTeX PDF or markdown with embedded equations).

## 4. Discovery Track 2: The "Vaporware" Risk (Validation of Security Architecture)

**Context:** The strategic paper promises a cryptographic "Decision Bill of Materials" (DBOM). We will use a "spec-first" approach to validate this.
**The Core Question:** Can we formally specify and then successfully implement a forensically useful, signed artifact for a code change?

*   **Experiment 2.1 (Spec-First): The Minimal DBOM Schema**
    *   **Assignee:** The Safety Architect (Hadiza).
    *   **Task:** Define the minimal, formal data structure for the DBOM, specifying the fields required for the payload to be cryptographically sound and forensically useful.
    *   **Deliverable:** A formally structured JSON schema file for the DBOM. This is the official constraint for Experiment 2.2.

*   **Experiment 2.2 (Implementation): The Crypto-Signature POC**
    *   **Assignee:** The Verifiable Product-Builder (Samuel).
    *   **Task:** Build a proof-of-concept that implements Hadiza's DBOM schema, proving a library like Auth0 or `jose` can generate a verifiable signature for an artifact that strictly adheres to the schema.
    *   **Deliverable:** A "Crypto Implementation Report" with a working script that ingests the DBOM schema, validates a sample payload, and successfully generates/verifies a signature.

## 5. Discovery Track 3: The "Math Gap" (Bridging Team Knowledge)

**Context:** The pivot introduces advanced mathematical concepts that are not yet common knowledge within the team.
**The Core Question:** Are the formulas in the paper correct and computable, and can we translate them into practical algorithms?

*   **Experiment 3.1: The Formal Formula Audit**
    *   **Assignee:** The Auditor (Alaa) and Formal Logic/LTL (Hadiza).
    *   **Task:** Conduct a rigorous review of the CIS formulas to confirm they are mathematically sound, consistent, and theoretically computable.
    *   **Deliverable:** A formal audit report with a "Pass," "Pass with Modifications," or "Fail" verdict for each distinct formula.

*   **Experiment 3.2: The Computability Explainer**
    *   **Assignee:** The Auditor (Alaa).
    *   **Task:** Translate the abstract mathematical formulas for the CIS into concrete pseudocode or a simple Python script with numerical examples.
    *   **Deliverable:** A markdown document or notebook that a non-expert can read to understand how the math would be implemented.

## 6. Discovery Track 4: Documentation Graphing (The Meta-Layer)

**Context:** We aim to treat our documentation repository as a mission-critical, auditable system of record.
**The Core Question:** Can we model our documentation workflow as an event-driven system to ensure its integrity and traceability?

*   **Experiment 4.1: The Document Event Schema**
    *   **Assignee:** The Logistics Architect (Aron).
    *   **Task:** Design an event schema for our documentation repository, modeling it as a "warehouse" and defining immutable events that track "inventory movements" (e.g., `file.created`, `file.renamed`, `link.updated`).
    *   **Deliverable:** A formal schema (e.g., in JSON Schema or Avro) for the key events.

*   **Experiment 4.2: The Node-and-Edge Schema**
    *   **Assignee:** The TPM (Deepti).
    *   **Task:** Define a clear data model for the documentation graph itself, which would be the consumer of the events defined by Aron.
    *   **Deliverable:** A JSON schema or TypeScript interface definition that represents the target data structure of the graph.

*   **Experiment 4.3: The Data Accessibility & Link Extraction POC**
    *   **Assignee:** Team Lead (Josh).
    *   **Task:** This experiment has two parts:
        1.  **Accessibility Test:** Verify that the Node.js server in `onboarding/` can be configured to safely read file contents from the root `docs/` and `logs/` directories to prove the data connection is possible.
        2.  **Link Extraction Spike:** Write a script (e.g., Python or Node.js) that can traverse the `docs/` and `logs/` directories and extract all explicit markdown links (`[text](./path/to/file.md)`) to build a preliminary adjacency list of the documentation graph. This validates the core mechanism needed to combat "reference rot."
    *   **Deliverable:** A brief report summarizing the findings. It should include a "Pass/Fail" for the accessibility test and the proof-of-concept script for link extraction.

## 7. Discovery Track 5: Competition & Go-to-Market Alignment

**Context:** A technically sound solution that is misaligned with the competition's evaluation framework is a strategic failure. This track validates our narrative and technical integration strategy.
**The Core Question:** How do we frame our CIS technology and integrate it within the AgentBeats SDK to create a winning submission?

*   **Experiment 5.1: The "Winning Narrative" Blueprint**
    *   **Assignee:** The TPM (Deepti).
    *   **Task:** Synthesize the `docs/20251102-AgentX AgentBeats Competition Analysis.md` document with our CIS concept to produce a "Narrative & Strategy Memo." This document must explicitly articulate the end-to-end story for the judges, connecting our "Green Agent" (CIS as a benchmark) and our "Purple Agent" (an agent that excels on it) to the sponsor's goals (especially Auth0's security focus).
    *   **Deliverable:** A 2-page memo outlining the proposed narrative, the key talking points for the pitch, and how our project embodies the "powerful *and* trustworthy" archetype.

*   **Experiment 5.2: The SDK & Auth0 Integration Spike**
    *   **Assignee:** The Verifiable Product-Builder (Samuel), advised by The Safety Architect (Hadiza).
    *   **Task:** Conduct a technical spike to answer critical integration questions. Decompile the AgentBeats SDK if necessary. The primary goal is to create a POC demonstrating how a Purple Agent, running within the SDK, can use Auth0's Token Vault and FGA to interact with a sandboxed resource.
    *   **Deliverable:** A working code sample and a brief report answering: What are the SDK's architectural constraints? How can an agent securely access and manage secrets (e.g., Auth0 tokens) within the SDK? What is the most compelling way to demonstrate Auth0's value in a live demo?

## 8. Knowledge Gaps

*This section is intentionally blank. Please add any new questions or uncertainties that arise during the Discovery Sprint.*

- ...
- ...
