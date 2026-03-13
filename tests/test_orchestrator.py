"""Tests for ThoughtNode UCB1 scoring and backpropagation (red_logic.orchestrator)."""

import math
import pytest
from red_logic.orchestrator import ThoughtNode


def make_node(id="test", parent=None, visits=0, value=0.0, prior=0.5):
    """Helper to create a ThoughtNode with sensible defaults."""
    return ThoughtNode(
        id=id,
        action={"tool": "test", "parameters": {}, "reasoning": "test"},
        parent=parent,
        visits=visits,
        value=value,
        prior=prior,
    )


class TestUcb1Score:
    def test_unvisited_node_returns_inf(self):
        node = make_node(visits=0)
        assert node.ucb1_score() == float("inf")

    def test_visited_node_with_parent(self):
        parent = make_node(id="parent", visits=10)
        child = make_node(id="child", parent=parent, visits=5, value=3.0)
        score = child.ucb1_score()
        # exploitation = 3.0/5 = 0.6
        # parent_visits = 10 + 1 = 11
        # exploration = 1.414 * sqrt(ln(11) / 5)
        # prior bonus = 0.5 * 0.5 = 0.25
        exploitation = 3.0 / 5
        exploration = 1.414 * math.sqrt(math.log(11) / 5)
        expected = exploitation + exploration + 0.25
        assert abs(score - expected) < 1e-6

    def test_root_node_no_parent_does_not_crash(self):
        """Regression test for issue #139: root node has parent=None."""
        root = make_node(id="root", parent=None, visits=3, value=1.5)
        score = root.ucb1_score()
        # parent_visits = 1 (fallback), log(1) = 0, so exploration = 0
        # exploitation = 1.5/3 = 0.5, prior bonus = 0.25
        assert abs(score - 0.75) < 1e-6

    def test_root_node_after_backpropagation(self):
        """The exact crash scenario: root gets visits via backpropagate,
        then ucb1_score is called on it."""
        root = make_node(id="root", parent=None)
        child = make_node(id="child", parent=root)

        # Simulate: child is selected, executed, then backpropagates
        child.backpropagate(0.8)

        # Now root.visits > 0 (backpropagate walked up to root)
        assert root.visits == 1
        assert child.visits == 1

        # This was the crash site — root.ucb1_score() with parent=None
        score = root.ucb1_score()
        # exploitation = 0.8/1 = 0.8, exploration = 0 (log(1)=0), prior = 0.25
        assert abs(score - 1.05) < 1e-6

    def test_custom_exploration_weight(self):
        parent = make_node(id="parent", visits=10)
        child = make_node(id="child", parent=parent, visits=5, value=2.5)
        score = child.ucb1_score(exploration_weight=2.0)
        exploitation = 2.5 / 5
        exploration = 2.0 * math.sqrt(math.log(11) / 5)
        expected = exploitation + exploration + 0.25
        assert abs(score - expected) < 1e-6


class TestBackpropagate:
    def test_single_node(self):
        node = make_node(visits=0, value=0.0)
        node.backpropagate(0.5)
        assert node.visits == 1
        assert node.value == 0.5

    def test_propagates_to_ancestors(self):
        root = make_node(id="root")
        mid = make_node(id="mid", parent=root)
        leaf = make_node(id="leaf", parent=mid)

        leaf.backpropagate(1.0)

        assert leaf.visits == 1 and leaf.value == 1.0
        assert mid.visits == 1 and mid.value == 1.0
        assert root.visits == 1 and root.value == 1.0

    def test_multiple_backpropagations_accumulate(self):
        root = make_node(id="root")
        child = make_node(id="child", parent=root)

        child.backpropagate(0.5)
        child.backpropagate(0.3)

        assert child.visits == 2
        assert abs(child.value - 0.8) < 1e-9
        assert root.visits == 2
        assert abs(root.value - 0.8) < 1e-9
