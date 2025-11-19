# Strategic Pivot Plan: CIS Formalization (2025-11-18)

## 1. Executive Summary

This document outlines a detailed, phased implementation plan for the strategic pivot from a rubric-based implementation of the Contextual Integrity Score (CIS) to a formal, mathematically-defensible, algorithm-based model.

The previous implementation, as detailed in `logs/technical/20251113_RECOVERY_PLAN.md`, relied on simpler mechanisms (e.g., complexity metrics, basic pass/fail test capture). This new approach elevates our core intellectual property by grounding each component of the CIS in hard technology: vector-based semantic analysis, graph theory, and semantic test coverage.

This pivot is critical for moving our project from a "consulting framework" to a "hard tech" product. This document will serve as the primary technical roadmap for this transition and as a core onboarding document for new team members.

## 2. Source of Change

The technical and mathematical foundations for this pivot are detailed in the proposed revision to the Contextual Debt paper. This document will be uploaded by the project lead to the following location after this plan is merged:

`docs/strategy_and_ip/DOC-REVISIONS/20251118-proposed-Section-2.2.md`

All implementation work should refer to this document as the source of truth for the new logic.

## 3. Phase 1: Revision of the `RECOVERY_PLAN.md`

To execute this pivot, "Workstream 1" of the existing `RECOVERY_PLAN.md` will be deprecated and replaced. The tasks related to `escomplex` integration and simple sandbox test capture are no longer relevant.

**Action Item:** The `logs/technical/20251113_RECOVERY_PLAN.md` will be updated to replace the contents of "Workstream 1: Harden Core Analyzer Logic" with the following:

---

### **Workstream 1 (Revised): Implement Formalized CIS v2 Analyzers**

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

---

## 4. Phase 2: "Golden Dataset" Creation

**Purpose:** The new analyzers are too complex for simple, mock-based unit tests. To ensure their accuracy and defensibility, we must create a small, manually-labeled "golden dataset" to serve as an empirical benchmark.

**Structure:** This dataset will consist of a collection of sample code changes (e.g., stored as `.patch` files or within a structured JSON file) that represent key scenarios. Each sample will be manually annotated with the *expected* Rationale, Architectural, and Testing integrity scores.

**Required Samples:**

1.  **High-Integrity Sample:** A well-written code change that is semantically aligned with its requirement, adheres to all architectural rules, and has meaningful tests. (Expected CIS: > 0.9)
2.  **Rationale Debt Sample:** A code change that correctly implements a feature but is linked to an irrelevant or vague requirement. (Expected Rationale Score: < 0.3)
3.  **Architectural Debt Sample:** A code change that is locally correct but introduces an illegal dependency between services. (Expected Architectural Score: 0)
4.  **Testing Debt Sample:** A code change with 100% line coverage but with "vanity tests" that do not actually validate the business logic described in the requirements. (Expected Testing Score: < 0.4)

## 5. Phase 3: Testing and Verification Strategy Update

Our existing testing strategy must be updated to leverage the Golden Dataset for verification.

*   **Unit Testing:**
    *   The unit tests for each of the three new analyzers will be refactored.
    *   Instead of using simple mocks, the tests will load the relevant sample from the Golden Dataset, pass it to the analyzer, and assert that the resulting score is within a small margin of error of the manually-annotated "correct" score.

*   **End-to-End (E2E) Testing:**
    *   The primary E2E test (`evaluation.e2e.test.ts`) will be updated.
    *   It will be configured to run a full evaluation pipeline on the "High-Integrity Sample" from the Golden Dataset.
    *   The test's final assertion will be to check that the `EvaluationReport`'s final CIS score is above the high-integrity threshold (e.g., > 0.9), providing empirical, end-to-end verification of the entire system.

## 6. Onboarding Implications

This document outlines a significant but necessary evolution of our core technology. It should be considered required reading for any new team members, as it represents the most current, actionable technical roadmap for the project's central feature.
