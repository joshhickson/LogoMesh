"""
Red Logic - Hybrid Red Agent for vulnerability detection.

This package implements a multi-layer attack engine:
- Layer 1: Static workers (fast, reliable, guaranteed findings)
- Layer 2: Smart reasoning (LLM-powered, finds logic flaws)
- Layer 3: Reflection (optional deeper analysis)

Usage:
    from red_logic import RedAgentV2, attack_code

    # Async usage
    report = await attack_code(source_code, task_id="task-001")

    # Or with full control
    agent = RedAgentV2()
    report = await agent.attack(source_code, task_id, task_description)
"""

from .orchestrator import RedAgentV2, AttackConfig, AttackMetrics, attack_code
from .executor import RedAgentV2Executor
from .agent import run_red_agent

__all__ = [
    "RedAgentV2",
    "RedAgentV2Executor",
    "AttackConfig",
    "AttackMetrics",
    "attack_code",
    "run_red_agent",
]
