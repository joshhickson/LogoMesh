"""
Smart Reasoning Layer - LLM-powered vulnerability enhancement.

This layer adds intelligence on top of static analysis:
1. Finds logic flaws that static analysis misses
2. Identifies edge cases and boundary conditions
3. Discovers business logic vulnerabilities
4. Generates creative attack vectors

This is Layer 2 of the hybrid architecture - runs after static workers.
"""

import asyncio
import json
import os
import re
import sys
from typing import Optional
from enum import Enum
from dataclasses import dataclass

from openai import AsyncOpenAI

try:
    from llm_utils import get_temperature_kwargs
except ImportError:
    try:
        from src.llm_utils import get_temperature_kwargs
    except ImportError:
        def get_temperature_kwargs(default=0.7):
            return {"temperature": default}

# Add parent path to allow imports from green_logic (for Docker compatibility)
_src_path = os.path.dirname(os.path.dirname(__file__))
if _src_path not in sys.path:
    sys.path.insert(0, _src_path)

# Try multiple import paths for Docker compatibility
try:
    from green_logic.red_report_types import Vulnerability, Severity
except ImportError:
    try:
        from src.green_logic.red_report_types import Vulnerability, Severity
    except ImportError:
        # Fallback: define locally if imports fail
        class Severity(Enum):
            CRITICAL = "critical"
            HIGH = "high"
            MEDIUM = "medium"
            LOW = "low"
            INFO = "info"

        @dataclass
        class Vulnerability:
            severity: Severity
            category: str
            title: str
            description: str
            exploit_code: str = ""
            line_number: Optional[int] = None
            confidence: float = 0.8


class SmartReasoningLayer:
    """
    LLM-powered reasoning layer for finding vulnerabilities
    that static analysis cannot detect.

    Key features:
    - Bounded turns (max 3) to prevent infinite loops
    - Hard timeout (30s) to prevent stalls
    - Builds on static findings (doesn't duplicate)
    - Focuses on logic flaws, not syntax issues
    - Lazy initialization of LLM client (doesn't require API key at init)
    """

    # Task-specific attack focus hints
    TASK_ATTACK_HINTS = {
        "task-001": "Focus on: regex edge cases, unicode bypass, null bytes, extremely long inputs",
        "task-002": "Focus on: race conditions, clock manipulation, memory exhaustion with many clients",
        "task-003": "Focus on: cache poisoning, eviction race conditions, hash collisions",
        "task-004": "Focus on: stack overflow with large n, negative input handling",
        "task-005": "Focus on: algorithm confusion (alg:none), key confusion (RS256→HS256), expired token bypass",
        "task-006": "Focus on: deadlock scenarios, connection leaks, timeout race conditions",
        "task-007": "Focus on: invalid state transitions, event ordering, callback exceptions",
        "task-008": "Focus on: second preimage attacks, proof forgery, odd-length tree handling",
        "task-009": "Focus on: block tampering, chain reorganization, difficulty manipulation",
        "task-010": "Focus on: weak key derivation, hardened vs normal derivation confusion",
        "task-011": "Focus on: nonce reuse (critical!), invalid curve points, malleability",
        "task-012": "Focus on: overflow/underflow, approval race condition, zero address",
        "task-013": "Focus on: path traversal, middleware bypass, route collision",
        "task-014": "Focus on: SQL injection edge cases, UNION injection, blind injection",
        "task-015": "Focus on: event ordering, concurrency conflicts, version mismatch",
        "task-016": "Focus on: task loss, retry storms, dead letter queue bypass",
        "task-017": "Focus on: split brain, vote manipulation, term confusion",
        "task-018": "Focus on: tree corruption, rebalancing bugs, key collision",
        "task-019": "Focus on: hash collision attacks, hotspots, node failure handling",
        "task-020": "Focus on: write skew, phantom reads, version mismatch, GC race",
    }

    def __init__(self):
        self._client = None  # Lazy initialization
        self.model = os.getenv("MODEL_NAME", "gpt-4o-mini")
        self.max_retries = 2
        self.timeout = 30  # seconds

    @property
    def client(self):
        """Lazy initialization of OpenAI client."""
        if self._client is None:
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise ValueError("OPENAI_API_KEY not set - smart layer unavailable")
            self._client = AsyncOpenAI(
                api_key=api_key,
                base_url=os.getenv("OPENAI_BASE_URL")
            )
        return self._client

    async def enhance_findings(
        self,
        code: str,
        task_id: Optional[str],
        task_description: str,
        static_findings: list[Vulnerability],
        memory_context: str = "",
        task_intel=None,
    ) -> list[Vulnerability]:
        """
        Use LLM to find vulnerabilities that static analysis missed.

        Args:
            code: Source code to analyze
            task_id: Task identifier (e.g., "task-001")
            task_description: Full task description
            static_findings: Vulnerabilities already found by static workers
            task_intel: Optional TaskIntelligence for dynamic hint generation

        Returns:
            List of additional vulnerabilities found by LLM
        """
        try:
            return await asyncio.wait_for(
                self._do_enhance(code, task_id, task_description, static_findings, memory_context, task_intel),
                timeout=self.timeout
            )
        except asyncio.TimeoutError:
            print(f"[SmartReasoning] Timeout after {self.timeout}s, returning empty")
            return []
        except Exception as e:
            print(f"[SmartReasoning] Error: {e}")
            return []

    async def _do_enhance(
        self,
        code: str,
        task_id: Optional[str],
        task_description: str,
        static_findings: list[Vulnerability],
        memory_context: str = "",
        task_intel=None,
    ) -> list[Vulnerability]:
        """Internal method that does the actual enhancement."""

        # Format existing findings
        existing = self._format_existing_findings(static_findings)

        # Get task-specific hints — use TaskIntelligence for dynamic generation
        if task_intel and task_id:
            try:
                attack_hints = await task_intel.get_attack_hints(task_id, task_description, code)
            except Exception as e:
                print(f"[SmartReasoning] TaskIntelligence failed: {e}")
                attack_hints = self.TASK_ATTACK_HINTS.get(task_id, "Focus on common vulnerability patterns")
        else:
            attack_hints = self.TASK_ATTACK_HINTS.get(task_id, "Focus on common vulnerability patterns")

        prompt = f"""You are an expert security researcher performing a deep code review.

## TASK CONTEXT
{task_description[:1500]}

## STATIC ANALYSIS ALREADY FOUND
{existing if existing else "No vulnerabilities found by static analysis."}

## TARGET CODE
```python
{code[:4000]}
```

## YOUR MISSION
Find vulnerabilities that STATIC ANALYSIS MISSED. Do NOT repeat findings above.

{attack_hints}
{memory_context}

## LOOK FOR
1. **Logic Flaws**: Incorrect business logic, edge cases, off-by-one errors
2. **Race Conditions**: TOCTOU, concurrent access without synchronization
3. **Input Validation**: Missing validation, type confusion, boundary issues
4. **Crypto Issues**: Weak algorithms, timing attacks, key management
5. **Resource Issues**: Memory leaks, DoS vectors, resource exhaustion

## OUTPUT FORMAT
Return a JSON object with this EXACT structure:
{{
  "vulnerabilities": [
    {{
      "severity": "critical" | "high" | "medium" | "low",
      "category": "logic_flaw" | "race_condition" | "input_validation" | "crypto" | "resource" | "other",
      "title": "Brief title",
      "description": "Detailed explanation of the vulnerability and its impact",
      "exploit_code": "Proof of concept code showing how to exploit",
      "line_number": null or integer,
      "confidence": "high" | "medium" | "low"
    }}
  ]
}}

If you find NO new vulnerabilities, return: {{"vulnerabilities": []}}

IMPORTANT:
- Only report NEW findings not in static analysis
- Be specific - include line numbers and exploit code when possible
- Focus on EXPLOITABLE issues, not theoretical weaknesses
- Severity: critical=RCE/data loss, high=auth bypass/injection, medium=limited impact, low=theoretical"""

        for attempt in range(self.max_retries):
            try:
                response = await self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "You are a security vulnerability researcher. Return only valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    response_format={"type": "json_object"},
                    max_tokens=2000,
                    **get_temperature_kwargs(0.3)
                )

                content = response.choices[0].message.content
                return self._parse_response(content)

            except json.JSONDecodeError as e:
                print(f"[SmartReasoning] JSON parse error (attempt {attempt + 1}): {e}")
                continue
            except Exception as e:
                print(f"[SmartReasoning] LLM error (attempt {attempt + 1}): {e}")
                continue

        return []

    def _format_existing_findings(self, findings: list[Vulnerability]) -> str:
        """Format existing findings for the prompt."""
        if not findings:
            return ""

        lines = []
        for i, v in enumerate(findings, 1):
            lines.append(f"{i}. [{v.severity.value.upper()}] {v.title}")
            lines.append(f"   Category: {v.category}")
            if v.line_number:
                lines.append(f"   Line: {v.line_number}")

        return "\n".join(lines)

    def _parse_response(self, content: str) -> list[Vulnerability]:
        """Parse LLM response into Vulnerability objects."""
        vulnerabilities = []

        try:
            # Clean up potential markdown
            clean = content.strip()
            if clean.startswith("```"):
                clean = re.sub(r"```(?:json)?\s*\n?", "", clean)
                clean = clean.rstrip("`").strip()

            data = json.loads(clean)

            for v in data.get("vulnerabilities", []):
                try:
                    severity_str = v.get("severity", "medium").lower()
                    severity = Severity(severity_str)
                except ValueError:
                    severity = Severity.MEDIUM

                vulnerabilities.append(Vulnerability(
                    severity=severity,
                    category=v.get("category", "other"),
                    title=v.get("title", "Unnamed vulnerability"),
                    description=v.get("description", ""),
                    exploit_code=v.get("exploit_code"),
                    line_number=v.get("line_number"),
                    confidence=v.get("confidence", "medium")
                ))

        except json.JSONDecodeError as e:
            print(f"[SmartReasoning] Failed to parse response: {e}")
            print(f"[SmartReasoning] Raw content: {content[:500]}")

        return vulnerabilities


class ReflectionLayer:
    """
    Optional second-pass reasoning for deeper analysis.

    Only runs if:
    1. No CRITICAL vulnerabilities found yet
    2. Time budget allows (not near timeout)
    3. Static findings suggest more to explore
    """

    def __init__(self):
        self._client = None  # Lazy initialization
        self.model = os.getenv("MODEL_NAME", "gpt-4o-mini")

    @property
    def client(self):
        """Lazy initialization of OpenAI client."""
        if self._client is None:
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise ValueError("OPENAI_API_KEY not set - reflection layer unavailable")
            self._client = AsyncOpenAI(
                api_key=api_key,
                base_url=os.getenv("OPENAI_BASE_URL")
            )
        return self._client

    async def reflect_and_dig_deeper(
        self,
        code: str,
        task_id: Optional[str],
        all_findings: list[Vulnerability]
    ) -> list[Vulnerability]:
        """
        Second-pass analysis focusing on areas not yet explored.

        Args:
            code: Source code
            task_id: Task identifier
            all_findings: All findings so far (static + first LLM pass)

        Returns:
            Additional vulnerabilities from deeper analysis
        """
        try:
            return await asyncio.wait_for(
                self._do_reflect(code, task_id, all_findings),
                timeout=20
            )
        except asyncio.TimeoutError:
            return []
        except Exception as e:
            print(f"[Reflection] Error: {e}")
            return []

    async def _do_reflect(
        self,
        code: str,
        task_id: Optional[str],
        all_findings: list[Vulnerability]
    ) -> list[Vulnerability]:
        """Internal reflection method."""

        # Analyze what categories we've already covered
        covered_categories = set(v.category for v in all_findings)

        # Determine what to focus on
        uncovered = []
        all_categories = ["logic_flaw", "race_condition", "input_validation", "crypto", "resource", "injection"]
        for cat in all_categories:
            if cat not in covered_categories:
                uncovered.append(cat)

        if not uncovered:
            # Already covered everything
            return []

        prompt = f"""You are a security researcher doing a SECOND PASS analysis.

## CODE
```python
{code[:3000]}
```

## ALREADY FOUND
{len(all_findings)} vulnerabilities in categories: {', '.join(covered_categories)}

## YOUR FOCUS
You must look for vulnerabilities in these UNCOVERED categories:
{', '.join(uncovered)}

Focus especially on:
1. Edge cases in error handling
2. Boundary conditions (empty input, max values)
3. Concurrency issues if any shared state exists
4. Resource cleanup in failure paths

Return JSON:
{{"vulnerabilities": [...]}}

Only report HIGH or CRITICAL severity issues. Be concise."""

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Security researcher. JSON output only."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                max_tokens=1000,
                **get_temperature_kwargs(0.4)
            )

            content = response.choices[0].message.content
            data = json.loads(content)

            vulns = []
            for v in data.get("vulnerabilities", []):
                try:
                    severity = Severity(v.get("severity", "medium").lower())
                    # Only keep HIGH or CRITICAL as promised
                    if severity in [Severity.CRITICAL, Severity.HIGH]:
                        vulns.append(Vulnerability(
                            severity=severity,
                            category=v.get("category", "other"),
                            title=v.get("title", ""),
                            description=v.get("description", ""),
                            exploit_code=v.get("exploit_code"),
                            confidence=v.get("confidence", "medium")
                        ))
                except ValueError:
                    continue

            return vulns

        except Exception as e:
            print(f"[Reflection] Parse error: {e}")
            return []
