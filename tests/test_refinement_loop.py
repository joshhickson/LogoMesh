"""
Tests for src/green_logic/refinement_loop.py

Targets the deterministic, pure-logic components that do NOT require
an LLM or network access:
  - DynamicExperimentBuilder (security validation, storage)
  - ScientificMemory (state management)
  - ScientificReasoner fallbacks (hypothesis generation, result interpretation)
  - ScientificMethodEngine classifiers (severity, category, fix extraction)
"""

import pytest

from src.green_logic.refinement_loop import (
    DynamicExperimentBuilder,
    HypothesisStatus,
    Hypothesis,
    Experiment,
    Observation,
    ScientificMemory,
    ScientificMethodEngine,
    ScientificReasoner,
)


# ═══════════════════════════════════════════════════════════════════════
# DynamicExperimentBuilder
# ═══════════════════════════════════════════════════════════════════════


class TestDynamicExperimentBuilder:
    """Tests for the meta-agent that creates experiments at runtime."""

    def test_valid_experiment_is_stored(self):
        """A well-formed hypothesis-based test should be accepted and stored."""
        builder = DynamicExperimentBuilder()
        code = (
            "from hypothesis import given, strategies as st\n"
            "@given(st.text())\n"
            "def test_roundtrip(s):\n"
            "    assert s == s\n"
        )
        ok, msg = builder.create_experiment("roundtrip", "decode(encode(x))==x", code)

        assert ok is True
        assert "roundtrip" in msg
        assert builder.get_experiment("roundtrip") == code

    def test_rejects_os_system(self):
        """Code containing os.system must be blocked."""
        builder = DynamicExperimentBuilder()
        code = "from hypothesis import given\nimport os\nos.system('rm -rf /')\n"
        ok, _ = builder.create_experiment("evil", "n/a", code)

        assert ok is False
        assert builder.get_experiment("evil") is None

    def test_rejects_subprocess(self):
        """Code containing subprocess must be blocked."""
        builder = DynamicExperimentBuilder()
        code = "from hypothesis import given\nimport subprocess\nsubprocess.run(['ls'])\n"
        ok, _ = builder.create_experiment("evil2", "n/a", code)

        assert ok is False

    def test_rejects_eval(self):
        """Code containing eval must be blocked."""
        builder = DynamicExperimentBuilder()
        code = "from hypothesis import given\neval('1+1')\n"
        ok, _ = builder.create_experiment("evil3", "n/a", code)

        assert ok is False

    def test_rejects_code_without_test_framework(self):
        """Code that doesn't import hypothesis or unittest is rejected."""
        builder = DynamicExperimentBuilder()
        code = "def test_foo():\n    assert True\n"
        ok, msg = builder.create_experiment("bare", "n/a", code)

        assert ok is False
        assert "hypothesis or unittest" in msg.lower()

    def test_get_nonexistent_returns_none(self):
        """Retrieving a name that was never created returns None."""
        builder = DynamicExperimentBuilder()

        assert builder.get_experiment("does_not_exist") is None


# ═══════════════════════════════════════════════════════════════════════
# ScientificMemory
# ═══════════════════════════════════════════════════════════════════════


class TestScientificMemory:
    """Tests for the in-memory state container."""

    def test_add_observation(self):
        """Observations should accumulate in the list."""
        mem = ScientificMemory()
        mem.add_observation("red_agent", "sql_injection", "found sqli", "evidence")

        assert len(mem.observations) == 1
        assert mem.observations[0].category == "sql_injection"

    def test_create_hypothesis_returns_sequential_ids(self):
        """IDs should be H1, H2, H3, …"""
        mem = ScientificMemory()
        h1 = mem.create_hypothesis("stmt1", "pred1", "cause1")
        h2 = mem.create_hypothesis("stmt2", "pred2", "cause2")

        assert h1 == "H1"
        assert h2 == "H2"
        assert len(mem.hypotheses) == 2

    def test_get_unverified_hypotheses(self):
        """Should return only PROPOSED and TESTING hypotheses."""
        mem = ScientificMemory()
        mem.create_hypothesis("a", "b", "c")  # PROPOSED by default
        mem.hypotheses[0].status = HypothesisStatus.CONFIRMED

        mem.create_hypothesis("d", "e", "f")  # PROPOSED

        unverified = mem.get_unverified_hypotheses()
        assert len(unverified) == 1
        assert unverified[0].statement == "d"

    def test_get_confirmed_hypotheses(self):
        """Should return only CONFIRMED hypotheses."""
        mem = ScientificMemory()
        mem.create_hypothesis("a", "b", "c")
        mem.create_hypothesis("d", "e", "f")
        mem.hypotheses[0].status = HypothesisStatus.CONFIRMED
        mem.hypotheses[1].status = HypothesisStatus.REJECTED

        confirmed = mem.get_confirmed_hypotheses()
        assert len(confirmed) == 1
        assert confirmed[0].statement == "a"


# ═══════════════════════════════════════════════════════════════════════
# ScientificReasoner — fallback (no LLM) paths
# ═══════════════════════════════════════════════════════════════════════


class TestFallbackHypotheses:
    """Tests for _fallback_hypotheses — deterministic hypothesis generation."""

    def setup_method(self):
        self.reasoner = ScientificReasoner.__new__(ScientificReasoner)
        self.reasoner.client = None
        self.reasoner.model = None

    def test_sql_injection_observation(self):
        """SQL injection observation should produce a sql-related hypothesis."""
        obs = [Observation("red_agent", "sql_injection", "sqli found",
                           "evidence", line_number=10)]
        result = self.reasoner._fallback_hypotheses(obs)

        assert len(result) == 1
        assert "sql" in result[0]["statement"].lower()
        assert "parameterization" in result[0]["root_cause"].lower()

    def test_command_injection_observation(self):
        """Command injection observation should produce a shell-related hypothesis."""
        obs = [Observation("red_agent", "command_injection", "cmd inj",
                           "evidence", line_number=20)]
        result = self.reasoner._fallback_hypotheses(obs)

        assert len(result) == 1
        assert "command" in result[0]["statement"].lower()

    def test_unknown_category_produces_generic_hypothesis(self):
        """An unrecognized category should still produce a hypothesis."""
        obs = [Observation("red_agent", "something_new", "desc",
                           "evidence", line_number=5)]
        result = self.reasoner._fallback_hypotheses(obs)

        assert len(result) == 1
        assert "statement" in result[0]
        assert "prediction" in result[0]
        assert "root_cause" in result[0]

    def test_max_three_hypotheses(self):
        """Fallback should produce at most 3 hypotheses even with more observations."""
        obs = [
            Observation("red_agent", "sql_injection", f"obs{i}", "ev", line_number=i)
            for i in range(5)
        ]
        result = self.reasoner._fallback_hypotheses(obs)

        assert len(result) <= 3


class TestFallbackInterpretation:
    """Tests for _fallback_interpretation — pattern-matching on test output."""

    def setup_method(self):
        self.reasoner = ScientificReasoner.__new__(ScientificReasoner)
        self.reasoner.client = None
        self.reasoner.model = None
        self.dummy_exp = Experiment(
            hypothesis_id="H1",
            test_name="test_x",
            test_code="pass",
            expected_behavior="should pass",
        )

    def test_import_error_returns_confirmed(self):
        """Infrastructure errors like ImportError should default to CONFIRMED."""
        status, _, _ = self.reasoner._fallback_interpretation(
            self.dummy_exp, "ImportError: No module named 'solution'"
        )
        assert status == HypothesisStatus.CONFIRMED

    def test_falsifying_example_returns_confirmed(self):
        """Hypothesis library finding a counterexample means vulnerability confirmed."""
        status, _, conf = self.reasoner._fallback_interpretation(
            self.dummy_exp, "Falsifying example: x='admin'"
        )
        assert status == HypothesisStatus.CONFIRMED
        assert conf >= 0.9

    def test_passed_output_returns_rejected(self):
        """Clean 'passed' output means the hypothesis was disproved."""
        status, _, _ = self.reasoner._fallback_interpretation(
            self.dummy_exp, "3 passed in 0.5s"
        )
        assert status == HypothesisStatus.REJECTED

    def test_assertion_failed_returns_confirmed(self):
        """An assertion failure in test output confirms the hypothesis."""
        status, _, _ = self.reasoner._fallback_interpretation(
            self.dummy_exp, "FAILED test_x - AssertionError: assertion failed"
        )
        assert status == HypothesisStatus.CONFIRMED

    def test_flaky_returns_confirmed(self):
        """A flaky test result indicates a potential edge-case vulnerability."""
        status, _, _ = self.reasoner._fallback_interpretation(
            self.dummy_exp, "Flaky test detected after 50 runs"
        )
        assert status == HypothesisStatus.CONFIRMED


# ═══════════════════════════════════════════════════════════════════════
# ScientificMethodEngine — classifiers & helpers
# ═══════════════════════════════════════════════════════════════════════


class TestDetermineSeverity:
    """Tests for _determine_severity keyword mapping."""

    def setup_method(self):
        self.engine = ScientificMethodEngine.__new__(ScientificMethodEngine)

    def _hyp(self, statement):
        return Hypothesis(id="H1", statement=statement, prediction="", root_cause="")

    def test_sql_injection_is_critical(self):
        assert self.engine._determine_severity(self._hyp("SQL injection in login")) == "critical"

    def test_command_injection_is_critical(self):
        assert self.engine._determine_severity(self._hyp("command injection via shell")) == "critical"

    def test_auth_bypass_is_high(self):
        assert self.engine._determine_severity(self._hyp("authentication bypass")) == "high"

    def test_xss_is_medium(self):
        assert self.engine._determine_severity(self._hyp("XSS in search page")) == "medium"

    def test_unknown_defaults_to_medium(self):
        assert self.engine._determine_severity(self._hyp("logic error in sort")) == "medium"


class TestDetermineCategory:
    """Tests for _determine_category keyword mapping."""

    def setup_method(self):
        self.engine = ScientificMethodEngine.__new__(ScientificMethodEngine)

    def _hyp(self, statement):
        return Hypothesis(id="H1", statement=statement, prediction="", root_cause="")

    def test_sql_category(self):
        assert self.engine._determine_category(self._hyp("SQL query is unsafe")) == "sql_injection"

    def test_command_category(self):
        assert self.engine._determine_category(self._hyp("command passed to shell")) == "command_injection"

    def test_eval_category(self):
        assert self.engine._determine_category(self._hyp("eval on user input")) == "code_injection"

    def test_auth_category(self):
        assert self.engine._determine_category(self._hyp("auth token not verified")) == "authentication"

    def test_xss_category(self):
        assert self.engine._determine_category(self._hyp("XSS in output")) == "xss"

    def test_fallback_category(self):
        assert self.engine._determine_category(self._hyp("off-by-one error")) == "security_flaw"


class TestExtractFixAction:
    """Tests for _extract_fix_action — shortening verbose fix suggestions."""

    def setup_method(self):
        self.engine = ScientificMethodEngine.__new__(ScientificMethodEngine)

    def test_short_suggestion_returned_as_is(self):
        short = "Use parameterized queries"
        assert self.engine._extract_fix_action(short) == short

    def test_sql_pattern_shortened(self):
        verbose = (
            "**FIX REQUIRED**: Replace string formatting with parameterized queries.\n"
            "WRONG: cursor.execute(f\"...{user_id}\")\n"
            "CORRECT: cursor.execute('...?...', (user_id,))\n"
        )
        result = self.engine._extract_fix_action(verbose)
        assert "parameterized" in result.lower()

    def test_eval_pattern_shortened(self):
        verbose = (
            "**FIX REQUIRED**: Remove eval/exec or use ast.literal_eval "
            "for safe parsing.\nWRONG: result = eval(user_input)\n"
            "CORRECT: result = ast.literal_eval(user_input)\n"
        )
        result = self.engine._extract_fix_action(verbose)
        assert "literal_eval" in result.lower()
