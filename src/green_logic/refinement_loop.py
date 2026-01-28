"""
Agentic Refinement Loop for Green Agent.

This module implements an iterative improvement loop that makes the Green Agent
more "agentic" - it doesn't just evaluate once, it helps Purple improve.

Flow:
1. Purple submits code
2. Green evaluates (tests + Red Agent)
3. If issues found → Green analyzes WHY and sends specific feedback
4. Purple fixes and resubmits
5. Repeat until passing or max iterations

This is the key difference between:
- Tool: "Your code failed" (one-shot)
- Agent: "Your code failed because X, try Y instead" (iterative, helpful)

AGI Features:
- Detects FALSE POSITIVES (e.g., QueryBuilder with parameterized queries)
- Understands code semantics, not just patterns
- Provides nuanced feedback based on actual issues
"""

import os
import json
from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any
from openai import AsyncOpenAI

# Import semantic analyzer for false positive detection
try:
    from src.red_logic.semantic_analyzer import QueryBuilderDetector, SecurityVerdict
    HAS_SEMANTIC_ANALYZER = True
except ImportError:
    HAS_SEMANTIC_ANALYZER = False


@dataclass
class RefinementResult:
    """Result of a single refinement iteration."""
    iteration: int
    passed: bool
    score: float
    issues: List[str] = field(default_factory=list)
    feedback_given: str = ""
    code_snippet: str = ""


@dataclass
class RefinementSession:
    """Tracks the full refinement session across iterations."""
    max_iterations: int = 3
    iterations: List[RefinementResult] = field(default_factory=list)
    final_passed: bool = False
    final_score: float = 0.0
    improvement_delta: float = 0.0  # How much score improved


class SelfReflectionEngine:
    """
    Uses LLM to analyze WHY code failed and generate targeted feedback.

    This is the "AGI" part - instead of just saying "test failed",
    it understands the root cause and suggests specific fixes.
    """

    def __init__(self):
        base_url = os.getenv("LLM_BASE_URL", os.getenv("OPENAI_BASE_URL"))
        self.client = AsyncOpenAI(
            api_key=os.getenv("LLM_API_KEY", os.getenv("OPENAI_API_KEY", "dummy")),
            base_url=base_url,
        )
        if base_url is None or "openai.com" in (base_url or ""):
            self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        else:
            self.model = os.getenv("LLM_MODEL_NAME", "Qwen/Qwen2.5-Coder-32B-Instruct-AWQ")

    def _filter_false_positives(
        self,
        source_code: str,
        vulnerabilities: List[Dict]
    ) -> tuple[List[Dict], List[str]]:
        """
        Filter out false positive vulnerabilities using semantic analysis.

        Returns:
            (real_vulnerabilities, filtered_reasons)
        """
        if not HAS_SEMANTIC_ANALYZER or not vulnerabilities:
            return vulnerabilities, []

        # Check if code implements QueryBuilder pattern
        detector = QueryBuilderDetector(source_code)
        class_info = detector.analyze()

        # Check for parameterized QueryBuilder
        has_parameterized_builder = any(
            info.get("is_parameterized", False)
            for info in class_info.values()
        )

        if not has_parameterized_builder:
            return vulnerabilities, []

        # Filter SQL injection false positives
        real_vulns = []
        filtered_reasons = []

        for vuln in vulnerabilities:
            if vuln.get("category") == "sql_injection":
                # This is likely a false positive - QueryBuilder uses parameterized queries
                filtered_reasons.append(
                    f"Filtered '{vuln.get('title', 'SQL issue')}' - code uses parameterized queries"
                )
            else:
                real_vulns.append(vuln)

        return real_vulns, filtered_reasons

    async def analyze_failure(
        self,
        task_description: str,
        source_code: str,
        test_output: str,
        red_vulnerabilities: List[Dict],
        audit_issues: List[str]
    ) -> Dict[str, Any]:
        """
        Analyze why code failed and generate targeted feedback.

        Returns:
            {
                "root_cause": "The function doesn't handle empty input",
                "specific_feedback": "Add a check for empty list at line 5",
                "suggested_fix": "if not items: return []",
                "priority_issues": ["empty input", "off-by-one"],
                "confidence": 0.85,
                "false_positives_filtered": ["SQL injection - uses parameterized queries"]
            }
        """
        # First, filter out false positives
        real_vulns, filtered_reasons = self._filter_false_positives(source_code, red_vulnerabilities)

        # Build context for LLM
        vuln_summary = "\n".join([
            f"- [{v.get('severity', 'unknown')}] {v.get('title', 'Unknown')}: {v.get('description', '')[:200]}"
            for v in real_vulns[:5]  # Top 5 REAL issues
        ]) if real_vulns else "No security vulnerabilities found."

        if filtered_reasons:
            vuln_summary += f"\n\n(Note: {len(filtered_reasons)} false positive(s) filtered - code uses safe patterns)"

        audit_summary = "\n".join([f"- {issue}" for issue in audit_issues[:5]]) if audit_issues else "No audit issues."

        prompt = f"""You are a senior code reviewer. Analyze why this code failed and provide SPECIFIC, ACTIONABLE feedback.

## Task Description
{task_description}

## Submitted Code
```python
{source_code[:2000]}
```

## Test Output (what went wrong)
```
{test_output[:1500]}
```

## Security Issues Found
{vuln_summary}

## Static Analysis Issues
{audit_summary}

## Your Analysis

Provide a JSON response with:
1. root_cause: The fundamental reason for failure (1-2 sentences)
2. specific_feedback: Exact instructions to fix (reference line numbers if possible)
3. suggested_fix: A code snippet showing the fix
4. priority_issues: List of top 3 issues to fix first
5. confidence: How confident you are in this analysis (0-1)

Respond with ONLY valid JSON, no markdown:"""

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful code reviewer. Always respond with valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,  # Lower temperature for more focused analysis
            )

            result_text = response.choices[0].message.content.strip()

            # Parse JSON response
            if result_text.startswith("```"):
                result_text = result_text.split("```")[1]
                if result_text.startswith("json"):
                    result_text = result_text[4:]

            return json.loads(result_text)

        except Exception as e:
            print(f"[SelfReflection] Analysis failed: {e}")
            # Fallback to basic analysis
            return {
                "root_cause": "Test execution failed",
                "specific_feedback": f"Review test output: {test_output[:200]}",
                "suggested_fix": "",
                "priority_issues": ["Review test failures"],
                "confidence": 0.3
            }


class AdaptiveTestGenerator:
    """
    Generates additional tests based on what Red Agent found.

    If Red found SQL injection, generate MORE SQL injection tests.
    This is adaptive - it targets the specific weaknesses found.
    """

    def __init__(self):
        base_url = os.getenv("LLM_BASE_URL", os.getenv("OPENAI_BASE_URL"))
        self.client = AsyncOpenAI(
            api_key=os.getenv("LLM_API_KEY", os.getenv("OPENAI_API_KEY", "dummy")),
            base_url=base_url,
        )
        if base_url is None or "openai.com" in (base_url or ""):
            self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        else:
            self.model = os.getenv("LLM_MODEL_NAME", "Qwen/Qwen2.5-Coder-32B-Instruct-AWQ")

    async def generate_targeted_tests(
        self,
        source_code: str,
        vulnerabilities: List[Dict],
        previous_test_output: str
    ) -> str:
        """
        Generate tests that specifically target the vulnerabilities found.
        """
        if not vulnerabilities:
            return ""

        # Group vulnerabilities by category
        categories = {}
        for v in vulnerabilities:
            cat = v.get("category", "unknown")
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(v)

        # Generate targeted tests for each category
        prompt = f"""Generate pytest tests that specifically target these vulnerabilities found in the code:

## Vulnerabilities Found
{json.dumps(vulnerabilities[:5], indent=2)}

## Source Code
```python
{source_code[:1500]}
```

## Previous Test Output
{previous_test_output[:500]}

Generate 3-5 unittest tests that will EXPOSE these specific vulnerabilities.
Focus on the exact attack vectors mentioned.

Output ONLY valid Python code using unittest, no explanations:"""

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Generate unittest test code only. No explanations."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
            )

            return response.choices[0].message.content.strip()

        except Exception as e:
            print(f"[AdaptiveTests] Generation failed: {e}")
            return ""


class RefinementLoop:
    """
    Main agentic refinement loop.

    This is what makes the Green Agent truly "agentic":
    - It doesn't just evaluate once
    - It iteratively helps Purple improve
    - It uses self-reflection to understand failures
    - It adapts its testing based on what it finds
    """

    def __init__(self, max_iterations: int = 3):
        self.max_iterations = max_iterations
        self.reflection_engine = SelfReflectionEngine()
        self.adaptive_tester = AdaptiveTestGenerator()

    def should_continue(
        self,
        iteration: int,
        test_passed: bool,
        score: float,
        critical_vulns: int
    ) -> bool:
        """
        Decide if we should ask Purple for another iteration.

        Conditions to STOP:
        - Max iterations reached
        - Tests pass AND no critical vulnerabilities AND score > 0.8
        """
        if iteration >= self.max_iterations:
            return False

        if test_passed and critical_vulns == 0 and score >= 0.8:
            return False  # Good enough!

        return True  # Keep trying

    async def generate_feedback_message(
        self,
        task_description: str,
        source_code: str,
        test_output: str,
        red_vulnerabilities: List[Dict],
        audit_issues: List[str],
        iteration: int
    ) -> str:
        """
        Generate a helpful feedback message to send to Purple Agent.

        This is the key agentic behavior - giving SPECIFIC, ACTIONABLE feedback.
        """

        # Use self-reflection to understand the failure
        analysis = await self.reflection_engine.analyze_failure(
            task_description=task_description,
            source_code=source_code,
            test_output=test_output,
            red_vulnerabilities=red_vulnerabilities,
            audit_issues=audit_issues
        )

        # Build feedback message
        feedback = f"""## Iteration {iteration} Feedback

Your code has issues that need to be fixed. Here's what went wrong:

### Root Cause
{analysis.get('root_cause', 'Test failures detected')}

### Specific Issues to Fix
{analysis.get('specific_feedback', 'Review the test output')}

### Priority (fix these first)
"""

        for i, issue in enumerate(analysis.get('priority_issues', [])[:3], 1):
            feedback += f"{i}. {issue}\n"

        if analysis.get('suggested_fix'):
            feedback += f"""
### Suggested Fix
```python
{analysis.get('suggested_fix')}
```
"""

        feedback += """
Please fix these issues and resubmit. Respond with the same JSON format:
{
    "sourceCode": "...",
    "testCode": "...",
    "rationale": "..."
}"""

        return feedback

    def calculate_improvement(self, iterations: List[RefinementResult]) -> float:
        """Calculate how much the score improved across iterations."""
        if len(iterations) < 2:
            return 0.0

        return iterations[-1].score - iterations[0].score


def create_refinement_task_prompt(
    original_prompt: str,
    feedback: str,
    iteration: int
) -> str:
    """
    Create a new task prompt that includes the feedback.

    This is sent to Purple Agent for the next iteration.
    """
    return f"""{original_prompt}

---
{feedback}

This is iteration {iteration}. Please address the feedback above and resubmit your improved solution."""
