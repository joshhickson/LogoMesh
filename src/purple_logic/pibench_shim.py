"""Starlette middleware: inject `result.message` into JSON-RPC responses.

Pi-Bench's green-agent engine parses purple responses by reading
`response.result.message.parts` directly from the JSON-RPC body
(RDI-Foundation/pi-bench-agentbeats engine.py `_parse_a2a_response`).
Standard A2A responses don't nest the message under `result.message` —
they put it at `result.parts` (Message response) or
`result.status.message.parts` / `result.artifacts[].parts` (Task response).

This middleware leaves the existing fields intact and additionally exposes
the response message at `result.message`, which is what Pi-Bench's parser
expects. Tau2-bench and other A2A SDK clients ignore the extra field
because they decode against the typed schema.
"""

from __future__ import annotations

import json
from typing import Any

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


def _extract_message(result: dict[str, Any]) -> dict[str, Any] | None:
    """Find the response message inside a JSON-RPC result body."""
    # Direct Message response: result is a Message with kind == "message".
    if result.get("kind") == "message" and isinstance(result.get("parts"), list):
        return {
            "kind": "message",
            "role": result.get("role"),
            "parts": result["parts"],
            "messageId": result.get("messageId"),
            "contextId": result.get("contextId"),
        }
    # Task response with terminal status.message.
    status = result.get("status")
    if isinstance(status, dict):
        status_msg = status.get("message")
        if isinstance(status_msg, dict) and isinstance(status_msg.get("parts"), list):
            return status_msg
    # Task response with artifacts (concatenate their parts as a single message).
    artifacts = result.get("artifacts")
    if isinstance(artifacts, list) and artifacts:
        collected: list[dict[str, Any]] = []
        for art in artifacts:
            if isinstance(art, dict) and isinstance(art.get("parts"), list):
                collected.extend(art["parts"])
        if collected:
            return {"kind": "message", "role": "agent", "parts": collected}
    return None


class PiBenchResponseShimMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Only intervene on the A2A JSON-RPC endpoint.
        if request.url.path != "/" or request.method != "POST":
            return await call_next(request)

        response = await call_next(request)

        body_bytes = b""
        async for chunk in response.body_iterator:
            body_bytes += chunk

        # Anything other than a JSON body is passed through untouched.
        content_type = response.headers.get("content-type", "")
        if "application/json" not in content_type.lower():
            return Response(
                content=body_bytes,
                status_code=response.status_code,
                headers=dict(response.headers),
                media_type=content_type or None,
            )

        try:
            data = json.loads(body_bytes)
        except (json.JSONDecodeError, UnicodeDecodeError):
            return Response(
                content=body_bytes,
                status_code=response.status_code,
                headers=dict(response.headers),
                media_type=content_type,
            )

        result = data.get("result")
        if isinstance(result, dict) and "message" not in result:
            msg = _extract_message(result)
            if msg is not None:
                data["result"]["message"] = msg

        new_body = json.dumps(data).encode("utf-8")
        # Rebuild headers (Content-Length must be re-computed).
        new_headers = {k: v for k, v in response.headers.items() if k.lower() != "content-length"}
        new_headers["content-length"] = str(len(new_body))
        return Response(
            content=new_body,
            status_code=response.status_code,
            headers=new_headers,
            media_type="application/json",
        )
