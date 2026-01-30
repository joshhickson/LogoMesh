"""
Constraint Breaker Worker - Finds task-specific constraint violations.

Each task in LogoMesh has specific constraints that Purple Agent must follow.
This worker knows all constraints and finds violations.

Reference: src/green_logic/tasks.py
"""

import ast
import re
import time
from typing import Optional
from dataclasses import dataclass

from .base import BaseWorker, WorkerResult, Vulnerability, Severity


@dataclass
class TaskConstraint:
    """Definition of a task-specific constraint."""
    task_id: str
    name: str
    description: str
    check_type: str  # "forbidden_import", "forbidden_pattern", "required_pattern", "forbidden_construct"
    patterns: list[str]
    severity: Severity
    exploit_hint: str = ""


class ConstraintBreakerWorker(BaseWorker):
    """
    Finds task-specific constraint violations.

    Each task has unique requirements:
    - task-001 (Email): Regex only, no network calls
    - task-004 (Fibonacci): Must use recursion, no loops
    - task-005 (JWT): Only allowed imports
    - task-006 (Connection Pool): Must be thread-safe
    - task-014 (SQL Builder): Must use parameterized queries
    - etc.

    This worker checks ALL constraints and reports violations.
    """

    # Complete task constraint definitions from tasks.py
    TASK_CONSTRAINTS: list[TaskConstraint] = [
        # === TASK-001: Email Validator ===
        TaskConstraint(
            task_id="task-001",
            name="no_network_calls",
            description="Email validator must not make network calls",
            check_type="forbidden_import",
            patterns=["socket", "urllib", "requests", "http.client", "httpx", "aiohttp"],
            severity=Severity.HIGH,
            exploit_hint="Network calls in email validation allow SSRF attacks"
        ),
        TaskConstraint(
            task_id="task-001",
            name="regex_only",
            description="Email validation must use regex patterns",
            check_type="required_import",
            patterns=["re"],
            severity=Severity.MEDIUM,
            exploit_hint="Without regex, validation is likely incomplete or incorrect"
        ),
        TaskConstraint(
            task_id="task-001",
            name="no_dns_lookup",
            description="No DNS/MX record lookups allowed",
            check_type="forbidden_pattern",
            patterns=[r"dns\.", r"resolver\.", r"MX", r"getaddrinfo"],
            severity=Severity.HIGH,
            exploit_hint="DNS lookups can be used for reconnaissance"
        ),

        # === TASK-002: Rate Limiter ===
        TaskConstraint(
            task_id="task-002",
            name="require_thread_safety",
            description="Rate limiter should be thread-safe for concurrent clients",
            check_type="required_pattern",
            patterns=[r"Lock\s*\(", r"RLock\s*\(", r"threading\.", r"asyncio\.Lock"],
            severity=Severity.HIGH,
            exploit_hint="Without thread safety, concurrent requests bypass rate limits"
        ),

        # === TASK-004: Recursive Fibonacci ===
        TaskConstraint(
            task_id="task-004",
            name="require_recursion",
            description="Fibonacci must use recursion",
            check_type="required_pattern",
            # Simpler pattern: function definition that calls fibonacci inside
            patterns=[r"def\s+fibonacci.*\n.*fibonacci\s*\(", r"fibonacci\s*\([^)]*\)\s*\+\s*fibonacci"],
            severity=Severity.HIGH,
            exploit_hint="Non-recursive solution violates task requirements"
        ),
        TaskConstraint(
            task_id="task-004",
            name="forbid_loops",
            description="Fibonacci must not use loops",
            check_type="forbidden_construct",
            patterns=["for", "while"],
            severity=Severity.HIGH,
            exploit_hint="Using loops instead of recursion violates task constraints"
        ),

        # === TASK-005: JWT Parser ===
        TaskConstraint(
            task_id="task-005",
            name="allowed_imports_only",
            description="JWT Parser can only use: base64, json, hmac, hashlib, time",
            check_type="forbidden_import",
            patterns=["jwt", "pyjwt", "jose", "cryptography", "Crypto"],
            severity=Severity.HIGH,
            exploit_hint="Using JWT libraries defeats the purpose of the task"
        ),
        TaskConstraint(
            task_id="task-005",
            name="signature_validation",
            description="JWT must validate signatures",
            check_type="required_pattern",
            patterns=[r"hmac\.", r"hashlib\."],
            severity=Severity.CRITICAL,
            exploit_hint="Missing signature validation allows token forgery"
        ),

        # === TASK-006: Thread-Safe Connection Pool ===
        TaskConstraint(
            task_id="task-006",
            name="require_thread_safety",
            description="Connection pool must use threading primitives",
            check_type="required_import",
            patterns=["threading"],
            severity=Severity.CRITICAL,
            exploit_hint="Without thread safety, race conditions will corrupt pool state"
        ),
        TaskConstraint(
            task_id="task-006",
            name="require_lock",
            description="Connection pool must use locks",
            check_type="required_pattern",
            patterns=[r"Lock\s*\(", r"RLock\s*\(", r"Semaphore\s*\(", r"Condition\s*\("],
            severity=Severity.CRITICAL,
            exploit_hint="Missing synchronization primitives cause race conditions"
        ),

        # === TASK-008: Merkle Tree ===
        TaskConstraint(
            task_id="task-008",
            name="leaf_internal_differentiation",
            description="Merkle tree must differentiate leaf and internal nodes",
            check_type="required_pattern",
            patterns=[r"0x00|0x01|\\x00|\\x01|b'\\x00'|b'\\x01'"],
            severity=Severity.CRITICAL,
            exploit_hint="Without differentiation, second preimage attacks are possible"
        ),

        # === TASK-009: Blockchain ===
        TaskConstraint(
            task_id="task-009",
            name="proof_of_work",
            description="Blockchain must implement proof of work",
            check_type="required_pattern",
            patterns=[r"nonce", r"difficulty", r"startswith\s*\(['\"]0"],
            severity=Severity.HIGH,
            exploit_hint="Without PoW, blocks can be mined instantly"
        ),

        # === TASK-011: ECDSA ===
        TaskConstraint(
            task_id="task-011",
            name="nonce_generation",
            description="ECDSA must use secure nonce generation",
            check_type="required_pattern",
            patterns=[r"secrets\.", r"random\.SystemRandom", r"os\.urandom"],
            severity=Severity.CRITICAL,
            exploit_hint="Predictable nonces allow private key recovery"
        ),

        # === TASK-012: ERC-20 Token ===
        TaskConstraint(
            task_id="task-012",
            name="zero_address_check",
            description="Token must check for zero address",
            check_type="required_pattern",
            patterns=[r"0x0|zero|null.*address"],
            severity=Severity.HIGH,
            exploit_hint="Missing zero address check can burn tokens"
        ),

        # === TASK-014: SQL Query Builder ===
        TaskConstraint(
            task_id="task-014",
            name="parameterized_queries",
            description="SQL builder must use parameterized queries",
            check_type="required_pattern",
            patterns=[r"\?|%s|:\w+|\$\d+"],  # Placeholder patterns
            severity=Severity.CRITICAL,
            exploit_hint="Without parameterization, SQL injection is possible"
        ),
        TaskConstraint(
            task_id="task-014",
            name="no_string_interpolation",
            description="SQL builder must not use string interpolation",
            check_type="forbidden_pattern",
            patterns=[r"f['\"].*(?:SELECT|INSERT|UPDATE|DELETE)", r"\+.*['\"].*(?:SELECT|INSERT)"],
            severity=Severity.CRITICAL,
            exploit_hint="String interpolation in SQL = SQL injection"
        ),

        # === TASK-016: Task Queue ===
        TaskConstraint(
            task_id="task-016",
            name="require_thread_safety",
            description="Task queue must be thread-safe",
            check_type="required_import",
            patterns=["threading"],
            severity=Severity.HIGH,
            exploit_hint="Non-thread-safe queue will lose tasks"
        ),

        # === TASK-017: Raft Consensus ===
        TaskConstraint(
            task_id="task-017",
            name="term_tracking",
            description="Raft must track terms",
            check_type="required_pattern",
            patterns=[r"term|current_term"],
            severity=Severity.HIGH,
            exploit_hint="Without term tracking, split brain is possible"
        ),

        # === TASK-020: MVCC ===
        TaskConstraint(
            task_id="task-020",
            name="require_thread_safety",
            description="MVCC must be thread-safe",
            check_type="required_import",
            patterns=["threading"],
            severity=Severity.CRITICAL,
            exploit_hint="Non-thread-safe MVCC will have lost updates"
        ),
        TaskConstraint(
            task_id="task-020",
            name="version_tracking",
            description="MVCC must track versions",
            check_type="required_pattern",
            patterns=[r"version|txn_id|timestamp"],
            severity=Severity.HIGH,
            exploit_hint="Without version tracking, isolation is broken"
        ),
    ]

    @property
    def name(self) -> str:
        return "ConstraintBreakerWorker"

    def analyze(self, code: str, task_id: Optional[str] = None) -> WorkerResult:
        """
        Analyze code for task-specific constraint violations.

        Args:
            code: Source code to analyze
            task_id: Task identifier (e.g., "task-001")

        Returns:
            WorkerResult with found violations
        """
        start_time = time.time()
        vulnerabilities = []

        if not task_id:
            # Try to infer task from common patterns
            task_id = self._infer_task_id(code)

        if not task_id:
            # Can't check constraints without knowing the task
            # Novel tasks are handled by the LLM reasoning layer instead
            print(f"[ConstraintBreaker] No task_id inferred — skipping static constraint checks")
            return WorkerResult(
                worker_name=self.name,
                vulnerabilities=[],
                execution_time_ms=(time.time() - start_time) * 1000
            )

        # Get constraints for this task
        task_constraints = [c for c in self.TASK_CONSTRAINTS if c.task_id == task_id]
        if not task_constraints and task_id:
            print(f"[ConstraintBreaker] No hardcoded constraints for {task_id} — novel task")

        # Check each constraint
        for constraint in task_constraints:
            violation = self._check_constraint(code, constraint)
            if violation:
                vulnerabilities.append(violation)

        # Also check for common vulnerabilities specific to task type
        vulnerabilities.extend(self._check_task_specific_vulns(code, task_id))

        return WorkerResult(
            worker_name=self.name,
            vulnerabilities=vulnerabilities,
            execution_time_ms=(time.time() - start_time) * 1000
        )

    def _check_constraint(self, code: str, constraint: TaskConstraint) -> Optional[Vulnerability]:
        """Check a single constraint and return vulnerability if violated."""

        if constraint.check_type == "forbidden_import":
            return self._check_forbidden_import(code, constraint)
        elif constraint.check_type == "required_import":
            return self._check_required_import(code, constraint)
        elif constraint.check_type == "forbidden_pattern":
            return self._check_forbidden_pattern(code, constraint)
        elif constraint.check_type == "required_pattern":
            return self._check_required_pattern(code, constraint)
        elif constraint.check_type == "forbidden_construct":
            return self._check_forbidden_construct(code, constraint)

        return None

    def _check_forbidden_import(self, code: str, constraint: TaskConstraint) -> Optional[Vulnerability]:
        """Check for forbidden imports."""
        for pattern in constraint.patterns:
            if re.search(rf"\bimport\s+{re.escape(pattern)}\b", code) or \
               re.search(rf"\bfrom\s+{re.escape(pattern)}\s+import\b", code):
                return self._create_vulnerability(
                    severity=constraint.severity,
                    category="constraint_violation",
                    title=f"Constraint violation: {constraint.name}",
                    description=f"{constraint.description}. Found forbidden import: {pattern}",
                    exploit_code=f"# {constraint.exploit_hint}",
                    confidence="high"
                )
        return None

    def _check_required_import(self, code: str, constraint: TaskConstraint) -> Optional[Vulnerability]:
        """Check that required imports are present."""
        for pattern in constraint.patterns:
            # Check various import forms
            if re.search(rf"\bimport\s+{re.escape(pattern)}\b", code):
                return None  # Found required import
            if re.search(rf"\bfrom\s+{re.escape(pattern)}\s+import\b", code):
                return None  # Found required import
            if re.search(rf"\bfrom\s+{re.escape(pattern)}\.", code):
                return None  # Found required import (from threading.Lock import ...)

        return self._create_vulnerability(
            severity=constraint.severity,
            category="constraint_violation",
            title=f"Missing requirement: {constraint.name}",
            description=f"{constraint.description}. Required import not found: {constraint.patterns}",
            exploit_code=f"# {constraint.exploit_hint}",
            confidence="high"
        )

    def _check_forbidden_pattern(self, code: str, constraint: TaskConstraint) -> Optional[Vulnerability]:
        """Check for forbidden patterns in code."""
        for pattern in constraint.patterns:
            match = re.search(pattern, code, re.IGNORECASE | re.MULTILINE)
            if match:
                # Find line number
                line_num = code[:match.start()].count('\n') + 1
                return self._create_vulnerability(
                    severity=constraint.severity,
                    category="constraint_violation",
                    title=f"Forbidden pattern: {constraint.name}",
                    description=f"{constraint.description}. Found: {match.group()}",
                    line_number=line_num,
                    exploit_code=f"# {constraint.exploit_hint}",
                    confidence="high"
                )
        return None

    def _check_required_pattern(self, code: str, constraint: TaskConstraint) -> Optional[Vulnerability]:
        """Check that required patterns are present."""
        for pattern in constraint.patterns:
            if re.search(pattern, code, re.IGNORECASE | re.MULTILINE):
                return None  # Found required pattern

        return self._create_vulnerability(
            severity=constraint.severity,
            category="constraint_violation",
            title=f"Missing requirement: {constraint.name}",
            description=f"{constraint.description}. Required pattern not found.",
            exploit_code=f"# {constraint.exploit_hint}",
            confidence="medium"
        )

    def _check_forbidden_construct(self, code: str, constraint: TaskConstraint) -> Optional[Vulnerability]:
        """Check for forbidden language constructs (for, while, etc.)."""
        try:
            tree = ast.parse(code)
        except SyntaxError:
            return None

        for node in ast.walk(tree):
            for pattern in constraint.patterns:
                if pattern == "for" and isinstance(node, ast.For):
                    return self._create_vulnerability(
                        severity=constraint.severity,
                        category="constraint_violation",
                        title=f"Forbidden construct: {constraint.name}",
                        description=f"{constraint.description}. Found 'for' loop.",
                        line_number=node.lineno,
                        exploit_code=f"# {constraint.exploit_hint}",
                        confidence="high"
                    )
                elif pattern == "while" and isinstance(node, ast.While):
                    return self._create_vulnerability(
                        severity=constraint.severity,
                        category="constraint_violation",
                        title=f"Forbidden construct: {constraint.name}",
                        description=f"{constraint.description}. Found 'while' loop.",
                        line_number=node.lineno,
                        exploit_code=f"# {constraint.exploit_hint}",
                        confidence="high"
                    )

        return None

    def _check_task_specific_vulns(self, code: str, task_id: str) -> list[Vulnerability]:
        """Check for vulnerabilities specific to task type."""
        vulns = []

        # JWT-specific checks
        if task_id == "task-005":
            # Check for algorithm confusion vulnerability
            if "alg" in code and not re.search(r"alg.*==.*['\"]HS256['\"]|verify.*algorithm", code, re.I):
                vulns.append(self._create_vulnerability(
                    severity=Severity.CRITICAL,
                    category="crypto",
                    title="JWT algorithm confusion vulnerability",
                    description="JWT parser may not properly validate the algorithm claim, "
                               "allowing 'alg: none' attacks.",
                    exploit_code="# Attack: Set 'alg': 'none' and remove signature\n"
                                "fake_token = base64('{\"alg\":\"none\"}') + '.' + base64(payload) + '.'",
                    confidence="medium"
                ))

        # Rate limiter specific checks
        if task_id == "task-002":
            if "time.time()" in code and "monotonic" not in code:
                vulns.append(self._create_vulnerability(
                    severity=Severity.MEDIUM,
                    category="timing",
                    title="Non-monotonic time source in rate limiter",
                    description="Using time.time() instead of time.monotonic() allows clock drift attacks.",
                    exploit_code="# Clock can be set backwards to reset rate limit window",
                    confidence="medium"
                ))

        # Connection pool specific checks
        if task_id == "task-006":
            if "with " not in code and "__enter__" not in code:
                vulns.append(self._create_vulnerability(
                    severity=Severity.HIGH,
                    category="resource_leak",
                    title="Missing context manager in connection pool",
                    description="Connection pool should support 'with' statement to ensure connections are returned.",
                    exploit_code="# Connections may leak if not properly released",
                    confidence="medium"
                ))

        # SQL builder specific checks
        if task_id == "task-014":
            # Check for potential SQL injection in IN clause
            if "IN" in code.upper() and not re.search(r"IN\s*\(\s*\?", code, re.I):
                vulns.append(self._create_vulnerability(
                    severity=Severity.HIGH,
                    category="sql_injection",
                    title="Potential SQL injection in IN clause",
                    description="IN clause may not properly parameterize list values.",
                    exploit_code="# IN clause should expand to (?, ?, ?) for list values",
                    confidence="medium"
                ))

        return vulns

    def _infer_task_id(self, code: str) -> Optional[str]:
        """Try to infer task ID from code patterns."""
        code_lower = code.lower()

        # Heuristic detection based on common patterns
        if "validate_email" in code_lower or "email" in code_lower and "@" in code:
            return "task-001"
        elif "ratelimit" in code_lower or "rate_limit" in code_lower:
            return "task-002"
        elif "lrucache" in code_lower or "lru_cache" in code_lower or "least recently" in code_lower:
            return "task-003"
        elif "fibonacci" in code_lower or "fib(" in code_lower:
            return "task-004"
        elif "jwt" in code_lower or "json web token" in code_lower:
            return "task-005"
        elif "connectionpool" in code_lower or "connection_pool" in code_lower:
            return "task-006"
        elif "statemachine" in code_lower or "state_machine" in code_lower:
            return "task-007"
        elif "merkle" in code_lower:
            return "task-008"
        elif "blockchain" in code_lower or "block" in code_lower and "chain" in code_lower:
            return "task-009"
        elif "hdwallet" in code_lower or "hd_wallet" in code_lower or "derive" in code_lower and "key" in code_lower:
            return "task-010"
        elif "ecdsa" in code_lower or "elliptic" in code_lower:
            return "task-011"
        elif "erc20" in code_lower or "token" in code_lower and "transfer" in code_lower:
            return "task-012"
        elif "router" in code_lower and ("route" in code_lower or "middleware" in code_lower):
            return "task-013"
        elif "querybuilder" in code_lower or "query_builder" in code_lower or "sql" in code_lower:
            return "task-014"
        elif "eventsourc" in code_lower or "event_sourc" in code_lower or "cqrs" in code_lower:
            return "task-015"
        elif "taskqueue" in code_lower or "task_queue" in code_lower:
            return "task-016"
        elif "raft" in code_lower or "leader" in code_lower and "election" in code_lower:
            return "task-017"
        elif "btree" in code_lower or "b_tree" in code_lower:
            return "task-018"
        elif "hashring" in code_lower or "consistent" in code_lower and "hash" in code_lower:
            return "task-019"
        elif "mvcc" in code_lower or "multiversion" in code_lower:
            return "task-020"

        # No heuristic match — reasoning layer handles novel tasks dynamically
        return None
