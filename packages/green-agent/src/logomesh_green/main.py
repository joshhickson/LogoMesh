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

# Create the agent instance
agent = ab.BeatsAgent(__name__)


def main():
    """Main entry point for the LogoMesh Green Agent."""
    # Determine the path to agent_card.toml
    # When running from packages/green-agent, it's in the current directory
    # When running as installed package, we need to find it
    agent_card_path = Path(__file__).parent.parent.parent / "agent_card.toml"

    if not agent_card_path.exists():
        # Try current working directory
        agent_card_path = Path("agent_card.toml")

    if not agent_card_path.exists():
        print(f"Error: agent_card.toml not found at {agent_card_path}")
        sys.exit(1)

    print(f"Loading agent card from: {agent_card_path}")
    agent.load_agent_card(str(agent_card_path))

    print("Starting LogoMesh Green Agent...")
    print(f"  LOGOMESH_SERVER_URL: {os.getenv('LOGOMESH_SERVER_URL', 'http://localhost:3000')}")
    print(f"  Agent Port: 9040")

    agent.run()


if __name__ == "__main__":
    main()
