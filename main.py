import argparse
import os
import sys

# Ensure the src directory is in the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import only purple and red agents at module level
# Green agent import is delayed to avoid Docker socket dependency
from src.purple_logic.agent import run_purple_agent
from src.red_logic.agent import run_red_agent

def start_green_agent(args):
    """Initializes and runs the Green Agent server."""
    print("[Polyglot] Starting Green Agent...")

    # Import green agent only when needed (avoids Docker socket init for other agents)
    from src.green_logic.server import run_server

    # Set environment variables for the server to use
    if args.host:
        os.environ["HOST"] = args.host
    if args.port:
        os.environ["PORT"] = str(args.port)

    # Run the FastAPI server
    run_server()

def start_purple_agent(args):
    """Initializes and runs the Purple Agent."""
    print("[Polyglot] Starting Purple Agent...")
    
    # Run the Purple Agent server
    run_purple_agent(args.host, args.port)

def start_red_agent(args):
    """Initializes and runs the Red Agent."""
    print("[Polyglot] Starting Red Agent...")
    
    # Run the Red Agent server
    run_red_agent(args.host, args.port)

def main():
    """
    The main entrypoint for the Polyglot Agent.
    Parses command-line arguments to determine which agent role to start.
    """
    parser = argparse.ArgumentParser(description="AgentBeats Polyglot Entrypoint")
    parser.add_argument(
        "--role",
        choices=["GREEN", "PURPLE", "RED"],
        required=True,
        help="The role to play (Evaluator vs Defender vs Attacker)"
    )

    # AgentBeats Platform Requirements
    parser.add_argument("--host", default="0.0.0.0", help="Host to bind to")
    parser.add_argument("--port", type=int, default=8000, help="Port to listen on")
    parser.add_argument("--card-url", default="", help="URL to advertise in the agent card")

    args = parser.parse_args()

    if args.role == "GREEN":
        start_green_agent(args)
    elif args.role == "PURPLE":
        start_purple_agent(args)
    elif args.role == "RED":
        start_red_agent(args)

if __name__ == "__main__":
    main()
