"""Tests for the SemanticAuditor static code analyzer."""

import pytest
from green_logic.analyzer import SemanticAuditor, analyze_code


@pytest.fixture
def auditor():
    return SemanticAuditor()


# ── Forbidden imports ──────────────────────────────────────────────

class TestForbiddenImports:
    def test_detects_import_os(self, auditor):
        result = auditor.analyze("import os", {})
        assert not result["valid"]
        assert result["penalty"] == 1.0
        assert "os" in result["reason"]

    def test_detects_from_subprocess(self, auditor):
        result = auditor.analyze("from subprocess import run", {})
        assert not result["valid"]

    def test_allows_safe_imports(self, auditor):
        result = auditor.analyze("import math\nimport json", {})
        assert result["valid"]
        assert result["penalty"] == 0.0

    def test_detects_multiple_forbidden(self, auditor):
        result = auditor.analyze("import os\nimport sys", {})
        assert not result["valid"]
        assert "os" in result["reason"]
        assert "sys" in result["reason"]


# ── Recursion detection ────────────────────────────────────────────

class TestRecursion:
    def test_detects_recursion(self, auditor):
        code = """
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)
"""
        result = auditor.analyze(code, {"require_recursion": True})
        assert result["valid"]

    def test_fails_when_recursion_required_but_missing(self, auditor):
        code = """
def factorial(n):
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result
"""
        result = auditor.analyze(code, {"require_recursion": True})
        assert not result["valid"]
        assert result["penalty"] >= 0.5

    def test_no_recursion_requirement_passes_iterative(self, auditor):
        code = """
def add(a, b):
    return a + b
"""
        result = auditor.analyze(code, {})
        assert result["valid"]


# ── Loop detection ─────────────────────────────────────────────────

class TestLoops:
    def test_detects_for_loop(self, auditor):
        code = """
def foo():
    for i in range(10):
        pass
"""
        result = auditor.analyze(code, {"forbid_loops": True})
        assert not result["valid"]

    def test_detects_while_loop(self, auditor):
        code = """
def foo():
    while True:
        break
"""
        result = auditor.analyze(code, {"forbid_loops": True})
        assert not result["valid"]

    def test_no_loops_passes(self, auditor):
        code = """
def foo():
    return 42
"""
        result = auditor.analyze(code, {"forbid_loops": True})
        assert result["valid"]


# ── Security: dangerous functions ──────────────────────────────────

class TestDangerousFunctions:
    def test_detects_eval(self, auditor):
        code = "x = eval('1+1')"
        result = auditor.analyze(code, {})
        high_issues = [i for i in result["security_issues"] if i["severity"] == "high"]
        assert len(high_issues) >= 1

    def test_detects_exec(self, auditor):
        code = "exec('print(1)')"
        result = auditor.analyze(code, {})
        high_issues = [i for i in result["security_issues"] if i["severity"] == "high"]
        assert len(high_issues) >= 1


# ── Security: command injection ────────────────────────────────────

class TestCommandInjection:
    def test_detects_shell_true(self, auditor):
        code = """
import subprocess
subprocess.run(['ls'], shell=True)
"""
        # Ignore the forbidden import for this test
        auditor_lax = SemanticAuditor(forbidden_imports=set())
        result = auditor_lax.analyze(code, {})
        cmd_issues = [i for i in result["security_issues"] if i["issue_type"] == "command_injection"]
        assert len(cmd_issues) >= 1


# ── Complexity metrics ─────────────────────────────────────────────

class TestComplexity:
    def test_simple_function_low_complexity(self, auditor):
        code = """
def add(a, b):
    return a + b
"""
        result = auditor.analyze(code, {})
        assert result["complexity"]["per_function"]["add"] == 1

    def test_branching_increases_complexity(self, auditor):
        code = """
def classify(x):
    if x > 0:
        return "positive"
    elif x < 0:
        return "negative"
    else:
        return "zero"
"""
        result = auditor.analyze(code, {})
        assert result["complexity"]["per_function"]["classify"] >= 3

    def test_complexity_limit_triggers_smell(self, auditor):
        # A function with many branches
        code = """
def many_branches(x):
    if x == 1: return 'a'
    elif x == 2: return 'b'
    elif x == 3: return 'c'
    elif x == 4: return 'd'
    elif x == 5: return 'e'
    elif x == 6: return 'f'
    elif x == 7: return 'g'
    elif x == 8: return 'h'
    elif x == 9: return 'i'
    elif x == 10: return 'j'
    elif x == 11: return 'k'
    return 'z'
"""
        result = auditor.analyze(code, {"max_complexity": 5})
        smells = [s for s in result["code_smells"] if s["smell_type"] == "high_complexity"]
        assert len(smells) >= 1


# ── Syntax errors ──────────────────────────────────────────────────

class TestSyntaxErrors:
    def test_invalid_syntax(self, auditor):
        result = auditor.analyze("def oops(:", {})
        assert not result["valid"]
        assert result["penalty"] == 1.0
        assert "Syntax error" in result["reason"]


# ── Function info extraction ──────────────────────────────────────

class TestFunctionInfo:
    def test_extracts_function_names(self, auditor):
        code = """
def hello(name):
    return f"hello {name}"

def goodbye():
    pass
"""
        info = auditor.get_function_info(code)
        names = [f["name"] for f in info["functions"]]
        assert "hello" in names
        assert "goodbye" in names

    def test_extracts_args(self, auditor):
        code = """
def add(a, b, c):
    return a + b + c
"""
        info = auditor.get_function_info(code)
        assert info["functions"][0]["args"] == ["a", "b", "c"]

    def test_handles_syntax_error(self, auditor):
        info = auditor.get_function_info("def bad(:")
        assert "error" in info


# ── Convenience wrapper ───────────────────────────────────────────

class TestAnalyzeCode:
    def test_works_without_constraints(self):
        result = analyze_code("x = 1 + 2")
        assert result["valid"]

    def test_passes_constraints_through(self):
        code = """
def foo():
    for i in range(10):
        pass
"""
        result = analyze_code(code, {"forbid_loops": True})
        assert not result["valid"]
