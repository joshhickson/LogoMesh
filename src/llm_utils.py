"""Shared LLM utilities for temperature and model configuration."""

import os


def get_temperature_kwargs(default: float = 0.7) -> dict:
    """
    Return temperature kwargs for OpenAI API calls.

    Uses LLM_TEMPERATURE env var:
    - "default" or "" or unset: returns {} (let model use its default)
    - A number: returns {"temperature": float(value)}

    This handles models like gpt-5.2 that reject custom temperature values.
    """
    env_val = os.getenv("LLM_TEMPERATURE", "").strip().lower()

    if env_val in ("", "default", "none"):
        return {}

    try:
        return {"temperature": float(env_val)}
    except ValueError:
        return {}
