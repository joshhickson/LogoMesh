"""
Tests for src/red_logic/orchestrator.py

Covers pure-logic components with no OpenAI calls, no static-analysis
workers, and no file I/O:

  - ThoughtNode       (UCB1 scoring, backpropagation)
  - AgentMemory       (findings, hypotheses, investigation queue, context summary)
  - MCTSPlanner       (greedy + epsilon-greedy selection)
  - DynamicToolBuilder (tool registration, security validation, name validation)
  - CodeActionSpace   (_grep_pattern, _read_code, _extract_function_body,
                       _analyze_function_security)
"""

import asyncio
import math
from unittest.mock import MagicMock, patch

import pytest

from src.red_logic.orchestrator import (
    AgentMemory,
    CodeActionSpace,
    DynamicToolBuilder,
    MCTSPlanner,
    ThoughtNode,
)


# ── Helpers ──────────────────────────────────────────────────────────


def _make_node(
    id="n1",
    tool="scan_file",
    parent=None,
    visits=0,
    value=0.0,
    prior=0.5,
):
    """Build a ThoughtNode with sensible defaults."""
    node = ThoughtNode(
        id=id,
        action={"tool": tool, "parameters": {}, "reasoning": "test"},
        parent=parent,
        prior=prior,
    )
    node.visits = visits
    node.value = value
    return node


def _make_planner():
    """Build an MCTSPlanner with dummy dependencies."""
    return MCTSPlanner(
        client=MagicMock(),
        model="test-model",
        action_space=MagicMock(),
    )


# ═════════════════════════════════════════════════════════════════════
# ThoughtNode
# ═════════════════════════════════════════════════════════════════════


class TestThoughtNodeUCB1:
    """UCB1 score: exploitation + exploration + prior bonus."""

    def test_unvisited_node_returns_infinity(self):
        node = _make_node(visits=0)
        assert node.ucb1_score() == float("inf")

    def test_visited_node_returns_finite_score(self):
        parent = _make_node(id="root", visits=5, value=2.0)
        child = _make_node(id="c1", parent=parent, visits=3, value=1.5, prior=0.6)

        assert math.isfinite(child.ucb1_score())

    def test_ucb1_formula_matches_manual_calculation(self):
        """UCB1 = (value/visits) + weight*sqrt(ln(parent.visits+1)/visits) + prior*0.5"""
        parent = _make_node(id="root", visits=10, value=4.0)
        child = _make_node(id="c1", parent=parent, visits=4, value=2.0, prior=0.6)

        weight = 1.414  # default exploration_weight
        exploitation = 2.0 / 4
        exploration = weight * math.sqrt(math.log(10 + 1) / 4)
        prior_bonus = 0.6 * 0.5
        expected = exploitation + exploration + prior_bonus

        assert child.ucb1_score() == pytest.approx(expected, abs=1e-6)

    def test_higher_value_gives_higher_score(self):
        parent = _make_node(id="root", visits=6, value=3.0)
        low = _make_node(id="lo", parent=parent, visits=3, value=0.3, prior=0.5)
        high = _make_node(id="hi", parent=parent, visits=3, value=2.7, prior=0.5)

        assert high.ucb1_score() > low.ucb1_score()


class TestThoughtNodeBackpropagate:
    """backpropagate() walks to root, incrementing visits and accumulating value."""

    def test_single_node_updates(self):
        node = _make_node(visits=0, value=0.0)
        node.backpropagate(0.7)

        assert node.visits == 1
        assert node.value == pytest.approx(0.7)

    def test_chain_propagates_to_root(self):
        root = _make_node(id="root", visits=0, value=0.0)
        mid = _make_node(id="mid", parent=root, visits=0, value=0.0)
        leaf = _make_node(id="leaf", parent=mid, visits=0, value=0.0)

        leaf.backpropagate(1.0)

        assert leaf.visits == 1 and leaf.value == pytest.approx(1.0)
        assert mid.visits == 1 and mid.value == pytest.approx(1.0)
        assert root.visits == 1 and root.value == pytest.approx(1.0)

    def test_multiple_backprops_accumulate(self):
        root = _make_node(id="root", visits=0, value=0.0)
        child = _make_node(id="child", parent=root, visits=0, value=0.0)

        child.backpropagate(0.5)
        child.backpropagate(0.3)

        assert child.visits == 2
        assert child.value == pytest.approx(0.8)
        assert root.visits == 2
        assert root.value == pytest.approx(0.8)


# ═════════════════════════════════════════════════════════════════════
# AgentMemory
# ═════════════════════════════════════════════════════════════════════


@pytest.fixture
def memory():
    return AgentMemory()


class TestAgentMemoryFindings:

    def test_add_finding_stores_all_fields(self, memory):
        memory.current_step = 3
        memory.add_finding(
            tool="scan_file",
            category="injection",
            description="SQL injection via f-string",
            severity="high",
            evidence="line 42: f\"SELECT * FROM {table}\"",
            line=42,
        )

        assert len(memory.findings) == 1
        f = memory.findings[0]
        assert f.step == 3
        assert f.tool_used == "scan_file"
        assert f.category == "injection"
        assert f.severity == "high"
        assert f.line_number == 42

    def test_add_finding_defaults_line_to_none(self, memory):
        memory.add_finding("tool", "cat", "desc", "low", "evidence")
        assert memory.findings[0].line_number is None


class TestAgentMemoryHypotheses:

    def test_sequential_ids(self, memory):
        h1 = memory.add_hypothesis("eval() might accept user input")
        h2 = memory.add_hypothesis("password is hardcoded")
        h3 = memory.add_hypothesis("race condition in auth")

        assert (h1, h2, h3) == ("H1", "H2", "H3")

    def test_hypothesis_starts_as_investigating(self, memory):
        memory.add_hypothesis("possible XSS")
        assert memory.hypotheses[0].status == "investigating"


class TestAgentMemoryInvestigationQueue:

    def test_queue_stores_item(self, memory):
        memory.queue_investigation("auth()", "suspicious eval", priority=8)

        assert len(memory.investigation_queue) == 1
        item = memory.investigation_queue[0]
        assert item["target"] == "auth()"
        assert item["reason"] == "suspicious eval"
        assert item["priority"] == 8

    def test_queue_sorted_by_priority_descending(self, memory):
        memory.queue_investigation("low_target", "low reason", priority=2)
        memory.queue_investigation("high_target", "high reason", priority=9)
        memory.queue_investigation("mid_target", "mid reason", priority=5)

        priorities = [item["priority"] for item in memory.investigation_queue]
        assert priorities == [9, 5, 2]


class TestAgentMemoryCriticalFinding:

    def test_true_when_critical_exists(self, memory):
        memory.add_finding("tool", "rce", "remote code exec", "critical", "eval(input)")
        assert memory.has_critical_finding() is True

    def test_false_when_no_findings(self, memory):
        assert memory.has_critical_finding() is False

    def test_false_when_only_non_critical(self, memory):
        memory.add_finding("tool", "xss", "reflected XSS", "high", "evidence")
        memory.add_finding("tool", "info", "version leak", "low", "evidence")
        assert memory.has_critical_finding() is False


class TestAgentMemoryContextSummary:

    def test_empty_memory_returns_fallback(self, memory):
        assert memory.get_context_summary() == "No findings yet."

    def test_includes_findings(self, memory):
        memory.add_finding("tool", "injection", "SQLi", "high", "ev")
        summary = memory.get_context_summary()

        assert "Confirmed Findings" in summary
        assert "injection" in summary

    def test_includes_active_hypotheses(self, memory):
        memory.add_hypothesis("possible timing attack")
        summary = memory.get_context_summary()

        assert "Active Hypotheses" in summary
        assert "possible timing attack" in summary

    def test_excludes_resolved_hypotheses(self, memory):
        h_id = memory.add_hypothesis("might be safe")
        memory.update_hypothesis(h_id, "confirmed", "verified", supports=True)

        summary = memory.get_context_summary()
        assert "might be safe" not in summary


# ═════════════════════════════════════════════════════════════════════
# MCTSPlanner.select()
# ═════════════════════════════════════════════════════════════════════


class TestMCTSPlannerSelect:

    def test_greedy_selects_highest_score(self):
        planner = _make_planner()
        low = _make_node(id="low", tool="grep_pattern")
        high = _make_node(id="high", tool="scan_file")

        scored = [(high, 0.9), (low, 0.4)]

        with patch("random.random", return_value=0.5):  # > epsilon
            selected = planner.select(scored)

        assert selected is high

    def test_raises_on_empty_list(self):
        planner = _make_planner()
        with pytest.raises(ValueError, match="No nodes to select from"):
            planner.select([])

    def test_explores_close_alternative(self):
        """When random triggers exploration and an alternative is within
        0.3 of the best score, it can be selected."""
        planner = _make_planner()
        best = _make_node(id="best", tool="scan_file")
        close = _make_node(id="close", tool="fuzz_function")

        scored = [(best, 0.8), (close, 0.6)]  # diff = 0.2, within 0.3

        with patch("random.random", return_value=0.05), \
             patch("random.choice", return_value=(close, 0.6)):
            selected = planner.select(scored)

        assert selected is close

    def test_does_not_explore_distant_alternative(self):
        """When the only alternative is >0.3 below best, exploration
        falls back to greedy."""
        planner = _make_planner()
        best = _make_node(id="best", tool="scan_file")
        far = _make_node(id="far", tool="grep_pattern")

        scored = [(best, 0.9), (far, 0.5)]  # diff = 0.4, outside 0.3

        with patch("random.random", return_value=0.05):
            selected = planner.select(scored)

        assert selected is best

    def test_single_node_always_selected(self):
        planner = _make_planner()
        only = _make_node(id="only", tool="scan_file")

        with patch("random.random", return_value=0.01):
            selected = planner.select([(only, 0.7)])

        assert selected is only


# ═════════════════════════════════════════════════════════════════════
# DynamicToolBuilder.create_tool()
# ═════════════════════════════════════════════════════════════════════


_SAFE_TOOL_CODE = """\
def count_lines(params, memory, source_code):
    lines = source_code.split('\\n')
    return ToolResult(success=True, output=str(len(lines)))
"""

_SAFE_PARAMS = {"type": "object", "properties": {}, "required": []}


@pytest.fixture
def builder():
    return DynamicToolBuilder()


class TestDynamicToolBuilderValidCreation:

    def test_create_returns_success(self, builder):
        success, msg = builder.create_tool(
            tool_name="count_lines",
            tool_code=_SAFE_TOOL_CODE,
            description="Count source lines",
            parameters=_SAFE_PARAMS,
        )

        assert success is True
        assert "successfully" in msg.lower()

    def test_tool_registered_in_created_tools(self, builder):
        builder.create_tool(
            "count_lines", _SAFE_TOOL_CODE, "Count lines", _SAFE_PARAMS
        )

        assert "count_lines" in builder.created_tools

    def test_has_tool_returns_true_after_creation(self, builder):
        builder.create_tool(
            "count_lines", _SAFE_TOOL_CODE, "Count lines", _SAFE_PARAMS
        )

        assert builder.has_tool("count_lines") is True

    def test_has_tool_returns_false_for_unknown(self, builder):
        assert builder.has_tool("nonexistent") is False

    def test_registered_function_is_callable(self, builder):
        builder.create_tool(
            "count_lines", _SAFE_TOOL_CODE, "Count lines", _SAFE_PARAMS
        )

        func = builder.created_tools["count_lines"]["function"]
        assert callable(func)


class TestDynamicToolBuilderSecurityRejection:

    @pytest.mark.parametrize("code", [
        'def bad(p, m, s):\n    os.system("echo pwned")\n',
        'def bad(p, m, s):\n    import subprocess\n    subprocess.run(["ls"])\n',
        'def bad(p, m, s):\n    return eval("1+1")\n',
        'def bad(p, m, s):\n    os = __import__("os")\n',
    ], ids=["os_system", "subprocess", "eval", "dunder_import"])
    def test_rejects_dangerous_pattern(self, builder, code):
        success, msg = builder.create_tool("bad_tool", code, "bad", _SAFE_PARAMS)

        assert success is False
        assert "security violation" in msg.lower()
        assert not builder.has_tool("bad_tool")


class TestDynamicToolBuilderNameValidation:

    def test_rejects_duplicate_name(self, builder):
        builder.create_tool(
            "count_lines", _SAFE_TOOL_CODE, "Count lines", _SAFE_PARAMS
        )
        success, msg = builder.create_tool(
            "count_lines", _SAFE_TOOL_CODE, "Count lines again", _SAFE_PARAMS
        )

        assert success is False
        assert "already exists" in msg.lower()

    @pytest.mark.parametrize("name", ["bad-name", "2fast", ""])
    def test_rejects_invalid_identifier(self, builder, name):
        success, msg = builder.create_tool(
            name, _SAFE_TOOL_CODE, "desc", _SAFE_PARAMS
        )

        assert success is False


# ═════════════════════════════════════════════════════════════════════
# CodeActionSpace helper methods
# ═════════════════════════════════════════════════════════════════════


_SAMPLE_SOURCE = """\
import hashlib

def auth(user, token):
    password = "s3cret"
    return eval(token)

def safe_add(a, b):
    return a + b

class Unrelated:
    pass"""


@pytest.fixture
def action_space():
    return CodeActionSpace(_SAMPLE_SOURCE)


class TestCodeActionSpaceGrepPattern:

    def test_finds_matching_lines(self, action_space):
        result = asyncio.run(
            action_space._grep_pattern({"pattern": "password"}, AgentMemory())
        )

        assert result.success is True
        assert "4:" in result.output

    def test_no_matches_reports_zero(self, action_space):
        result = asyncio.run(
            action_space._grep_pattern({"pattern": "xyzzy_not_here"}, AgentMemory())
        )

        assert result.success is True
        assert "no matches" in result.output.lower()

    def test_invalid_regex_returns_failure(self, action_space):
        result = asyncio.run(
            action_space._grep_pattern({"pattern": "[invalid"}, AgentMemory())
        )

        assert result.success is False
        assert "invalid regex" in result.output.lower()

    def test_records_pattern_in_explored_patterns(self, action_space):
        mem = AgentMemory()
        asyncio.run(action_space._grep_pattern({"pattern": "eval"}, mem))

        assert "eval" in mem.explored_patterns


class TestCodeActionSpaceReadCode:

    def test_returns_requested_range(self, action_space):
        result = asyncio.run(
            action_space._read_code({"start_line": 3, "end_line": 5}, AgentMemory())
        )

        assert result.success is True
        assert "def auth" in result.output
        assert "password" in result.output
        assert "eval" in result.output

    def test_clamps_beyond_end_of_file(self, action_space):
        total_lines = len(_SAMPLE_SOURCE.split("\n"))
        result = asyncio.run(
            action_space._read_code(
                {"start_line": 1, "end_line": total_lines + 100}, AgentMemory()
            )
        )

        assert result.success is True
        assert "pass" in result.output

    def test_marks_lines_as_explored(self, action_space):
        mem = AgentMemory()
        asyncio.run(
            action_space._read_code({"start_line": 7, "end_line": 8}, mem)
        )

        assert 7 in mem.explored_lines
        assert 8 in mem.explored_lines

    def test_start_line_below_one_is_clamped(self, action_space):
        result = asyncio.run(
            action_space._read_code({"start_line": -5, "end_line": 2}, AgentMemory())
        )

        assert result.success is True
        assert "hashlib" in result.output


class TestCodeActionSpaceExtractFunctionBody:

    def test_extracts_auth_body(self, action_space):
        start_pos = _SAMPLE_SOURCE.index("def auth")
        body = action_space._extract_function_body(start_pos)

        assert "def auth" in body
        assert "password" in body
        assert "eval" in body
        assert "safe_add" not in body

    def test_extracts_safe_add_body(self, action_space):
        start_pos = _SAMPLE_SOURCE.index("def safe_add")
        body = action_space._extract_function_body(start_pos)

        assert "def safe_add" in body
        assert "return a + b" in body
        assert "Unrelated" not in body

    def test_handles_position_at_end_of_source(self, action_space):
        start_pos = _SAMPLE_SOURCE.index("class Unrelated")
        body = action_space._extract_function_body(start_pos)

        assert "class Unrelated" in body
        assert "pass" in body


class TestCodeActionSpaceAnalyzeFunctionSecurity:

    def test_detects_eval_as_critical(self, action_space):
        func_body = "def dangerous(x):\n    return eval(x)\n"
        issues = action_space._analyze_function_security(
            "dangerous", func_body, line_num=1
        )

        assert len(issues) >= 1
        eval_issue = next(i for i in issues if "eval" in i["title"].lower())
        assert eval_issue["severity"] == "critical"
        assert eval_issue["category"] == "code_injection"

    def test_detects_hardcoded_password(self, action_space):
        func_body = 'def setup():\n    password = "hunter2"\n'
        issues = action_space._analyze_function_security(
            "setup", func_body, line_num=10
        )

        assert len(issues) >= 1
        pw_issue = next(i for i in issues if i["category"] == "hardcoded_secret")
        assert pw_issue["severity"] == "high"

    def test_clean_function_returns_no_issues(self, action_space):
        func_body = "def add(a, b):\n    return a + b\n"
        issues = action_space._analyze_function_security(
            "add", func_body, line_num=1
        )

        assert issues == []

    def test_line_numbers_offset_correctly(self, action_space):
        func_body = "def f(x):\n    return eval(x)\n"
        issues = action_space._analyze_function_security(
            "f", func_body, line_num=20
        )

        eval_issue = next(i for i in issues if "eval" in i["title"].lower())
        # eval is at body line index 1 -> reported line = 21
        assert eval_issue["line"] == 21
