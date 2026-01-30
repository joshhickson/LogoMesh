"""
Persistent Memory System for LogoMesh.

Enables cross-run learning by extracting, storing, and retrieving
structured lessons from past evaluation battles. The system gets
smarter with each run:
- Red Agent learns which attacks succeed per task
- Test generator targets historically problematic patterns
- Scorer has context from past evaluations
- Refinement loop knows what feedback worked before

Uses the existing SQLite database (data/battles.db) with 3 additional
tables. No new dependencies required.
"""

import json
import sqlite3
import os
import re
import datetime
from typing import Optional
from collections import Counter


class BattleMemory:
    """
    Cross-run memory system that learns from past evaluation battles.

    Uses the existing SQLite database (data/battles.db) with additional
    tables for lessons, attack hints, and task statistics.
    """

    def __init__(self, db_path: str = "data/battles.db"):
        self.db_path = db_path
        os.makedirs(os.path.dirname(db_path) or "data", exist_ok=True)
        self._ensure_tables()

    def _get_conn(self) -> sqlite3.Connection:
        """Get a connection with WAL mode (matches existing battles table)."""
        conn = sqlite3.connect(self.db_path, check_same_thread=False)
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.row_factory = sqlite3.Row
        return conn

    def _ensure_tables(self):
        """Create memory tables if they don't exist. Backwards-compatible."""
        conn = self._get_conn()
        cursor = conn.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS memory_lessons (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_id TEXT NOT NULL,
                task_title TEXT NOT NULL,
                battle_id TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                lesson_type TEXT NOT NULL,
                category TEXT,
                severity TEXT,
                description TEXT NOT NULL,
                score_impact REAL,
                metadata TEXT
            )
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_lessons_task
            ON memory_lessons(task_id)
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_lessons_type
            ON memory_lessons(lesson_type)
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS memory_attack_hints (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_id TEXT NOT NULL,
                hint_text TEXT NOT NULL,
                success_count INTEGER DEFAULT 0,
                attempt_count INTEGER DEFAULT 0,
                last_updated TEXT NOT NULL,
                source TEXT DEFAULT 'learned'
            )
        """)

        # Use a regular index since UNIQUE INDEX creation syntax
        # with IF NOT EXISTS varies across SQLite versions
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS memory_task_stats (
                task_id TEXT PRIMARY KEY,
                task_title TEXT,
                total_runs INTEGER DEFAULT 0,
                avg_score REAL DEFAULT 0.0,
                max_score REAL DEFAULT 0.0,
                min_score REAL DEFAULT 0.0,
                test_pass_rate REAL DEFAULT 0.0,
                vuln_rate REAL DEFAULT 0.0,
                top_vuln_categories TEXT,
                top_failure_patterns TEXT,
                best_refinement_feedback TEXT,
                last_updated TEXT
            )
        """)

        conn.commit()
        conn.close()

    # ========== STORAGE (called after each battle) ==========

    def store_lessons(
        self,
        task_id: str,
        task_title: str,
        battle_id: str,
        result: dict,
    ) -> int:
        """
        Extract and store structured lessons from a completed battle.

        Called from server.py after each evaluation completes.
        Returns the number of lessons stored.
        """
        lessons = []
        timestamp = datetime.datetime.now().isoformat()
        evaluation = result.get("evaluation", {})
        score = evaluation.get("cis_score", 0.0)

        # 1. Vulnerability lessons from Red Agent
        red_report = result.get("red_report")
        if red_report and red_report.get("vulnerabilities"):
            for vuln in red_report["vulnerabilities"]:
                lessons.append({
                    "lesson_type": "vulnerability",
                    "category": vuln.get("category", "unknown"),
                    "severity": vuln.get("severity", "medium"),
                    "description": (
                        f"{vuln.get('title', 'Unknown')}: "
                        f"{vuln.get('description', '')[:200]}"
                    ),
                    "score_impact": evaluation.get("red_penalty_applied", 0.0),
                    "metadata": json.dumps({
                        "exploit_code": vuln.get("exploit_code", "")[:200],
                        "line_number": vuln.get("line_number"),
                        "confidence": vuln.get("confidence"),
                    }),
                })

        # 2. Test failure lessons
        sandbox = result.get("sandbox_result", {})
        if not sandbox.get("success", True):
            output = sandbox.get("output", "")[:500]
            error_types = self._extract_error_types(output)
            lessons.append({
                "lesson_type": "test_failure",
                "category": ",".join(error_types) if error_types else "test_failure",
                "severity": "high",
                "description": (
                    f"Tests failed. Errors: {', '.join(error_types)}. "
                    f"Output: {output[:200]}"
                ),
                "score_impact": max(0, 1.0 - score),
                "metadata": json.dumps({
                    "test_pass_rate": evaluation.get("test_pass_rate", 0),
                    "tests_used": sandbox.get("tests_used", "unknown"),
                }),
            })

        # 3. Refinement lessons
        refinement_history = evaluation.get("refinement_history", [])
        if len(refinement_history) >= 2:
            improvement = (
                refinement_history[-1].get("score", 0)
                - refinement_history[0].get("score", 0)
            )
            best_iter = max(refinement_history, key=lambda h: h.get("score", 0))
            lessons.append({
                "lesson_type": "refinement",
                "category": "improvement" if improvement > 0 else "regression",
                "severity": "info",
                "description": (
                    f"Refinement {'improved' if improvement > 0 else 'regressed'} "
                    f"by {improvement:.2f}. Best feedback: "
                    f"{best_iter.get('feedback', '')[:200]}"
                ),
                "score_impact": improvement,
                "metadata": json.dumps({
                    "iterations": len(refinement_history),
                    "initial_score": refinement_history[0].get("score", 0),
                    "final_score": refinement_history[-1].get("score", 0),
                    "best_feedback": best_iter.get("feedback", "")[:500],
                }),
            })

        # 4. Scoring breakdown lesson
        lessons.append({
            "lesson_type": "scoring",
            "category": "cis_breakdown",
            "severity": "info",
            "description": (
                f"CIS={score:.2f} "
                f"R={evaluation.get('rationale_score', 0):.2f} "
                f"A={evaluation.get('architecture_score', 0):.2f} "
                f"T={evaluation.get('testing_score', 0):.2f} "
                f"L={evaluation.get('logic_score', 0):.2f}"
            ),
            "score_impact": score,
            "metadata": json.dumps({
                "cis_score": score,
                "rationale_score": evaluation.get("rationale_score", 0),
                "architecture_score": evaluation.get("architecture_score", 0),
                "testing_score": evaluation.get("testing_score", 0),
                "logic_score": evaluation.get("logic_score", 0),
                "red_penalty": evaluation.get("red_penalty_applied", 0),
            }),
        })

        # Batch insert
        conn = self._get_conn()
        cursor = conn.cursor()

        for lesson in lessons:
            cursor.execute(
                """
                INSERT INTO memory_lessons
                (task_id, task_title, battle_id, timestamp, lesson_type,
                 category, severity, description, score_impact, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    task_id, task_title, battle_id, timestamp,
                    lesson["lesson_type"], lesson.get("category"),
                    lesson.get("severity"), lesson["description"],
                    lesson.get("score_impact"), lesson.get("metadata"),
                ),
            )

        # Update aggregates
        self._update_task_stats(cursor, task_id, task_title)

        # Update attack hints from vulnerability findings
        if red_report and red_report.get("vulnerabilities"):
            self._update_attack_hints(cursor, task_id, red_report["vulnerabilities"])

        conn.commit()
        conn.close()
        return len(lessons)

    def _extract_error_types(self, output: str) -> list[str]:
        """Extract Python error types from test output."""
        errors = re.findall(r"(\w+Error)", output)
        return list(set(errors))[:5]

    def _update_task_stats(self, cursor, task_id: str, task_title: str):
        """Recompute aggregate stats for a task."""
        cursor.execute(
            "SELECT score_impact FROM memory_lessons "
            "WHERE task_id = ? AND lesson_type = 'scoring'",
            (task_id,),
        )
        scores = [row[0] for row in cursor.fetchall() if row[0] is not None]
        if not scores:
            return

        # Top vulnerability categories
        cursor.execute(
            "SELECT category, COUNT(*) as cnt FROM memory_lessons "
            "WHERE task_id = ? AND lesson_type = 'vulnerability' "
            "GROUP BY category ORDER BY cnt DESC LIMIT 5",
            (task_id,),
        )
        top_vulns = [{"category": row[0], "count": row[1]} for row in cursor.fetchall()]

        # Top failure patterns
        cursor.execute(
            "SELECT category, COUNT(*) as cnt FROM memory_lessons "
            "WHERE task_id = ? AND lesson_type = 'test_failure' "
            "GROUP BY category ORDER BY cnt DESC LIMIT 5",
            (task_id,),
        )
        top_failures = [{"pattern": row[0], "count": row[1]} for row in cursor.fetchall()]

        # Test pass rate
        total = len(scores)
        cursor.execute(
            "SELECT COUNT(*) FROM memory_lessons "
            "WHERE task_id = ? AND lesson_type = 'test_failure'",
            (task_id,),
        )
        failures = cursor.fetchone()[0]
        pass_rate = (total - failures) / total if total > 0 else 0

        # Best refinement feedback
        cursor.execute(
            "SELECT metadata FROM memory_lessons "
            "WHERE task_id = ? AND lesson_type = 'refinement' AND score_impact > 0 "
            "ORDER BY score_impact DESC LIMIT 1",
            (task_id,),
        )
        row = cursor.fetchone()
        best_feedback = ""
        if row and row[0]:
            try:
                meta = json.loads(row[0])
                best_feedback = meta.get("best_feedback", "")
            except json.JSONDecodeError:
                pass

        cursor.execute(
            """
            INSERT OR REPLACE INTO memory_task_stats
            (task_id, task_title, total_runs, avg_score, max_score, min_score,
             test_pass_rate, vuln_rate, top_vuln_categories, top_failure_patterns,
             best_refinement_feedback, last_updated)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                task_id, task_title, total,
                sum(scores) / total, max(scores), min(scores),
                pass_rate,
                len(top_vulns) / total if total > 0 else 0,
                json.dumps(top_vulns),
                json.dumps(top_failures),
                best_feedback[:1000],
                datetime.datetime.now().isoformat(),
            ),
        )

    def _update_attack_hints(self, cursor, task_id: str, vulnerabilities: list):
        """Update dynamic attack hints based on what the Red Agent found."""
        now = datetime.datetime.now().isoformat()
        for vuln in vulnerabilities:
            category = vuln.get("category", "unknown")
            severity = vuln.get("severity", "medium")
            title = vuln.get("title", "")[:100]
            hint = f"{category} ({severity}): {title}"

            # Upsert: increment counts if exists, insert if new
            cursor.execute(
                "SELECT id, success_count, attempt_count FROM memory_attack_hints "
                "WHERE task_id = ? AND hint_text = ?",
                (task_id, hint),
            )
            existing = cursor.fetchone()
            if existing:
                cursor.execute(
                    "UPDATE memory_attack_hints "
                    "SET success_count = success_count + 1, "
                    "    attempt_count = attempt_count + 1, "
                    "    last_updated = ? "
                    "WHERE id = ?",
                    (now, existing[0]),
                )
            else:
                cursor.execute(
                    "INSERT INTO memory_attack_hints "
                    "(task_id, hint_text, success_count, attempt_count, last_updated, source) "
                    "VALUES (?, ?, 1, 1, ?, 'learned')",
                    (task_id, hint, now),
                )

    # ========== RETRIEVAL (called before each battle) ==========

    def get_task_memory(self, task_id: str, task_title: str = "") -> dict:
        """
        Retrieve all relevant memory for a task. Fast (<100ms).

        Returns a dict with structured memory ready to be formatted
        into LLM prompts by the format_for_* methods.
        """
        conn = self._get_conn()
        cursor = conn.cursor()

        memory = {
            "task_id": task_id,
            "has_history": False,
            "stats": None,
            "recent_vulnerabilities": [],
            "recent_failures": [],
            "attack_hints": [],
            "scoring_insights": [],
            "refinement_insights": [],
        }

        # 1. Task stats (precomputed)
        cursor.execute(
            "SELECT * FROM memory_task_stats WHERE task_id = ?", (task_id,)
        )
        row = cursor.fetchone()
        if row:
            memory["has_history"] = True
            memory["stats"] = dict(row)

        # Fallback: match by title
        if not memory["has_history"] and task_title:
            cursor.execute(
                "SELECT * FROM memory_task_stats WHERE task_title = ?",
                (task_title,),
            )
            row = cursor.fetchone()
            if row:
                memory["has_history"] = True
                memory["stats"] = dict(row)
                task_id = row["task_id"]

        if not memory["has_history"]:
            conn.close()
            return memory

        # 2. Recent vulnerabilities (last 10)
        cursor.execute(
            "SELECT category, severity, description, score_impact "
            "FROM memory_lessons "
            "WHERE task_id = ? AND lesson_type = 'vulnerability' "
            "ORDER BY timestamp DESC LIMIT 10",
            (task_id,),
        )
        memory["recent_vulnerabilities"] = [dict(r) for r in cursor.fetchall()]

        # 3. Recent test failures (last 5)
        cursor.execute(
            "SELECT category, description, metadata "
            "FROM memory_lessons "
            "WHERE task_id = ? AND lesson_type = 'test_failure' "
            "ORDER BY timestamp DESC LIMIT 5",
            (task_id,),
        )
        memory["recent_failures"] = [dict(r) for r in cursor.fetchall()]

        # 4. Attack hints (sorted by success rate)
        cursor.execute(
            "SELECT hint_text, success_count, attempt_count, "
            "  CAST(success_count AS REAL) / MAX(attempt_count, 1) as success_rate "
            "FROM memory_attack_hints "
            "WHERE task_id = ? "
            "ORDER BY success_rate DESC, success_count DESC "
            "LIMIT 10",
            (task_id,),
        )
        memory["attack_hints"] = [dict(r) for r in cursor.fetchall()]

        # 5. Scoring insights (last 5)
        cursor.execute(
            "SELECT description, score_impact, metadata "
            "FROM memory_lessons "
            "WHERE task_id = ? AND lesson_type = 'scoring' "
            "ORDER BY timestamp DESC LIMIT 5",
            (task_id,),
        )
        memory["scoring_insights"] = [dict(r) for r in cursor.fetchall()]

        # 6. Refinement insights (top 3 improvements)
        cursor.execute(
            "SELECT description, score_impact, metadata "
            "FROM memory_lessons "
            "WHERE task_id = ? AND lesson_type = 'refinement' AND score_impact > 0 "
            "ORDER BY score_impact DESC LIMIT 3",
            (task_id,),
        )
        memory["refinement_insights"] = [dict(r) for r in cursor.fetchall()]

        conn.close()
        return memory

    # ========== PROMPT FORMATTERS ==========

    def format_for_scoring(self, memory: dict) -> str:
        """Format memory context for the ContextualIntegrityScorer prompt."""
        if not memory["has_history"]:
            return ""

        stats = memory["stats"]
        lines = [
            "\n### Historical Context (from past evaluations of this task)",
            f"- Previous runs: {stats['total_runs']}, "
            f"avg score: {stats['avg_score']:.2f}, "
            f"best: {stats['max_score']:.2f}",
        ]

        if memory["recent_vulnerabilities"]:
            cats = Counter(v["category"] for v in memory["recent_vulnerabilities"])
            top = ", ".join(f"{c}({n})" for c, n in cats.most_common(3))
            lines.append(f"- Common vulnerabilities in past submissions: {top}")

        if memory["scoring_insights"]:
            latest = memory["scoring_insights"][0]
            lines.append(f"- Latest score breakdown: {latest['description']}")

        lines.append(
            "Use this context to calibrate your evaluation — "
            "compare this submission against past performance on this task."
        )
        return "\n".join(lines)

    def format_for_red_agent(self, memory: dict) -> str:
        """Format memory context for Red Agent reasoning prompts."""
        if not memory["has_history"]:
            return ""

        lines = ["\n## LEARNED ATTACK INTELLIGENCE (from past runs)"]

        if memory["attack_hints"]:
            for hint in memory["attack_hints"][:5]:
                rate = hint["success_count"] / max(hint["attempt_count"], 1)
                lines.append(f"- {hint['hint_text']} (found in {rate:.0%} of runs)")

        if memory["recent_vulnerabilities"]:
            cats = Counter(v["category"] for v in memory["recent_vulnerabilities"])
            top = ", ".join(f"{c}({n}x)" for c, n in cats.most_common(3))
            lines.append(f"\nMost exploitable categories: {top}")

        lines.append("Prioritize attacks that succeeded before on this task type.")
        return "\n".join(lines)

    def format_for_test_generator(self, memory: dict) -> str:
        """Format memory context for TestGenerator prompts."""
        if not memory["has_history"]:
            return ""

        lines = ["\n### KNOWN FAILURE PATTERNS (from past runs of this task)"]

        if memory["recent_failures"]:
            for f in memory["recent_failures"][:3]:
                lines.append(f"- {f['description'][:150]}")

        if memory["recent_vulnerabilities"]:
            lines.append("\nVulnerabilities to specifically test for:")
            for v in memory["recent_vulnerabilities"][:3]:
                lines.append(f"- [{v['severity']}] {v['description'][:100]}")

        lines.append("Generate tests that target these known weak points.")
        return "\n".join(lines)

    def format_for_refinement(self, memory: dict) -> str:
        """Format memory for refinement feedback generation."""
        if not memory["has_history"]:
            return ""

        lines = []

        if memory["refinement_insights"]:
            lines.append("\n### REFINEMENT INSIGHTS (what worked in past runs)")
            for r in memory["refinement_insights"][:2]:
                lines.append(f"- {r['description'][:200]}")

        stats = memory["stats"]
        if stats and stats.get("best_refinement_feedback"):
            feedback = stats["best_refinement_feedback"][:300]
            lines.append(f"\nMost effective past feedback: {feedback}")

        return "\n".join(lines) if lines else ""

    # ========== BACKFILL: Populate from existing battles ==========

    def backfill_from_battles(self):
        """
        One-time migration: extract lessons from existing battles table.
        Idempotent — skips if lessons already exist.
        """
        conn = self._get_conn()
        cursor = conn.cursor()

        # Check if already backfilled
        cursor.execute("SELECT COUNT(*) FROM memory_lessons")
        if cursor.fetchone()[0] > 0:
            conn.close()
            return

        # Check if battles table exists
        cursor.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='battles'"
        )
        if not cursor.fetchone():
            conn.close()
            return

        cursor.execute(
            "SELECT battle_id, score, raw_result, timestamp "
            "FROM battles WHERE raw_result IS NOT NULL"
        )
        rows = cursor.fetchall()
        conn.close()

        if not rows:
            return

        print(f"[Memory] Backfilling from {len(rows)} existing battle records...")
        count = 0
        for row in rows:
            try:
                result = json.loads(row["raw_result"])
                task_title = result.get("task", "Unknown")
                task_id = self._title_to_task_id(task_title)
                n = self.store_lessons(
                    task_id=task_id,
                    task_title=task_title,
                    battle_id=row["battle_id"],
                    result=result,
                )
                count += n
            except (json.JSONDecodeError, Exception) as e:
                print(f"[Memory] Backfill error for {row['battle_id']}: {e}")
                continue

        print(f"[Memory] Backfill complete: {count} lessons from {len(rows)} battles")

    def _title_to_task_id(self, title: str) -> str:
        """Map task title to task_id via CODING_TASKS lookup."""
        try:
            try:
                from green_logic.tasks import CODING_TASKS
            except ImportError:
                from src.green_logic.tasks import CODING_TASKS

            for task in CODING_TASKS:
                if task["title"].lower() == title.lower():
                    return task["id"]
        except ImportError:
            pass

        # Fallback: generate a stable ID from title
        slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")[:20]
        return f"task-{slug}"
