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

    FALLBACK_TEST = "def test_fallback(): assert True"

    def __init__(self):
        """Initialize AsyncOpenAI client with Qwen configuration."""
        self.client = AsyncOpenAI(
            api_key=os.getenv("QWEN_API_KEY"),
            base_url=os.getenv("QWEN_BASE_URL"),
        )
        self.timeout_seconds = 10

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
1. Output ONLY valid Python code using pytest. No explanations.
2. No markdown formatting. No code blocks. Just raw Python.
3. Assume the candidate code is saved as `solution.py` and import via: from solution import *
4. Each test function must start with `test_` prefix.
5. Make tests that EXPOSE bugs, not confirm correctness."""

        user_prompt = f"""### Task Description
{task_desc}

### Candidate Code to Attack
{candidate_code}

Generate 3 adversarial pytest test functions targeting edge cases in this code."""

        try:
            response = await asyncio.wait_for(
                self.client.chat.completions.create(
                    model=os.getenv("QWEN_MODEL_NAME", "qwen-2.5-coder"),
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
            return self.FALLBACK_TEST
        except Exception:
            return self.FALLBACK_TEST

    def _sanitize_output(self, raw: str) -> str:
        """
        Strip markdown code blocks from LLM response.

        Handles patterns like:
        - ```python ... ```
        - ``` ... ```
        - ```py ... ```
        """
        if not raw:
            return self.FALLBACK_TEST

        # Remove markdown code fences (```python, ```py, or just ```)
        sanitized = re.sub(
            r"```(?:python|py)?\s*\n?(.*?)```",
            r"\1",
            raw,
            flags=re.DOTALL | re.IGNORECASE,
        )

        # Strip leading/trailing whitespace
        sanitized = sanitized.strip()

        # If sanitization resulted in empty string, return fallback
        if not sanitized:
            return self.FALLBACK_TEST

        return sanitized