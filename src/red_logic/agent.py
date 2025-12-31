import os
import uvicorn
from a2a.server.apps import A2AStarletteApplication
from a2a.server.request_handlers import DefaultRequestHandler
from a2a.server.tasks import InMemoryTaskStore
from a2a.types import AgentCard, AgentCapabilities

# Import the executor from the scenario
from scenarios.security_arena.agents.generic_attacker import GenericAttackerExecutor

def run_red_agent(host: str, port: int):
    """
    Starts the Red Agent (Attacker) service using the GenericAttackerExecutor.
    """
    print(f"[RedAgent] Starting Attacker on {host}:{port}")

    # Create agent card
    agent_card = AgentCard(
        name="red_agent",
        description="Polyglot Red Agent (Attacker)",
        url=f"http://{host}:{port}/",
        version="1.0.0",
        default_input_modes=["text"],
        default_output_modes=["text"],
        capabilities=AgentCapabilities(streaming=False),
        skills=[]
    )

    # Create executor
    # Allow model override via env var
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    executor = GenericAttackerExecutor(model=model)

    # Create A2A application
    task_store = InMemoryTaskStore()
    request_handler = DefaultRequestHandler(
        agent_executor=executor,
        task_store=task_store
    )

    app = A2AStarletteApplication(
        agent_card=agent_card,
        http_handler=request_handler
    )

    # Start server
    uvicorn.run(app.build(), host=host, port=port)
