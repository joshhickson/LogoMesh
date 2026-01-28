"""
Base Worker class for Red Agent workers.

All workers inherit from this and implement the analyze() method.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional
import sys
import os

# Add parent path to allow imports from green_logic (for Docker compatibility)
_src_path = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
if _src_path not in sys.path:
    sys.path.insert(0, _src_path)

# Try multiple import paths for Docker compatibility
try:
    from green_logic.red_report_types import Vulnerability, Severity
except ImportError:
    try:
        from src.green_logic.red_report_types import Vulnerability, Severity
    except ImportError:
        # Fallback: define locally if imports fail
        from enum import Enum
        from dataclasses import dataclass
        from typing import Optional

        class Severity(Enum):
            CRITICAL = "critical"
            HIGH = "high"
            MEDIUM = "medium"
            LOW = "low"
            INFO = "info"

        @dataclass
        class Vulnerability:
            severity: Severity
            category: str
            title: str
            description: str
            exploit_code: str = ""
            line_number: Optional[int] = None
            confidence: float = 0.8


@dataclass
class WorkerResult:
    """Result from a worker's analysis."""
    worker_name: str
    vulnerabilities: list[Vulnerability] = field(default_factory=list)
    execution_time_ms: float = 0.0
    error: Optional[str] = None

    @property
    def found_critical(self) -> bool:
        return any(v.severity == Severity.CRITICAL for v in self.vulnerabilities)

    @property
    def found_high(self) -> bool:
        return any(v.severity == Severity.HIGH for v in self.vulnerabilities)

    @property
    def max_severity(self) -> Optional[Severity]:
        if not self.vulnerabilities:
            return None
        severity_order = [Severity.CRITICAL, Severity.HIGH, Severity.MEDIUM, Severity.LOW, Severity.INFO]
        for sev in severity_order:
            if any(v.severity == sev for v in self.vulnerabilities):
                return sev
        return None


class BaseWorker(ABC):
    """
    Abstract base class for all Red Agent workers.

    Each worker specializes in detecting a specific class of vulnerabilities.
    Workers are designed to be fast and deterministic.
    """

    @property
    @abstractmethod
    def name(self) -> str:
        """Return the worker name for logging."""
        pass

    @abstractmethod
    def analyze(self, code: str, task_id: Optional[str] = None) -> WorkerResult:
        """
        Analyze code for vulnerabilities.

        Args:
            code: Source code to analyze
            task_id: Optional task identifier for task-specific checks

        Returns:
            WorkerResult with found vulnerabilities
        """
        pass

    def _create_vulnerability(
        self,
        severity: Severity,
        category: str,
        title: str,
        description: str,
        line_number: Optional[int] = None,
        exploit_code: Optional[str] = None,
        confidence: str = "high"
    ) -> Vulnerability:
        """Helper to create a Vulnerability object."""
        return Vulnerability(
            severity=severity,
            category=category,
            title=title,
            description=description,
            line_number=line_number,
            exploit_code=exploit_code,
            confidence=confidence
        )
