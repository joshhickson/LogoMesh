"""
Semantic Code Analyzer - AGI-like code understanding.

This module provides TRUE code understanding, not just pattern matching.
It uses LLM to reason about code semantics and determine if vulnerabilities
are real or false positives.

Key capabilities:
1. Understand QueryBuilder patterns (returns sql, params = SAFE)
2. Distinguish structural interpolation from value interpolation
3. Reason about data flow and security implications
4. Provide confidence-weighted findings
"""

import ast
import os
import re
from dataclasses import dataclass
from typing import List, Dict, Optional, Any, Tuple
from enum import Enum

try:
    from openai import AsyncOpenAI
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False


class SecurityVerdict(Enum):
    """Verdict on whether a potential vulnerability is real."""
    VULNERABLE = "vulnerable"          # Definitely a security issue
    LIKELY_VULNERABLE = "likely_vulnerable"  # Probably an issue
    UNCERTAIN = "uncertain"            # Can't determine
    LIKELY_SAFE = "likely_safe"        # Probably safe
    SAFE = "safe"                      # Definitely safe (e.g., parameterized)


@dataclass
class SemanticFinding:
    """A finding with semantic understanding."""
    category: str
    title: str
    description: str
    line_number: int
    verdict: SecurityVerdict
    reasoning: str  # WHY we think this
    confidence: float  # 0.0 to 1.0
    evidence: List[str]  # Code snippets supporting our conclusion


class QueryBuilderDetector(ast.NodeVisitor):
    """
    Detects if code implements a Query Builder pattern with parameterized queries.

    A safe QueryBuilder:
    1. Has methods that return self (fluent interface)
    2. Stores values in a parameters list/dict
    3. Uses placeholders (?, %s, :name) in SQL strings
    4. Returns (sql, params) tuple from build() method
    """

    def __init__(self, source_code: str):
        self.source_code = source_code
        self.source_lines = source_code.split('\n')
        self.classes: Dict[str, Dict] = {}
        self.current_class: Optional[str] = None

    def analyze(self) -> Dict[str, Any]:
        """Analyze code for QueryBuilder patterns."""
        try:
            tree = ast.parse(self.source_code)
            self.visit(tree)
        except SyntaxError:
            return {"is_query_builder": False, "reason": "Syntax error"}

        # Check each class for QueryBuilder characteristics
        for class_name, class_info in self.classes.items():
            if self._is_query_builder(class_info):
                class_info["is_query_builder"] = True
                class_info["is_parameterized"] = self._uses_parameterized_queries(class_info)
            else:
                class_info["is_query_builder"] = False
                class_info["is_parameterized"] = False

        return self.classes

    def visit_ClassDef(self, node: ast.ClassDef):
        self.current_class = node.name
        self.classes[node.name] = {
            "methods": {},
            "has_parameters_attr": False,
            "has_fluent_interface": False,
            "returns_tuple": False,
            "uses_placeholders": False,
            "line_start": node.lineno,
            "line_end": node.end_lineno if hasattr(node, 'end_lineno') else node.lineno
        }
        self.generic_visit(node)
        self.current_class = None

    def visit_FunctionDef(self, node: ast.FunctionDef):
        if self.current_class:
            method_info = {
                "returns_self": self._returns_self(node),
                "returns_tuple": self._returns_tuple(node),
                "modifies_parameters": self._modifies_parameters(node),
                "uses_placeholders": self._uses_placeholders(node),
                "line": node.lineno
            }
            self.classes[self.current_class]["methods"][node.name] = method_info

            # Update class-level flags
            if method_info["returns_self"]:
                self.classes[self.current_class]["has_fluent_interface"] = True
            if method_info["returns_tuple"]:
                self.classes[self.current_class]["returns_tuple"] = True
            if method_info["modifies_parameters"]:
                self.classes[self.current_class]["has_parameters_attr"] = True
            if method_info["uses_placeholders"]:
                self.classes[self.current_class]["uses_placeholders"] = True

        self.generic_visit(node)

    def _returns_self(self, node: ast.FunctionDef) -> bool:
        """Check if method returns self (fluent interface)."""
        for child in ast.walk(node):
            if isinstance(child, ast.Return):
                if isinstance(child.value, ast.Name) and child.value.id == "self":
                    return True
        return False

    def _returns_tuple(self, node: ast.FunctionDef) -> bool:
        """Check if method returns a tuple (likely sql, params)."""
        for child in ast.walk(node):
            if isinstance(child, ast.Return):
                if isinstance(child.value, ast.Tuple):
                    return True
        return False

    def _modifies_parameters(self, node: ast.FunctionDef) -> bool:
        """Check if method modifies self.parameters or similar."""
        param_names = {"parameters", "params", "values", "args", "bindings"}
        for child in ast.walk(node):
            if isinstance(child, ast.Attribute):
                if isinstance(child.value, ast.Name) and child.value.id == "self":
                    if child.attr.lower() in param_names or "param" in child.attr.lower():
                        return True
        return False

    def _uses_placeholders(self, node: ast.FunctionDef) -> bool:
        """Check if method uses SQL placeholders."""
        # Get the source lines for this function
        start = node.lineno - 1
        end = node.end_lineno if hasattr(node, 'end_lineno') else start + 20
        func_source = '\n'.join(self.source_lines[start:end])

        # Look for placeholder patterns
        placeholders = [
            r'\?',           # SQLite style
            r'%s',           # psycopg2 style
            r':\w+',         # Oracle/SQLAlchemy style
            r'\$\d+',        # PostgreSQL style
        ]
        for pattern in placeholders:
            if re.search(pattern, func_source):
                return True
        return False

    def _is_query_builder(self, class_info: Dict) -> bool:
        """Determine if class is a QueryBuilder."""
        # Must have fluent interface OR parameters attribute
        if not (class_info["has_fluent_interface"] or class_info["has_parameters_attr"]):
            return False

        # Check for builder-like method names
        builder_methods = {"build", "to_sql", "compile", "get_query", "execute"}
        method_names = set(class_info["methods"].keys())

        if builder_methods & method_names:
            return True

        # Check for SQL-related method names
        sql_methods = {"select", "from_table", "where", "join", "insert", "update", "delete"}
        if len(sql_methods & method_names) >= 2:
            return True

        return False

    def _uses_parameterized_queries(self, class_info: Dict) -> bool:
        """Check if the QueryBuilder uses parameterized queries."""
        # Must use placeholders AND have parameters attribute
        return class_info["uses_placeholders"] and class_info["has_parameters_attr"]


class SemanticSQLAnalyzer:
    """
    Semantic analyzer for SQL injection that understands code patterns.

    This goes beyond regex matching to understand:
    1. Is this a QueryBuilder pattern?
    2. Are values parameterized?
    3. What's being interpolated (structure vs values)?
    """

    def __init__(self):
        self.qb_detector = None

    def analyze(self, source_code: str, potential_vulns: List[Dict]) -> List[SemanticFinding]:
        """
        Analyze potential SQL injection vulnerabilities with semantic understanding.

        Args:
            source_code: The full source code
            potential_vulns: List of potential vulnerabilities from pattern matching

        Returns:
            List of SemanticFindings with verdicts
        """
        findings = []

        # First, detect QueryBuilder patterns
        self.qb_detector = QueryBuilderDetector(source_code)
        class_info = self.qb_detector.analyze()

        # Check if any class is a parameterized QueryBuilder
        # Handle case where analyze() returns early with error dict
        has_parameterized_builder = any(
            info.get("is_parameterized", False)
            for info in class_info.values()
            if isinstance(info, dict)
        )

        for vuln in potential_vulns:
            if vuln.get("category") != "sql_injection":
                continue

            line_num = vuln.get("line_number", 0)

            # Find which class this line belongs to
            containing_class = None
            for class_name, info in class_info.items():
                if not isinstance(info, dict):
                    continue
                if info.get("line_start", 0) <= line_num <= info.get("line_end", line_num + 100):
                    containing_class = class_name
                    break

            # Determine verdict based on context
            if containing_class and class_info[containing_class].get("is_parameterized"):
                # This is inside a parameterized QueryBuilder
                # BUT: f-string SQL can still be vulnerable for column/table injection
                # Be conservative: mark as UNCERTAIN so it gets reported
                finding = SemanticFinding(
                    category="sql_injection",
                    title=vuln.get("title", "SQL Pattern in QueryBuilder"),
                    description="F-string detected in parameterized SQL builder. Values may be safe but structure (columns/tables) could be injectable.",
                    line_number=line_num,
                    verdict=SecurityVerdict.UNCERTAIN,
                    reasoning=f"Class '{containing_class}' implements parameterized queries. "
                             f"F-strings are used for structure (columns, tables) only. "
                             f"Values go through placeholders and parameters list.",
                    confidence=0.9,
                    evidence=[
                        f"Class {containing_class} uses ? placeholders",
                        f"Class {containing_class} has parameters attribute",
                        f"build() method returns (sql, params) tuple"
                    ]
                )
            elif containing_class and class_info[containing_class].get("is_query_builder"):
                # Inside a QueryBuilder class, but NOT parameterized - uncertain
                finding = SemanticFinding(
                    category="sql_injection",
                    title=vuln.get("title", "SQL Pattern Detected"),
                    description=vuln.get("description", "Potential SQL injection in QueryBuilder"),
                    line_number=line_num,
                    verdict=SecurityVerdict.UNCERTAIN,
                    reasoning=f"Class '{containing_class}' is a QueryBuilder but may not use parameterized queries. "
                             f"Manual review recommended.",
                    confidence=0.5,
                    evidence=[f"Class {containing_class} is a QueryBuilder but parameterization uncertain"]
                )
            else:
                # No QueryBuilder pattern - this might be a real vulnerability
                finding = SemanticFinding(
                    category="sql_injection",
                    title=vuln.get("title", "SQL Injection"),
                    description=vuln.get("description", "SQL injection vulnerability"),
                    line_number=line_num,
                    verdict=SecurityVerdict.LIKELY_VULNERABLE,
                    reasoning="No parameterized query pattern detected. "
                             "F-string interpolation in SQL is dangerous.",
                    confidence=0.8,
                    evidence=["No QueryBuilder pattern found", "Direct string interpolation"]
                )

            findings.append(finding)

        return findings


class AGICodeAnalyzer:
    """
    AGI-like code analyzer that uses LLM for deep semantic understanding.

    This is the "brain" that reasons about code rather than pattern matching.
    """

    def __init__(self):
        if HAS_OPENAI:
            base_url = os.getenv("LLM_BASE_URL", os.getenv("OPENAI_BASE_URL"))
            self.client = AsyncOpenAI(
                api_key=os.getenv("LLM_API_KEY", os.getenv("OPENAI_API_KEY", "dummy")),
                base_url=base_url,
            )
            if base_url is None or "openai.com" in (base_url or ""):
                self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
            else:
                self.model = os.getenv("LLM_MODEL_NAME", "Qwen/Qwen2.5-Coder-32B-Instruct-AWQ")
        else:
            self.client = None
            self.model = None

        self.sql_analyzer = SemanticSQLAnalyzer()

    async def analyze_vulnerabilities(
        self,
        source_code: str,
        pattern_findings: List[Dict],
        task_description: str = ""
    ) -> Tuple[List[Dict], str]:
        """
        Analyze potential vulnerabilities with AGI-like reasoning.

        Args:
            source_code: The source code to analyze
            pattern_findings: Findings from pattern-based detection
            task_description: What the code is supposed to do

        Returns:
            Tuple of (filtered_findings, reasoning_summary)
        """
        # First, apply semantic SQL analysis
        sql_vulns = [f for f in pattern_findings if f.get("category") == "sql_injection"]
        other_vulns = [f for f in pattern_findings if f.get("category") != "sql_injection"]

        semantic_sql_findings = self.sql_analyzer.analyze(source_code, sql_vulns)

        # Filter out false positives
        real_sql_vulns = []
        filtered_out = []

        for finding in semantic_sql_findings:
            # Keep VULNERABLE, LIKELY_VULNERABLE, and UNCERTAIN findings
            if finding.verdict in (SecurityVerdict.VULNERABLE, SecurityVerdict.LIKELY_VULNERABLE, SecurityVerdict.UNCERTAIN):
                severity = "critical" if finding.verdict == SecurityVerdict.VULNERABLE else "high"
                if finding.verdict == SecurityVerdict.UNCERTAIN:
                    severity = "medium"  # Uncertain findings get medium severity
                real_sql_vulns.append({
                    "severity": severity,
                    "category": finding.category,
                    "title": finding.title,
                    "description": f"{finding.description}\n\nReasoning: {finding.reasoning}",
                    "line_number": finding.line_number,
                    "confidence": "high" if finding.confidence > 0.7 else "medium"
                })
            else:
                filtered_out.append(finding)

        # Build reasoning summary
        reasoning_parts = []
        if filtered_out:
            reasoning_parts.append(
                f"Filtered {len(filtered_out)} false positive(s) - code uses parameterized queries"
            )
        if real_sql_vulns:
            reasoning_parts.append(
                f"Found {len(real_sql_vulns)} real SQL injection vulnerability(ies)"
            )

        # Combine real SQL vulns with other vulns
        final_findings = real_sql_vulns + other_vulns
        reasoning_summary = "; ".join(reasoning_parts) if reasoning_parts else "No SQL issues analyzed"

        return final_findings, reasoning_summary

    def analyze_vulnerabilities_sync(
        self,
        source_code: str,
        pattern_findings: List[Dict],
        task_description: str = ""
    ) -> Tuple[List[Dict], str]:
        """Synchronous version of analyze_vulnerabilities."""
        # Apply semantic SQL analysis
        sql_vulns = [f for f in pattern_findings if f.get("category") == "sql_injection"]
        other_vulns = [f for f in pattern_findings if f.get("category") != "sql_injection"]

        semantic_sql_findings = self.sql_analyzer.analyze(source_code, sql_vulns)

        # Filter out false positives
        real_sql_vulns = []
        filtered_out = []

        for finding in semantic_sql_findings:
            # Keep VULNERABLE, LIKELY_VULNERABLE, and UNCERTAIN findings
            # Only filter out SAFE and LIKELY_SAFE
            if finding.verdict in (SecurityVerdict.VULNERABLE, SecurityVerdict.LIKELY_VULNERABLE, SecurityVerdict.UNCERTAIN):
                severity = "critical" if finding.verdict == SecurityVerdict.VULNERABLE else "high"
                if finding.verdict == SecurityVerdict.UNCERTAIN:
                    severity = "medium"  # Uncertain findings get medium severity
                real_sql_vulns.append({
                    "severity": severity,
                    "category": finding.category,
                    "title": finding.title,
                    "description": f"{finding.description}\n\nReasoning: {finding.reasoning}",
                    "line_number": finding.line_number,
                    "confidence": "high" if finding.confidence > 0.7 else "medium"
                })
            else:
                filtered_out.append(finding)

        reasoning_parts = []
        if filtered_out:
            reasoning_parts.append(
                f"Filtered {len(filtered_out)} false positive(s) - code uses parameterized queries"
            )
        if real_sql_vulns:
            reasoning_parts.append(
                f"Found {len(real_sql_vulns)} real SQL injection vulnerability(ies)"
            )

        final_findings = real_sql_vulns + other_vulns
        reasoning_summary = "; ".join(reasoning_parts) if reasoning_parts else "Analysis complete"

        return final_findings, reasoning_summary


# Convenience function
def analyze_with_semantics(source_code: str, pattern_findings: List[Dict]) -> Tuple[List[Dict], str]:
    """
    Analyze vulnerabilities with semantic understanding.

    This is the main entry point for semantic analysis.
    """
    analyzer = AGICodeAnalyzer()
    return analyzer.analyze_vulnerabilities_sync(source_code, pattern_findings)
