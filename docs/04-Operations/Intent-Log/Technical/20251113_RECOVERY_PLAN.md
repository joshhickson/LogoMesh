# Intensive Recovery Plan (2025-11-13)

## 1. Introduction & Acknowledgment of Current Plan

This document is a tactical supplement to the strategic [PROJECT_PLAN.md (Outdated)](../../../../PROJECT_PLAN.md). While the [PROJECT_PLAN.md (Outdated)](../../../../PROJECT_PLAN.md) outlines the "what" and "why," this recovery plan details the "how"—providing a concrete, actionable roadmap to address the remaining gaps identified in the `2025-11-13_GAP_ANALYSIS_REPORT.md`.

Our strategy is sound, but execution is paramount. This plan breaks down the remaining high-level goals into specific, verifiable tasks required to create a competition-winning submission.

## 2. Recovery Workstreams

The following workstreams are designed to run in parallel, aligning with the roles and weekly milestones established in the [PROJECT_PLAN.md (Outdated)](../../../../PROJECT_PLAN.md).

### Workstream 1: Harden Core Analyzer Logic

**Goal:** Move all analyzers from prototypes to production-ready components. This directly addresses the "Incomplete Implementation" gap.

*   **Task 1.1: Integrate Static Analysis into `architecturalDebtAnalyzer`**
    *   **Action:** Integrate the `escomplex` library to generate a quantitative score for code complexity and maintainability.
    *   **Acceptance Criteria:** The analyzer's output report must include a valid `escomplex` score based on the "Purple Agent's" generated code.
*   **Task 1.2: Build Secure Sandbox for `testingDebtAnalyzer`**
    *   **Action:** Utilize the `isolated-vm` library to create a secure, sandboxed environment for executing the "Purple Agent's" test code.
    *   **Acceptance Criteria:** The sandbox must prevent file system access outside of a temporary directory and enforce a strict execution timeout. The analyzer must successfully capture test results (`pass`/`fail`) from the sandboxed environment.
*   **Task 1.3: Implement Compounding Debt Logic in `rationaleDebtAnalyzer`**
    *   **Action:** Refactor the analyzer to explicitly trace how a piece of irrelevant context (a "debt event") is cited and used in subsequent reasoning steps.
    *   **Acceptance Criteria:** The final `EvaluationReport` JSON must contain a `debtTrace` array that links an initial contextual error to a specific, downstream failure in the agent's logic. This is critical to defending our novelty claim.

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
