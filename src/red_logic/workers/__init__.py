"""
Red Agent Workers - Specialized vulnerability detection workers.

Each worker focuses on a specific class of vulnerabilities:
- StaticMirrorWorker: Mirrors what Green Agent's SemanticAuditor checks
- ConstraintBreakerWorker: Finds task-specific constraint violations
"""

from .static_mirror import StaticMirrorWorker
from .constraint_breaker import ConstraintBreakerWorker
from .base import BaseWorker, WorkerResult

__all__ = [
    "StaticMirrorWorker",
    "ConstraintBreakerWorker",
    "BaseWorker",
    "WorkerResult",
]
