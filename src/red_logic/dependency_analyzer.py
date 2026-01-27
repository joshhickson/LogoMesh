"""
Context-Aware Dependency Analyzer for Red Agent.

This module performs smart analysis of imports and their usage patterns.
It doesn't blindly flag imports - it analyzes HOW they're used.

Examples:
  - subprocess.run(user_input) → CRITICAL (command injection)
  - subprocess.run(["ls", "-la"]) → OK (hardcoded)
  - pickle.loads(request.data) → CRITICAL (deserialization)
  - pickle.dumps(internal_obj) → LOW (serialization is safer)
"""

import ast
from dataclasses import dataclass
from enum import Enum
from typing import List, Set, Dict, Optional


class RiskLevel(Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


@dataclass
class DependencyFinding:
    """A context-aware finding about dangerous dependency usage."""
    risk_level: RiskLevel
    category: str
    title: str
    description: str
    line_number: int
    code_snippet: str
    remediation: str


# Dangerous patterns: module.function -> (risk_if_user_input, risk_if_hardcoded, description)
DANGEROUS_PATTERNS = {
    # Command execution
    ("subprocess", "run"): {
        "user_input": RiskLevel.CRITICAL,
        "hardcoded": RiskLevel.INFO,
        "category": "command_injection",
        "description": "subprocess.run can execute arbitrary commands",
        "remediation": "Use shlex.quote() or pass args as list with shell=False"
    },
    ("subprocess", "Popen"): {
        "user_input": RiskLevel.CRITICAL,
        "hardcoded": RiskLevel.INFO,
        "category": "command_injection",
        "description": "subprocess.Popen can execute arbitrary commands",
        "remediation": "Use shlex.quote() or pass args as list with shell=False"
    },
    ("subprocess", "call"): {
        "user_input": RiskLevel.CRITICAL,
        "hardcoded": RiskLevel.INFO,
        "category": "command_injection",
        "description": "subprocess.call can execute arbitrary commands",
        "remediation": "Use shlex.quote() or pass args as list with shell=False"
    },
    ("os", "system"): {
        "user_input": RiskLevel.CRITICAL,
        "hardcoded": RiskLevel.MEDIUM,
        "category": "command_injection",
        "description": "os.system executes commands through shell",
        "remediation": "Use subprocess with shell=False instead"
    },
    ("os", "popen"): {
        "user_input": RiskLevel.CRITICAL,
        "hardcoded": RiskLevel.MEDIUM,
        "category": "command_injection",
        "description": "os.popen executes commands through shell",
        "remediation": "Use subprocess with shell=False instead"
    },

    # Code execution
    ("builtins", "eval"): {
        "user_input": RiskLevel.CRITICAL,
        "hardcoded": RiskLevel.HIGH,
        "category": "code_injection",
        "description": "eval() executes arbitrary Python code",
        "remediation": "Use ast.literal_eval() for safe evaluation of literals"
    },
    ("builtins", "exec"): {
        "user_input": RiskLevel.CRITICAL,
        "hardcoded": RiskLevel.HIGH,
        "category": "code_injection",
        "description": "exec() executes arbitrary Python code",
        "remediation": "Avoid exec(), use safer alternatives"
    },
    ("builtins", "compile"): {
        "user_input": RiskLevel.HIGH,
        "hardcoded": RiskLevel.MEDIUM,
        "category": "code_injection",
        "description": "compile() can be used to execute arbitrary code",
        "remediation": "Avoid compiling user-provided code"
    },

    # Deserialization
    ("pickle", "loads"): {
        "user_input": RiskLevel.CRITICAL,
        "hardcoded": RiskLevel.LOW,
        "category": "deserialization",
        "description": "pickle.loads can execute arbitrary code during deserialization",
        "remediation": "Use JSON or other safe serialization formats for untrusted data"
    },
    ("pickle", "load"): {
        "user_input": RiskLevel.CRITICAL,
        "hardcoded": RiskLevel.LOW,
        "category": "deserialization",
        "description": "pickle.load can execute arbitrary code during deserialization",
        "remediation": "Use JSON or other safe serialization formats for untrusted data"
    },
    ("yaml", "load"): {
        "user_input": RiskLevel.CRITICAL,
        "hardcoded": RiskLevel.LOW,
        "category": "deserialization",
        "description": "yaml.load with default Loader can execute arbitrary code",
        "remediation": "Use yaml.safe_load() instead"
    },
    ("marshal", "loads"): {
        "user_input": RiskLevel.HIGH,
        "hardcoded": RiskLevel.LOW,
        "category": "deserialization",
        "description": "marshal.loads can crash or exploit the interpreter",
        "remediation": "Avoid marshal for untrusted data"
    },

    # SQL injection (when using string formatting)
    ("sqlite3", "execute"): {
        "user_input": RiskLevel.HIGH,  # Will check for string formatting
        "hardcoded": RiskLevel.INFO,
        "category": "sql_injection",
        "description": "SQL query may be vulnerable to injection",
        "remediation": "Use parameterized queries with ? placeholders"
    },

    # File operations
    ("builtins", "open"): {
        "user_input": RiskLevel.HIGH,
        "hardcoded": RiskLevel.INFO,
        "category": "path_traversal",
        "description": "open() with user input can lead to path traversal",
        "remediation": "Validate and sanitize file paths, use pathlib"
    },
    ("os", "remove"): {
        "user_input": RiskLevel.HIGH,
        "hardcoded": RiskLevel.INFO,
        "category": "path_traversal",
        "description": "os.remove with user input can delete arbitrary files",
        "remediation": "Validate paths are within allowed directories"
    },
    ("shutil", "rmtree"): {
        "user_input": RiskLevel.CRITICAL,
        "hardcoded": RiskLevel.MEDIUM,
        "category": "path_traversal",
        "description": "shutil.rmtree can recursively delete directories",
        "remediation": "Validate paths are within allowed directories"
    },

    # Weak crypto
    ("random", "random"): {
        "user_input": RiskLevel.INFO,
        "hardcoded": RiskLevel.MEDIUM,
        "category": "weak_crypto",
        "description": "random module is not cryptographically secure",
        "remediation": "Use secrets module for security-sensitive randomness",
        "context_check": "crypto"  # Only flag if used in crypto context
    },
    ("random", "randint"): {
        "user_input": RiskLevel.INFO,
        "hardcoded": RiskLevel.MEDIUM,
        "category": "weak_crypto",
        "description": "random.randint is not cryptographically secure",
        "remediation": "Use secrets.randbelow() for security-sensitive randomness",
        "context_check": "crypto"
    },
    ("hashlib", "md5"): {
        "user_input": RiskLevel.INFO,
        "hardcoded": RiskLevel.MEDIUM,
        "category": "weak_crypto",
        "description": "MD5 is cryptographically broken",
        "remediation": "Use SHA-256 or better for security purposes",
        "context_check": "crypto"
    },
    ("hashlib", "sha1"): {
        "user_input": RiskLevel.INFO,
        "hardcoded": RiskLevel.LOW,
        "category": "weak_crypto",
        "description": "SHA-1 is deprecated for security purposes",
        "remediation": "Use SHA-256 or better",
        "context_check": "crypto"
    },
}

# Keywords that suggest user input / external data
USER_INPUT_INDICATORS = {
    "request", "req", "input", "user", "data", "body", "payload",
    "param", "args", "query", "form", "file", "upload", "content",
    "message", "msg", "text", "raw", "untrusted", "external"
}

# Keywords that suggest crypto/security context
CRYPTO_CONTEXT_INDICATORS = {
    "password", "secret", "token", "key", "auth", "crypt", "hash",
    "sign", "verify", "secure", "salt", "credential", "session"
}


class DependencyAnalyzer(ast.NodeVisitor):
    """
    AST-based analyzer that tracks imports and their usage patterns.

    It performs data flow analysis to determine if dangerous functions
    are called with user-controlled input or hardcoded values.
    """

    def __init__(self, source_code: str):
        self.source_code = source_code
        self.source_lines = source_code.split('\n')
        self.findings: List[DependencyFinding] = []

        # Track imports: alias -> (module, name)
        self.imports: Dict[str, tuple] = {}

        # Track variable assignments for data flow
        self.variables: Dict[str, str] = {}  # var_name -> "user_input" | "hardcoded" | "unknown"

        # Track function parameters (assume user input)
        self.function_params: Set[str] = set()

        # Detect if code is in crypto context
        self.is_crypto_context = False

    def analyze(self) -> List[DependencyFinding]:
        """Parse and analyze the source code."""
        try:
            tree = ast.parse(self.source_code)
        except SyntaxError:
            return []

        # First pass: collect imports and detect crypto context
        self._collect_imports(tree)
        self._detect_crypto_context()

        # Second pass: analyze usage
        self.visit(tree)

        return self.findings

    def _collect_imports(self, tree: ast.AST):
        """Collect all imports and their aliases."""
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    name = alias.asname or alias.name
                    self.imports[name] = (alias.name, None)
            elif isinstance(node, ast.ImportFrom):
                module = node.module or ""
                for alias in node.names:
                    name = alias.asname or alias.name
                    self.imports[name] = (module, alias.name)

    def _detect_crypto_context(self):
        """Check if the code appears to be doing crypto/security operations."""
        code_lower = self.source_code.lower()
        for indicator in CRYPTO_CONTEXT_INDICATORS:
            if indicator in code_lower:
                self.is_crypto_context = True
                break

    def _get_line(self, lineno: int) -> str:
        """Get source line by number."""
        if 0 < lineno <= len(self.source_lines):
            return self.source_lines[lineno - 1].strip()
        return ""

    def _is_user_input(self, node: ast.AST) -> bool:
        """
        Determine if a node likely contains user-controlled input.

        Heuristics:
        - Variable names containing 'input', 'user', 'request', etc.
        - Function parameters (assume untrusted)
        - Attribute access on request-like objects
        - Dictionary/subscript access on data-like objects
        """
        if isinstance(node, ast.Name):
            name_lower = node.id.lower()
            # Check if variable name suggests user input
            for indicator in USER_INPUT_INDICATORS:
                if indicator in name_lower:
                    return True
            # Check if it's a function parameter
            if node.id in self.function_params:
                return True
            # Check tracked variables
            if self.variables.get(node.id) == "user_input":
                return True

        elif isinstance(node, ast.Attribute):
            # Check for request.data, user.input, etc.
            attr_chain = self._get_attribute_chain(node)
            for indicator in USER_INPUT_INDICATORS:
                if any(indicator in part.lower() for part in attr_chain):
                    return True

        elif isinstance(node, ast.Subscript):
            # Check for data['key'], request['param'], etc.
            if isinstance(node.value, ast.Name):
                name_lower = node.value.id.lower()
                for indicator in USER_INPUT_INDICATORS:
                    if indicator in name_lower:
                        return True

        elif isinstance(node, ast.Call):
            # Check for input(), request.get(), etc.
            if isinstance(node.func, ast.Name):
                if node.func.id == "input":
                    return True
            elif isinstance(node.func, ast.Attribute):
                chain = self._get_attribute_chain(node.func)
                for indicator in USER_INPUT_INDICATORS:
                    if any(indicator in part.lower() for part in chain):
                        return True

        elif isinstance(node, ast.BinOp):
            # String formatting: f"SELECT * FROM {user_input}"
            return self._is_user_input(node.left) or self._is_user_input(node.right)

        elif isinstance(node, ast.JoinedStr):
            # f-strings
            for value in node.values:
                if isinstance(value, ast.FormattedValue):
                    if self._is_user_input(value.value):
                        return True

        return False

    def _is_hardcoded(self, node: ast.AST) -> bool:
        """Check if a node is a hardcoded/constant value."""
        if isinstance(node, ast.Constant):
            return True
        if isinstance(node, ast.List):
            return all(self._is_hardcoded(elt) for elt in node.elts)
        if isinstance(node, ast.Tuple):
            return all(self._is_hardcoded(elt) for elt in node.elts)
        if isinstance(node, ast.Dict):
            return (all(self._is_hardcoded(k) for k in node.keys if k) and
                    all(self._is_hardcoded(v) for v in node.values))
        return False

    def _get_attribute_chain(self, node: ast.Attribute) -> List[str]:
        """Get the chain of attributes: a.b.c -> ['a', 'b', 'c']"""
        chain = [node.attr]
        current = node.value
        while isinstance(current, ast.Attribute):
            chain.append(current.attr)
            current = current.value
        if isinstance(current, ast.Name):
            chain.append(current.id)
        chain.reverse()
        return chain

    def _resolve_call_target(self, node: ast.Call) -> Optional[tuple]:
        """
        Resolve what module.function a call refers to.
        Returns (module, function) or None.
        """
        if isinstance(node.func, ast.Attribute):
            # module.function() or obj.method()
            if isinstance(node.func.value, ast.Name):
                obj_name = node.func.value.id
                method_name = node.func.attr

                # Check if obj_name is an imported module
                if obj_name in self.imports:
                    module, _ = self.imports[obj_name]
                    return (module, method_name)

                # Built-in calls like eval(), exec()
                return (obj_name, method_name)

        elif isinstance(node.func, ast.Name):
            func_name = node.func.id

            # Check if it's an imported function
            if func_name in self.imports:
                module, name = self.imports[func_name]
                return (module, name or func_name)

            # Built-in functions
            if func_name in ("eval", "exec", "compile", "open"):
                return ("builtins", func_name)

        return None

    def _check_sql_string_formatting(self, node: ast.Call) -> bool:
        """Check if SQL execute is using string formatting (vulnerable)."""
        if node.args:
            first_arg = node.args[0]
            # Check for f-strings, % formatting, .format()
            if isinstance(first_arg, ast.JoinedStr):
                return True
            if isinstance(first_arg, ast.BinOp) and isinstance(first_arg.op, ast.Mod):
                return True
            if isinstance(first_arg, ast.Call):
                if isinstance(first_arg.func, ast.Attribute):
                    if first_arg.func.attr == "format":
                        return True
        return False

    def visit_FunctionDef(self, node: ast.FunctionDef):
        """Track function parameters as potential user input."""
        old_params = self.function_params.copy()

        # Add all parameters as potential user input
        for arg in node.args.args:
            self.function_params.add(arg.arg)
        for arg in node.args.kwonlyargs:
            self.function_params.add(arg.arg)
        if node.args.vararg:
            self.function_params.add(node.args.vararg.arg)
        if node.args.kwarg:
            self.function_params.add(node.args.kwarg.arg)

        self.generic_visit(node)

        # Restore (for nested functions)
        self.function_params = old_params

    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef):
        """Handle async functions same as regular functions."""
        self.visit_FunctionDef(node)  # type: ignore

    def visit_Call(self, node: ast.Call):
        """Analyze function calls for dangerous patterns."""
        target = self._resolve_call_target(node)

        if target:
            module, func = target
            pattern_key = (module, func)

            if pattern_key in DANGEROUS_PATTERNS:
                pattern = DANGEROUS_PATTERNS[pattern_key]

                # Check context requirement
                if pattern.get("context_check") == "crypto" and not self.is_crypto_context:
                    # Skip if not in crypto context
                    self.generic_visit(node)
                    return

                # Determine risk level based on input type
                has_user_input = False
                is_hardcoded = True

                for arg in node.args:
                    if self._is_user_input(arg):
                        has_user_input = True
                        is_hardcoded = False
                    elif not self._is_hardcoded(arg):
                        is_hardcoded = False

                for keyword in node.keywords:
                    if self._is_user_input(keyword.value):
                        has_user_input = True
                        is_hardcoded = False
                    elif not self._is_hardcoded(keyword.value):
                        is_hardcoded = False

                # Special case: SQL injection check
                if pattern["category"] == "sql_injection":
                    if self._check_sql_string_formatting(node):
                        has_user_input = True
                        is_hardcoded = False

                # Determine risk level
                if has_user_input:
                    risk_level = pattern["user_input"]
                elif is_hardcoded:
                    risk_level = pattern["hardcoded"]
                else:
                    # Unknown source - be cautious
                    risk_level = RiskLevel.MEDIUM

                # Only report if risk is meaningful
                if risk_level in (RiskLevel.CRITICAL, RiskLevel.HIGH, RiskLevel.MEDIUM):
                    line = self._get_line(node.lineno)

                    input_type = "user-controlled input" if has_user_input else (
                        "hardcoded value" if is_hardcoded else "unknown source"
                    )

                    finding = DependencyFinding(
                        risk_level=risk_level,
                        category=pattern["category"],
                        title=f"Dangerous use of {module}.{func}()",
                        description=f"{pattern['description']}. Called with {input_type}.",
                        line_number=node.lineno,
                        code_snippet=line,
                        remediation=pattern["remediation"]
                    )
                    self.findings.append(finding)

        self.generic_visit(node)


def analyze_dependencies(source_code: str) -> List[DependencyFinding]:
    """
    Analyze source code for dangerous dependency usage.

    Returns a list of findings with context-aware risk levels.
    """
    analyzer = DependencyAnalyzer(source_code)
    return analyzer.analyze()


# Convenience function to convert findings to Red Agent format
def findings_to_vulnerabilities(findings: List[DependencyFinding]) -> List[dict]:
    """Convert DependencyFindings to Red Agent vulnerability format."""
    vulnerabilities = []
    for finding in findings:
        vuln = {
            "severity": finding.risk_level.value,
            "category": finding.category,
            "title": finding.title,
            "description": f"{finding.description}\n\nRemediation: {finding.remediation}",
            "line_number": finding.line_number,
            "confidence": "high" if finding.risk_level in (RiskLevel.CRITICAL, RiskLevel.HIGH) else "medium",
            "exploit_code": f"# Vulnerable code at line {finding.line_number}:\n# {finding.code_snippet}"
        }
        vulnerabilities.append(vuln)
    return vulnerabilities
