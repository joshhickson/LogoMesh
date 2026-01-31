---

status: ACTIVE
type: Log
---
> **Context:**
> * 2026-01-30: Review migrated from AgentBeats_Submission_Audit_Log.md as part of documentation overhaul. Source: sszz01 code review, see 20260127-Session-Review-Video-Plan-and-Cleanup.md.
> * 2026-01-30: Updated after full code review for accuracy and completeness.

# File Review: src/green_logic/red_report_types.py

## Summary
Defines structured data types for Red Agent vulnerability reports, used by the scoring system for CIS penalty calculation. Provides a clear, extensible, and type-safe foundation for vulnerability reporting and penalty logic.

## Key Components
- **Severity (Enum)**: CVSS-like severity levels (CRITICAL, HIGH, MEDIUM, LOW, INFO) with associated penalty percentages (40%, 25%, 15%, 5%, 0%).
- **Vulnerability (dataclass)**: Represents a single vulnerability, including severity, category, title, description, exploit code, line number, and confidence.
- **RedAgentReport (dataclass)**: Structured report containing:
  - `attack_successful`: Boolean flag for attack outcome.
  - `vulnerabilities`: List of Vulnerability objects.
  - `attack_summary`: Optional summary string.
  - `raw_response`: Original response for debugging.
  - `get_max_severity()`: Returns the highest severity among all vulnerabilities.
  - `get_penalty_multiplier()`: Returns a penalty multiplier (1.0 = no penalty, 0.6 = max penalty) based on the highest severity found.

## Features
- Used by red_report_parser and scoring logic to apply severity-based penalties to CIS scores.
- Type-annotated, robust, and extensible for future vulnerability types or penalty logic.

## Code Quality
- Modern, type-annotated, and production-ready.
- Clear docstrings and robust handling of edge cases.
- No known issues or technical debt.

## Example Usage
```python
report = RedAgentReport(attack_successful=True, vulnerabilities=[...])
penalty = report.get_penalty_multiplier()
```
