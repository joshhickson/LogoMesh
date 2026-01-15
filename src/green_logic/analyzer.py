"""
Semantic Auditor module for static code analysis using Python's AST.

This module provides a SemanticAuditor class that:
- Checks for forbidden imports (os, sys, subprocess)
- Validates recursion requirements
- Detects forbidden loop constructs
- Calculates cyclomatic complexity
- Detects security vulnerabilities (eval, exec, SQL injection patterns)
- Identifies code smells (deep nesting, too many parameters, long functions)
- Returns structured audit results with penalties and warnings
"""

import ast
import re
from dataclasses import dataclass, field
from typing import Any


@dataclass
class SecurityIssue:
    """Represents a security vulnerability found in code."""
    severity: str  # "high", "medium", "low"
    issue_type: str
    description: str
    line: int
    confidence: str  # "high", "medium", "low"


@dataclass
class CodeSmell:
    """Represents a code quality issue."""
    smell_type: str
    description: str
    line: int
    metric_value: float | int | None = None


@dataclass
class AnalysisResult:
    """Complete analysis result with all metrics."""
    valid: bool
    penalty: float
    reason: str
    complexity: dict = field(default_factory=dict)
    security_issues: list[SecurityIssue] = field(default_factory=list)
    code_smells: list[CodeSmell] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "valid": self.valid,
            "penalty": self.penalty,
            "reason": self.reason,
            "complexity": self.complexity,
            "security_issues": [
                {
                    "severity": s.severity,
                    "issue_type": s.issue_type,
                    "description": s.description,
                    "line": s.line,
                    "confidence": s.confidence,
                }
                for s in self.security_issues
            ],
            "code_smells": [
                {
                    "smell_type": s.smell_type,
                    "description": s.description,
                    "line": s.line,
                    "metric_value": s.metric_value,
                }
                for s in self.code_smells
            ],
            "warnings": self.warnings,
        }


class SemanticAuditor:
    """
    A static code analyzer using Python's AST module.

    Analyzes source code against a set of constraints and returns
    validation results with penalties for violations.
    """

    # Default forbidden imports for security
    FORBIDDEN_IMPORTS = {"os", "sys", "subprocess", "shutil", "socket", "ctypes"}

    # Dangerous built-in functions that can execute arbitrary code
    DANGEROUS_FUNCTIONS = {
        "eval": ("high", "Arbitrary code execution via eval()"),
        "exec": ("high", "Arbitrary code execution via exec()"),
        "compile": ("medium", "Dynamic code compilation"),
        "__import__": ("medium", "Dynamic import can bypass restrictions"),
        "open": ("low", "File access - verify path sanitization"),
        "input": ("low", "User input - ensure proper validation"),
    }

    # SQL injection patterns (for string formatting with SQL keywords)
    SQL_PATTERNS = [
        r"['\"]SELECT\s+.+\s+FROM\s+.+['\"].*%",
        r"['\"]INSERT\s+INTO\s+.+['\"].*%",
        r"['\"]UPDATE\s+.+\s+SET\s+.+['\"].*%",
        r"['\"]DELETE\s+FROM\s+.+['\"].*%",
        r"f['\"].*SELECT.*\{",
        r"f['\"].*INSERT.*\{",
        r"f['\"].*UPDATE.*\{",
        r"f['\"].*DELETE.*\{",
    ]

    # Thresholds for code quality
    MAX_CYCLOMATIC_COMPLEXITY = 10  # Per function
    MAX_NESTING_DEPTH = 4
    MAX_FUNCTION_LINES = 50
    MAX_PARAMETERS = 5

    def __init__(self, forbidden_imports: set[str] | None = None):
        """
        Initialize the SemanticAuditor.

        Args:
            forbidden_imports: Set of module names that are not allowed.
                             Defaults to FORBIDDEN_IMPORTS
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
                - max_complexity: int - Maximum cyclomatic complexity per function
                - max_nesting: int - Maximum nesting depth

        Returns:
            dict with keys:
                - valid: bool indicating if all constraints are satisfied
                - penalty: float from 0.0 (no penalty) to 1.0 (full penalty)
                - reason: str explaining any violations
                - complexity: dict with complexity metrics
                - security_issues: list of security vulnerabilities found
                - code_smells: list of code quality issues
                - warnings: list of non-fatal warnings
        """
        # Normalize Unicode characters that may have been corrupted during transmission
        # Replace non-ASCII hyphens, quotes, etc. with ASCII equivalents
        source_code = source_code.replace('\u2011', '-')  # Non-breaking hyphen -> hyphen-minus
        source_code = source_code.replace('\u2010', '-')  # Hyphen -> hyphen-minus
        source_code = source_code.replace('\u2013', '-')  # En dash -> hyphen-minus
        source_code = source_code.replace('\u2014', '-')  # Em dash -> hyphen-minus
        source_code = source_code.replace('\u201c', '"') # Left double quote -> ASCII quote
        source_code = source_code.replace('\u201d', '"') # Right double quote -> ASCII quote
        source_code = source_code.replace('\u2018', "'")  # Left single quote -> ASCII quote
        source_code = source_code.replace('\u2019', "'")  # Right single quote -> ASCII quote
        
        try:
            tree = ast.parse(source_code)
        except SyntaxError as e:
            # Parser error is a tooling issue, not a security/logic issue
            # Apply reduced penalty (20%) and allow scoring to proceed
            return AnalysisResult(
                valid=False,
                penalty=0.2,
                reason=f"Parser error (may be Unicode/formatting): {str(e)[:100]}",
            ).to_dict()

        violations = []
        warnings = []
        penalty = 0.0
        security_issues: list[SecurityIssue] = []
        code_smells: list[CodeSmell] = []

        # ===== CONSTRAINT CHECKS (Fatal) =====

        # Check 1: Forbidden Imports
        import_violation = self._check_forbidden_imports(tree)
        if import_violation:
            violations.append(import_violation)
            penalty = 1.0  # Full penalty for security violations

        # Check 2: Recursion Requirement
        if constraints.get("require_recursion", False):
            recursion_result = self._check_recursion(tree)
            if not recursion_result["has_recursion"]:
                violations.append(
                    f"Recursion required but not found. Functions: {recursion_result['functions']}"
                )
                penalty = max(penalty, 0.5)

        # Check 3: Loop Prohibition
        if constraints.get("forbid_loops", False):
            loop_result = self._check_loops(tree)
            if loop_result["has_loops"]:
                violations.append(f"Loops forbidden but found: {loop_result['loop_types']}")
                penalty = max(penalty, 0.5)

        # ===== SECURITY ANALYSIS =====

        # Check 4: Dangerous function calls
        security_issues.extend(self._check_dangerous_functions(tree))

        # Check 5: SQL injection patterns
        sql_issues = self._check_sql_injection(source_code)
        security_issues.extend(sql_issues)

        # Check 6: Command injection patterns
        cmd_issues = self._check_command_injection(tree)
        security_issues.extend(cmd_issues)

        # Apply penalty for high-severity security issues
        high_severity_count = sum(1 for s in security_issues if s.severity == "high")
        if high_severity_count > 0:
            penalty = max(penalty, 0.3 * high_severity_count)
            warnings.append(f"Found {high_severity_count} high-severity security issues")

        # ===== COMPLEXITY ANALYSIS =====

        # Check 7: Cyclomatic complexity
        complexity_result = self._calculate_complexity(tree)
        max_allowed = constraints.get("max_complexity", self.MAX_CYCLOMATIC_COMPLEXITY)

        for func_name, func_complexity in complexity_result.get("per_function", {}).items():
            if func_complexity > max_allowed:
                code_smells.append(
                    CodeSmell(
                        smell_type="high_complexity",
                        description=f"Function '{func_name}' has complexity {func_complexity} (max: {max_allowed})",
                        line=complexity_result.get("function_lines", {}).get(func_name, 0),
                        metric_value=func_complexity,
                    )
                )

        # ===== CODE SMELL DETECTION =====

        # Check 8: Nesting depth
        max_nesting = constraints.get("max_nesting", self.MAX_NESTING_DEPTH)
        nesting_smells = self._check_nesting_depth(tree, max_nesting)
        code_smells.extend(nesting_smells)

        # Check 9: Function length
        length_smells = self._check_function_length(tree, source_code)
        code_smells.extend(length_smells)

        # Check 10: Parameter count
        param_smells = self._check_parameter_count(tree)
        code_smells.extend(param_smells)

        # Apply minor penalty for excessive code smells
        if len(code_smells) > 3:
            penalty = max(penalty, 0.1)
            warnings.append(f"Found {len(code_smells)} code quality issues")

        # ===== BUILD RESULT =====

        result = AnalysisResult(
            valid=len(violations) == 0,
            penalty=min(penalty, 1.0),  # Cap at 1.0
            reason="; ".join(violations) if violations else "All constraints satisfied",
            complexity=complexity_result,
            security_issues=security_issues,
            code_smells=code_smells,
            warnings=warnings,
        )

        return result.to_dict()

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

    def _check_dangerous_functions(self, tree: ast.AST) -> list[SecurityIssue]:
        """
        Check for calls to dangerous built-in functions.

        Returns:
            List of SecurityIssue objects for dangerous function calls.
        """
        issues = []

        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                func_name = None

                # Direct function call: eval(), exec()
                if isinstance(node.func, ast.Name):
                    func_name = node.func.id
                # Attribute call: builtins.eval()
                elif isinstance(node.func, ast.Attribute):
                    func_name = node.func.attr

                if func_name and func_name in self.DANGEROUS_FUNCTIONS:
                    severity, description = self.DANGEROUS_FUNCTIONS[func_name]
                    issues.append(
                        SecurityIssue(
                            severity=severity,
                            issue_type="dangerous_function",
                            description=f"{func_name}(): {description}",
                            line=node.lineno,
                            confidence="high",
                        )
                    )

        return issues

    def _check_sql_injection(self, source_code: str) -> list[SecurityIssue]:
        """
        Check for SQL injection vulnerabilities using pattern matching.

        Returns:
            List of SecurityIssue objects for SQL injection patterns.
        """
        issues = []
        lines = source_code.split("\n")

        for pattern in self.SQL_PATTERNS:
            for line_no, line in enumerate(lines, 1):
                if re.search(pattern, line, re.IGNORECASE):
                    issues.append(
                        SecurityIssue(
                            severity="high",
                            issue_type="sql_injection",
                            description="Possible SQL injection via string formatting",
                            line=line_no,
                            confidence="medium",
                        )
                    )
                    break  # One issue per pattern

        return issues

    def _check_command_injection(self, tree: ast.AST) -> list[SecurityIssue]:
        """
        Check for command injection vulnerabilities.

        Looks for shell=True in subprocess calls or string formatting
        passed to system commands.
        """
        issues = []

        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                # Check for shell=True in subprocess calls
                for keyword in node.keywords:
                    if keyword.arg == "shell":
                        if isinstance(keyword.value, ast.Constant) and keyword.value.value is True:
                            issues.append(
                                SecurityIssue(
                                    severity="high",
                                    issue_type="command_injection",
                                    description="shell=True enables command injection",
                                    line=node.lineno,
                                    confidence="high",
                                )
                            )

                # Check for os.system or os.popen with f-strings/format
                if isinstance(node.func, ast.Attribute):
                    if node.func.attr in ("system", "popen", "spawn"):
                        if node.args and isinstance(node.args[0], ast.JoinedStr):
                            issues.append(
                                SecurityIssue(
                                    severity="high",
                                    issue_type="command_injection",
                                    description=f"Dynamic command via {node.func.attr}() with f-string",
                                    line=node.lineno,
                                    confidence="high",
                                )
                            )

        return issues

    def _calculate_complexity(self, tree: ast.AST) -> dict:
        """
        Calculate cyclomatic complexity for each function.

        Cyclomatic complexity = E - N + 2P
        Simplified: 1 + number of decision points (if, for, while, and, or, except)

        Returns:
            dict with:
                - total: int - Total complexity of all functions
                - per_function: dict mapping function names to complexity
                - function_lines: dict mapping function names to line numbers
        """
        per_function = {}
        function_lines = {}

        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                complexity = self._function_complexity(node)
                per_function[node.name] = complexity
                function_lines[node.name] = node.lineno

        return {
            "total": sum(per_function.values()) if per_function else 0,
            "per_function": per_function,
            "function_lines": function_lines,
            "average": (
                sum(per_function.values()) / len(per_function)
                if per_function
                else 0
            ),
        }

    def _function_complexity(self, func_node: ast.FunctionDef) -> int:
        """
        Calculate cyclomatic complexity for a single function.

        Counts decision points:
        - if, elif
        - for, while
        - and, or (boolean operators)
        - except handlers
        - assert
        - comprehensions with conditions
        """
        complexity = 1  # Base complexity

        for node in ast.walk(func_node):
            # Branches
            if isinstance(node, ast.If):
                complexity += 1
            elif isinstance(node, ast.For):
                complexity += 1
            elif isinstance(node, ast.While):
                complexity += 1
            elif isinstance(node, ast.ExceptHandler):
                complexity += 1
            elif isinstance(node, ast.Assert):
                complexity += 1
            # Boolean operators add complexity
            elif isinstance(node, ast.BoolOp):
                # 'and' and 'or' each add paths
                complexity += len(node.values) - 1
            # Comprehensions with conditions
            elif isinstance(node, (ast.ListComp, ast.SetComp, ast.GeneratorExp, ast.DictComp)):
                for generator in node.generators:
                    complexity += len(generator.ifs)
            # Ternary expressions
            elif isinstance(node, ast.IfExp):
                complexity += 1

        return complexity

    def _check_nesting_depth(self, tree: ast.AST, max_depth: int) -> list[CodeSmell]:
        """
        Check for excessive nesting depth in functions.

        Returns:
            List of CodeSmell objects for deeply nested code.
        """
        smells = []

        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                max_found = self._measure_nesting(node.body, 0)
                if max_found > max_depth:
                    smells.append(
                        CodeSmell(
                            smell_type="deep_nesting",
                            description=f"Function '{node.name}' has nesting depth {max_found} (max: {max_depth})",
                            line=node.lineno,
                            metric_value=max_found,
                        )
                    )

        return smells

    def _measure_nesting(self, body: list, current_depth: int) -> int:
        """
        Recursively measure maximum nesting depth.
        """
        max_depth = current_depth

        for node in body:
            child_body = None
            new_depth = current_depth

            if isinstance(node, (ast.If, ast.For, ast.While, ast.With)):
                new_depth = current_depth + 1
                child_body = node.body
                if hasattr(node, "orelse") and node.orelse:
                    else_depth = self._measure_nesting(node.orelse, current_depth + 1)
                    max_depth = max(max_depth, else_depth)
            elif isinstance(node, ast.Try):
                new_depth = current_depth + 1
                child_body = node.body
                for handler in node.handlers:
                    handler_depth = self._measure_nesting(handler.body, current_depth + 1)
                    max_depth = max(max_depth, handler_depth)
                if node.finalbody:
                    finally_depth = self._measure_nesting(node.finalbody, current_depth + 1)
                    max_depth = max(max_depth, finally_depth)

            if child_body:
                child_max = self._measure_nesting(child_body, new_depth)
                max_depth = max(max_depth, child_max)

        return max_depth

    def _check_function_length(self, tree: ast.AST, source_code: str) -> list[CodeSmell]:
        """
        Check for functions that are too long.

        Returns:
            List of CodeSmell objects for overly long functions.
        """
        smells = []
        lines = source_code.split("\n")

        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                # Calculate function length
                start_line = node.lineno
                end_line = node.end_lineno if hasattr(node, "end_lineno") else start_line

                func_length = end_line - start_line + 1

                if func_length > self.MAX_FUNCTION_LINES:
                    smells.append(
                        CodeSmell(
                            smell_type="long_function",
                            description=f"Function '{node.name}' is {func_length} lines (max: {self.MAX_FUNCTION_LINES})",
                            line=start_line,
                            metric_value=func_length,
                        )
                    )

        return smells

    def _check_parameter_count(self, tree: ast.AST) -> list[CodeSmell]:
        """
        Check for functions with too many parameters.

        Returns:
            List of CodeSmell objects for functions with excessive parameters.
        """
        smells = []

        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                # Count parameters (excluding 'self' for methods)
                params = node.args.args
                param_count = len(params)

                # Exclude 'self' for methods
                if params and params[0].arg == "self":
                    param_count -= 1

                if param_count > self.MAX_PARAMETERS:
                    smells.append(
                        CodeSmell(
                            smell_type="too_many_parameters",
                            description=f"Function '{node.name}' has {param_count} parameters (max: {self.MAX_PARAMETERS})",
                            line=node.lineno,
                            metric_value=param_count,
                        )
                    )

        return smells

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