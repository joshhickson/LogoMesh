"""
Dynamic Test Generator for the Green Agent.

Uses an LLM (Qwen-2.5-Coder) to generate adversarial pytest cases
that target edge cases and vulnerabilities in the Purple Agent's code.
"""

import asyncio
import os
import re

from openai import AsyncOpenAI


class TestGenerator:
    """Generates adversarial pytest cases using Qwen-2.5-Coder."""

    FALLBACK_TEST = """import unittest
from solution import *

class TestFallback(unittest.TestCase):
    def test_fallback(self):
        self.assertTrue(True)
"""

    def __init__(self):
        """Initialize AsyncOpenAI client for vLLM (OpenAI-compatible API)."""
        # Priority: LLM_* > OPENAI_* (for backwards compatibility)
        base_url = os.getenv("LLM_BASE_URL", os.getenv("OPENAI_BASE_URL"))
        self.client = AsyncOpenAI(
            api_key=os.getenv("LLM_API_KEY", os.getenv("OPENAI_API_KEY", "dummy")),
            base_url=base_url,
        )
        # Auto-detect: if no custom base_url, we're using OpenAI directly
        if base_url is None or "openai.com" in (base_url or ""):
            default_model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        else:
            default_model = "Qwen/Qwen2.5-Coder-32B-Instruct-AWQ"
        self.model = os.getenv("LLM_MODEL_NAME", os.getenv("MODEL_NAME", default_model))
        self.timeout_seconds = 30  # vLLM can be slow on first request

    async def generate_adversarial_tests(
        self, task_desc: str, candidate_code: str
    ) -> str:
        """
        Generate adversarial pytest cases targeting the candidate code.

        Args:
            task_desc: The original task description.
            candidate_code: The Purple Agent's submitted source code.

        Returns:
            A string of valid Python pytest code, or a safe fallback on failure.
        """
        system_prompt = """You are a Ruthless QA Engineer. Your mission is to break code.

Analyze the candidate code provided and identify exactly 3 specific edge cases that could cause failures:
- Integer overflows or boundary values
- Null/None inputs or empty collections
- Negative numbers or invalid input types
- Off-by-one errors
- Division by zero scenarios

CRITICAL CONSTRAINTS:
1. Output ONLY valid Python code using unittest. No explanations.
2. No markdown formatting. No code blocks. Just raw Python.
3. Import the solution with: from solution import *
4. Create a TestCase class with test methods starting with `test_` prefix.
5. Make tests that EXPOSE bugs, not confirm correctness.
6. NEVER use infinite loops (while True) or sleep(). Keep inputs small.
7. Tests must complete in under 1 second.
8. DO NOT import pytest. Use only unittest and assert methods like self.assertEqual(), self.assertRaises(), etc.

Example format:
import unittest
from solution import *

class TestEdgeCases(unittest.TestCase):
    def test_empty_input(self):
        self.assertIsNone(func(None))
    def test_boundary(self):
        self.assertEqual(func(0), expected)"""

        user_prompt = f"""### Task Description
{task_desc}

### Candidate Code to Attack
{candidate_code}

Generate 3 adversarial pytest test functions targeting edge cases in this code."""

        try:
            response = await asyncio.wait_for(
                self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    temperature=0.7,
                ),
                timeout=self.timeout_seconds,
            )

            raw_output = response.choices[0].message.content
            return self._sanitize_output(raw_output)

        except asyncio.TimeoutError:
            print("DEBUG: TestGenerator timed out")
            return self.FALLBACK_TEST
        except Exception as e:
            print(f"DEBUG: TestGenerator failed: {e}")
            return self.FALLBACK_TEST

    def _sanitize_output(self, raw: str) -> str:
        """
        Aggressively sanitize LLM output to extract ONLY valid Python code.
        """
        if not raw:
            return self.FALLBACK_TEST

        # 1. Try to find code inside markdown blocks (```python ... ```)
        # Matches ```python, ```py, or just ```
        code_match = re.search(r"```(?:python|py)?\s*\n(.*?)```", raw, re.DOTALL | re.IGNORECASE)

        if code_match:
            clean_code = code_match.group(1)
        else:
            # 2. If no markdown, assume the whole text is code but strip "Here is the code:" logic
            # This regex looks for the first import or def and keeps everything after
            match = re.search(r"^(?:import|from|def|class)\s+.*", raw, re.MULTILINE | re.DOTALL)
            if match:
                clean_code = match.group(0)
            else:
                # Fallback: Just try to use the raw text if it looks vaguely like python
                clean_code = raw

        # 3. Final cleanup of whitespace
        clean_code = clean_code.strip()

        # 4. Emergency Sanity Check: If it's empty or doesn't look like code, return fallback
        if not clean_code or "def test_" not in clean_code:
            return self.FALLBACK_TEST

        return clean_code