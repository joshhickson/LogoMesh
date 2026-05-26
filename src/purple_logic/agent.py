"""Sprint 4 purple-agent A2A server.

Exposes the LogoMesh purple agent via the A2A protocol so AgentX-AgentBeats
green agents can dispatch assessments against it. The agent card declares a
single broad skill so the platform's Quick Submit flow can target this purple
at any of the Sprint 4 green-agent benchmarks (≥5 greens / ≥3 categories
required for judging eligibility).
"""

from __future__ import annotations

import os

import uvicorn
from a2a.server.apps import A2AStarletteApplication
from a2a.server.request_handlers import DefaultRequestHandler
from a2a.server.tasks import InMemoryTaskStore
from a2a.types import AgentCapabilities, AgentCard, AgentSkill

try:
    from src.purple_logic.sprint4_executor import Sprint4PurpleExecutor
except ImportError:
    from purple_logic.sprint4_executor import Sprint4PurpleExecutor


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
            "trace, research, and general-purpose categories. Detects expected "
            "output format from incoming messages (JSON, plain text, structured "
            "artifacts) and responds accordingly."
        ),
        tags=SKILL_TAGS,
        examples=[
            "Given a SQL task with schema and question, return JSON with a 'sql' field.",
            "Given a customer-service multi-turn task, follow policy and tool instructions.",
            "Given a policy-compliance scenario, emit a structured verdict, using AMBIGUOUS_POLICY when scope is unclear.",
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

    model = os.getenv("LOGOMESH_PURPLE_MODEL", "gpt-4.1")
    executor = Sprint4PurpleExecutor(model=model)
    agent_card = build_agent_card(host, port, card_url)

    request_handler = DefaultRequestHandler(
        agent_executor=executor,
        task_store=InMemoryTaskStore(),
    )

    app = A2AStarletteApplication(
        agent_card=agent_card,
        http_handler=request_handler,
    )

    uvicorn.run(app.build(), host=host, port=port, timeout_keep_alive=300)
