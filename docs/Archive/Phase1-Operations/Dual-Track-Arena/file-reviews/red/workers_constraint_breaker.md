---
status: ACTIVE
type: Log
---
> **Context:**
> * 2026-01-30: Review created as part of empirical documentation overhaul. See 20260127-Session-Review-Video-Plan-and-Cleanup.md for change tracking.

# File Review: src/red_logic/workers/constraint_breaker.py

## Summary
This module implements the Constraint Breaker Worker for the Red Agent. It detects violations of task-specific constraints defined for each LogoMesh task, such as forbidden imports, required patterns, and other code requirements. It references constraints from src/green_logic/tasks.py.

## Key Components
- **TaskConstraint (dataclass):** Defines a task-specific constraint, including task_id, name, description, check_type, patterns, severity, and exploit_hint.
- **ConstraintBreakerWorker (BaseWorker):** Checks code for violations of all defined constraints and reports them as vulnerabilities.
- **TASK_CONSTRAINTS:** List of all task constraints, covering a wide range of tasks and requirements.

## Features
- Detects forbidden imports, patterns, constructs, and enforces required patterns per task.
- Provides detailed findings with severity and exploit hints.
- Extensible: new constraints can be added easily.
- Integrates with Red Agent pipelines for automated constraint checking.

## Code Quality
- Modern, robust, and well-structured.
- Uses dataclasses and clear separation of concerns.
- No known technical debt or issues.

## Example Usage
```python
worker = ConstraintBreakerWorker()
result = worker.analyze(code, task_id="task-001")
for vuln in result.vulnerabilities:
    print(vuln)
```
