"""
Red Agent Report Data Types

Structured data types for parsing and representing Red Agent vulnerability reports.
Used by the scoring system to apply severity-based penalties to CIS scores.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


class Severity(str, Enum):
    """Severity levels following CVSS-like classification."""
    CRITICAL = "critical"  # 40% penalty
    HIGH = "high"          # 25% penalty
    MEDIUM = "medium"      # 15% penalty
    LOW = "low"            # 5% penalty
    INFO = "info"          # 0% penalty (informational only)


@dataclass
class Vulnerability:
    """Single vulnerability finding from Red Agent."""
    severity: Severity
    category: str  # e.g., "injection", "bypass", "logic_flaw", "info_disclosure"
    title: str
    description: str
    exploit_code: Optional[str] = None
    line_number: Optional[int] = None
    confidence: str = "medium"  # "high", "medium", "low"


@dataclass
class RedAgentReport:
    """Structured report from Red Agent attack analysis."""
    attack_successful: bool
    vulnerabilities: list[Vulnerability] = field(default_factory=list)
    attack_summary: str = ""
    raw_response: str = ""  # Preserve original for debugging

    # Penalty percentages for each severity level
    SEVERITY_PENALTIES = {
        Severity.CRITICAL: 0.40,
        Severity.HIGH: 0.25,
        Severity.MEDIUM: 0.15,
        Severity.LOW: 0.05,
        Severity.INFO: 0.0,
    }

    def get_max_severity(self) -> Optional[Severity]:
        """Return highest severity among all vulnerabilities."""
        if not self.vulnerabilities:
            return None
        severity_order = [
            Severity.CRITICAL,
            Severity.HIGH,
            Severity.MEDIUM,
            Severity.LOW,
            Severity.INFO
        ]
        for sev in severity_order:
            if any(v.severity == sev for v in self.vulnerabilities):
                return sev
        return None

    def get_penalty_multiplier(self) -> float:
        """
        Calculate total penalty multiplier.

        Returns:
            Float between 0.6 and 1.0:
            - 1.0 = no penalty (no vulnerabilities)
            - 0.6 = 40% penalty (critical vulnerability)
        """
        max_sev = self.get_max_severity()
        if max_sev is None:
            return 1.0
        penalty_pct = self.SEVERITY_PENALTIES.get(max_sev, 0.0)
        return 1.0 - penalty_pct
