"""
Red Agent V2 Orchestrator - Hybrid vulnerability detection engine.

This is the main entry point for the Red Agent. It orchestrates:
1. Layer 1: Static workers (fast, reliable, guaranteed findings)
2. Layer 2: Smart reasoning (LLM-powered, finds logic flaws)
3. Layer 3: Optional reflection (deeper analysis if time permits)

Architecture:
┌─────────────────────────────────────────┐
│           RedAgentV2                    │
├─────────────────────────────────────────┤
│  Layer 1: Static Workers (Always runs) │
│  ├── StaticMirrorWorker                │
│  └── ConstraintBreakerWorker           │
├─────────────────────────────────────────┤
│  Layer 2: Smart Reasoning (If needed)  │
│  └── SmartReasoningLayer               │
├─────────────────────────────────────────┤
│  Layer 3: Reflection (Optional)        │
│  └── ReflectionLayer                   │
└─────────────────────────────────────────┘
"""

import asyncio
import time
from dataclasses import dataclass, field
from typing import Optional

from green_logic.red_report_types import RedAgentReport, Vulnerability, Severity

from .workers.static_mirror import StaticMirrorWorker
from .workers.constraint_breaker import ConstraintBreakerWorker
from .reasoning import SmartReasoningLayer, ReflectionLayer


@dataclass
class AttackConfig:
    """Configuration for the attack run."""
    enable_smart_layer: bool = True
    enable_reflection: bool = True
    max_total_time: float = 60.0  # seconds
    smart_layer_timeout: float = 30.0
    reflection_timeout: float = 20.0
    min_findings_for_skip_smart: int = 3  # Skip smart layer if static finds this many


@dataclass
class AttackMetrics:
    """Metrics from an attack run for debugging/logging."""
    total_time_ms: float = 0.0
    static_time_ms: float = 0.0
    smart_time_ms: float = 0.0
    reflection_time_ms: float = 0.0
    static_findings: int = 0
    smart_findings: int = 0
    reflection_findings: int = 0
    layers_executed: list[str] = field(default_factory=list)


class RedAgentV2:
    """
    Hybrid Red Agent with layered vulnerability detection.

    Features:
    - Guaranteed baseline from static analysis
    - Smart enhancement from LLM reasoning
    - Graceful degradation (if LLM fails, static findings remain)
    - Time-bounded execution
    - Deduplication and ranking
    """

    def __init__(self, config: Optional[AttackConfig] = None):
        self.config = config or AttackConfig()

        # Layer 1: Static workers
        self.static_mirror = StaticMirrorWorker()
        self.constraint_breaker = ConstraintBreakerWorker()

        # Layer 2: Smart reasoning
        self.smart_layer = SmartReasoningLayer()

        # Layer 3: Reflection
        self.reflection_layer = ReflectionLayer()

    async def attack(
        self,
        code: str,
        task_id: Optional[str] = None,
        task_description: str = ""
    ) -> RedAgentReport:
        """
        Main entry point for attacking code.

        Args:
            code: Source code to analyze
            task_id: Task identifier (e.g., "task-001")
            task_description: Full task description for context

        Returns:
            RedAgentReport with all found vulnerabilities
        """
        start_time = time.time()
        metrics = AttackMetrics()
        all_vulnerabilities: list[Vulnerability] = []

        # ============================================================
        # LAYER 1: Static Analysis (Always runs, fast and reliable)
        # ============================================================
        print(f"[RedAgentV2] Starting Layer 1: Static Analysis")
        static_start = time.time()

        # Run both static workers
        mirror_result = self.static_mirror.analyze(code, task_id)
        constraint_result = self.constraint_breaker.analyze(code, task_id)

        static_vulns = mirror_result.vulnerabilities + constraint_result.vulnerabilities
        all_vulnerabilities.extend(static_vulns)

        metrics.static_time_ms = (time.time() - static_start) * 1000
        metrics.static_findings = len(static_vulns)
        metrics.layers_executed.append("static")

        print(f"[RedAgentV2] Layer 1 complete: {len(static_vulns)} findings in {metrics.static_time_ms:.0f}ms")

        # Check if we have enough critical findings to skip smart layer
        has_critical = any(v.severity == Severity.CRITICAL for v in all_vulnerabilities)
        has_many = len(all_vulnerabilities) >= self.config.min_findings_for_skip_smart

        # ============================================================
        # LAYER 2: Smart Reasoning (If enabled and beneficial)
        # ============================================================
        if self.config.enable_smart_layer and not (has_critical and has_many):
            remaining_time = self.config.max_total_time - (time.time() - start_time)

            if remaining_time > 10:  # Only if we have at least 10s left
                print(f"[RedAgentV2] Starting Layer 2: Smart Reasoning")
                smart_start = time.time()

                try:
                    smart_vulns = await asyncio.wait_for(
                        self.smart_layer.enhance_findings(
                            code=code,
                            task_id=task_id,
                            task_description=task_description,
                            static_findings=static_vulns
                        ),
                        timeout=min(self.config.smart_layer_timeout, remaining_time)
                    )
                    all_vulnerabilities.extend(smart_vulns)
                    metrics.smart_findings = len(smart_vulns)
                    metrics.layers_executed.append("smart")
                    print(f"[RedAgentV2] Layer 2 complete: {len(smart_vulns)} new findings")

                except asyncio.TimeoutError:
                    print(f"[RedAgentV2] Layer 2 timeout, continuing with static findings")
                except Exception as e:
                    print(f"[RedAgentV2] Layer 2 error: {e}")

                metrics.smart_time_ms = (time.time() - smart_start) * 1000

        # ============================================================
        # LAYER 3: Reflection (Optional deeper analysis)
        # ============================================================
        has_critical_now = any(v.severity == Severity.CRITICAL for v in all_vulnerabilities)

        if self.config.enable_reflection and not has_critical_now:
            remaining_time = self.config.max_total_time - (time.time() - start_time)

            if remaining_time > 5:  # Need at least 5s for reflection
                print(f"[RedAgentV2] Starting Layer 3: Reflection")
                reflection_start = time.time()

                try:
                    reflection_vulns = await asyncio.wait_for(
                        self.reflection_layer.reflect_and_dig_deeper(
                            code=code,
                            task_id=task_id,
                            all_findings=all_vulnerabilities
                        ),
                        timeout=min(self.config.reflection_timeout, remaining_time)
                    )
                    all_vulnerabilities.extend(reflection_vulns)
                    metrics.reflection_findings = len(reflection_vulns)
                    metrics.layers_executed.append("reflection")
                    print(f"[RedAgentV2] Layer 3 complete: {len(reflection_vulns)} new findings")

                except asyncio.TimeoutError:
                    print(f"[RedAgentV2] Layer 3 timeout")
                except Exception as e:
                    print(f"[RedAgentV2] Layer 3 error: {e}")

                metrics.reflection_time_ms = (time.time() - reflection_start) * 1000

        # ============================================================
        # POST-PROCESSING: Deduplicate, rank, and build report
        # ============================================================
        metrics.total_time_ms = (time.time() - start_time) * 1000

        # Deduplicate by title
        unique_vulns = self._deduplicate(all_vulnerabilities)

        # Sort by severity (critical first)
        unique_vulns.sort(key=lambda v: self._severity_rank(v.severity), reverse=True)

        # Build summary
        summary = self._build_summary(unique_vulns, metrics)

        print(f"[RedAgentV2] Attack complete: {len(unique_vulns)} unique findings in {metrics.total_time_ms:.0f}ms")
        print(f"[RedAgentV2] Layers: {', '.join(metrics.layers_executed)}")

        return RedAgentReport(
            attack_successful=len(unique_vulns) > 0,
            vulnerabilities=unique_vulns,
            attack_summary=summary
        )

    def _deduplicate(self, vulns: list[Vulnerability]) -> list[Vulnerability]:
        """Remove duplicate vulnerabilities by title."""
        seen_titles = set()
        unique = []

        for v in vulns:
            # Normalize title for comparison
            title_key = v.title.lower().strip()

            if title_key not in seen_titles:
                seen_titles.add(title_key)
                unique.append(v)

        return unique

    def _severity_rank(self, severity: Severity) -> int:
        """Convert severity to numeric rank for sorting."""
        ranks = {
            Severity.CRITICAL: 5,
            Severity.HIGH: 4,
            Severity.MEDIUM: 3,
            Severity.LOW: 2,
            Severity.INFO: 1,
        }
        return ranks.get(severity, 0)

    def _build_summary(self, vulns: list[Vulnerability], metrics: AttackMetrics) -> str:
        """Build a summary of the attack findings."""
        if not vulns:
            return "No vulnerabilities found after comprehensive analysis."

        # Count by severity
        counts = {sev: 0 for sev in Severity}
        for v in vulns:
            counts[v.severity] += 1

        # Build summary
        parts = []

        if counts[Severity.CRITICAL] > 0:
            parts.append(f"{counts[Severity.CRITICAL]} CRITICAL")
        if counts[Severity.HIGH] > 0:
            parts.append(f"{counts[Severity.HIGH]} HIGH")
        if counts[Severity.MEDIUM] > 0:
            parts.append(f"{counts[Severity.MEDIUM]} MEDIUM")
        if counts[Severity.LOW] > 0:
            parts.append(f"{counts[Severity.LOW]} LOW")

        severity_str = ", ".join(parts)

        # Top vulnerability
        top = vulns[0]

        summary = f"Found {len(vulns)} vulnerabilities ({severity_str}). "
        summary += f"Most critical: {top.title} ({top.severity.value}). "
        summary += f"Analysis used layers: {', '.join(metrics.layers_executed)}."

        return summary


# Convenience function for simple usage
async def attack_code(
    code: str,
    task_id: Optional[str] = None,
    task_description: str = ""
) -> RedAgentReport:
    """
    Convenience function to attack code without managing RedAgentV2 instance.

    Args:
        code: Source code to analyze
        task_id: Optional task identifier
        task_description: Optional task description

    Returns:
        RedAgentReport with findings
    """
    agent = RedAgentV2()
    return await agent.attack(code, task_id, task_description)
