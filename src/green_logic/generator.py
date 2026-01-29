"""
Dynamic Test Generator for the Green Agent.

Uses an LLM to generate adversarial test cases plus a programmatic fuzzer
that systematically generates edge case inputs.

Features:
1. LLM-generated adversarial tests (smart, contextual)
2. Programmatic fuzzer (systematic, guaranteed coverage)
"""

import ast
import asyncio
import os
import re
from typing import List, Dict, Set, Any, Optional

from openai import AsyncOpenAI

try:
    from llm_utils import get_temperature_kwargs
except ImportError:
    try:
        from src.llm_utils import get_temperature_kwargs
    except ImportError:
        def get_temperature_kwargs(default=0.7):
            return {"temperature": default}


# =============================================================================
# PROGRAMMATIC FUZZER - Systematic edge case generation
# =============================================================================

class CodeAnalyzer(ast.NodeVisitor):
    """Extract function signatures and class info from code."""

    def __init__(self):
        self.functions: List[Dict] = []
        self.classes: List[Dict] = []
        self.current_class: Optional[str] = None

    def visit_ClassDef(self, node: ast.ClassDef):
        self.current_class = node.name
        self.classes.append({
            "name": node.name,
            "methods": [],
            "init_params": []
        })
        self.generic_visit(node)
        self.current_class = None

    def visit_FunctionDef(self, node: ast.FunctionDef):
        params = []
        for arg in node.args.args:
            if arg.arg != 'self':
                param_type = None
                if arg.annotation:
                    param_type = ast.unparse(arg.annotation) if hasattr(ast, 'unparse') else str(arg.annotation)
                params.append({"name": arg.arg, "type": param_type})

        func_info = {
            "name": node.name,
            "params": params,
            "class": self.current_class
        }

        if self.current_class:
            # Add to class methods
            for c in self.classes:
                if c["name"] == self.current_class:
                    if node.name == "__init__":
                        c["init_params"] = params
                    else:
                        c["methods"].append(func_info)
        else:
            self.functions.append(func_info)

        self.generic_visit(node)


# Fuzz values by inferred type
FUZZ_VALUES = {
    "int": [0, -1, 1, -999999, 999999, 2**31-1, -2**31],
    "float": [0.0, -1.0, 1.0, float('inf'), float('-inf'), 1e-10, 1e10],
    "str": ["", " ", "a", "a"*1000, "\x00", "\n\t\r", "'; DROP TABLE--", "<script>alert(1)</script>"],
    "bool": [True, False],
    "list": [[], [None], [1], [1,2,3], list(range(1000))],
    "dict": [{}, {"a": 1}, {None: None}, {"key": "value"*100}],
    "none": [None],
    "any": [None, 0, "", [], {}, -1, "test"],
}

# Type inference from parameter names
NAME_TYPE_HINTS = {
    "key": "str",
    "keys": "list",
    "value": "any",
    "values": "list",
    "node": "str",
    "nodes": "list",
    "n": "int",
    "num": "int",
    "count": "int",
    "size": "int",
    "index": "int",
    "idx": "int",
    "name": "str",
    "text": "str",
    "data": "any",
    "items": "list",
    "timeout": "float",
    "flag": "bool",
    "enabled": "bool",
}


def infer_type(param_name: str, type_hint: Optional[str]) -> str:
    """Infer parameter type from hint or name."""
    if type_hint:
        hint_lower = type_hint.lower()
        if "int" in hint_lower:
            return "int"
        if "float" in hint_lower:
            return "float"
        if "str" in hint_lower:
            return "str"
        if "bool" in hint_lower:
            return "bool"
        if "list" in hint_lower or "sequence" in hint_lower:
            return "list"
        if "dict" in hint_lower or "mapping" in hint_lower:
            return "dict"
        if "none" in hint_lower or "optional" in hint_lower:
            return "none"

    # Infer from name
    name_lower = param_name.lower()
    for pattern, ptype in NAME_TYPE_HINTS.items():
        if pattern in name_lower:
            return ptype

    return "any"


def generate_fuzz_tests(code: str) -> str:
    """
    Generate systematic fuzz tests based on code analysis.

    Analyzes function signatures and generates tests for:
    - Empty/null inputs
    - Boundary values
    - Type confusion
    - Large inputs
    """
    try:
        tree = ast.parse(code)
    except SyntaxError:
        return ""

    analyzer = CodeAnalyzer()
    analyzer.visit(tree)

    test_lines = [
        "import pytest",
        "from solution import *",
        "",
    ]

    test_count = 0
    max_tests = 10  # Limit to avoid huge test files

    # Generate tests for classes
    for cls in analyzer.classes:
        if test_count >= max_tests:
            break

        class_name = cls["name"]
        init_params = cls["init_params"]

        # Test 1: Empty/default construction
        if not init_params or all(p.get("default") for p in init_params):
            test_lines.append(f"")
            test_lines.append(f"def test_{class_name.lower()}_empty_init():")
            test_lines.append(f"    '''Test {class_name} with no arguments'''")
            test_lines.append(f"    try:")
            test_lines.append(f"        obj = {class_name}()")
            test_lines.append(f"        assert obj is not None")
            test_lines.append(f"    except (TypeError, ValueError) as e:")
            test_lines.append(f"        pass  # Expected if required params")
            test_count += 1

        # Test 2: None arguments
        if init_params:
            test_lines.append(f"")
            test_lines.append(f"def test_{class_name.lower()}_none_args():")
            test_lines.append(f"    '''Test {class_name} with None arguments'''")
            test_lines.append(f"    try:")
            none_args = ", ".join(["None"] * len(init_params))
            test_lines.append(f"        obj = {class_name}({none_args})")
            test_lines.append(f"    except (TypeError, ValueError, AttributeError) as e:")
            test_lines.append(f"        pass  # May be expected")
            test_count += 1

        # Test methods with edge cases
        for method in cls["methods"]:
            if test_count >= max_tests:
                break
            if method["name"].startswith("_"):
                continue  # Skip private methods

            method_name = method["name"]
            params = method["params"]

            if not params:
                continue

            # Generate fuzz values for first param
            first_param = params[0]
            param_type = infer_type(first_param["name"], first_param.get("type"))
            fuzz_vals = FUZZ_VALUES.get(param_type, FUZZ_VALUES["any"])[:3]

            for i, fuzz_val in enumerate(fuzz_vals):
                if test_count >= max_tests:
                    break

                test_lines.append(f"")
                test_lines.append(f"def test_{class_name.lower()}_{method_name}_fuzz{i}():")
                test_lines.append(f"    '''Fuzz {class_name}.{method_name} with {repr(fuzz_val)[:30]}'''")
                test_lines.append(f"    try:")

                # Build init args (use simple defaults)
                if init_params:
                    init_args = []
                    for p in init_params:
                        ptype = infer_type(p["name"], p.get("type"))
                        if ptype == "list":
                            init_args.append("[]")
                        elif ptype == "str":
                            init_args.append("'test'")
                        elif ptype == "int":
                            init_args.append("1")
                        else:
                            init_args.append("None")
                    test_lines.append(f"        obj = {class_name}({', '.join(init_args)})")
                else:
                    test_lines.append(f"        obj = {class_name}()")

                test_lines.append(f"        result = obj.{method_name}({repr(fuzz_val)})")
                test_lines.append(f"    except (TypeError, ValueError, KeyError, IndexError, AttributeError, ZeroDivisionError) as e:")
                test_lines.append(f"        pass  # Edge case handled")
                test_count += 1

    # Generate tests for standalone functions
    for func in analyzer.functions:
        if test_count >= max_tests:
            break
        if func["name"].startswith("_"):
            continue

        func_name = func["name"]
        params = func["params"]

        if not params:
            continue

        # Test with None
        test_lines.append(f"")
        test_lines.append(f"def test_{func_name}_none_input():")
        test_lines.append(f"    '''Test {func_name} with None'''")
        test_lines.append(f"    try:")
        none_args = ", ".join(["None"] * len(params))
        test_lines.append(f"        result = {func_name}({none_args})")
        test_lines.append(f"    except (TypeError, ValueError, AttributeError) as e:")
        test_lines.append(f"        pass  # May be expected")
        test_count += 1

    if test_count == 0:
        return ""

    return "\n".join(test_lines)


class TestGenerator:
    """Generates adversarial pytest cases using Qwen-2.5-Coder."""

    FALLBACK_TEST = """import pytest
from solution import *

def test_fallback():
    assert True
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
        Generate adversarial test cases targeting the candidate code.

        Combines:
        1. LLM-generated tests (smart, contextual)
        2. Programmatic fuzz tests (systematic edge cases)

        Args:
            task_desc: The original task description.
            candidate_code: The Purple Agent's submitted source code.

        Returns:
            A string of valid Python pytest code, or a safe fallback on failure.
        """
        # Generate programmatic fuzz tests first (fast, guaranteed)
        fuzz_tests = generate_fuzz_tests(candidate_code)
        if fuzz_tests:
            print(f"[TestGenerator] Generated programmatic fuzz tests")

        # Then generate LLM-based adversarial tests
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
3. Import the solution with: from solution import *
4. Use simple test functions starting with `test_` prefix (NOT unittest.TestCase classes).
5. Make tests that EXPOSE bugs, not confirm correctness.
6. NEVER use infinite loops (while True) or sleep(). Keep inputs small.
7. Tests must complete in under 1 second.
8. Use plain assert statements (pytest style), NOT self.assertEqual().

Example format:
import pytest
from solution import *

def test_empty_input():
    assert func(None) is None

def test_boundary():
    assert func(0) == expected

def test_negative():
    with pytest.raises(ValueError):
        func(-1)"""

        user_prompt = f"""### Task Description
{task_desc}

### Candidate Code to Attack
{candidate_code}

Generate 3 adversarial pytest test functions targeting edge cases in this code."""

        llm_tests = ""
        try:
            response = await asyncio.wait_for(
                self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    **get_temperature_kwargs(0.7),
                ),
                timeout=self.timeout_seconds,
            )

            raw_output = response.choices[0].message.content
            llm_tests = self._sanitize_output(raw_output)
            print(f"[TestGenerator] Generated LLM adversarial tests")

        except asyncio.TimeoutError:
            print("[TestGenerator] LLM timed out, using fuzz tests only")
        except Exception as e:
            print(f"[TestGenerator] LLM failed: {e}, using fuzz tests only")

        # Combine fuzz tests + LLM tests
        combined = ""
        if fuzz_tests:
            combined = fuzz_tests
        if llm_tests and llm_tests != self.FALLBACK_TEST:
            if combined:
                # Append LLM tests as additional test class
                combined += "\n\n# === LLM-Generated Adversarial Tests ===\n"
                # Remove duplicate imports from LLM tests
                llm_tests_clean = re.sub(r'^import pytest\n', '', llm_tests)
                llm_tests_clean = re.sub(r'^from solution import \*\n', '', llm_tests_clean)
                combined += llm_tests_clean
            else:
                combined = llm_tests

        if not combined:
            return self.FALLBACK_TEST

        return combined

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