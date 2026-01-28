import argparse
import os
import sys

# Add project root and src directory to path for both local and Docker environments
_project_root = os.path.dirname(os.path.abspath(__file__))
_src_path = os.path.join(_project_root, "src")
for p in [_project_root, _src_path]:
    if p not in sys.path:
        sys.path.insert(0, p)


def start_green_agent(args):
    # Try multiple import paths for Docker compatibility
    try:
        from src.green_logic.server import run_server
    except ImportError:
        from green_logic.server import run_server
    print("[Polyglot] Starting Green Agent...")
    if args.host:
        os.environ["HOST"] = args.host
    if args.port:
        os.environ["PORT"] = str(args.port)
    run_server()


def start_purple_agent(args):
    try:
        from src.purple_logic.agent import run_purple_agent
    except ImportError:
        from purple_logic.agent import run_purple_agent
    print("[Polyglot] Starting Purple Agent...")
    run_purple_agent(args.host, args.port)


def start_red_agent(args):
    try:
        from src.red_logic.agent import run_red_agent
    except ImportError:
        from red_logic.agent import run_red_agent
    print("[Polyglot] Starting Red Agent...")
    run_red_agent(args.host, args.port)


def main():
    parser = argparse.ArgumentParser(description="AgentBeats Polyglot Entrypoint")
    parser.add_argument("--role", choices=["GREEN", "PURPLE", "RED"], required=True)
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument("--card-url", default="")

    args = parser.parse_args()

    if args.role == "GREEN":
        start_green_agent(args)
    elif args.role == "PURPLE":
        start_purple_agent(args)
    elif args.role == "RED":
        start_red_agent(args)


if __name__ == "__main__":
    main()
