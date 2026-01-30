"""
Dynamic Task Intelligence for Novel Tasks.

Provides a 3-tier intelligence hierarchy for understanding any task:
1. Hardcoded hints (fast path for known task-001..020)
2. Battle memory (learned from past runs)
3. LLM generation (dynamic, for truly novel tasks)

This module allows the Red Agent, scorer, and constraint checker to
handle tasks beyond the hardcoded 20 without degraded performance.
"""

import asyncio
import json
import os
import re
from typing import Optional, Any

from openai import AsyncOpenAI

try:
    from llm_utils import get_temperature_kwargs
except ImportError:
    try:
        from src.llm_utils import get_temperature_kwargs
    except ImportError:
        def get_temperature_kwargs(default=0.7):
            return {"temperature": default}


# Known task attack hints — imported here to avoid circular deps with reasoning.py
_KNOWN_ATTACK_HINTS = {
    "task-001": "Focus on: regex edge cases, unicode bypass, null bytes, extremely long inputs",
    "task-002": "Focus on: race conditions, clock manipulation, memory exhaustion with many clients",
    "task-003": "Focus on: cache poisoning, eviction race conditions, hash collisions",
    "task-004": "Focus on: stack overflow with large n, negative input handling",
    "task-005": "Focus on: algorithm confusion (alg:none), key confusion (RS256→HS256), expired token bypass",
    "task-006": "Focus on: deadlock scenarios, connection leaks, timeout race conditions",
    "task-007": "Focus on: invalid state transitions, event ordering, callback exceptions",
    "task-008": "Focus on: second preimage attacks, proof forgery, odd-length tree handling",
    "task-009": "Focus on: block tampering, chain reorganization, difficulty manipulation",
    "task-010": "Focus on: weak key derivation, hardened vs normal derivation confusion",
    "task-011": "Focus on: nonce reuse (critical!), invalid curve points, malleability",
    "task-012": "Focus on: overflow/underflow, approval race condition, zero address",
    "task-013": "Focus on: path traversal, middleware bypass, route collision",
    "task-014": "Focus on: SQL injection edge cases, UNION injection, blind injection",
    "task-015": "Focus on: event ordering, concurrency conflicts, version mismatch",
    "task-016": "Focus on: task loss, retry storms, dead letter queue bypass",
    "task-017": "Focus on: split brain, vote manipulation, term confusion",
    "task-018": "Focus on: tree corruption, rebalancing bugs, key collision",
    "task-019": "Focus on: hash collision attacks, hotspots, node failure handling",
    "task-020": "Focus on: write skew, phantom reads, version mismatch, GC race",
}


class TaskIntelligence:
    """
    Dynamic task understanding layer.

    For known tasks (task-001..020), returns precomputed data instantly.
    For novel tasks, uses LLM to analyze task description + code and
    generate equivalent hints, constraints, and scoring guidance.

    All LLM calls are cached in-memory per (task_id, method) so each
    generation happens at most once per server lifetime.
    """

    def __init__(self, battle_memory=None):
        """
        Args:
            battle_memory: Optional BattleMemory instance for learned hints.
        """
        self._memory = battle_memory
        self._client = None
        self._model = os.getenv("LLM_MODEL_NAME", os.getenv("MODEL_NAME", "gpt-4o-mini"))
        self._cache: dict[tuple[str, str], Any] = {}
        self._timeout = 15  # seconds

    @property
    def client(self):
        """Lazy initialization of OpenAI client."""
        if self._client is None:
            base_url = os.getenv("LLM_BASE_URL", os.getenv("OPENAI_BASE_URL"))
            self._client = AsyncOpenAI(
                api_key=os.getenv("LLM_API_KEY", os.getenv("OPENAI_API_KEY", "dummy")),
                base_url=base_url,
            )
            if base_url and "openai.com" not in base_url:
                self._model = os.getenv(
                    "LLM_MODEL_NAME",
                    os.getenv("MODEL_NAME", "Qwen/Qwen2.5-Coder-32B-Instruct-AWQ"),
                )
        return self._client

    def _is_known_task(self, task_id: str) -> bool:
        """Check if task_id is in the hardcoded set."""
        return task_id in _KNOWN_ATTACK_HINTS

    def _cache_key(self, task_id: str, method: str) -> tuple[str, str]:
        return (task_id, method)

    def _get_cached(self, task_id: str, method: str) -> Optional[Any]:
        return self._cache.get(self._cache_key(task_id, method))

    def _set_cached(self, task_id: str, method: str, value: Any):
        self._cache[self._cache_key(task_id, method)] = value

    # =========================================================================
    # 1. Attack Hints
    # =========================================================================

    async def get_attack_hints(
        self, task_id: str, task_description: str, code: str
    ) -> str:
        """
        Get attack focus hints for a task.

        Tier 1: Hardcoded hints for known tasks (instant)
        Tier 2: Learned hints from BattleMemory (fast)
        Tier 3: LLM-generated hints for novel tasks (15s timeout)
        """
        # Tier 1: hardcoded
        if task_id in _KNOWN_ATTACK_HINTS:
            return _KNOWN_ATTACK_HINTS[task_id]

        # Check cache
        cached = self._get_cached(task_id, "attack_hints")
        if cached is not None:
            return cached

        # Tier 2: learned from memory
        if self._memory:
            try:
                mem = self._memory.get_task_memory(task_id)
                if mem.get("has_history") and mem.get("attack_hints"):
                    hints = mem["attack_hints"]
                    if hints:
                        learned = "; ".join(
                            h["hint_text"] for h in hints[:5] if h.get("hint_text")
                        )
                        if learned:
                            result = f"Focus on (learned from past runs): {learned}"
                            self._set_cached(task_id, "attack_hints", result)
                            print(f"[TaskIntelligence] Using learned attack hints for {task_id}")
                            return result
            except Exception as e:
                print(f"[TaskIntelligence] Memory lookup failed: {e}")

        # Tier 3: LLM generation
        result = await self._generate_attack_hints(task_id, task_description, code)
        self._set_cached(task_id, "attack_hints", result)
        return result

    async def _generate_attack_hints(
        self, task_id: str, task_description: str, code: str
    ) -> str:
        """Generate attack hints via LLM for a novel task."""
        prompt = f"""You are a security researcher. Given this coding task and implementation, identify the top 5 attack vectors to focus on.

## Task Description
{task_description[:2000]}

## Code to Attack
```python
{code[:3000]}
```

Return ONLY a single line starting with "Focus on:" listing the 5 most promising attack vectors, separated by commas.
Example: "Focus on: buffer overflow with large inputs, race condition in shared state, missing input validation on negative numbers, integer overflow in size calculation, resource exhaustion via repeated allocation"

Your response must be a single line. No explanations."""

        try:
            response = await asyncio.wait_for(
                self.client.chat.completions.create(
                    model=self._model,
                    messages=[
                        {"role": "system", "content": "Security researcher. One-line output only."},
                        {"role": "user", "content": prompt},
                    ],
                    max_tokens=200,
                    **get_temperature_kwargs(0.4),
                ),
                timeout=self._timeout,
            )
            result = response.choices[0].message.content.strip()
            if not result.startswith("Focus on:"):
                result = f"Focus on: {result}"
            print(f"[TaskIntelligence] Generated attack hints for novel task {task_id}")
            return result

        except Exception as e:
            print(f"[TaskIntelligence] Attack hint generation failed for {task_id}: {e}")
            return "Focus on: common vulnerability patterns including edge cases, boundary values, null/empty inputs, type confusion, and resource exhaustion"

    # =========================================================================
    # 2. High-Value Patterns (for MCTS branch valuation)
    # =========================================================================

    async def get_high_value_patterns(
        self, task_id: str, task_description: str
    ) -> list[str]:
        """
        Get domain-specific keywords for MCTS branch valuation.

        Returns a list of keywords that indicate high-value attack areas
        in the code for a given task.
        """
        cached = self._get_cached(task_id, "high_value_patterns")
        if cached is not None:
            return cached

        prompt = f"""Given this coding task, list 5-8 domain-specific keywords that a security researcher should look for in the code as potential vulnerability areas.

Task: {task_description[:1500]}

Return ONLY a JSON array of lowercase strings. Example: ["hash", "collision", "resize", "capacity", "probe"]"""

        try:
            response = await asyncio.wait_for(
                self.client.chat.completions.create(
                    model=self._model,
                    messages=[
                        {"role": "system", "content": "Return only a JSON array of strings."},
                        {"role": "user", "content": prompt},
                    ],
                    max_tokens=100,
                    **get_temperature_kwargs(0.3),
                ),
                timeout=self._timeout,
            )
            raw = response.choices[0].message.content.strip()
            # Parse JSON array
            patterns = json.loads(raw)
            if isinstance(patterns, list) and all(isinstance(p, str) for p in patterns):
                self._set_cached(task_id, "high_value_patterns", patterns)
                print(f"[TaskIntelligence] Generated {len(patterns)} high-value patterns for {task_id}")
                return patterns
        except Exception as e:
            print(f"[TaskIntelligence] High-value pattern generation failed: {e}")

        default = []
        self._set_cached(task_id, "high_value_patterns", default)
        return default

    # =========================================================================
    # 3. Dynamic Constraints (for constraint_breaker.py)
    # =========================================================================

    async def get_dynamic_constraints(
        self, task_id: str, task_description: str, code: str
    ) -> list[dict]:
        """
        Generate architectural constraints for a novel task.

        Returns list of constraint dicts matching the schema used by
        ConstraintBreakerWorker.TASK_CONSTRAINTS.
        """
        cached = self._get_cached(task_id, "constraints")
        if cached is not None:
            return cached

        prompt = f"""You are a code quality auditor. Given this coding task, identify architectural constraints the implementation should follow.

## Task
{task_description[:2000]}

## Code
```python
{code[:3000]}
```

Return a JSON object with this structure:
{{
  "constraints": [
    {{
      "name": "brief constraint name",
      "forbidden_imports": ["module1", "module2"],
      "required_patterns": ["pattern that must exist in code"],
      "description": "why this constraint matters"
    }}
  ]
}}

Focus on:
- Imports that would be inappropriate for this task (e.g., network libs for a pure algorithm)
- Required patterns (e.g., thread safety primitives for concurrent code)
- Security-critical patterns (e.g., parameterized queries for SQL tasks)

Return 2-4 constraints. Return ONLY valid JSON."""

        try:
            response = await asyncio.wait_for(
                self.client.chat.completions.create(
                    model=self._model,
                    messages=[
                        {"role": "system", "content": "Code auditor. JSON output only."},
                        {"role": "user", "content": prompt},
                    ],
                    response_format={"type": "json_object"},
                    max_tokens=500,
                    **get_temperature_kwargs(0.3),
                ),
                timeout=self._timeout,
            )
            raw = response.choices[0].message.content.strip()
            data = json.loads(raw)
            constraints = data.get("constraints", [])
            self._set_cached(task_id, "constraints", constraints)
            print(f"[TaskIntelligence] Generated {len(constraints)} constraints for novel task {task_id}")
            return constraints

        except Exception as e:
            print(f"[TaskIntelligence] Constraint generation failed: {e}")
            self._set_cached(task_id, "constraints", [])
            return []

    # =========================================================================
    # 4. Architecture Guidance (for scoring.py)
    # =========================================================================

    async def get_architecture_guidance(
        self, task_id: str, task_description: str
    ) -> dict:
        """
        Generate architecture scoring guidance for a novel task.

        Returns a dict matching the schema in architecture_constraints.yaml:
        {
            "constraints": {
                "constraint_name": {
                    "description": "...",
                    "forbidden_imports": [...],
                    "required_imports": [...],
                    "forbidden_patterns": [...],
                    "penalty": 0.5,
                    "rationale": "..."
                }
            }
        }
        """
        cached = self._get_cached(task_id, "architecture_guidance")
        if cached is not None:
            return cached

        prompt = f"""You are a software architecture reviewer. Given this coding task, define architectural constraints for scoring code quality.

## Task
{task_description[:2000]}

Return a JSON object with this structure:
{{
  "constraints": {{
    "no_inappropriate_imports": {{
      "description": "Should not use imports inappropriate for this task",
      "forbidden_imports": ["module1", "module2"],
      "penalty": 0.3,
      "rationale": "Why these imports are inappropriate"
    }},
    "required_patterns": {{
      "description": "Must include certain patterns",
      "required_imports": ["module1"],
      "penalty": 0.2,
      "rationale": "Why these patterns are required"
    }}
  }}
}}

Define 1-3 constraints. Penalties should be between 0.1 and 0.5. Return ONLY valid JSON."""

        try:
            response = await asyncio.wait_for(
                self.client.chat.completions.create(
                    model=self._model,
                    messages=[
                        {"role": "system", "content": "Architecture reviewer. JSON output only."},
                        {"role": "user", "content": prompt},
                    ],
                    response_format={"type": "json_object"},
                    max_tokens=500,
                    **get_temperature_kwargs(0.3),
                ),
                timeout=self._timeout,
            )
            raw = response.choices[0].message.content.strip()
            data = json.loads(raw)
            self._set_cached(task_id, "architecture_guidance", data)
            print(f"[TaskIntelligence] Generated architecture guidance for novel task {task_id}")
            return data

        except Exception as e:
            print(f"[TaskIntelligence] Architecture guidance generation failed: {e}")
            self._set_cached(task_id, "architecture_guidance", {})
            return {}
