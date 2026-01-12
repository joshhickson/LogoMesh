"""
Semantic Auditor module for static code analysis using Python's AST.

This module provides a SemanticAuditor class that:
- Checks for forbidden imports (os, sys, subprocess)
- Validates recursion requirements
- Detects forbidden loop constructs
- Returns structured audit results with penalties
"""

import ast
from typing import Any


class SemanticAuditor:
    """
    A static code analyzer using Python's AST module.

    Analyzes source code against a set of constraints and returns
    validation results with penalties for violations.
    """

    # Default forbidden imports for security
    FORBIDDEN_IMPORTS = {"os", "sys", "subprocess"}

    def __init__(self, forbidden_imports: set[str] | None = None):
        """
        Initialize the SemanticAuditor.

        Args:
            forbidden_imports: Set of module names that are not allowed.
                             Defaults to {"os", "sys", "subprocess"}
        """
        self.forbidden_imports = forbidden_imports or self.FORBIDDEN_IMPORTS

    def analyze(self, source_code: str, constraints: dict[str, Any]) -> dict:
        """
        Analyze source code against the given constraints.

        Args:
            source_code: Python source code to analyze
            constraints: Dictionary of constraints to check:
                - require_recursion: bool - Function must call itself
                - forbid_loops: bool - No for/while loops allowed

        Returns:
            dict with keys:
                - valid: bool indicating if all constraints are satisfied
                - penalty: float from 0.0 (no penalty) to 1.0 (full penalty)
                - reason: str explaining any violations
        """
        try:
            tree = ast.parse(source_code)
        except SyntaxError as e:
            return {
                "valid": False,
                "penalty": 1.0,
                "reason": f"Syntax error in source code: {e}"
            }

        violations = []
        penalty = 0.0

        # Check 1: Forbidden Imports
        import_violation = self._check_forbidden_imports(tree)
        if import_violation:
            violations.append(import_violation)
            penalty = 1.0  # Full penalty for security violations

        # Check 2: Recursion Requirement
        if constraints.get("require_recursion", False):
            recursion_result = self._check_recursion(tree)
            if not recursion_result["has_recursion"]:
                violations.append(f"Recursion required but not found. Functions: {recursion_result['functions']}")
                penalty = max(penalty, 0.5)

        # Check 3: Loop Prohibition
        if constraints.get("forbid_loops", False):
            loop_result = self._check_loops(tree)
            if loop_result["has_loops"]:
                violations.append(f"Loops forbidden but found: {loop_result['loop_types']}")
                penalty = max(penalty, 0.5)

        if violations:
            return {
                "valid": False,
                "penalty": penalty,
                "reason": "; ".join(violations)
            }

        return {
            "valid": True,
            "penalty": 0.0,
            "reason": "All constraints satisfied"
        }

    def _check_forbidden_imports(self, tree: ast.AST) -> str | None:
        """
        Check for forbidden imports in the AST.

        Returns:
            Error message if forbidden imports found, None otherwise
        """
        forbidden_found = set()

        for node in ast.walk(tree):
            # Check 'import x' statements
            if isinstance(node, ast.Import):
                for alias in node.names:
                    module_name = alias.name.split(".")[0]
                    if module_name in self.forbidden_imports:
                        forbidden_found.add(module_name)

            # Check 'from x import y' statements
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    module_name = node.module.split(".")[0]
                    if module_name in self.forbidden_imports:
                        forbidden_found.add(module_name)

        if forbidden_found:
            return f"Forbidden imports detected: {sorted(forbidden_found)}"
        return None

    def _check_recursion(self, tree: ast.AST) -> dict:
        """
        Check if any function in the code calls itself (recursion).

        Returns:
            dict with:
                - has_recursion: bool
                - functions: list of function names found
        """
        functions = {}  # name -> set of called functions

        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                func_name = node.name
                called_funcs = set()

                # Walk through function body to find calls
                for child in ast.walk(node):
                    if isinstance(child, ast.Call):
                        # Get the function name being called
                        if isinstance(child.func, ast.Name):
                            called_funcs.add(child.func.id)
                        elif isinstance(child.func, ast.Attribute):
                            called_funcs.add(child.func.attr)

                functions[func_name] = called_funcs

        # Check if any function calls itself
        recursive_functions = [name for name, calls in functions.items() if name in calls]

        return {
            "has_recursion": len(recursive_functions) > 0,
            "functions": list(functions.keys()),
            "recursive_functions": recursive_functions
        }

    def _check_loops(self, tree: ast.AST) -> dict:
        """
        Check for loop constructs (for, while) in the code.

        Returns:
            dict with:
                - has_loops: bool
                - loop_types: list of loop types found
        """
        loop_types = []

        for node in ast.walk(tree):
            if isinstance(node, ast.For):
                loop_types.append("for")
            elif isinstance(node, ast.While):
                loop_types.append("while")

        return {
            "has_loops": len(loop_types) > 0,
            "loop_types": loop_types
        }

    def get_function_info(self, source_code: str) -> dict:
        """
        Extract information about functions in the source code.

        Args:
            source_code: Python source code to analyze

        Returns:
            dict with function names, their arguments, and decorators
        """
        try:
            tree = ast.parse(source_code)
        except SyntaxError:
            return {"error": "Could not parse source code"}

        functions = []
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                func_info = {
                    "name": node.name,
                    "args": [arg.arg for arg in node.args.args],
                    "decorators": [
                        ast.unparse(d) if hasattr(ast, 'unparse') else str(d)
                        for d in node.decorator_list
                    ],
                    "lineno": node.lineno
                }
                functions.append(func_info)

        return {"functions": functions}


# Convenience function for quick analysis
def analyze_code(source_code: str, constraints: dict[str, Any] | None = None) -> dict:
    """
    Convenience function to analyze code without managing SemanticAuditor instance.

    Args:
        source_code: Python source code to analyze
        constraints: Optional constraints dictionary

    Returns:
        dict with valid, penalty, and reason
    """
    auditor = SemanticAuditor()
    return auditor.analyze(source_code, constraints or {})