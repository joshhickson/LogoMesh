# 20251127-Contextual-Discovery-Plan-Revision

## 1. Referenced Documents

This plan synthesizes and extends the strategic direction outlined in the following core documents. It is recommended to review them for full context:

- **The New Pivot:** `[logs/ip_and_business/20251118-Strategic-Pivot-Plan-CIS-Formalization.md](logs/ip_and_business/20251118-Strategic-Pivot-Plan-CIS-Formalization.md)`
- **Math Viability Analysis:** `[logs/technical/josh-temp/20251127-Math-Viability-and-Novelty-Analysis.md](logs/technical/josh-temp/20251127-Math-Viability-and-Novelty-Analysis.md)` (Confirms API viability)
- **The Team Feedback:** `[logs/technical/20251127-Comparative-Analysis-of-Team-Feedback.md](logs/technical/20251127-Comparative-Analysis-of-Team-Feedback.md)` (Confirms A2A Pivot)
- **Competition Strategy:** `[docs/20251102-AgentX AgentBeats Competition Analysis.md](docs/20251102-AgentX AgentBeats Competition Analysis.md)`

## 2. Objective: The Discovery Sprint (Updated)

This document outlines a revised "Discovery Sprint" to validate the core hypotheses of the Contextual Integrity Score (CIS). Following the 11/27 Viability Analysis, our focus shifts from **Math Theory** to **Implementation Specifications**.

Our goal is to produce concrete "Decision Records" and "Implementation Specs" that allow us to build the Green Agent Evaluator by the Dec 19 deadline.

## 3. Discovery Track 1: The "Derivative Trap" (Validation of Application Novelty)

**Context:** The math analysis confirmed that while "Cosine Similarity" is standard, the *application* of a composite "Contextual Integrity Score" is novel.
**The Core Question:** How do we frame our *Composite Score* (RIS + AIS + TIS) as a unique contribution to the field?

*   **Experiment 1.1: The Product Novelty Audit**
    *   **Assignee:** Product/Applied DS (Deepti).
    *   **Task:** Produce a "Product Novelty Memo" that rigorously differentiates our project from a market perspective against competitors like DeepEval.
    *   **Deliverable:** A 1-page memo containing a comparative table ("DeepEval Features vs. Our Proposed Features") and a clear argument for our unique value proposition.

*   **Experiment 1.2: The Embedding Feasibility Spike**
    *   **Assignee:** Product/Applied DS (Deepti).
    *   **Task:** Create a proof-of-concept (POC) in a Jupyter notebook to generate vector embeddings using the **OpenAI Embeddings API** (`text-embedding-3-small`) to validate cost and performance.
    *   **Deliverable:** A working notebook and a short summary answering: What are the token limits? What are the potential costs?

*   **Experiment 1.3: The Composite Score Differentiation**
    *   **Assignee:** The Auditor (Alaa/Josh).
    *   **Task:** Produce a brief report demonstrating how the **combination** of Rationale (Embeddings), Architecture (Graph), and Testing (Semantic Coverage) creates a metric that is distinct from standard "Traceability" tools.
    *   **Deliverable:** A markdown report contrasting our "Composite Score" against singular metrics like BLEU or simple CodeBERT embeddings.

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

## 5. Discovery Track 3: The "Math Gap" (Implementation Specifications)

**Context:** The Math Analysis confirmed that we will use **OpenAI APIs** for Rationale/Testing and **dependency-cruiser** for Architecture. We no longer need to audit formulas; we need to specify the workers.
**The Core Question:** What are the exact Inputs/Outputs for the Worker Agents?

*   **Experiment 3.1: The Worker Specification (Rationale & Architecture)**
    *   **Assignee:** The Builder (Garrett) / Alaa.
    *   **Task:** Define the strict JSON Schemas for the `RationaleWorker` (Input: Diff + Req -> OpenAI -> Output: Float) and the `ArchitecturalWorker` (Input: Codebase -> DepCruiser -> Output: Graph/Penalty).
    *   **Deliverable:** Two JSON Schema files (`rationale-worker-schema.json`, `architectural-worker-schema.json`) ready for implementation.

*   **Experiment 3.2: The Green Agent Implementation Guide**
    *   **Assignee:** The Builder (Garrett) / Alaa.
    *   **Task:** Create a technical guide explaining how the Green Agent will orchestrate these workers. It should explain the flow: Receive Submission -> Dispatch to Workers -> Aggregate Scores -> Return Evaluation.
    *   **Deliverable:** A markdown "Implementation Guide" for the Green Agent.

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
    *   **Task:** Synthesize the `[docs/20251102-AgentX AgentBeats Competition Analysis.md](docs/20251102-AgentX AgentBeats Competition Analysis.md)` document with our CIS concept to produce a "Narrative & Strategy Memo." This document must explicitly articulate the end-to-end story for the judges, connecting our "Green Agent" (CIS as a benchmark) and our "Purple Agent" (an agent that excels on it) to the sponsor's goals (especially Auth0's security focus).
    *   **Deliverable:** A 2-page memo outlining the proposed narrative, the key talking points for the pitch, and how our project embodies the "powerful *and* trustworthy" archetype.

*   **Experiment 5.2: The SDK & Auth0 Integration Spike**
    *   **Assignee:** The Verifiable Product-Builder (Samuel), advised by The Safety Architect (Hadiza).
    *   **Task:** Conduct a technical spike to answer critical integration questions. Decompile the AgentBeats SDK if necessary. The primary goal is to create a POC demonstrating how a Purple Agent, running within the SDK, can use Auth0's Token Vault and FGA to interact with a sandboxed resource.
    *   **Deliverable:** A working code sample and a brief report answering: What are the SDK's architectural constraints? How can an agent securely access and manage secrets (e.g., Auth0 tokens) within the SDK? What is the most compelling way to demonstrate Auth0's value in a live demo?

## 8. Knowledge Gaps

*This section is intentionally blank. Please add any new questions or uncertainties that arise during the Discovery Sprint.*

- ...
- ...
