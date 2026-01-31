---

status: ACTIVE
type: Log
---
> **Context:**
> * 2026-01-30: Review migrated from AgentBeats_Submission_Audit_Log.md as part of documentation overhaul. Source: sszz01 code review, see 20260127-Session-Review-Video-Plan-and-Cleanup.md.
> * 2026-01-30: Updated after full code review for accuracy and completeness.

# File Review: src/green_logic/harmony_parser.py

## Summary
Implements the `HarmonyParser` class for parsing responses from gpt-oss-20b models using the Harmony Response Format. Extracts structured reasoning traces and final outputs from XML-style channel tags, supporting robust CIS validation.

## Key Components
- **HarmonyParser class**
  - `parse(response_text: str) -> dict`: Extracts all channels (analysis, final, search, reflection) from Harmony-formatted responses, mapping them to a dictionary. Handles both standard and fallback formats (with or without explicit end tags).
  - `extract_code_from_final(final_content: Optional[str]) -> Optional[str]`: Extracts code from the 'final' channel, handling JSON, markdown, and plain code formats. Returns code or None if not found.
  - `extract_rationale_from_analysis(analysis_content: Optional[str]) -> Optional[str]`: Extracts design rationale from the 'analysis' channel, using regex patterns for rationale/approach/reasoning sections. Returns rationale or the full analysis if not found.
  - `format_for_display(parsed: dict, max_length: int = 500) -> str`: Formats parsed output for human-readable display, previewing analysis and final channels.

## Features
- Supports both standard Harmony format and fallback parsing for non-standard or incomplete responses.
- Extensively documented, with clear references to Harmony protocol and example usage/test cases in the main block.
- Handles edge cases and fallback scenarios robustly, ensuring graceful degradation if Harmony format is not detected.
- Used for parsing model outputs for CIS validation, especially for extracting requirements (intent) and code for scoring.

## Code Quality
- Modern, modular, and production-ready.
- Strong regex handling and clear separation of parsing logic.
- No known issues or technical debt.

## Example Usage
```python
parser = HarmonyParser()
result = parser.parse(response_text)
code = parser.extract_code_from_final(result['final'])
rationale = parser.extract_rationale_from_analysis(result['analysis'])
```
