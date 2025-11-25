# 20251124-Contextual-Discovery-Plan

## 1. Objective: The Discovery Sprint

This document outlines a one-week "Discovery Sprint" to validate the core hypotheses of the `20251118-Strategic-Pivot-Plan`. Our goal is **not to implement features**, but to reduce risk by answering critical open questions.

Success for this sprint is defined as **Risk Reduction via Falsification**. We will produce a set of "Decision Records"—memos, proofs-of-concept, and formal audits—that give us the confidence to proceed with the math-based pivot, or the evidence needed to pivot again safely. Each task's deliverable is **evidence**, not production code.

## 2. Discovery Track 1: The "Derivative Trap" (Validation of Rationale Integrity)

**Context:** The pivot proposes using Vector Embeddings and Cosine Similarity to measure the alignment between intent and code.
**The Core Question:** Is our approach genuinely novel, or are we inadvertently cloning existing solutions like DeepEval?

*   **Experiment 1.1: The Novelty Audit**
    *   **Assignee:** The Auditor (Alaa), supported by Applied DS (Deepti).
    *   **Task:** Produce a "Novelty Memo" that rigorously differentiates our proposed "Compounding Debt" logic from standard RAG and QA metrics. The analysis must go beyond surface-level claims and provide a defensible argument for our unique value proposition.
    *   **Deliverable:** A 1-page memo containing a comparative table ("DeepEval Metrics vs. Our Metrics") and a concise mathematical or logical proof of our novelty.

*   **Experiment 1.2: The Embedding Feasibility Spike**
    *   **Assignee:** Applied DS (Deepti).
    *   **Task:** Create a proof-of-concept (POC) in a Jupyter notebook to generate vector embeddings for a representative code diff and a related requirements document. The goal is to uncover practical constraints.
    *   **Deliverable:** A working notebook and a short summary answering: What embedding models are suitable? What are the token limits? What are the potential costs and performance bottlenecks?

## 3. Discovery Track 2: The "Vaporware" Risk (Validation of Security Architecture)

**Context:** The strategic paper promises a cryptographic "Decision Bill of Materials" (DBOM) and verifiable digital signatures for code changes.
**The Core Question:** Can we actually generate and verify a cryptographic signature for a code change, or is this feature currently beyond our technical reach?

*   **Experiment 2.1: The Crypto-Signature POC**
    *   **Assignee:** The Verifiable Product-Builder (Samuel), advised by The Safety Architect (Hadiza).
    *   **Task:** Investigate and demonstrate the ability to cryptographically sign a piece of data representing a code change (e.g., a git commit hash). Evaluate at least two potential libraries or services (e.g., Auth0, `node-forge`, `jose`).
    *   **Deliverable:** A "Crypto Feasibility Report" (1-2 pages) with a clear recommendation, accompanied by a minimal, working script that generates and verifies a signature.

*   **Experiment 2.2: The Minimal DBOM Schema**
    *   **Assignee:** The Safety Architect (Hadiza).
    *   **Task:** Define the minimal data structure for the DBOM. What is the absolute minimum set of fields (e.g., `commitHash`, `authorId`, `requirementId`, `timestamp`, `signature`) that must be included in the signed payload to make it forensically useful?
    *   **Deliverable:** A simple, well-documented JSON schema file representing the proposed DBOM structure.

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

**Context:** Our `working-log.md` proposes visualizing the repository's documentation as a graph to understand its structure.
**The Core Question:** Is it technically feasible for our existing web server to access and parse the necessary `docs/` and `logs/` files?

*   **Experiment 4.1: The Data Connectivity Spike**
    *   **Assignee:** The Logistics Architect (Aron).
    *   **Task:** Create a minimal technical spike to determine if the `onboarding/` web server can programmatically access and read files from the root `logs/` and `docs/` directories. This is a file system and permissions check, not a UI task.
    *   **Deliverable:** A simple script (`.js` or `.ts`) that successfully reads a test file from each directory and a one-paragraph report detailing any challenges (e.g., pathing, sandboxing, permissions).

*   **Experiment 4.2: The Node-and-Edge Schema**
    *   **Assignee:** The TPM (Deepti).
    *   **Task:** Define a simple, clear data model for the documentation graph. What constitutes a "node" (e.g., a file, a section header)? What constitutes an "edge" (e.g., an explicit markdown link, a mention of another file's name)?
    *   **Deliverable:** A JSON schema or TypeScript interface definition that Aron can use as the target data structure for his connectivity spike.

## 6. Knowledge Gaps

*This section is intentionally blank. Please add any new questions or uncertainties that arise during the Discovery Sprint.*

- ...
- ...
