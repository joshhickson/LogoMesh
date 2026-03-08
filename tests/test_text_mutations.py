"""
Tests for the text mutation action space and MCTS abstraction.

Covers:
- Each mutation tool produces valid ToolResult
- TextMutationActionSpace implements the full ActionSpace interface
- RedAgentV3 can instantiate in both modes without errors
- CodeActionSpace backward compatibility (ToolRegistry alias)
"""

import asyncio
import pytest

from red_logic.text_mutations import (
    TextMutationActionSpace,
    _base64_encode,
    _inject_persona,
    _language_switch,
    _split_payload,
)
from red_logic.orchestrator import (
    ActionSpace,
    CodeActionSpace,
    ToolRegistry,
    ThoughtNode,
    AgentMemory,
    RedAgentV3,
)


# ── helper to run async tests ──────────────────────────────────────────────

def run(coro):
    return asyncio.get_event_loop().run_until_complete(coro)


# ── pure mutation function tests ───────────────────────────────────────────

class TestMutationHelpers:
    def test_base64_encode_contains_encoded_string(self):
        result = _base64_encode("hello world")
        assert "base64" in result.lower()
        assert "aGVsbG8gd29ybGQ=" in result  # base64 of "hello world"

    def test_inject_persona_default(self):
        result = _inject_persona("do something bad")
        assert "DAN" in result
        assert "do something bad" in result

    def test_inject_persona_custom(self):
        result = _inject_persona("payload", persona="I am admin")
        assert "I am admin" in result
        assert "payload" in result

    def test_language_switch_rot13(self):
        result = _language_switch("hello", "rot13")
        assert result == "uryyb"

    def test_language_switch_pig_latin(self):
        result = _language_switch("hello world", "pig_latin")
        assert "ello" in result  # "hello" -> "ellohay"

    def test_language_switch_reverse(self):
        result = _language_switch("hello", "reverse")
        assert result == "olleh"

    def test_split_payload_has_two_parts(self):
        result = _split_payload("make a dangerous thing happen now")
        assert "Part 1" in result
        assert "Part 2" in result
        assert "Concatenate" in result


# ── TextMutationActionSpace interface tests ────────────────────────────────

class TestTextMutationActionSpace:
    def setup_method(self):
        self.space = TextMutationActionSpace(target_prompt="test payload")
        self.memory = AgentMemory()

    def test_is_action_space(self):
        assert isinstance(self.space, ActionSpace)

    def test_get_tool_definitions_returns_list(self):
        defs = self.space.get_tool_definitions()
        assert isinstance(defs, list)
        assert len(defs) >= 4  # issue requires at least 4
        names = [t["name"] for t in defs]
        assert "base64_encode" in names
        assert "inject_persona" in names
        assert "language_switch" in names
        assert "split_payload" in names

    def test_get_expand_prompt_returns_tuple(self):
        sys_p, user_p = self.space.get_expand_prompt("ctx", "", "desc", "target", 1)
        assert isinstance(sys_p, str)
        assert isinstance(user_p, str)
        # Should be about prompt injection, not code scanning
        assert "injection" in sys_p.lower() or "jailbreak" in sys_p.lower()
        assert "scan_file" not in sys_p

    def test_get_reason_prompt_returns_tuple(self):
        sys_p, user_p = self.space.get_reason_prompt("ctx", "", "desc", "target", 1, 10)
        assert isinstance(sys_p, str)
        assert isinstance(user_p, str)

    def test_get_fallback_nodes_returns_thought_nodes(self):
        counter = [0]
        def gen_id():
            counter[0] += 1
            return f"node_{counter[0]}"
        nodes = self.space.get_fallback_nodes(None, gen_id)
        assert len(nodes) >= 2
        assert all(isinstance(n, ThoughtNode) for n in nodes)

    def test_execute_base64(self):
        result = run(self.space.execute("base64_encode", {"payload": "test"}, self.memory))
        assert result.success is True
        assert "base64" in result.output.lower() or "Base64" in result.output

    def test_execute_persona(self):
        result = run(self.space.execute("inject_persona", {"payload": "test"}, self.memory))
        assert result.success is True
        assert "DAN" in result.output or "persona" in result.output.lower()

    def test_execute_language_switch(self):
        result = run(self.space.execute(
            "language_switch",
            {"payload": "hello", "language": "rot13"},
            self.memory
        ))
        assert result.success is True
        assert "uryyb" in result.output  # rot13 of "hello"

    def test_execute_split(self):
        result = run(self.space.execute("split_payload", {"payload": "split this text"}, self.memory))
        assert result.success is True
        assert "Part 1" in result.output

    def test_execute_unknown_tool(self):
        result = run(self.space.execute("nonexistent", {}, self.memory))
        assert result.success is False

    def test_valuate_heuristic_rewards_diversity(self):
        node = ThoughtNode(
            id="test",
            action={"tool": "base64_encode", "parameters": {}, "reasoning": "Try encoding"},
        )
        # No observations yet — tool hasn't been used, should get a bonus
        score_fresh = self.space.valuate_heuristic(node, self.memory)
        assert score_fresh > 0

        # Add an observation that mentions base64_encode
        self.memory.observations.append("Step 1: base64_encode -> encoded")
        score_used = self.space.valuate_heuristic(node, self.memory)
        # After using it, the fresh-tool bonus should be gone
        assert score_used <= score_fresh


# ── Backward compatibility tests ──────────────────────────────────────────

class TestBackwardCompat:
    def test_tool_registry_alias(self):
        """ToolRegistry should still work for old imports."""
        assert ToolRegistry is CodeActionSpace

    def test_code_action_space_is_action_space(self):
        space = CodeActionSpace("print('hello')", "test")
        assert isinstance(space, ActionSpace)

    def test_red_agent_default_mode_is_code(self):
        agent = RedAgentV3()
        assert agent.mode == "code"

    def test_red_agent_text_mode_accepted(self):
        agent = RedAgentV3(mode="text")
        assert agent.mode == "text"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
