---
status: ACTIVE
type: Log
---
> **Context:**
> * 2026-01-30: Review created as part of empirical documentation overhaul. See 20260127-Session-Review-Video-Plan-and-Cleanup.md for change tracking.

# File Review: src/red_logic/reasoning.py

## Summary
This module implements the "Smart Reasoning Layer" for the Red Agent, leveraging LLMs to enhance vulnerability detection beyond static analysis. It identifies logic flaws, edge cases, business logic vulnerabilities, and generates creative attack vectors. This is Layer 2 in the hybrid Red Agent architecture.

## Key Components
- **LLM Integration:** Uses OpenAI (AsyncOpenAI) to power advanced reasoning and vulnerability discovery.
- **get_temperature_kwargs:** Utility for temperature configuration, robust to import path issues.
- **Vulnerability & Severity:** Imports or defines these dataclasses/enums for reporting findings.
- **Hybrid Import Logic:** Handles multiple import paths for Docker and local compatibility.

## Features
- Finds vulnerabilities missed by static analysis (logic, business, edge cases).
- Generates creative attack vectors using LLMs.
- Robust to environment and import path issues (Docker, local, etc.).
- Designed for asynchronous operation and integration with Red Agent pipelines.

## Code Quality
- Modern, robust, and well-structured.
- Handles import errors gracefully.
- No known technical debt or issues.

## Example Usage
```python
# Used internally by Red Agent as Layer 2 after static analysis.
# vulnerabilities = await analyze_with_llm(source_code)
# for vuln in vulnerabilities:
#     print(vuln)
```
