import json
import sqlite3

import pytest

from src.memory import BattleMemory


# ── Fixtures ──────────────────────────────────────────────────────────


@pytest.fixture
def memory(tmp_path):
    """Create a BattleMemory instance backed by a temporary database."""
    db_path = tmp_path / "test_memory.db"
    return BattleMemory(str(db_path))


def _minimal_result(**overrides):
    """
    Build the minimum valid `result` dict accepted by store_lessons().

    By default this triggers only the mandatory 'scoring' lesson.
    Pass keyword overrides to inject red_report, sandbox_result,
    or refinement_history into the evaluation block.
    """
    evaluation = {
        "cis_score": 0.75,
        "rationale_score": 0.8,
        "architecture_score": 0.7,
        "testing_score": 0.6,
        "logic_score": 0.9,
        "red_penalty_applied": 0,
    }
    evaluation.update(overrides.pop("evaluation_extra", {}))
    result = {"evaluation": evaluation}
    result.update(overrides)
    return result


# ── Table creation ────────────────────────────────────────────────────


def test_ensure_tables_creates_all_three(memory):
    """
    Initializing BattleMemory must create the three memory tables:
    memory_lessons, memory_attack_hints, and memory_task_stats.
    """
    conn = sqlite3.connect(memory.db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = {row[0] for row in cursor.fetchall()}
    conn.close()

    assert "memory_lessons" in tables
    assert "memory_attack_hints" in tables
    assert "memory_task_stats" in tables


def test_ensure_tables_creates_indexes(memory):
    """
    _ensure_tables should create indexes on memory_lessons for
    fast lookup by task_id and lesson_type.
    """
    conn = sqlite3.connect(memory.db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='index'")
    indexes = {row[0] for row in cursor.fetchall()}
    conn.close()

    assert "idx_lessons_task" in indexes
    assert "idx_lessons_type" in indexes


# ── Scoring lesson (always produced) ─────────────────────────────────


def test_store_lessons_returns_int(memory):
    """
    store_lessons() must return an integer representing the number of
    lessons extracted from the result dict.
    """
    count = memory.store_lessons(
        task_id="task-1",
        task_title="Sample Task",
        battle_id="battle-1",
        result=_minimal_result(),
    )

    assert isinstance(count, int)
    assert count > 0


def test_minimal_result_produces_exactly_one_lesson(memory):
    """
    A result with only an evaluation block (no red_report, no
    sandbox_result, no refinement_history) should produce exactly
    one 'scoring' lesson.
    """
    count = memory.store_lessons(
        task_id="task-1",
        task_title="Minimal",
        battle_id="battle-1",
        result=_minimal_result(),
    )

    assert count == 1

    conn = sqlite3.connect(memory.db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT lesson_type FROM memory_lessons")
    types = [row[0] for row in cursor.fetchall()]
    conn.close()

    assert types == ["scoring"]


def test_scoring_lesson_contains_cis_breakdown(memory):
    """
    The scoring lesson description should contain the CIS score and
    individual component scores from the evaluation.
    """
    memory.store_lessons(
        task_id="task-1",
        task_title="Score Check",
        battle_id="battle-1",
        result=_minimal_result(),
    )

    conn = sqlite3.connect(memory.db_path)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT description, metadata FROM memory_lessons "
        "WHERE lesson_type = 'scoring'"
    )
    row = cursor.fetchone()
    conn.close()

    description = row[0]
    assert "CIS=" in description
    assert "R=" in description
    assert "A=" in description

    metadata = json.loads(row[1])
    assert metadata["cis_score"] == 0.75
    assert metadata["rationale_score"] == 0.8


# ── Refinement lesson ────────────────────────────────────────────────


def test_refinement_lesson_requires_two_history_entries(memory):
    """
    A refinement lesson is only produced when evaluation.refinement_history
    contains at least 2 entries.  One entry should NOT trigger it.
    """
    # One entry — no refinement lesson
    result_one = _minimal_result(
        evaluation_extra={
            "refinement_history": [
                {"score": 0.5, "feedback": "only one"},
            ]
        }
    )
    count = memory.store_lessons(
        task_id="task-1",
        task_title="One Entry",
        battle_id="battle-1",
        result=result_one,
    )
    assert count == 1  # scoring only


def test_refinement_lesson_produced_with_two_entries(memory):
    """
    When refinement_history has ≥2 entries, store_lessons should
    produce a 'refinement' lesson in addition to the 'scoring' lesson.
    """
    result = _minimal_result(
        evaluation_extra={
            "refinement_history": [
                {"score": 0.5, "feedback": "initial attempt"},
                {"score": 0.9, "feedback": "improved solution"},
            ]
        }
    )
    count = memory.store_lessons(
        task_id="task-2",
        task_title="Refine",
        battle_id="battle-2",
        result=result,
    )

    assert count == 2  # scoring + refinement

    conn = sqlite3.connect(memory.db_path)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT lesson_type FROM memory_lessons ORDER BY lesson_type"
    )
    types = [row[0] for row in cursor.fetchall()]
    conn.close()

    assert "refinement" in types
    assert "scoring" in types


# ── Vulnerability lesson ─────────────────────────────────────────────


def test_vulnerability_lessons_from_red_report(memory):
    """
    When the result includes a red_report with vulnerabilities,
    store_lessons should create one 'vulnerability' lesson per entry,
    plus the mandatory 'scoring' lesson.
    """
    result = _minimal_result(
        red_report={
            "vulnerabilities": [
                {
                    "category": "injection",
                    "severity": "high",
                    "title": "SQL Injection",
                    "description": "Unsanitised user input",
                },
                {
                    "category": "xss",
                    "severity": "medium",
                    "title": "Reflected XSS",
                    "description": "Script in query param",
                },
            ]
        }
    )
    count = memory.store_lessons(
        task_id="task-3",
        task_title="Vuln",
        battle_id="battle-3",
        result=result,
    )

    assert count == 3  # 2 vulnerabilities + 1 scoring

    conn = sqlite3.connect(memory.db_path)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT category FROM memory_lessons "
        "WHERE lesson_type = 'vulnerability' ORDER BY category"
    )
    categories = [row[0] for row in cursor.fetchall()]
    conn.close()

    assert categories == ["injection", "xss"]


def test_vulnerability_creates_attack_hints(memory):
    """
    Vulnerabilities in the red_report should also populate the
    memory_attack_hints table for future Red Agent runs.
    """
    result = _minimal_result(
        red_report={
            "vulnerabilities": [
                {
                    "category": "injection",
                    "severity": "high",
                    "title": "SQL Injection",
                },
            ]
        }
    )
    memory.store_lessons(
        task_id="task-4",
        task_title="Hints",
        battle_id="battle-4",
        result=result,
    )

    conn = sqlite3.connect(memory.db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT hint_text, success_count FROM memory_attack_hints")
    rows = cursor.fetchall()
    conn.close()

    assert len(rows) == 1
    assert "injection" in rows[0][0]
    assert rows[0][1] == 1


# ── Test failure lesson ──────────────────────────────────────────────


def test_test_failure_lesson(memory):
    """
    When sandbox_result.success is False, store_lessons should create
    a 'test_failure' lesson.
    """
    result = _minimal_result(
        sandbox_result={
            "success": False,
            "output": "AssertionError: expected 4 got 5\nTypeError: bad arg",
        }
    )
    count = memory.store_lessons(
        task_id="task-5",
        task_title="Fail",
        battle_id="battle-5",
        result=result,
    )

    assert count == 2  # test_failure + scoring

    conn = sqlite3.connect(memory.db_path)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT description FROM memory_lessons "
        "WHERE lesson_type = 'test_failure'"
    )
    row = cursor.fetchone()
    conn.close()

    assert row is not None
    assert "Tests failed" in row[0]


# ── Task stats (side-effect of store_lessons) ────────────────────────


def test_store_lessons_updates_task_stats(memory):
    """
    After store_lessons runs, memory_task_stats should contain an
    aggregate row for that task_id with the computed avg/max/min scores.
    """
    memory.store_lessons(
        task_id="task-6",
        task_title="Stats Check",
        battle_id="battle-6",
        result=_minimal_result(),
    )

    conn = sqlite3.connect(memory.db_path)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT task_id, total_runs, avg_score FROM memory_task_stats "
        "WHERE task_id = 'task-6'"
    )
    row = cursor.fetchone()
    conn.close()

    assert row is not None
    assert row[0] == "task-6"
    assert row[1] == 1  # total_runs
    assert row[2] == pytest.approx(0.75, abs=0.01)  # avg_score == cis_score


# ── Retrieval (get_task_memory) ──────────────────────────────────────


def test_get_task_memory_returns_empty_for_unknown_task(memory):
    """
    get_task_memory for a task_id with no stored data should return
    has_history=False and empty lists.
    """
    result = memory.get_task_memory("nonexistent-task")

    assert result["has_history"] is False
    assert result["stats"] is None
    assert result["recent_vulnerabilities"] == []


def test_get_task_memory_returns_history_after_store(memory):
    """
    After storing lessons for a task, get_task_memory should return
    has_history=True with populated stats and scoring_insights.
    """
    memory.store_lessons(
        task_id="task-7",
        task_title="Retrieval",
        battle_id="battle-7",
        result=_minimal_result(),
    )

    result = memory.get_task_memory("task-7")

    assert result["has_history"] is True
    assert result["stats"] is not None
    assert result["stats"]["task_id"] == "task-7"
    assert len(result["scoring_insights"]) == 1
