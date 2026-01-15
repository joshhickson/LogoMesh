"""
Red Agent Report Parser

Parses Red Agent responses into structured vulnerability reports.
Supports both structured JSON parsing and keyword-based fallback detection.
"""

import json
import re
from typing import Optional

from .red_report_types import RedAgentReport, Vulnerability, Severity


# Fallback keyword patterns with associated severity
EXPLOIT_KEYWORDS: dict[Severity, list[str]] = {
    Severity.CRITICAL: [
        r"\bremote\s+code\s+execution\b",
        r"\brce\b",
        r"\bshell\s+injection\b",
        r"\bcommand\s+injection\b",
        r"\beval\s*\([^)]*user",
        r"\bexec\s*\([^)]*user",
        r"\barbitrary\s+code\b",
    ],
    Severity.HIGH: [
        r"\bsql\s+injection\b",
        r"\bsqli\b",
        r"\bauth(?:entication)?\s+bypass\b",
        r"\bprivilege\s+escalation\b",
        r"\bxss\b",
        r"\bcross.site\s+scripting\b",
        r"\bpath\s+traversal\b",
        r"\bdirectory\s+traversal\b",
    ],
    Severity.MEDIUM: [
        r"\bexploit(?:ed|able)?\b",
        r"\bvulnerability\b",
        r"\bvulnerable\b",
        r"\bbypass(?:ed)?\b",
        r"\binjection\b",
        r"\bunsafe\b",
        r"\binsecure\b",
    ],
    Severity.LOW: [
        r"\binfo(?:rmation)?\s+disclosure\b",
        r"\bweakness\b",
        r"\bedge\s+case\b",
        r"\bflaw\b",
        r"\bmissing\s+validation\b",
        r"\bimproper\s+handling\b",
    ],
}

# Keywords indicating successful attack
SUCCESS_INDICATORS = [
    "successfully",
    "exploited",
    "confirmed",
    "poc works",
    "proof of concept",
    "attack succeeded",
    "was able to",
    "managed to",
]


class RedReportParser:
    """Parses Red Agent responses into structured vulnerability reports."""

    def parse(self, red_result_data: dict) -> RedAgentReport:
        """
        Parse Red Agent JSON-RPC response into structured report.

        Attempts structured JSON parsing first, falls back to keyword analysis.

        Args:
            red_result_data: Raw JSON-RPC response from Red Agent

        Returns:
            RedAgentReport with parsed vulnerabilities and penalty info
        """
        # Extract text content from A2A response structure
        raw_text = self._extract_text(red_result_data)

        # Try structured JSON parsing first
        report = self._try_parse_structured(raw_text)
        if report:
            report.raw_response = raw_text
            return report

        # Fall back to keyword-based analysis
        return self._parse_with_keywords(raw_text)

    def _extract_text(self, red_result_data: dict) -> str:
        """Extract text content from A2A JSON-RPC response."""
        try:
            # A2A structure: result -> status -> message -> parts[0] -> text
            text = (
                red_result_data
                .get("result", {})
                .get("status", {})
                .get("message", {})
                .get("parts", [{}])[0]
                .get("text", "")
            )
            if text:
                print(f"DEBUG RedParser: Extracted text from A2A structure ({len(text)} chars)")
                return text

            # Fallback: Check if it's a direct text response
            if "text" in red_result_data:
                print(f"DEBUG RedParser: Using direct 'text' field")
                return red_result_data["text"]

            # Fallback: Use JSON serialization (not str()) to preserve valid JSON format
            print(f"DEBUG RedParser: A2A extraction empty, falling back to JSON serialization")
            print(f"DEBUG RedParser: Available keys: {list(red_result_data.keys())}")
            return json.dumps(red_result_data)

        except (KeyError, IndexError, TypeError) as e:
            # If structure doesn't match, serialize as JSON (not str() which uses single quotes)
            print(f"DEBUG RedParser: Extraction failed ({e}), using JSON fallback")
            return json.dumps(red_result_data)

    def _try_parse_structured(self, raw_text: str) -> Optional[RedAgentReport]:
        """Attempt to parse response as structured JSON."""
        try:
            # Clean potential markdown code blocks
            clean_text = raw_text.strip()
            if clean_text.startswith("```"):
                # Remove ```json or ``` prefix
                clean_text = re.sub(r"```(?:json)?\s*\n?", "", clean_text)
                clean_text = clean_text.rstrip("`").strip()

            # Remove inline comments that LLMs sometimes add (invalid in JSON)
            # Pattern: matches `// comment` or `# comment` outside of strings
            # Simple approach: remove lines that are just comments, and trailing comments
            lines = clean_text.split('\n')
            cleaned_lines = []
            for line in lines:
                # Remove trailing comments (not inside strings - simplified heuristic)
                # Look for # or // that appears after a closing " or digit
                line = re.sub(r'(["\d\]},])\s*#[^"]*$', r'\1', line)
                line = re.sub(r'(["\d\]},])\s*//[^"]*$', r'\1', line)
                cleaned_lines.append(line)
            clean_text = '\n'.join(cleaned_lines)

            data = json.loads(clean_text)
            print(f"DEBUG RedParser: JSON parsed successfully, keys: {list(data.keys())}")

            # Validate required fields
            if "attack_successful" not in data:
                print(f"DEBUG RedParser: Missing 'attack_successful' field, falling back to keyword parsing")
                return None

            vulnerabilities = []
            for v in data.get("vulnerabilities", []):
                try:
                    severity = Severity(v.get("severity", "medium").lower())
                except ValueError:
                    severity = Severity.MEDIUM

                vulnerabilities.append(Vulnerability(
                    severity=severity,
                    category=v.get("category", "other"),
                    title=v.get("title", "Unnamed vulnerability"),
                    description=v.get("description", ""),
                    exploit_code=v.get("exploit_code"),
                    line_number=v.get("line_number"),
                    confidence=v.get("confidence", "medium"),
                ))

            report = RedAgentReport(
                attack_successful=data.get("attack_successful", False),
                vulnerabilities=vulnerabilities,
                attack_summary=data.get("attack_summary", ""),
            )
            print(f"DEBUG RedParser: Structured parsing SUCCESS - attack_successful={report.attack_successful}, vulns={len(vulnerabilities)}")
            return report
        except (json.JSONDecodeError, ValueError, KeyError, TypeError) as e:
            print(f"DEBUG RedParser: Structured parsing FAILED: {type(e).__name__}: {e}")
            print(f"DEBUG RedParser: Raw text preview: {raw_text[:200]}...")
            return None

    def _parse_with_keywords(self, raw_text: str) -> RedAgentReport:
        """Fall back to keyword-based severity detection."""
        text_lower = raw_text.lower()
        vulnerabilities = []
        matched_severities = set()

        # Check keywords in severity order (highest first)
        for severity, patterns in EXPLOIT_KEYWORDS.items():
            if severity in matched_severities:
                continue

            for pattern in patterns:
                match = re.search(pattern, text_lower, re.IGNORECASE)
                if match:
                    vulnerabilities.append(Vulnerability(
                        severity=severity,
                        category="detected_via_keyword",
                        title=f"Keyword match: {match.group()}",
                        description=f"Red Agent mentioned '{match.group()}' in response",
                        confidence="low",
                    ))
                    matched_severities.add(severity)
                    break  # One match per severity level

        # Determine if attack was successful based on keywords
        attack_successful = any(
            ind in text_lower for ind in SUCCESS_INDICATORS
        ) or len(vulnerabilities) > 0

        return RedAgentReport(
            attack_successful=attack_successful,
            vulnerabilities=vulnerabilities,
            attack_summary="Parsed via keyword fallback",
            raw_response=raw_text,
        )
