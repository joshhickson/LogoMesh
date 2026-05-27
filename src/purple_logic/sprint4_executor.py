"""Sprint 4 generalist purple-agent executor.

Designed to serve multiple AgentX-AgentBeats green agent benchmarks via A2A.
Two operating modes are auto-selected per incoming message:

1. Pi-Bench / tool-calling mode (when the incoming text is a JSON object
   containing `scenario_id` + `tools`): uses OpenAI function-calling, emits
   A2A response parts with custom `kind: "tool_call"` that Pi-Bench's
   engine parses (see RDI-Foundation/pi-bench-agentbeats engine.py).
2. Default text mode (everything else, including tau2-bench): streams a text
   response with JSON-mode auto-detection and an artifact alongside the stream.

State is namespaced per A2A `context_id` so concurrent assessments don't bleed
into each other (per AgentBeats reproducibility guidance).
"""

from __future__ import annotations

import json
import logging
import os
import re
import uuid
from typing import Any

from a2a.server.agent_execution import AgentExecutor, RequestContext
from a2a.server.events import EventQueue
from a2a.server.tasks import TaskUpdater
from a2a.types import (
    DataPart,
    InvalidParamsError,
    Message,
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

3. USE TOOLS DECISIVELY. When tool definitions are supplied, USE THEM to take concrete actions rather than describing them in prose. Specifically:
   - If a policy task requires recording a DECISION (ALLOW / DENY / ESCALATE), invoke the matching tool (record_decision, escalate_to_human, etc.) rather than only narrating your choice.
   - If a request requires verification or authorization before action, call the verification tool first.
   - Match arguments exactly to the schema provided. Use only fields declared in the tool's parameters.
   - Prefer making the right tool call to making zero tool calls. Silent abstention loses points.

4. NEVER fabricate. When you don't know something (a column name, a policy detail, a network state), say so explicitly:
   - SQL tasks: omit table/column/function references you cannot verify from the provided schema.
   - Policy / compliance tasks: when policy scope is genuinely unclear, output `AMBIGUOUS_POLICY` or `AMBIGUOUS_STATE` rather than forcing a binary verdict.
   - Error analysis: classify the error type before proposing recovery; aim for pre-execution detection.
   - Multi-turn dialog: track both your prior actions and any simulated user state.
   - Network/infra: when live cluster access is unavailable, produce a reasoned plan and clearly mark it as such.

5. STAY ON TASK. Do not add commentary beyond what is requested. No preambles like "Sure, I can help with that".

6. FOLLOW POLICY. When a system prompt, tool description, or policy document is embedded in the task, follow it strictly.

Operate honestly. Failure to know is acceptable; fabrication is not."""


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


def _try_parse_pibench_request(text: str) -> dict[str, Any] | None:
    """Detect a Pi-Bench-style request envelope.

    Pi-Bench sends two shapes (engine.py _send_turn / _send_tool_results):
    - Turn:    {scenario_id, turn_number, instruction, environment, tools, max_turns}
    - Result:  {scenario_id, turn_number, tool_results, assistant_tool_calls, environment}

    Returns the parsed dict if it matches either shape, else None.
    """
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        return None
    if not isinstance(data, dict):
        return None
    has_scenario = "scenario_id" in data
    has_tools_or_results = ("tools" in data) or ("tool_results" in data)
    if has_scenario and has_tools_or_results:
        return data
    return None


def _pibench_tools_to_openai(tools: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Convert Pi-Bench tool schemas to OpenAI function-calling format."""
    openai_tools: list[dict[str, Any]] = []
    for t in tools:
        name = t.get("name")
        if not name:
            continue
        params = t.get("parameters", {}) or {}
        # Pi-Bench parameter shape: {field_name: {"type": ..., ...}}
        # OpenAI expects a JSON-Schema object with `properties` wrapper.
        if "properties" in params:
            schema = params
        else:
            schema = {"type": "object", "properties": params}
        openai_tools.append({
            "type": "function",
            "function": {
                "name": name,
                "description": t.get("description", ""),
                "parameters": schema,
            },
        })
    return openai_tools


def _build_response_message(
    *,
    context_id: str | None,
    text: str | None,
    tool_calls: list[dict[str, Any]],
) -> Message:
    """Build an A2A Message with text + custom `kind: "tool_call"` parts.

    Bypasses Pydantic validation via `model_construct` so the non-standard
    `tool_call` kind survives serialization (a2a-sdk's Part discriminator
    only knows text/data/file).
    """
    parts: list[Any] = []
    if text:
        parts.append({"kind": "text", "text": text})
    for tc in tool_calls:
        parts.append({
            "kind": "tool_call",
            "name": tc["name"],
            "arguments": tc.get("arguments", {}),
            "callId": tc.get("callId", ""),
        })
    return Message.model_construct(
        role="agent",
        parts=parts,
        messageId=uuid.uuid4().hex,
        kind="message",
        contextId=context_id,
    )


class Sprint4PurpleExecutor(AgentExecutor):
    """Generalist purple-agent executor for Sprint 4 benchmarks.

    Auto-selects between Pi-Bench tool-calling mode and default text mode
    per incoming message. Conversation history is keyed by context_id and
    kept separate per mode so tool-call protocol doesn't bleed into plain
    text exchanges.
    """

    def __init__(self, model: str | None = None):
        # Treat empty-string env values as unset so Amber's `${config.x}`
        # substitution with an empty default doesn't break the OpenAI client.
        base_url = os.getenv("OPENAI_BASE_URL") or None
        self.client = AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY"),
            base_url=base_url,
        )
        env_model = os.getenv("LOGOMESH_PURPLE_MODEL") or None
        self.model = model or env_model or "gpt-4.1"
        self.system_prompt = SPRINT4_SYSTEM_PROMPT
        # Default-mode history: list of {role, content} per context_id
        self._history: dict[str, list[dict[str, Any]]] = {}
        # Pi-Bench-mode history: OpenAI chat-completions message list per context_id
        self._pb_history: dict[str, list[dict[str, Any]]] = {}
        # Pi-Bench tool schemas snapshot per context_id (for tool-result rounds).
        self._pb_history_tools: dict[str, list[dict[str, Any]]] = {}

    async def execute(self, context: RequestContext, event_queue: EventQueue) -> None:
        msg = context.message
        if not msg:
            raise ServerError(error=InvalidParamsError(message="Missing message."))

        message_text = context.get_user_input() or ""
        pb_request = _try_parse_pibench_request(message_text)
        if pb_request is not None:
            await self._execute_pibench(context, event_queue, pb_request)
            return

        await self._execute_default(context, event_queue, message_text)

    async def _execute_default(
        self,
        context: RequestContext,
        event_queue: EventQueue,
        message_text: str,
    ) -> None:
        task = context.current_task
        if not task:
            task = new_task(context.message)
            await event_queue.enqueue_event(task)

        updater = TaskUpdater(event_queue, task.id, task.context_id)
        context_id = task.context_id or task.id

        try:
            logger.info("default-mode task %s received (%d chars)", task.id, len(message_text))

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
            logger.info("default-mode task %s completed (%d chars)", task.id, len(assistant_message))

            artifact_parts: list[Part] = []
            parsed_json = _try_parse_json(assistant_message) if json_mode else None
            if parsed_json is not None:
                artifact_parts.append(Part(root=DataPart(data=parsed_json)))
            artifact_parts.append(Part(root=TextPart(text=assistant_message)))

            await updater.add_artifact(parts=artifact_parts, name="Response")
            await updater.complete()

        except Exception as exc:
            logger.exception("default-mode task %s failed", task.id)
            await updater.failed(
                new_agent_text_message(
                    f"Agent error: {exc}",
                    context_id=context_id,
                    task_id=task.id,
                )
            )

    async def _execute_pibench(
        self,
        context: RequestContext,
        event_queue: EventQueue,
        pb_request: dict[str, Any],
    ) -> None:
        """Pi-Bench tool-calling path.

        Bypasses TaskUpdater entirely — Pi-Bench's engine parses the raw
        JSON-RPC response at `result.message.parts`, so we emit a Message
        directly via event_queue with custom `kind: "tool_call"` parts.
        """
        context_id = context.context_id or pb_request.get("scenario_id", uuid.uuid4().hex)
        is_tool_result_round = "tool_results" in pb_request

        try:
            history = self._pb_history.setdefault(context_id, [
                {"role": "system", "content": self.system_prompt},
            ])

            openai_tools: list[dict[str, Any]] = []
            if is_tool_result_round:
                # Append prior assistant tool_calls (if not already) and the tool results.
                # Pi-Bench passes assistant_tool_calls and tool_results.
                assistant_tool_calls = pb_request.get("assistant_tool_calls", []) or []
                if assistant_tool_calls:
                    tool_calls_msg = {
                        "role": "assistant",
                        "content": None,
                        "tool_calls": [
                            {
                                "id": tc.get("callId") or f"call_{i}",
                                "type": "function",
                                "function": {
                                    "name": tc.get("name", ""),
                                    "arguments": json.dumps(tc.get("arguments", {})),
                                },
                            }
                            for i, tc in enumerate(assistant_tool_calls)
                        ],
                    }
                    history.append(tool_calls_msg)
                for tr in pb_request.get("tool_results", []) or []:
                    history.append({
                        "role": "tool",
                        "tool_call_id": tr.get("callId") or "",
                        "name": tr.get("name", ""),
                        "content": json.dumps(tr.get("result", {})),
                    })
                # No new openai_tools needed; we're feeding results back.
                # Pi-Bench keeps the same tool set across rounds; reuse last seen
                # tools by scanning history for a turn message — but simpler:
                # always supply tools from the most recent envelope we cached.
                openai_tools = self._pb_history_tools.get(context_id, [])
            else:
                # New turn — build user content and snapshot tool schemas.
                tools = pb_request.get("tools", []) or []
                openai_tools = _pibench_tools_to_openai(tools)
                self._pb_history_tools[context_id] = openai_tools

                instruction = pb_request.get("instruction", "")
                environment = pb_request.get("environment", {})
                env_blob = json.dumps(environment, indent=2) if environment else "(empty)"
                user_content = (
                    f"Scenario: {pb_request.get('scenario_id', '')}\n"
                    f"Turn: {pb_request.get('turn_number', 0)}\n"
                    f"Environment state:\n{env_blob}\n\n"
                    f"User instruction:\n{instruction}"
                )
                history.append({"role": "user", "content": user_content})

            logger.info(
                "pibench task scenario=%s turn=%s tool_result_round=%s tools=%d",
                pb_request.get("scenario_id"),
                pb_request.get("turn_number"),
                is_tool_result_round,
                len(openai_tools),
            )

            kwargs: dict[str, Any] = {
                "model": self.model,
                "messages": history,
            }
            if openai_tools:
                kwargs["tools"] = openai_tools

            response = await self.client.chat.completions.create(**kwargs)
            choice = response.choices[0].message
            assistant_text = choice.content or ""
            assistant_tool_calls: list[dict[str, Any]] = []
            if getattr(choice, "tool_calls", None):
                for tc in choice.tool_calls:
                    try:
                        args = json.loads(tc.function.arguments or "{}")
                    except json.JSONDecodeError:
                        args = {"_raw_arguments": tc.function.arguments}
                    assistant_tool_calls.append({
                        "name": tc.function.name,
                        "arguments": args,
                        "callId": tc.id,
                    })

            # Append our assistant turn to history for future rounds.
            history_entry: dict[str, Any] = {"role": "assistant"}
            if assistant_text:
                history_entry["content"] = assistant_text
            else:
                history_entry["content"] = None
            if assistant_tool_calls:
                history_entry["tool_calls"] = [
                    {
                        "id": tc["callId"],
                        "type": "function",
                        "function": {
                            "name": tc["name"],
                            "arguments": json.dumps(tc["arguments"]),
                        },
                    }
                    for tc in assistant_tool_calls
                ]
            history.append(history_entry)

            response_message = _build_response_message(
                context_id=context_id,
                text=assistant_text or None,
                tool_calls=assistant_tool_calls,
            )
            await event_queue.enqueue_event(response_message)
            logger.info(
                "pibench task scenario=%s emitted text=%dchars tool_calls=%d",
                pb_request.get("scenario_id"),
                len(assistant_text),
                len(assistant_tool_calls),
            )

        except Exception as exc:
            logger.exception("pibench task failed")
            # Emit an error message that still satisfies the parser shape.
            err_msg = Message.model_construct(
                role="agent",
                parts=[{"kind": "text", "text": f"Agent error: {exc}"}],
                messageId=uuid.uuid4().hex,
                kind="message",
                contextId=context_id,
            )
            await event_queue.enqueue_event(err_msg)

    async def cancel(self, context: RequestContext, event_queue: EventQueue) -> Task | None:
        raise ServerError(error=UnsupportedOperationError())
