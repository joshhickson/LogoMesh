"""Tests for the Harmony Protocol parser."""

import pytest
from green_logic.harmony_parser import HarmonyParser


class TestHarmonyParse:
    def test_full_format_with_end_tags(self):
        text = (
            "<|channel|analysis|>\nMy reasoning here.\n<|channel|end|>\n"
            "<|channel|final|>\ndef foo(): pass\n<|channel|end|>"
        )
        result = HarmonyParser.parse(text)
        assert result["format_detected"] is True
        assert "analysis" in result["channels"]
        assert "final" in result["channels"]
        assert result["analysis"] == "My reasoning here."
        assert "def foo" in result["final"]

    def test_format_without_end_tags(self):
        text = (
            "<|channel|analysis|>\nReasoning trace.\n"
            "<|channel|final|>\ndef bar(): return 1\n"
        )
        result = HarmonyParser.parse(text)
        assert result["format_detected"] is True
        assert result["analysis"] is not None
        assert result["final"] is not None

    def test_non_harmony_falls_back(self):
        text = "Here is some plain code:\ndef hello(): pass"
        result = HarmonyParser.parse(text)
        assert result["format_detected"] is False
        assert result["final"] == text.strip()
        assert result["analysis"] is None

    def test_empty_string(self):
        result = HarmonyParser.parse("")
        assert result["format_detected"] is False
        assert result["final"] == ""


class TestExtractCode:
    def test_extracts_from_json_source_code(self):
        content = '{"sourceCode": "def fib(n):\\n    return n"}'
        code = HarmonyParser.extract_code_from_final(content)
        assert "def fib(n):" in code
        assert "\n" in code  # escaped newline should be real newline

    def test_extracts_from_markdown_code_block(self):
        content = "Here's the code:\n```python\ndef add(a, b):\n    return a + b\n```"
        code = HarmonyParser.extract_code_from_final(content)
        assert "def add(a, b):" in code

    def test_extracts_plain_code(self):
        content = "def hello():\n    print('hi')"
        code = HarmonyParser.extract_code_from_final(content)
        assert "def hello" in code

    def test_none_input(self):
        assert HarmonyParser.extract_code_from_final(None) is None

    def test_empty_input(self):
        assert HarmonyParser.extract_code_from_final("") is None


class TestExtractRationale:
    def test_extracts_rationale_section(self):
        content = "Some preamble.\nRationale: I chose recursion for clarity.\n\nMore text."
        rationale = HarmonyParser.extract_rationale_from_analysis(content)
        assert "recursion" in rationale

    def test_extracts_approach_section(self):
        content = "My approach: Use dynamic programming to optimize."
        rationale = HarmonyParser.extract_rationale_from_analysis(content)
        assert "dynamic programming" in rationale

    def test_falls_back_to_full_text(self):
        content = "This is just a general analysis without labeled sections."
        rationale = HarmonyParser.extract_rationale_from_analysis(content)
        assert rationale == content.strip()

    def test_none_input(self):
        assert HarmonyParser.extract_rationale_from_analysis(None) is None


class TestFormatForDisplay:
    def test_formats_detected_response(self):
        parsed = {
            "format_detected": True,
            "channels": {"analysis": "...", "final": "..."},
            "analysis": "My reasoning",
            "final": "def code(): pass",
        }
        display = HarmonyParser.format_for_display(parsed)
        assert "Harmony Response" in display
        assert "Format Detected: True" in display
        assert "My reasoning" in display

    def test_truncates_long_content(self):
        parsed = {
            "format_detected": True,
            "channels": {"analysis": "x"},
            "analysis": "A" * 1000,
            "final": None,
        }
        display = HarmonyParser.format_for_display(parsed, max_length=100)
        assert "..." in display
