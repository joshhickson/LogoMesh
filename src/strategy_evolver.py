"""
Strategy Evolver — Self-improving strategy selection for the Green Agent.

Closes the feedback loop: past battle outcomes drive future strategy choices.
The system tracks which parameter configurations and prompt strategies produce
better scores, and gravitates toward higher-performing variants over time.

Evolvable dimensions:
1. Scoring prompt emphasis (what to weight in LLM judge instructions)
2. Red Agent aggressiveness (MCTS exploration weight, branch count)
3. Test generator focus (edge case types to prioritize)
4. Refinement strategy (feedback style that produces best improvement)

Uses the existing SQLite database (data/battles.db) with one additional table.
No new dependencies required.
"""

import json
import math
import os
import random
import sqlite3
import datetime
from typing import Optional


# Default strategy — baseline configuration
DEFAULT_STRATEGY = {
    # Scoring emphasis: how the LLM judge should weight different aspects
    "scoring_emphasis": "balanced",  # balanced | security_focused | correctness_focused
    "scoring_strictness": 0.5,  # 0.0 = lenient, 1.0 = strict

    # Red Agent parameters
    "mcts_exploration_weight": 1.414,  # UCB1 exploration constant
    "mcts_num_branches": 3,  # Number of MCTS branches to explore
    "red_agent_timeout": 60,  # Seconds for red agent attack

    # Test generator focus
    "test_focus": "edge_cases",  # edge_cases | boundary_values | type_confusion | security
    "fuzz_intensity": 1.0,  # Multiplier for fuzz test count

    # Refinement strategy
    "refinement_style": "scientific",  # scientific | direct | minimal
    "max_refinement_iterations": 2,
}

# Strategy variants to explore — each tweaks one or more dimensions
STRATEGY_VARIANTS = [
    {
        "name": "aggressive_red",
        "description": "More aggressive red agent with wider exploration",
        "overrides": {
            "mcts_exploration_weight": 2.0,
            "mcts_num_branches": 4,
            "scoring_emphasis": "security_focused",
        },
    },
    {
        "name": "correctness_focus",
        "description": "Prioritize correctness over security",
        "overrides": {
            "scoring_emphasis": "correctness_focused",
            "test_focus": "boundary_values",
            "scoring_strictness": 0.3,
        },
    },
    {
        "name": "deep_refinement",
        "description": "More refinement iterations with scientific feedback",
        "overrides": {
            "max_refinement_iterations": 3,
            "refinement_style": "scientific",
            "scoring_strictness": 0.6,
        },
    },
    {
        "name": "security_hunter",
        "description": "Focus on finding and penalizing security issues",
        "overrides": {
            "scoring_emphasis": "security_focused",
            "test_focus": "security",
            "mcts_exploration_weight": 1.8,
            "scoring_strictness": 0.7,
        },
    },
    {
        "name": "fast_lenient",
        "description": "Faster evaluation with lenient scoring",
        "overrides": {
            "mcts_num_branches": 2,
            "max_refinement_iterations": 1,
            "scoring_strictness": 0.3,
            "red_agent_timeout": 30,
        },
    },
]


class StrategyEvolver:
    """
    Self-improving strategy selection based on past performance.

    Uses a multi-armed bandit approach (UCB1) to select strategies:
    - Each strategy variant is an "arm"
    - Score from each battle is the reward
    - UCB1 balances exploration (trying new strategies) vs exploitation
      (using what works)

    After enough data, the system converges on the best strategy per task
    domain while still occasionally exploring alternatives.
    """

    def __init__(self, db_path: str = "data/battles.db"):
        self.db_path = db_path
        os.makedirs(os.path.dirname(db_path) or "data", exist_ok=True)
        self._ensure_table()

    def _get_conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, check_same_thread=False)
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.row_factory = sqlite3.Row
        return conn

    def _ensure_table(self):
        """Create strategy tracking table if it doesn't exist."""
        conn = self._get_conn()
        conn.execute("""
            CREATE TABLE IF NOT EXISTS strategy_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_id TEXT NOT NULL,
                strategy_name TEXT NOT NULL,
                strategy_config TEXT NOT NULL,
                cis_score REAL,
                component_scores TEXT,
                timestamp TEXT NOT NULL
            )
        """)
        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_strategy_task
            ON strategy_history(task_id, strategy_name)
        """)
        conn.commit()
        conn.close()

    def select_strategy(self, task_id: str) -> dict:
        """
        Select the best strategy for a task using UCB1 multi-armed bandit.

        Returns a strategy config dict (DEFAULT_STRATEGY merged with overrides).
        """
        conn = self._get_conn()
        cursor = conn.cursor()

        # Get performance stats for each strategy on this task
        cursor.execute("""
            SELECT strategy_name,
                   COUNT(*) as attempts,
                   AVG(cis_score) as avg_score,
                   MAX(cis_score) as max_score
            FROM strategy_history
            WHERE task_id = ?
            GROUP BY strategy_name
        """, (task_id,))

        stats = {row["strategy_name"]: dict(row) for row in cursor.fetchall()}

        # Also get global stats (across all tasks) for strategies with no task data
        cursor.execute("""
            SELECT strategy_name,
                   COUNT(*) as attempts,
                   AVG(cis_score) as avg_score
            FROM strategy_history
            GROUP BY strategy_name
        """)
        global_stats = {row["strategy_name"]: dict(row) for row in cursor.fetchall()}
        conn.close()

        total_attempts = sum(s["attempts"] for s in stats.values()) if stats else 0

        # Not enough data — explore randomly
        if total_attempts < 3:
            variant = random.choice(STRATEGY_VARIANTS)
            config = {**DEFAULT_STRATEGY, **variant["overrides"]}
            config["_strategy_name"] = variant["name"]
            config["_selection_reason"] = "exploration (insufficient data)"
            print(f"[StrategyEvolver] Exploring: {variant['name']} — {variant['description']}")
            return config

        # UCB1 selection across all variants
        best_score = -1
        best_variant = None

        for variant in STRATEGY_VARIANTS:
            name = variant["name"]

            if name in stats:
                s = stats[name]
                avg = s["avg_score"] or 0
                n = s["attempts"]
                # UCB1: avg_reward + exploration_bonus
                exploration = math.sqrt(2 * math.log(total_attempts + 1) / n)
                ucb_score = avg + exploration
            elif name in global_stats:
                # Use global data with higher exploration bonus
                g = global_stats[name]
                avg = g["avg_score"] or 0
                n = g["attempts"]
                exploration = math.sqrt(2 * math.log(total_attempts + 1) / max(n, 1))
                ucb_score = avg + exploration * 1.5  # Extra exploration for untested-on-task
            else:
                # Never tried — high exploration bonus
                ucb_score = 1.0 + random.random() * 0.5

            if ucb_score > best_score:
                best_score = ucb_score
                best_variant = variant

        if best_variant is None:
            best_variant = random.choice(STRATEGY_VARIANTS)

        config = {**DEFAULT_STRATEGY, **best_variant["overrides"]}
        config["_strategy_name"] = best_variant["name"]

        # Log selection reasoning
        if best_variant["name"] in stats:
            s = stats[best_variant["name"]]
            config["_selection_reason"] = (
                f"UCB1 selected (avg={s['avg_score']:.2f}, "
                f"max={s['max_score']:.2f}, n={s['attempts']})"
            )
        else:
            config["_selection_reason"] = "exploration (no task-specific data)"

        print(
            f"[StrategyEvolver] Selected: {best_variant['name']} — "
            f"{config['_selection_reason']}"
        )
        return config

    def record_outcome(
        self,
        task_id: str,
        strategy_name: str,
        strategy_config: dict,
        cis_score: float,
        component_scores: Optional[dict] = None,
    ):
        """
        Record the outcome of a battle for strategy evolution.

        Called after each evaluation completes.
        """
        conn = self._get_conn()
        conn.execute(
            """
            INSERT INTO strategy_history
            (task_id, strategy_name, strategy_config, cis_score,
             component_scores, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                task_id,
                strategy_name,
                json.dumps({k: v for k, v in strategy_config.items() if not k.startswith("_")}),
                cis_score,
                json.dumps(component_scores) if component_scores else None,
                datetime.datetime.now().isoformat(),
            ),
        )
        conn.commit()
        conn.close()
        print(
            f"[StrategyEvolver] Recorded: {strategy_name} on {task_id} → "
            f"CIS={cis_score:.2f}"
        )

    def get_scoring_emphasis_prompt(self, strategy: dict) -> str:
        """
        Generate scoring prompt additions based on the evolved strategy.

        Returns a string to append to the scorer's LLM prompt.
        """
        emphasis = strategy.get("scoring_emphasis", "balanced")
        strictness = strategy.get("scoring_strictness", 0.5)

        if emphasis == "security_focused":
            return (
                "\n## EVALUATION EMPHASIS (evolved strategy)\n"
                "This evaluation prioritizes SECURITY. Weight architecture (A) "
                "and red agent findings heavily. Code that is functionally correct "
                "but insecure should score lower.\n"
            )
        elif emphasis == "correctness_focused":
            return (
                "\n## EVALUATION EMPHASIS (evolved strategy)\n"
                "This evaluation prioritizes CORRECTNESS. Weight logic (L) and "
                "testing (T) heavily. Code that passes all tests and handles edge "
                "cases well should score higher, even with minor security concerns.\n"
            )
        else:
            # Balanced — include strictness calibration
            if strictness > 0.6:
                return (
                    "\n## EVALUATION CALIBRATION (evolved strategy)\n"
                    "Apply strict standards. Deduct points for any missed edge case "
                    "or architectural weakness. High bar for quality.\n"
                )
            elif strictness < 0.4:
                return (
                    "\n## EVALUATION CALIBRATION (evolved strategy)\n"
                    "Apply proportional standards. Give credit for partial solutions "
                    "and reasonable architectural choices. Focus on substance over perfection.\n"
                )
            return ""  # Default balanced, no extra prompt

    def get_test_focus_prompt(self, strategy: dict) -> str:
        """
        Generate test generator prompt additions based on evolved strategy.
        """
        focus = strategy.get("test_focus", "edge_cases")

        focus_prompts = {
            "edge_cases": (
                "\n## TEST FOCUS (evolved strategy)\n"
                "Prioritize edge cases: empty inputs, None values, maximum sizes, "
                "off-by-one errors, and unexpected types.\n"
            ),
            "boundary_values": (
                "\n## TEST FOCUS (evolved strategy)\n"
                "Prioritize boundary conditions: min/max integers, empty strings, "
                "single-element collections, zero values, and overflow conditions.\n"
            ),
            "type_confusion": (
                "\n## TEST FOCUS (evolved strategy)\n"
                "Prioritize type confusion: pass strings where ints expected, "
                "None where objects expected, lists where dicts expected, and "
                "test with mixed types in collections.\n"
            ),
            "security": (
                "\n## TEST FOCUS (evolved strategy)\n"
                "Prioritize security-relevant tests: injection payloads, "
                "authentication bypass attempts, resource exhaustion, "
                "and privilege escalation scenarios.\n"
            ),
        }

        return focus_prompts.get(focus, "")

    def get_refinement_guidance(self, strategy: dict) -> str:
        """
        Generate refinement loop guidance based on evolved strategy.
        """
        style = strategy.get("refinement_style", "scientific")

        if style == "direct":
            return (
                "\n## REFINEMENT APPROACH (evolved strategy)\n"
                "Be DIRECT: state exactly what's wrong and provide the fix. "
                "Don't explain the scientific method, just fix the bugs.\n"
            )
        elif style == "minimal":
            return (
                "\n## REFINEMENT APPROACH (evolved strategy)\n"
                "Be MINIMAL: only mention the single most impactful issue. "
                "Don't overwhelm with multiple fixes. One thing at a time.\n"
            )
        else:
            return ""  # scientific is the default, no override needed

    def get_performance_summary(self) -> str:
        """Get a summary of strategy performance across all tasks."""
        conn = self._get_conn()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT strategy_name,
                   COUNT(*) as runs,
                   AVG(cis_score) as avg_score,
                   MAX(cis_score) as best,
                   MIN(cis_score) as worst
            FROM strategy_history
            GROUP BY strategy_name
            ORDER BY avg_score DESC
        """)

        rows = cursor.fetchall()
        conn.close()

        if not rows:
            return "[StrategyEvolver] No performance data yet."

        lines = ["[StrategyEvolver] Performance Summary:"]
        for row in rows:
            lines.append(
                f"  {row['strategy_name']}: avg={row['avg_score']:.3f} "
                f"best={row['best']:.3f} worst={row['worst']:.3f} "
                f"(n={row['runs']})"
            )
        return "\n".join(lines)
