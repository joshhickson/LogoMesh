"""
Static Mirror Worker - Mirrors Green Agent's SemanticAuditor checks.

This worker knows EXACTLY what Green Agent checks for and finds those issues.
If this worker finds a vulnerability, Green WILL penalize it.

Reference: src/green_logic/analyzer.py
"""

import ast
import re
import time
from typing import Optional

from .base import BaseWorker, WorkerResult, Vulnerability, Severity


class StaticMirrorWorker(BaseWorker):
    """
    Mirrors Green Agent's SemanticAuditor to find violations.

    Green checks for:
    1. Forbidden imports: os, sys, subprocess, shutil, socket, ctypes
    2. Dangerous functions: eval, exec, compile, __import__
    3. SQL injection patterns (f-strings, % formatting with SQL)
    4. Command injection (shell=True, os.system with f-strings)
    5. High cyclomatic complexity (>10 per function)
    6. Deep nesting (>4 levels)

    This worker finds these EXACT issues to report as vulnerabilities.
    """

    # Mirrors FORBIDDEN_IMPORTS from analyzer.py
    FORBIDDEN_IMPORTS = {"os", "sys", "subprocess", "shutil", "socket", "ctypes"}

    # Mirrors DANGEROUS_FUNCTIONS from analyzer.py
    DANGEROUS_FUNCTIONS = {
        "eval": (Severity.CRITICAL, "Arbitrary code execution via eval()"),
        "exec": (Severity.CRITICAL, "Arbitrary code execution via exec()"),
        "compile": (Severity.HIGH, "Dynamic code compilation can execute arbitrary code"),
        "__import__": (Severity.HIGH, "Dynamic import can bypass security restrictions"),
    }

    # Mirrors SQL_PATTERNS from analyzer.py
    # CRITICAL: These patterns must distinguish DANGEROUS string formatting from SAFE parameterized queries
    # DANGEROUS: "SELECT ... %s" % var  (string formatting - variable substitution)
    # SAFE: cursor.execute("SELECT ... %s", (var,))  (parameterized query - %s is placeholder)
    SQL_PATTERNS = [
        # f-string patterns - ALWAYS dangerous (direct interpolation)
        (r"f['\"].*SELECT\s+.*\{", "f-string SQL SELECT"),
        (r"f['\"].*INSERT\s+.*\{", "f-string SQL INSERT"),
        (r"f['\"].*UPDATE\s+.*\{", "f-string SQL UPDATE"),
        (r"f['\"].*DELETE\s+.*\{", "f-string SQL DELETE"),
        # Old-style % formatting - only dangerous when followed by % and a variable/tuple
        # Pattern: "SQL..." % var OR "SQL..." % (var,) - NOT cursor.execute("SQL...", (var,))
        (r"['\"]SELECT\s+.+FROM\s+.+['\"]\s*%\s*[\(\w]", "% formatting SQL SELECT"),
        (r"['\"]INSERT\s+INTO\s+.+['\"]\s*%\s*[\(\w]", "% formatting SQL INSERT"),
        (r"['\"]UPDATE\s+.+SET\s+.+['\"]\s*%\s*[\(\w]", "% formatting SQL UPDATE"),
        (r"['\"]DELETE\s+FROM\s+.+['\"]\s*%\s*[\(\w]", "% formatting SQL DELETE"),
        # String concatenation with SQL - ALWAYS dangerous
        (r"['\"]SELECT\s+.+['\"]\s*\+", "string concat SQL SELECT"),
        (r"['\"]INSERT\s+.+['\"]\s*\+", "string concat SQL INSERT"),
        (r"['\"]UPDATE\s+.+['\"]\s*\+", "string concat SQL UPDATE"),
        (r"['\"]DELETE\s+.+['\"]\s*\+", "string concat SQL DELETE"),
    ]

    # Complexity thresholds (from analyzer.py)
    MAX_CYCLOMATIC_COMPLEXITY = 10
    MAX_NESTING_DEPTH = 4

    @property
    def name(self) -> str:
        return "StaticMirrorWorker"

    def analyze(self, code: str, task_id: Optional[str] = None) -> WorkerResult:
        """
        Analyze code for issues that Green Agent's SemanticAuditor checks.

        Args:
            code: Source code to analyze
            task_id: Optional task identifier (not used by this worker)

        Returns:
            WorkerResult with found vulnerabilities
        """
        start_time = time.time()
        vulnerabilities = []

        # Parse AST
        try:
            tree = ast.parse(code)
        except SyntaxError as e:
            # Syntax error is itself a finding
            vulnerabilities.append(self._create_vulnerability(
                severity=Severity.HIGH,
                category="syntax_error",
                title="Code has syntax errors",
                description=f"Cannot parse code: {e}",
                line_number=getattr(e, 'lineno', None),
                confidence="high"
            ))
            return WorkerResult(
                worker_name=self.name,
                vulnerabilities=vulnerabilities,
                execution_time_ms=(time.time() - start_time) * 1000
            )

        # Check 1: Forbidden imports
        vulnerabilities.extend(self._check_forbidden_imports(tree))

        # Check 2: Dangerous function calls
        vulnerabilities.extend(self._check_dangerous_functions(tree))

        # Check 3: SQL injection patterns
        vulnerabilities.extend(self._check_sql_injection(code))

        # Check 4: Command injection
        vulnerabilities.extend(self._check_command_injection(tree, code))

        # Check 5: High complexity
        vulnerabilities.extend(self._check_complexity(tree))

        # Check 6: Deep nesting
        vulnerabilities.extend(self._check_nesting(tree))

        # Check 7: Tautological comparisons (critical logic flaws)
        vulnerabilities.extend(self._check_tautologies(tree))

        # Check 8: Broken authorization patterns
        vulnerabilities.extend(self._check_broken_authorization(tree, code))

        return WorkerResult(
            worker_name=self.name,
            vulnerabilities=vulnerabilities,
            execution_time_ms=(time.time() - start_time) * 1000
        )

    def _check_forbidden_imports(self, tree: ast.AST) -> list[Vulnerability]:
        """Check for imports that Green Agent forbids."""
        vulns = []
        forbidden_found = set()

        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    module_name = alias.name.split(".")[0]
                    if module_name in self.FORBIDDEN_IMPORTS:
                        forbidden_found.add((module_name, node.lineno))

            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    module_name = node.module.split(".")[0]
                    if module_name in self.FORBIDDEN_IMPORTS:
                        forbidden_found.add((module_name, node.lineno))

        for module, lineno in forbidden_found:
            vulns.append(self._create_vulnerability(
                severity=Severity.HIGH,
                category="forbidden_import",
                title=f"Forbidden import: {module}",
                description=f"Import of '{module}' is forbidden by Green Agent's security policy. "
                           f"This module can be used for system access, file operations, or command execution.",
                line_number=lineno,
                exploit_code=f"# The imported module '{module}' allows:\n"
                            f"# - os: file/process operations\n"
                            f"# - sys: interpreter access\n"
                            f"# - subprocess: command execution\n"
                            f"# - socket: network access",
                confidence="high"
            ))

        return vulns

    def _check_dangerous_functions(self, tree: ast.AST) -> list[Vulnerability]:
        """Check for dangerous function calls like eval(), exec()."""
        vulns = []

        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                func_name = None

                if isinstance(node.func, ast.Name):
                    func_name = node.func.id
                elif isinstance(node.func, ast.Attribute):
                    func_name = node.func.attr

                if func_name and func_name in self.DANGEROUS_FUNCTIONS:
                    severity, description = self.DANGEROUS_FUNCTIONS[func_name]

                    # Check if user input might flow into this function
                    has_variable_arg = any(
                        isinstance(arg, (ast.Name, ast.Subscript, ast.Attribute, ast.Call))
                        for arg in node.args
                    )

                    vulns.append(self._create_vulnerability(
                        severity=severity,
                        category="dangerous_function",
                        title=f"Dangerous function: {func_name}()",
                        description=description + (
                            " The function receives a variable argument, making code injection likely."
                            if has_variable_arg else ""
                        ),
                        line_number=node.lineno,
                        exploit_code=f"# Exploit for {func_name}():\n"
                                    f"malicious_input = \"__import__('os').system('id')\"\n"
                                    f"{func_name}(malicious_input)  # Executes arbitrary code",
                        confidence="high" if has_variable_arg else "medium"
                    ))

        return vulns

    def _check_sql_injection(self, code: str) -> list[Vulnerability]:
        """Check for SQL injection vulnerabilities.

        IMPORTANT: This method distinguishes between:
        - DANGEROUS: String formatting/concatenation for SQL (f-strings, %, +)
        - SAFE: Parameterized queries (cursor.execute("...", (params,)))
        """
        vulns = []
        lines = code.split("\n")

        # Pattern to detect parameterized query usage (SAFE pattern)
        # e.g., execute("SELECT...", (var,)) or execute("SELECT...", [var])
        parameterized_pattern = r"\.execute\s*\([^)]*['\"][^'\"]*['\"],\s*[\(\[]"

        for pattern, desc in self.SQL_PATTERNS:
            for lineno, line in enumerate(lines, 1):
                if re.search(pattern, line, re.IGNORECASE):
                    # Check if this line looks like a parameterized query (SAFE)
                    if re.search(parameterized_pattern, line, re.IGNORECASE):
                        # This is a parameterized query, NOT vulnerable
                        continue

                    # Check for .execute() with comma-separated args (another safe pattern)
                    # e.g., cursor.execute(query, params)
                    if ".execute(" in line and "," in line.split(".execute(")[1] if ".execute(" in line else False:
                        # Likely parameterized - needs more context to be sure
                        # Reduce confidence instead of skipping
                        vulns.append(self._create_vulnerability(
                            severity=Severity.MEDIUM,  # Downgraded - might be false positive
                            category="sql_injection",
                            title=f"Potential SQL Injection: {desc}",
                            description=f"SQL query appears to use string formatting. "
                                       f"Verify this is NOT a parameterized query. "
                                       f"Parameterized: cursor.execute('...%s...', (var,)) is SAFE.",
                            line_number=lineno,
                            exploit_code="# If this is string formatting (not parameterized):\n"
                                        "user_input = \"' OR '1'='1' --\"\n"
                                        "# Verify: Is the second arg to execute() used for params?",
                            confidence="medium"
                        ))
                    else:
                        # Definitely looks like string formatting/interpolation
                        vulns.append(self._create_vulnerability(
                            severity=Severity.CRITICAL,
                            category="sql_injection",
                            title=f"SQL Injection: {desc}",
                            description=f"SQL query built with string interpolation instead of parameterized queries. "
                                       f"User input can modify the query structure.",
                            line_number=lineno,
                            exploit_code="# SQL Injection exploit:\n"
                                        "user_input = \"' OR '1'='1' --\"\n"
                                        "# Or for data extraction:\n"
                                        "user_input = \"' UNION SELECT password FROM users --\"",
                            confidence="high"
                        ))
                    break  # One finding per pattern

        return vulns

    def _check_command_injection(self, tree: ast.AST, code: str) -> list[Vulnerability]:
        """Check for command injection vulnerabilities."""
        vulns = []

        # Check for shell=True
        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                for keyword in node.keywords:
                    if keyword.arg == "shell":
                        if isinstance(keyword.value, ast.Constant) and keyword.value.value is True:
                            vulns.append(self._create_vulnerability(
                                severity=Severity.CRITICAL,
                                category="command_injection",
                                title="Command injection via shell=True",
                                description="Using shell=True with subprocess allows shell metacharacter injection. "
                                           "Attackers can chain commands using ; | && etc.",
                                line_number=node.lineno,
                                exploit_code="# Command injection exploit:\n"
                                            "user_input = \"file.txt; cat /etc/passwd\"\n"
                                            "subprocess.run(f\"cat {user_input}\", shell=True)\n"
                                            "# Executes: cat file.txt; cat /etc/passwd",
                                confidence="high"
                            ))

        # Check for os.system with f-strings
        lines = code.split("\n")
        for lineno, line in enumerate(lines, 1):
            if re.search(r"os\.system\s*\(\s*f['\"]", line):
                vulns.append(self._create_vulnerability(
                    severity=Severity.CRITICAL,
                    category="command_injection",
                    title="Command injection via os.system with f-string",
                    description="os.system() with f-string allows arbitrary command execution.",
                    line_number=lineno,
                    exploit_code="# Exploit:\n"
                                "user_input = \"file.txt; rm -rf /\"\n"
                                "os.system(f\"cat {user_input}\")  # Disaster",
                    confidence="high"
                ))

            if re.search(r"os\.popen\s*\(\s*f['\"]", line):
                vulns.append(self._create_vulnerability(
                    severity=Severity.CRITICAL,
                    category="command_injection",
                    title="Command injection via os.popen with f-string",
                    description="os.popen() with f-string allows arbitrary command execution.",
                    line_number=lineno,
                    confidence="high"
                ))

        return vulns

    def _check_complexity(self, tree: ast.AST) -> list[Vulnerability]:
        """Check for high cyclomatic complexity."""
        vulns = []

        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                complexity = self._calculate_complexity(node)
                if complexity > self.MAX_CYCLOMATIC_COMPLEXITY:
                    vulns.append(self._create_vulnerability(
                        severity=Severity.LOW,
                        category="complexity",
                        title=f"High cyclomatic complexity in {node.name}()",
                        description=f"Function has complexity {complexity} (max allowed: {self.MAX_CYCLOMATIC_COMPLEXITY}). "
                                   f"High complexity often indicates hard-to-test code with potential edge case bugs.",
                        line_number=node.lineno,
                        confidence="medium"
                    ))

        return vulns

    def _calculate_complexity(self, func_node: ast.FunctionDef) -> int:
        """Calculate cyclomatic complexity for a function."""
        complexity = 1

        for node in ast.walk(func_node):
            if isinstance(node, (ast.If, ast.For, ast.While, ast.ExceptHandler, ast.Assert)):
                complexity += 1
            elif isinstance(node, ast.BoolOp):
                complexity += len(node.values) - 1
            elif isinstance(node, (ast.ListComp, ast.SetComp, ast.GeneratorExp, ast.DictComp)):
                for gen in node.generators:
                    complexity += len(gen.ifs)
            elif isinstance(node, ast.IfExp):
                complexity += 1

        return complexity

    def _check_nesting(self, tree: ast.AST) -> list[Vulnerability]:
        """Check for excessive nesting depth."""
        vulns = []

        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                max_depth = self._measure_nesting(node.body, 0)
                if max_depth > self.MAX_NESTING_DEPTH:
                    vulns.append(self._create_vulnerability(
                        severity=Severity.LOW,
                        category="deep_nesting",
                        title=f"Deep nesting in {node.name}()",
                        description=f"Function has nesting depth {max_depth} (max: {self.MAX_NESTING_DEPTH}). "
                                   f"Deep nesting makes code hard to follow and prone to logic errors.",
                        line_number=node.lineno,
                        confidence="medium"
                    ))

        return vulns

    def _measure_nesting(self, body: list, depth: int) -> int:
        """Recursively measure maximum nesting depth."""
        max_depth = depth

        for node in body:
            child_body = None
            new_depth = depth

            if isinstance(node, (ast.If, ast.For, ast.While, ast.With)):
                new_depth = depth + 1
                child_body = node.body
                if hasattr(node, "orelse") and node.orelse:
                    else_depth = self._measure_nesting(node.orelse, depth + 1)
                    max_depth = max(max_depth, else_depth)
            elif isinstance(node, ast.Try):
                new_depth = depth + 1
                child_body = node.body
                for handler in node.handlers:
                    handler_depth = self._measure_nesting(handler.body, depth + 1)
                    max_depth = max(max_depth, handler_depth)

            if child_body:
                child_max = self._measure_nesting(child_body, new_depth)
                max_depth = max(max_depth, child_max)

        return max_depth

    def _check_tautologies(self, tree: ast.AST) -> list[Vulnerability]:
        """
        Check for tautological comparisons that are always true or false.

        Examples:
        - self.owner == self.owner  (always True)
        - x != x  (always False for most types)
        - self.var == self.var  (always True)

        These often indicate broken authorization or logic bugs.
        """
        vulns = []

        for node in ast.walk(tree):
            if isinstance(node, ast.Compare):
                # Handle single comparisons (most common)
                if len(node.ops) == 1 and len(node.comparators) == 1:
                    left = ast.dump(node.left)
                    right = ast.dump(node.comparators[0])
                    op = node.ops[0]

                    if left == right:
                        # Same expression on both sides
                        if isinstance(op, (ast.Eq, ast.Is)):
                            # x == x or x is x -> always True
                            vulns.append(self._create_vulnerability(
                                severity=Severity.CRITICAL,
                                category="logic_flaw",
                                title="Tautological comparison (always True)",
                                description=f"Comparison is always True: comparing an expression to itself. "
                                           f"This likely indicates a broken security check or authorization bypass. "
                                           f"The condition will ALWAYS pass regardless of actual values.",
                                line_number=node.lineno,
                                exploit_code="# This check is broken:\n"
                                            "# self.owner == self.owner is ALWAYS True!\n"
                                            "# Anyone can pass this check, not just the owner.\n"
                                            "# Fix: Compare against the caller/sender, not self-reference",
                                confidence="high"
                            ))
                        elif isinstance(op, (ast.NotEq, ast.IsNot)):
                            # x != x or x is not x -> always False
                            vulns.append(self._create_vulnerability(
                                severity=Severity.HIGH,
                                category="logic_flaw",
                                title="Tautological comparison (always False)",
                                description=f"Comparison is always False: comparing an expression to itself with inequality. "
                                           f"This code path can never execute, indicating dead code or logic error.",
                                line_number=node.lineno,
                                confidence="high"
                            ))

        return vulns

    def _check_broken_authorization(self, tree: ast.AST, code: str) -> list[Vulnerability]:
        """
        Check for broken authorization patterns.

        Patterns detected:
        1. require(owner == owner) - self-comparison in auth check
        2. _require(self.x == self.x) - same pattern in method call
        3. assert self.admin == self.admin - assertion that always passes
        4. if caller == caller: - always-true branch guard
        """
        vulns = []
        lines = code.split("\n")

        # Pattern 1: Function calls with tautological arguments (e.g., _require(self.x == self.x))
        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                func_name = None
                if isinstance(node.func, ast.Name):
                    func_name = node.func.id
                elif isinstance(node.func, ast.Attribute):
                    func_name = node.func.attr

                # Check if this looks like an authorization/validation function
                auth_keywords = ["require", "assert", "check", "verify", "validate", "authorize", "ensure"]
                if func_name and any(kw in func_name.lower() for kw in auth_keywords):
                    # Check arguments for tautological comparisons
                    for arg in node.args:
                        if isinstance(arg, ast.Compare):
                            if len(arg.ops) == 1 and len(arg.comparators) == 1:
                                left = ast.dump(arg.left)
                                right = ast.dump(arg.comparators[0])
                                if left == right and isinstance(arg.ops[0], (ast.Eq, ast.Is)):
                                    vulns.append(self._create_vulnerability(
                                        severity=Severity.CRITICAL,
                                        category="authorization_bypass",
                                        title=f"Broken authorization in {func_name}()",
                                        description=f"Authorization check '{func_name}()' contains a tautological "
                                                   f"comparison that is always True. This completely bypasses "
                                                   f"the intended access control. ANYONE can call this function.",
                                        line_number=node.lineno,
                                        exploit_code=f"# CRITICAL: {func_name}(x == x) is ALWAYS True!\n"
                                                    f"# This means the 'Only owner can...' check is fake.\n"
                                                    f"# Any user can call mint/burn/blacklist.\n"
                                                    f"token.mint('attacker_address', 1_000_000_000)  # Works for anyone!",
                                        confidence="high"
                                    ))

        # Pattern 2: Check for suspicious patterns in raw code
        # e.g., self._require(self.owner == self.owner, ...)
        suspicious_patterns = [
            (r"self\.owner\s*==\s*self\.owner", "owner check always passes"),
            (r"self\.admin\s*==\s*self\.admin", "admin check always passes"),
            (r"msg\.sender\s*==\s*msg\.sender", "sender check always passes"),
            (r"caller\s*==\s*caller", "caller check always passes"),
        ]

        for lineno, line in enumerate(lines, 1):
            for pattern, desc in suspicious_patterns:
                if re.search(pattern, line):
                    # Only add if not already caught by AST analysis
                    already_found = any(
                        v.line_number == lineno and v.category == "authorization_bypass"
                        for v in vulns
                    )
                    if not already_found:
                        vulns.append(self._create_vulnerability(
                            severity=Severity.CRITICAL,
                            category="authorization_bypass",
                            title=f"Broken authorization: {desc}",
                            description=f"Line contains a self-comparison in what appears to be an "
                                       f"authorization check. The condition '{pattern}' is always True, "
                                       f"meaning any caller can bypass this check.",
                            line_number=lineno,
                            confidence="high"
                        ))

        return vulns
