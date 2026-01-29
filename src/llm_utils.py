"""Shared LLM utilities for temperature and model configuration."""

import os


def get_temperature_kwargs(default: float = 0.7) -> dict:
    """
    Return temperature kwargs for OpenAI API calls.

    Uses LLM_TEMPERATURE env var:
    - unset or "": uses the caller's default value (preserves determinism)
    - "skip": returns {} (let model use its own default, for models like gpt-5.2)
    - A number: returns {"temperature": float(value)}
    """
    env_val = os.getenv("LLM_TEMPERATURE", "").strip().lower()

    # Not set — use the caller's intended default (keeps deterministic scoring)
    if env_val == "":
        return {"temperature": default}

    # Explicitly skip temperature (for models that reject it like gpt-5.2)
    if env_val in ("skip", "none", "default"):
        return {}

    try:
        return {"temperature": float(env_val)}
    except ValueError:
        return {"temperature": default}
