> **Status:** SNAPSHOT
> **Type:** Log
> **Context:**
> * [2025-12-17]: Pivot gap analysis.

# Gap Analysis: `RECOVERY_PLAN` vs. `Strategic-Pivot-Plan` (2025-11-18)

## 1. Purpose

This document provides a detailed gap analysis comparing the currently active technical roadmap, [20251113_RECOVERY_PLAN.md](20251113_RECOVERY_PLAN.md), with the proposed new direction outlined in [../../../00-Strategy/Business/20251118-Strategic-Pivot-Plan-CIS-Formalization.md](../../../00-Strategy/Business/20251118-Strategic-Pivot-Plan-CIS-Formalization.md).

The goal is to clearly articulate the differences between the two plans to inform a strategic decision on whether to pivot the project's core technical implementation.

## 2. Current State of the Repository (As of 2025-11-18)

To ground this analysis, it is essential to define the project's current state. The development team has been executing "Workstream 1" from the `RECOVERY_PLAN`.

*   **Completed Task:** Task 1.2, "Build Secure Sandbox for `testingDebtAnalyzer`," is **COMPLETE**. The successful implementation is documented in [../../../Archive/Unsorted/CoPilot/20251117-Task-1.2-Completion-Summary.md](../../../Archive/Unsorted/CoPilot/20251117-Task-1.2-Completion-Summary.md).
*   **Pending Tasks:** Task 1.1 (`escomplex` integration) and Task 1.3 (compounding debt logic) have **NOT** been started.

The repository is therefore in a state where the `testingDebtAnalyzer` has a functional sandbox, but the other analyzers remain in their prototype stage.

## 3. Core Gap: A Shift in Technical Foundation

The central difference between the two plans is a fundamental pivot in the technical implementation of the Contextual Integrity Score (CIS). The `Strategic-Pivot-Plan` proposes to **deprecate and replace the entirety of "Workstream 1"** from the `RECOVERY_PLAN`.

The shift is from a qualitative, rubric-based model to a quantitative, mathematically-defensible one.

## 4. Side-by-Side Comparison: Workstream 1

| Analyzer | Old Plan (`RECOVERY_PLAN.md`) | New Proposed Plan (`Strategic-Pivot-Plan`) | Verdict |
| :--- | :--- | :--- | :--- |
| **Architectural Debt** | **Integrate `escomplex`** to measure code complexity (cyclomatic complexity, maintainability index). | **Implement Graph Centrality.** Statically analyze the code's dependency graph against a predefined architecture (`logomesh.arch.json`). Score is 0 if any illegal dependency is found. | **Direct Replacement.** The `escomplex` task becomes obsolete. |
| **Rationale Debt** | **Implement Compounding Debt Logic.** Abstractly trace how an irrelevant piece of context is used in downstream reasoning steps. | **Implement Semantic Alignment.** Use vector embeddings to calculate the **cosine similarity** between the natural language intent (from a ticket) and the code diff. | **Direct Replacement.** The abstract tracing task is replaced by a concrete mathematical calculation. |
| **Testing Debt** | **Build Secure Sandbox.** Capture basic `pass/fail` results from test execution within a secure `isolated-vm` sandbox. | **Implement Semantic Coverage.** Combine traditional code coverage with a **vector similarity score** comparing test case assertions to the acceptance criteria of the requirement. | **Significant Evolution.** The already-completed sandbox (Task 1.2) remains useful, but the *analysis* performed on the test results becomes far more sophisticated. |

## 5. New Requirements Introduced by the Pivot Plan

Adopting the `Strategic-Pivot-Plan` introduces significant new workstreams that have no equivalent in the original `RECOVERY_PLAN`.

1.  **"Golden Dataset" Creation:**
    *   **Requirement:** Manually create and label a small, high-quality dataset of sample code changes (e.g., as `.patch` files).
    *   **Purpose:** To provide a reliable, empirical benchmark for validating the accuracy of the new, complex analyzers. Simple mock-based unit tests are no longer sufficient.

2.  **Testing and Verification Strategy Update:**
    *   **Requirement:** Refactor the entire testing strategy for the analyzers.
    *   **Purpose:** Unit tests must be rewritten to use the "Golden Dataset" as their input. The main E2E test must also be updated to run a full evaluation on a "High-Integrity Sample" from the dataset and assert a high CIS score.

## 6. Conclusion

The `Strategic-Pivot-Plan` is not an incremental change but a **complete replacement** of the core analyzer logic defined in the original `RECOVERY_PLAN`.

*   **Obsolete Tasks:** Tasks 1.1 and 1.3 from the `RECOVERY_PLAN` would be formally deprecated and removed from the backlog.
*   **Evolved Task:** The work done for Task 1.2 (the secure sandbox) is still valuable as an execution environment, but the logic for scoring testing debt would need a major overhaul.
*   **New Dependencies:** The pivot introduces a dependency on new capabilities (vector embedding generation) and new artifacts (the Golden Dataset).

A formal decision is required before proceeding with any further work on Workstream 1. The team must either commit to completing the original `RECOVERY_PLAN` as written or formally adopt the pivot and create a new, updated recovery plan based on its more ambitious requirements.
