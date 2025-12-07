"""LogoMesh Green Agent - Entry Point."""

import os
import sys
from pathlib import Path

# Add the vendor agentbeats to path if not installed via pip
VENDOR_PATH = Path(__file__).parent.parent.parent.parent.parent / "vendor" / "agentbeats" / "src"
if VENDOR_PATH.exists():
    sys.path.insert(0, str(VENDOR_PATH))

import agentbeats as ab

# Import tools to register them with agentbeats
from logomesh_green import tools  # noqa: F401


def main():
    """Main entry point for the LogoMesh Green Agent."""
    # Configuration from environment
    agent_host = os.getenv("AGENT_HOST", "0.0.0.0")
    agent_port = int(os.getenv("AGENT_PORT", "9040"))
    model_type = os.getenv("MODEL_TYPE", "openai")
    model_name = os.getenv("MODEL_NAME", "gpt-4o-mini")

    # Determine the path to agent_card.toml
    agent_card_path = Path(__file__).parent.parent.parent / "agent_card.toml"
    if not agent_card_path.exists():
        agent_card_path = Path("agent_card.toml")
    if not agent_card_path.exists():
        print(f"Error: agent_card.toml not found at {agent_card_path}")
        sys.exit(1)

    print(f"Loading agent card from: {agent_card_path}")
    print(f"Starting LogoMesh Green Agent...")
    print(f"  Host: {agent_host}:{agent_port}")
    print(f"  Model: {model_type}/{model_name}")
    print(f"  LOGOMESH_SERVER_URL: {os.getenv('LOGOMESH_SERVER_URL', 'http://localhost:3000')}")

    # Create agent with required parameters
    agent = ab.BeatsAgent(
        name="logomesh-green-agent",
        agent_host=agent_host,
        agent_port=agent_port,
        model_type=model_type,
        model_name=model_name,
    )

    # Load agent card and register tools
    agent.load_agent_card(str(agent_card_path))

    # Register our tools
    for tool_func in [
        tools.get_coding_task,
        tools.send_coding_task,
        tools.evaluate_solution,
        tools.update_battle_process,
        tools.report_on_battle_end,
        tools.orchestrate_evaluation,
    ]:
        agent.register_tool(tool_func)

    # Run the agent
    agent.run()


if __name__ == "__main__":
    main()
