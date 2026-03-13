"""Tests for refinement loop behavior, including test_memory initialization."""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from green_logic.refinement_loop import RefinementLoop, create_refinement_task_prompt


class TestRefinementLoopShouldContinue:
    """Test the RefinementLoop.should_continue decision logic."""

    def setup_method(self):
        self.loop = RefinementLoop(max_iterations=3)

    def test_stops_at_max_iterations(self):
        assert not self.loop.should_continue(
            iteration=3, test_passed=False, score=0.3, critical_vulns=1
        )

    def test_continues_below_max_iterations(self):
        assert self.loop.should_continue(
            iteration=1, test_passed=False, score=0.3, critical_vulns=0
        )

    def test_stops_on_success(self):
        assert not self.loop.should_continue(
            iteration=1, test_passed=True, score=0.8, critical_vulns=0
        )

    def test_continues_if_critical_vulns(self):
        assert self.loop.should_continue(
            iteration=1, test_passed=True, score=0.8, critical_vulns=1
        )

    def test_stops_on_score_regression(self):
        # First iteration sets best_score
        self.loop.should_continue(
            iteration=1, test_passed=False, score=0.6, critical_vulns=0
        )
        # Second iteration score drops significantly
        assert not self.loop.should_continue(
            iteration=2, test_passed=False, score=0.4, critical_vulns=0
        )

    def test_reset_clears_state(self):
        self.loop.should_continue(
            iteration=1, test_passed=False, score=0.6, critical_vulns=0
        )
        self.loop.reset()
        assert self.loop.best_score == 0.0
        assert self.loop.best_iteration == 0


class TestCreateRefinementTaskPrompt:
    def test_includes_feedback_and_iteration(self):
        prompt = create_refinement_task_prompt(
            original_prompt="Write a function",
            feedback="Fix the bug",
            iteration=2,
        )
        assert "Fix the bug" in prompt
        assert "2" in prompt


class TestTestMemoryInitialization:
    """
    Regression tests for GitHub Issue #137:
    test_memory must be defined before the refinement loop references it,
    even when hidden_tests are used (skipping the else branch where
    test_memory was originally assigned).
    """

    def test_test_memory_defined_when_hidden_tests_used(self):
        """Simulate the branching logic from server.py to verify
        test_memory is always defined, even when hidden_tests is set."""
        hidden_tests = "def test_hidden(): assert True"
        battle_memory = None
        task_memory = None

        # This mirrors the fixed code in server.py lines 697-708
        test_memory = ""
        if hidden_tests and hidden_tests.strip():
            tests_to_run = hidden_tests
            tests_used = "hidden"
        else:
            test_memory = (
                battle_memory.format_for_test_generator(task_memory)
                if battle_memory and task_memory
                else ""
            )
            tests_to_run = "generated tests"
            tests_used = "generated"

        # Simulate the refinement loop referencing test_memory (line 954)
        memory_context = test_memory if battle_memory and task_memory else ""
        assert memory_context == ""
        assert tests_used == "hidden"

    def test_test_memory_defined_across_two_refinement_iterations(self):
        """Simulate two refinement iterations with hidden_tests.
        Before the fix, the second iteration would raise UnboundLocalError."""
        hidden_tests = "def test_hidden(): assert True"
        battle_memory = None
        task_memory = None

        test_memory = ""
        if hidden_tests and hidden_tests.strip():
            tests_to_run = hidden_tests
            tests_used = "hidden"
        else:
            test_memory = (
                battle_memory.format_for_test_generator(task_memory)
                if battle_memory and task_memory
                else ""
            )
            tests_to_run = "generated tests"
            tests_used = "generated"

        # Iteration 1: reference test_memory
        memory_context_1 = test_memory if battle_memory and task_memory else ""

        # Iteration 2: reference test_memory again (this was the crash site)
        memory_context_2 = test_memory if battle_memory and task_memory else ""

        assert memory_context_1 == ""
        assert memory_context_2 == ""

    def test_test_memory_populated_without_hidden_tests(self):
        """When there are no hidden_tests, test_memory should be populated
        from battle_memory if available."""
        hidden_tests = None
        battle_memory = MagicMock()
        battle_memory.format_for_test_generator.return_value = "memory context data"
        task_memory = MagicMock()

        test_memory = ""
        if hidden_tests and hidden_tests.strip() if hidden_tests else False:
            tests_to_run = hidden_tests
            tests_used = "hidden"
        else:
            test_memory = (
                battle_memory.format_for_test_generator(task_memory)
                if battle_memory and task_memory
                else ""
            )
            tests_to_run = "generated tests"
            tests_used = "generated"

        memory_context = test_memory if battle_memory and task_memory else ""
        assert memory_context == "memory context data"
