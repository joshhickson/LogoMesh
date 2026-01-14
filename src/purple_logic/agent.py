import os
import uvicorn
from a2a.server.apps import A2AStarletteApplication
from a2a.server.request_handlers import DefaultRequestHandler
from a2a.server.tasks import InMemoryTaskStore
from a2a.types import AgentCard, AgentCapabilities

# Import the executor from the scenario
# Ensure 'scenarios' is in the python path (handled by main.py or env)
from scenarios.security_arena.agents.generic_defender import GenericDefenderExecutor

def run_purple_agent(host: str, port: int):
    """
    Starts the Purple Agent (Defender) service using the GenericDefenderExecutor.
    """
    print(f"[PurpleAgent] Starting Defender on {host}:{port}")

    # Create agent card
    # We use the host/port provided to construct the URL
    agent_card = AgentCard(
        name="purple_agent",
        description="Polyglot Purple Agent (Defender) - Streaming Enabled",
        url=f"http://{host}:{port}/",
        version="1.0.0",
        default_input_modes=["text"],
        default_output_modes=["text"],
        capabilities=AgentCapabilities(streaming=True),  # Enable streaming
        skills=[]
    )

    # Create executor
    # Allow model override via env var
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    executor = GenericDefenderExecutor(model=model)

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
