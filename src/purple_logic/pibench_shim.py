"""Starlette middleware: route Pi-Bench-shaped POST / requests to PiBenchHandler.

Pi-Bench's `domain: all` benchmark uses a non-standard A2A protocol — JSON-RPC
message/send with `parts[0].kind == "data"` carrying bootstrap/turn payloads,
expecting responses with `result.status.message.parts[0].data` containing
`tool_calls` (OpenAI function-call list) or `content`. The a2a-sdk's
discriminator-typed Part and TaskUpdater abstractions don't model this
protocol, so we handle pi-bench requests directly with PiBenchHandler and let
everything else fall through to the standard a2a-sdk app (tau2 and any other
text-protocol greens).

Implementation note: when a request body matches pi-bench shape we return the
crafted JSON response without invoking call_next. For all other requests we
re-emit the buffered body into the ASGI receive stream so the downstream a2a
handler can consume it normally.
"""

from __future__ import annotations

import json
import logging
from typing import Any, Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from .pibench_handler import PiBenchHandler, is_pibench_request

logger = logging.getLogger("pibench")


class PiBenchRouteMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, handler: PiBenchHandler):
        super().__init__(app)
        self.handler = handler

    async def dispatch(self, request: Request, call_next: Callable):
        if request.url.path != "/" or request.method != "POST":
            return await call_next(request)

        try:
            body_bytes = await request.body()
        except Exception:
            return await call_next(request)

        try:
            body = json.loads(body_bytes)
        except (json.JSONDecodeError, UnicodeDecodeError):
            return await self._pass_through(request, call_next, body_bytes)

        if not is_pibench_request(body):
            return await self._pass_through(request, call_next, body_bytes)

        try:
            response_body = await self.handler.handle(body)
        except Exception as exc:
            logger.exception("pibench handler crashed")
            response_body = {
                "jsonrpc": "2.0",
                "id": body.get("id"),
                "error": {"code": -32603, "message": f"Internal error: {exc}"},
            }
        return JSONResponse(response_body)

    async def _pass_through(self, request: Request, call_next: Callable, body_bytes: bytes) -> Response:
        # Re-emit the buffered body into ASGI receive so the downstream
        # handler can read the request normally.
        async def receive() -> dict[str, Any]:
            return {
                "type": "http.request",
                "body": body_bytes,
                "more_body": False,
            }

        request._receive = receive  # type: ignore[attr-defined]
        return await call_next(request)
