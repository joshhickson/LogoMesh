---
status: ACTIVE
type: Log
---
> **Context:**
> * 2026-01-30: Review created as part of empirical documentation overhaul. See 20260127-Session-Review-Video-Plan-and-Cleanup.md for change tracking.

# File Review: src/red_logic/workers/static_mirror.py

## Summary
This module implements the Static Mirror Worker for the Red Agent. It mirrors the Green Agent's SemanticAuditor checks, ensuring that any vulnerability found here will also be penalized by the Green Agent. It references logic from src/green_logic/analyzer.py.

## Key Components
- **StaticMirrorWorker (BaseWorker):** Checks for forbidden imports, dangerous functions, SQL injection, command injection, high cyclomatic complexity, and deep nesting, mirroring Green Agent logic.
- **FORBIDDEN_IMPORTS:** Set of imports that are always forbidden.
- **DANGEROUS_FUNCTIONS:** Dict of dangerous functions with severity and rationale.
- **SQL_PATTERNS:** Regex patterns for detecting dangerous SQL usage (f-strings, % formatting, etc.).

## Features
- Ensures Red Agent findings match Green Agent's enforcement.
- Detects a wide range of security issues and code quality problems.
- Extensible: new checks can be added to match Green Agent updates.
- Integrates with Red Agent pipelines for automated static analysis.

## Code Quality
- Modern, robust, and well-structured.
- Uses clear separation of concerns and mirrors Green Agent logic precisely.
- No known technical debt or issues.

## Example Usage
```python
worker = StaticMirrorWorker()
result = worker.analyze(code)
for vuln in result.vulnerabilities:
    print(vuln)
```
