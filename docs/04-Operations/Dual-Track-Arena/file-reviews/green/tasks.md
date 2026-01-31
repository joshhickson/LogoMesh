---
status: ACTIVE
type: Log
---
> **Context:**
> * 2026-01-30: Review migrated from AgentBeats_Submission_Audit_Log.md as part of documentation overhaul. Source: sszz01 code review, see 20260127-Session-Review-Video-Plan-and-Cleanup.md.


# File Review: src/green_logic/tasks.py

## Summary
This file defines the `CODING_TASKS` list, which serves as the master specification for all coding challenges assigned to Purple Agents. Each entry in the list is a dictionary describing a single task, including its unique id, title, detailed requirements, constraints, and (optionally) hidden tests for Green Agent validation.

## Key Components
- **Task Structure:**
  - Each task is a dictionary with fields: `id`, `title`, `description` (multi-line, often with numbered requirements), and `constraints` (enforcing static/dynamic rules such as allowed imports, recursion, or thread safety).
  - Some tasks include a `hidden_tests` field, containing Python code for additional validation (not visible to Purple Agents).
- **Coverage:**
  - Tasks span a broad range of topics: input validation, rate limiting, LRU cache, recursion, JWT parsing, thread-safe connection pools, state machines, Merkle trees, blockchain, HD wallets, ECDSA, ERC-20 token logic, REST API routing, SQL query building, event sourcing, distributed queues, Raft consensus, B-trees, consistent hashing, and MVCC.
  - Each task is self-contained, specifying both implementation and testing requirements, and often requesting rationale for design decisions.
- **Constraints:**
  - Constraints are explicit and enforceable, e.g., "no network calls", "regex only", "require_thread_safety", or lists of allowed imports.
  - Some tasks include algorithmic or security constraints, and several require static analysis enforcement.
- **Usage:**
  - The file is used by the Green Agent server to select, describe, and evaluate tasks in the agent competition pipeline.
  - Tasks are presented to Purple Agents, who must submit solutions matching the requirements and constraints.
  - Hidden tests are used by the Green Agent to verify correctness and edge cases.

## Code Quality & Design
- The file is well-structured, with clear separation between tasks and consistent formatting.
- Descriptions are detailed and unambiguous, supporting both human and automated evaluation.
- The use of explicit constraints and hidden tests enables robust, fair, and reproducible assessment of agent submissions.

## Example Usage
The Green Agent server loads `CODING_TASKS` and selects a task to assign to a Purple Agent. The agent receives the task description and constraints, implements a solution, and submits it for evaluation. The Green Agent then runs both public and hidden tests to score the submission.

## Assessment
- **Strengths:**
  - Comprehensive coverage of relevant coding and system design topics.
  - Explicit, enforceable constraints for fair evaluation.
  - Supports both automated and manual review.
- **Weaknesses:**
  - As a static list, any changes require codebase updates and review.
  - Hidden tests are embedded as strings, which may complicate test management as the task set grows.

**Conclusion:**
This file is critical to the agent evaluation pipeline, providing a single source of truth for all coding tasks, their requirements, and validation logic. It is up-to-date, well-maintained, and central to the competition's integrity.
