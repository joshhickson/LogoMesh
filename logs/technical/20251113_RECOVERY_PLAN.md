# Intensive Recovery Plan (2025-11-13)

## 1. Introduction & Acknowledgment of Current Plan

This document is a tactical supplement to the strategic `PROJECT_PLAN.md`. While the `PROJECT_PLAN.md` outlines the "what" and "why," this recovery plan details the "how"—providing a concrete, actionable roadmap to address the remaining gaps identified in the `2025-11-13_GAP_ANALYSIS_REPORT.md`.

Our strategy is sound, but execution is paramount. This plan breaks down the remaining high-level goals into specific, verifiable tasks required to create a competition-winning submission.

## 2. Recovery Workstreams

The following workstreams are designed to run in parallel, aligning with the roles and weekly milestones established in the `PROJECT_PLAN.md`.

### Workstream 1 (Revised): Implement Formalized CIS v2 Analyzers

**Goal:** Implement the new, mathematically-grounded analyzers for each component of the Contextual Integrity Score, as defined in the strategic revision document.

*   **Task 1.1: Implement Rationale Integrity Analyzer v2 (Semantic Alignment)**
    *   **Action:**
        1.  Develop a service capable of generating high-dimensional vector embeddings for text (from requirements, tickets, etc.) and code (from git diffs).
        2.  Implement the Rationale Integrity function `R(Δ)` which calculates the cosine similarity between the intent vector (`v_intent`) and the code vector (`v_code`).
    *   **Acceptance Criteria:** The analyzer must be able to take a code diff and a text requirement as input and output a similarity score between 0 and 1.

*   **Task 1.2: Implement Architectural Integrity Analyzer v2 (Graph Centrality)**
    *   **Action:**
        1.  Design and implement a schema (e.g., in a `logomesh.arch.json` file) for defining the project's service architecture as a directed graph.
        2.  Build a static analysis engine that parses a code change, identifies all new or modified cross-service dependencies, and checks them against the "allowed edges" in the architecture graph.
        3.  Implement the Architectural Integrity function `A(Δ)` which returns 0 if any "illegal edge" is detected (the "Critical Veto").
    *   **Acceptance Criteria:** The analyzer must correctly identify and fail a code change that introduces a dependency that violates the predefined architectural graph.

*   **Task 1.3: Implement Testing Integrity Analyzer v2 (Semantic Coverage)**
    *   **Action:**
        1.  Integrate a standard code coverage tool to capture line/branch coverage data.
        2.  Use the vector embedding service (from Task 1.1) to generate embeddings for test case assertions and the acceptance criteria of the linked requirement.
        3.  Implement the Testing Integrity function `T(Δ)` which combines the code coverage score with the semantic similarity score between tests and requirements.
    *   **Acceptance Criteria:** The analyzer must produce a low score for a code change that has 100% line coverage but whose tests do not semantically align with the stated business requirements.

### Workstream 2: Implement Production-Grade Security (Auth0)

**Goal:** Move from a *plan* for security to a working implementation. This addresses the "Security Question."

*   **Task 2.1: Implement Auth0 FGA-Secured Endpoint**
    *   **Action:** Create a new test endpoint (e.g., `/v1/secure/tool`) that is protected by a real Auth0 FGA policy.
    *   **Acceptance Criteria:** An agent attempting to access this endpoint without a valid, scoped token must receive a `403 Forbidden` error.
*   **Task 2.2: Refactor Evaluation Flow for Secure Credential Handling**
    *   **Action:** Remove any logic that passes API keys or secrets in the `POST /v1/evaluate` payload. Instead, the Orchestrator will be responsible for provisioning short-lived tokens for the "Purple Agent" on-demand during the evaluation.
    *   **Acceptance Criteria:** The E2E test must successfully complete an evaluation that requires the "Purple Agent" to access the new secure endpoint using an Auth0-provisioned token.

### Workstream 3: Prove End-to-End Reproducibility

**Goal:** Create an undeniable, fully automated E2E test that validates the entire asynchronous pipeline. This addresses the "E2E Question."

*   **Task 3.1: Enhance `evaluation.e2e.test.ts`**
    *   **Action:** Modify the E2E test to be truly end-to-end. It must:
        1.  Make a `POST` request to `/v1/evaluate`.
        2.  Extract the `evaluationId` from the `202 Accepted` response.
        3.  Enter a polling loop that periodically makes `GET` requests to `/v1/evaluate/{evaluationId}`.
        4.  The test will pass only when the polling endpoint returns a `200 OK` with a final report that matches the expected schema.
    *   **Acceptance Criteria:** The `docker-compose` test runner must successfully execute this new, asynchronous E2E test.

### Workstream 4: Build the Developer Experience (DevEx) Bridge

**Goal:** Create a tangible, compelling demonstration of how our benchmark integrates into a real developer workflow. This addresses the "Integration Question."

*   **Task 4.1: Create a Proof-of-Concept GitHub Action**
    *   **Action:** Develop a simple GitHub Action that can be triggered on a `pull_request`. The action will use the `docker-compose` setup to run the benchmark against a sample of the PR's code.
    *   **Acceptance Criteria:** The GitHub Action must successfully run and post a formatted summary of the `EvaluationReport` as a comment on the pull request. This makes the project's value immediately visible and tangible.

### Workstream 5: Implement Verifiable Audit Trails

**Goal:** Fulfill the "Trust and Safety" requirement by creating a transparent, auditable log of the evaluation process.

*   **Task 5.1: Implement Structured Audit Logger**
    *   **Action:** Enhance the placeholder audit logger to produce a structured, human-readable log file for each evaluation run.
    *   **Acceptance Criteria:** The log must clearly show the inputs received by each analyzer, the key intermediate decisions (e.g., LLM prompts and responses), and the final scores awarded, providing a verifiable trail for the entire evaluation.
