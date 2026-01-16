import os
import uvicorn
from a2a.server.apps import A2AStarletteApplication
from a2a.server.request_handlers import DefaultRequestHandler
from a2a.server.tasks import InMemoryTaskStore
from a2a.types import AgentCard, AgentCapabilities

# Import executors
from scenarios.security_arena.agents.generic_attacker import GenericAttackerExecutor

# Try to import the new V2 executor
try:
    from .executor import RedAgentV2Executor
    from .orchestrator import AttackConfig
    V2_AVAILABLE = True
except ImportError as e:
    print(f"[RedAgent] Warning: RedAgentV2 not available: {e}")
    V2_AVAILABLE = False


def run_red_agent(host: str, port: int, use_v2: bool = True):
    """
    Starts the Red Agent (Attacker) service.

    Args:
        host: Host to bind to
        port: Port to bind to
        use_v2: If True, use the new hybrid RedAgentV2. If False, use legacy GenericAttacker.
    """
    # Check environment variable override
    use_v2_env = os.getenv("RED_AGENT_V2", "true").lower() == "true"
    use_v2 = use_v2 and use_v2_env and V2_AVAILABLE

    version = "2.0.0 (Hybrid)" if use_v2 else "1.0.0 (Legacy)"
    print(f"[RedAgent] Starting Attacker v{version} on {host}:{port}")

    # Create agent card
    agent_card = AgentCard(
        name="red_agent_v2" if use_v2 else "red_agent",
        description="Hybrid Red Agent with multi-layer attack engine" if use_v2 else "Polyglot Red Agent (Attacker)",
        url=f"http://{host}:{port}/",
        version=version,
        default_input_modes=["text"],
        default_output_modes=["text"],
        capabilities=AgentCapabilities(streaming=False),
        skills=[]
    )

    # Create executor based on version
    if use_v2:
        # Configure the attack engine
        config = AttackConfig(
            enable_smart_layer=True,
            enable_reflection=True,
            max_total_time=float(os.getenv("RED_AGENT_TIMEOUT", "60")),
            smart_layer_timeout=float(os.getenv("RED_SMART_TIMEOUT", "30")),
            reflection_timeout=float(os.getenv("RED_REFLECT_TIMEOUT", "20")),
        )
        executor = RedAgentV2Executor(config=config)
        print(f"[RedAgent] Using RedAgentV2 with:")
        print(f"  - Smart layer: enabled (timeout: {config.smart_layer_timeout}s)")
        print(f"  - Reflection: enabled (timeout: {config.reflection_timeout}s)")
        print(f"  - Max total time: {config.max_total_time}s")
    else:
        # Legacy executor
        model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        executor = GenericAttackerExecutor(model=model)
        print(f"[RedAgent] Using legacy GenericAttacker with model: {model}")

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
