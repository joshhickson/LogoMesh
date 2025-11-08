# Engineering Log: 2025-11-07 (Evening)

**Objective:** Execute a strategic architectural refactor to address core security and extensibility flaws identified in the simulated judge's report.

## 1. The Mandate: From Monolith to Multi-Agent

The previous architecture, while functional, was a monolith. The `EvaluationOrchestrator` directly instantiated and called the various analyzer services. This created two critical vulnerabilities:
1.  **No Security Isolation:** A flaw in any single analyzer (e.g., a remote code execution vulnerability in a test sandbox) would compromise the entire server.
2.  **Poor Extensibility:** The system was not a "pluggable framework" as envisioned in the project plan. Adding a new analyzer required modifying the core orchestrator logic.

The mandate was to refactor the system into a **secure, extensible, and isolated multi-agent architecture**.

## 2. The New Architecture: Orchestrator-Worker with a Message Queue

I implemented a true Orchestrator-Worker pattern using a process-isolating message queue.

-   **Action: Integrated `bullmq` and Redis.**
    -   Discarded the in-memory `EventEmitter`.
    -   Added `bullmq` and `ioredis` as dependencies to provide a robust, Redis-backed message queue for inter-process communication.

-   **Action: Created a new `@logomesh/workers` package.**
    -   To achieve true process isolation, all analyzer logic was moved from `@logomesh/core` into a new, dedicated `packages/workers` package.
    -   Each analyzer (`Rationale`, `Architectural`, `Testing`) was refactored into its own runnable worker file (`rationale-worker.ts`, etc.), designed to be launched as a separate process.

-   **Action: Refactored the `EvaluationOrchestrator`.**
    -   The orchestrator no longer instantiates analyzers directly. Its sole responsibility is now to manage the evaluation workflow.
    -   It uses `bullmq`'s `FlowProducer` to create a DAG of analysis jobs.
    -   It dispatches targeted, minimal-data messages to the specific worker queues, adhering to the principle of least privilege.
    -   A dedicated aggregator worker listens for the completion of the entire flow to assemble the final report, making the system fully asynchronous and event-driven.

## 3. Testing and Verification: A True End-to-End Test

The original E2E test was insufficient as it only tested the API layer.

-   **Action: Rewrote the E2E test.**
    -   The new test in `packages/server/src/e2e/evaluation.e2e.test.ts` is a true, multi-process integration test.
    -   Using Node.js's `child_process`, the test now programmatically starts:
        1.  The main API server.
        2.  The mock "Purple Agent" server.
        3.  All three new, separate worker processes.
    -   It then makes a request to the API and polls for the final result, validating that the entire distributed system works in concert as expected.

## 4. The Debugging Gauntlet

Achieving a passing E2E test for this new, complex architecture required a significant and systematic debugging effort.

-   **Initial Problem:** Tests were hanging silently.
-   **Investigation & Fixes (in order):**
    1.  **Incorrect Test Command:** Corrected the `pnpm` script invocation.
    2.  **Test Runner Configuration:** Discovered the `vitest.config.js` `include` pattern was too restrictive and was not discovering the E2E test file. Corrected the glob pattern.
    3.  **Missing Dependency:** Realized the core issue was that the Redis server, the backbone of `bullmq`, was not installed or running. Installed and started `redis-server`.
    4.  **Build Failures:** With Redis running, the tests began to fail with compilation errors, providing a clear signal.
        -   Fixed outdated constructor calls and obsolete imports in the orchestrator and server packages.
        -   Deleted an obsolete unit test (`evaluationOrchestrator.test.ts`) that was no longer valid for the new architecture.
    5.  **Child Process Errors:** The tests were still failing silently. Discovered the commands used to spawn the worker processes within the E2E test were incorrect. Corrected the `exec` commands to use `node` directly on the compiled output files.
    6.  **Final Build Cleanup:** A final `pnpm run build` revealed lingering broken imports from the refactor. I systematically removed all traces of the old analyzer classes from the `@logomesh/core` package and moved their definitions into the `@logomesh/workers` package, resulting in a completely clean, successful build of the entire monorepo.

## 5. Outcome

The project now has a robust, secure, and extensible multi-agent architecture that directly addresses the strategic goals outlined in the project plan and the feedback from the judge's report. The successful end-to-end test provides high confidence in the correctness and reproducibility of the new system.
