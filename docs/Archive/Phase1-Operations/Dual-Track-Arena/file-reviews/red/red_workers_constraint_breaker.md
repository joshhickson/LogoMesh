---
status: ACTIVE
type: Log
---
> **Context:**
> * 2026-01-30: Review migrated from AgentBeats_Submission_Audit_Log.md as part of documentation overhaul. Source: sszz01 code review, see 20260127-Session-Review-Video-Plan-and-Cleanup.md.

# File Review: src/red_logic/workers/constraint_breaker.py

- Implements ConstraintBreakerWorker, which finds task-specific constraint violations.
- Encodes all task constraints (forbidden imports, patterns, required/forbidden constructs) as TaskConstraint dataclasses.
- Analyzes code for violations and reports vulnerabilities with severity and exploit hints.
- References src/green_logic/tasks.py for constraint definitions.
- Critical for enforcing compliance and catching specification violations.
