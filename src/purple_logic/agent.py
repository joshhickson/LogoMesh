"""Sprint 4 purple-agent A2A server.

Two protocol paths share one process:
  - Pi-Bench `kind: "data"` bootstrap+turn (PiBenchHandler + middleware)
  - Standard A2A `kind: "text"` (Sprint4PurpleExecutor via a2a-sdk)

PiBenchRouteMiddleware sniffs incoming POST / bodies. Pi-Bench-shape requests
are answered directly with the JSON-RPC envelope Pi-Bench's parser expects.
Everything else falls through to the a2a-sdk Starlette app.
"""

from __future__ import annotations

import logging
import os

import uvicorn
from a2a.server.apps import A2AStarletteApplication
from a2a.server.request_handlers import DefaultRequestHandler
from a2a.server.tasks import InMemoryTaskStore
from a2a.types import AgentCapabilities, AgentCard, AgentSkill
from openai import AsyncOpenAI

try:
    from src.purple_logic.sprint4_executor import Sprint4PurpleExecutor
    from src.purple_logic.pibench_handler import (
        PIBENCH_SYSTEM_PROMPT,
        POLICY_BOOTSTRAP_EXTENSION,
        PiBenchHandler,
    )
    from src.purple_logic.pibench_shim import PiBenchRouteMiddleware
except ImportError:
    from purple_logic.sprint4_executor import Sprint4PurpleExecutor
    from purple_logic.pibench_handler import (
        PIBENCH_SYSTEM_PROMPT,
        POLICY_BOOTSTRAP_EXTENSION,
        PiBenchHandler,
    )
    from purple_logic.pibench_shim import PiBenchRouteMiddleware


SKILL_TAGS = [
    "benchmark",
    "agentx",
    "sprint4",
    "coding",
    "agent-safety",
    "cybersecurity",
    "computer-use",
    "tau2",
    "policy-trace",
    "research",
    "general-purpose",
]


def build_agent_card(host: str, port: int, card_url: str | None) -> AgentCard:
    skill = AgentSkill(
        id="sprint4_generalist",
        name="Sprint 4 Generalist Task Fulfillment",
        description=(
            "Generalist purple agent that solves benchmark tasks across coding, "
            "agent-safety, cybersecurity, computer-use, tau2 dual-control, policy "
            "trace, research, and general-purpose categories. Supports the Pi-Bench "
            "bootstrap extension and OpenAI function-calling tool protocol."
        ),
        tags=SKILL_TAGS,
        examples=[
            "Given a SQL task with schema and question, return JSON with a 'sql' field.",
            "Given a customer-service multi-turn task, follow policy and tool instructions.",
            "Given a policy-compliance scenario, emit the required record_decision tool call.",
            "Given a network diagnosis prompt without live cluster access, produce a reasoned kubectl plan.",
        ],
    )

    return AgentCard(
        name="logomesh_sprint4_purple",
        description=(
            "LogoMesh Sprint 4 purple agent — generalist evaluation participant "
            "for AgentX-AgentBeats Phase 2."
        ),
        url=card_url or f"http://{host}:{port}/",
        version="1.0.0",
        default_input_modes=["text"],
        default_output_modes=["text"],
        capabilities=AgentCapabilities(streaming=True),
        skills=[skill],
    )


def run_purple_agent(host: str, port: int, card_url: str | None = None) -> None:
    print(f"[PurpleAgent] starting Sprint 4 generalist on {host}:{port}")
    if card_url:
        print(f"[PurpleAgent] advertising card url: {card_url}")
    logging.basicConfig(
        level=os.getenv("LOG_LEVEL", "INFO"),
        format="%(asctime)s %(name)s %(levelname)s %(message)s",
    )

    model = os.getenv("LOGOMESH_PURPLE_MODEL") or "gpt-4.1"

    # Shared OpenAI client so both protocol paths use the same auth + base URL.
    base_url = os.getenv("OPENAI_BASE_URL") or None
    openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"), base_url=base_url)

    executor = Sprint4PurpleExecutor(model=model)
    # Reuse the executor's already-configured client for the pi-bench handler so
    # any future model/endpoint changes only need to land in one place.
    executor.client = openai_client
    pibench_handler = PiBenchHandler(openai_client=openai_client, model=model)

    agent_card = build_agent_card(host, port, card_url)

    request_handler = DefaultRequestHandler(
        agent_executor=executor,
        task_store=InMemoryTaskStore(),
    )

    a2a_app = A2AStarletteApplication(
        agent_card=agent_card,
        http_handler=request_handler,
    )
    starlette_app = a2a_app.build()
    starlette_app.add_middleware(PiBenchRouteMiddleware, handler=pibench_handler)

    uvicorn.run(starlette_app, host=host, port=port, timeout_keep_alive=300)
