"""Sprint 4 generalist purple-agent executor (default text-mode path).

This executor handles greens that use the standard A2A protocol with
`kind: "text"` parts — tau2-bench is the proven example. Pi-Bench's
`kind: "data"` bootstrap+turn protocol is handled separately by
PiBenchHandler via PiBenchRouteMiddleware before this executor runs.

State is namespaced per A2A `context_id` so concurrent assessments don't bleed
into each other (per AgentBeats reproducibility guidance). JSON-mode is
auto-detected from incoming text and toggles OpenAI `response_format`.
"""

from __future__ import annotations

import json
import logging
import os
import re
from typing import Any

from a2a.server.agent_execution import AgentExecutor, RequestContext
from a2a.server.events import EventQueue
from a2a.server.tasks import TaskUpdater
from a2a.types import (
    DataPart,
    InvalidParamsError,
    Part,
    Task,
    TaskState,
    TextPart,
    UnsupportedOperationError,
)
from a2a.utils import new_agent_text_message, new_task
from a2a.utils.errors import ServerError
from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv()

logger = logging.getLogger("sprint4_purple")


SPRINT4_SYSTEM_PROMPT = """You are LogoMesh, a versatile evaluation agent participating in AgentX-AgentBeats Phase 2 Sprint 4 benchmarks via the A2A protocol.

Each incoming message contains task instructions from a benchmark green agent. Your responsibilities:

1. PARSE the task carefully. Identify the required output format (JSON object, file content, multi-turn dialog turn, kubectl plan, policy verdict, tool calls, etc.) from the message text or any explicit schema provided.

2. RESPOND in the exact format requested. If the task says "return JSON with field X", emit valid JSON with that field at the top level. If natural-language reasoning is asked for, give clear reasoning with no extraneous commentary.

3. NEVER fabricate. When you don't know something (a column name, a policy detail, a network state), say so explicitly:
   - SQL tasks: omit table/column/function references you cannot verify from the provided schema.
   - Policy / compliance tasks: when policy scope is genuinely unclear, output `AMBIGUOUS_POLICY` or `AMBIGUOUS_STATE` rather than forcing a binary verdict.
   - Error analysis: classify the error type before proposing recovery; aim for pre-execution detection.
   - Multi-turn dialog: track both your prior actions and any simulated user state.
   - Network/infra: when live cluster access is unavailable, produce a reasoned plan and clearly mark it as such.

4. STAY ON TASK. Do not add commentary beyond what is requested. No preambles like "Sure, I can help with that".

5. FOLLOW POLICY. When a system prompt, tool description, or policy document is embedded in the task, follow it strictly.

Operate honestly. Failure to know is acceptable; fabrication is not."""


REASONING_MODEL_PREFIXES = ("gpt-5", "o1", "o3", "o4")


def _model_needs_reasoning_effort(model: str) -> bool:
    """gpt-5/o1/o3/o4 family models default to reasoning: none in
    chat.completions, which disables tool calling and degrades quality.
    Set reasoning.effort explicitly so they actually reason."""
    model_lower = model.lower()
    return any(model_lower.startswith(p) for p in REASONING_MODEL_PREFIXES)


JSON_REQUEST_PATTERNS = [
    re.compile(r"\breturn\s+(?:a\s+|the\s+)?json\b", re.IGNORECASE),
    re.compile(r"\boutput\s+(?:a\s+|the\s+)?json\b", re.IGNORECASE),
    re.compile(r"\brespond\s+(?:with\s+|in\s+)?json\b", re.IGNORECASE),
    re.compile(r"\bjson\s+(?:object|format|response|schema)\b", re.IGNORECASE),
    re.compile(r'"\s*sql\s*"\s*:', re.IGNORECASE),
    re.compile(r'"\s*action\s*"\s*:', re.IGNORECASE),
    re.compile(r'"\s*answer\s*"\s*:', re.IGNORECASE),
]


def _expects_json(message_text: str) -> bool:
    for pattern in JSON_REQUEST_PATTERNS:
        if pattern.search(message_text):
            return True
    return False


def _try_parse_json(text: str) -> dict[str, Any] | None:
    text = text.strip()
    if not text:
        return None
    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        return None
    if isinstance(parsed, dict):
        return parsed
    return {"value": parsed}


class Sprint4PurpleExecutor(AgentExecutor):
    """Default text-mode executor for greens using the standard A2A protocol.

    Streams text responses via TaskUpdater, optionally enabling OpenAI
    JSON-mode response_format when the incoming text requests JSON. Emits a
    DataPart + TextPart artifact alongside the stream so green agents using
    either consumption pattern work.
    """

    def __init__(self, model: str | None = None):
        base_url = os.getenv("OPENAI_BASE_URL") or None
        self.client = AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY"),
            base_url=base_url,
        )
        env_model = os.getenv("LOGOMESH_PURPLE_MODEL") or None
        self.model = model or env_model or "gpt-4.1"
        self.system_prompt = SPRINT4_SYSTEM_PROMPT
        self._history: dict[str, list[dict[str, Any]]] = {}

    async def execute(self, context: RequestContext, event_queue: EventQueue) -> None:
        msg = context.message
        if not msg:
            raise ServerError(error=InvalidParamsError(message="Missing message."))

        task = context.current_task
        if not task:
            task = new_task(msg)
            await event_queue.enqueue_event(task)

        updater = TaskUpdater(event_queue, task.id, task.context_id)
        context_id = task.context_id or task.id

        try:
            message_text = context.get_user_input() or ""
            logger.info("text-mode task %s received (%d chars)", task.id, len(message_text))

            history = self._history.setdefault(context_id, [])
            history.append({"role": "user", "content": message_text})

            json_mode = _expects_json(message_text)

            await updater.update_status(
                TaskState.working,
                new_agent_text_message("Working..."),
            )

            kwargs: dict[str, Any] = {
                "model": self.model,
                "messages": [{"role": "system", "content": self.system_prompt}, *history],
                "stream": True,
            }
            if json_mode:
                kwargs["response_format"] = {"type": "json_object"}
            if _model_needs_reasoning_effort(self.model):
                # chat.completions uses top-level snake_case `reasoning_effort`.
                kwargs["reasoning_effort"] = "medium"

            stream = await self.client.chat.completions.create(**kwargs)

            assistant_message = ""
            async for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    token = chunk.choices[0].delta.content
                    assistant_message += token
                    await updater.update_status(
                        TaskState.working,
                        new_agent_text_message(token),
                    )

            history.append({"role": "assistant", "content": assistant_message})
            logger.info("text-mode task %s completed (%d chars)", task.id, len(assistant_message))

            artifact_parts: list[Part] = []
            parsed_json = _try_parse_json(assistant_message) if json_mode else None
            if parsed_json is not None:
                artifact_parts.append(Part(root=DataPart(data=parsed_json)))
            artifact_parts.append(Part(root=TextPart(text=assistant_message)))

            await updater.add_artifact(parts=artifact_parts, name="Response")
            await updater.complete()

        except Exception as exc:
            logger.exception("text-mode task %s failed", task.id)
            await updater.failed(
                new_agent_text_message(
                    f"Agent error: {exc}",
                    context_id=context_id,
                    task_id=task.id,
                )
            )

    async def cancel(self, context: RequestContext, event_queue: EventQueue) -> Task | None:
        raise ServerError(error=UnsupportedOperationError())
