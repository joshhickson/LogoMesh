---
status: ACTIVE
type: Guide
---
> **Context:**
> *   [2025-12-31]: A step-by-step execution guide for Porting the Purple Agent (Phase 5).

# Phase 5: Purple Agent Porting Guide

**Objective:** Migrate the Purple Agent (Defender) logic from the "Lambda Track" source (now in `src/agentbeats/`) to the Polyglot structure, wire it to the `main.py` entrypoint, and verify A2A communication.

**Note:** The "Purple Agent" in this context is the "Defender" from the Lambda Track. The source code was already moved to `src/agentbeats/` during the initial scaffolding (Phase 3A), but it needs to be exposed as a "Purple Agent" service.

---

## Step 1: Verify Source Code
The source code should already exist in `src/agentbeats/`. We need to confirm it contains the necessary logic to act as a Defender.

```bash
# List contents of the agentbeats package
ls -R src/agentbeats/
```

*   **Verification:** Look for `client.py` (A2A Client/Server logic) or `run_scenario.py`.

## Step 2: Create Purple Agent Wrapper
We need a clean entrypoint for the Purple Agent that matches the `main.py` expectations. We will create `src/purple_logic/` to house this wrapper, importing the core logic from `src/agentbeats/`.

### 2.1. Create Directory
```bash
mkdir -p src/purple_logic
touch src/purple_logic/__init__.py
```

### 2.2. Create `src/purple_logic/agent.py`
This file will wrap the existing `agentbeats` logic to run as a standalone server.

```python
import os
import uvicorn
from fastapi import FastAPI
from src.agentbeats.client import AgentBeatsClient 
# Note: We might need to adapt 'client.py' if it's designed as a CLI tool.
# For now, we assume we can instantiate the server/app from it.

def run_purple_agent(host: str, port: int):
    """
    Starts the Purple Agent (Defender) service.
    """
    print(f"[PurpleAgent] Starting Defender on {host}:{port}")
    
    # TODO: Inspect src/agentbeats/client.py to see how to start the server.
    # If it uses A2AStarletteApplication, we can run it with uvicorn.
    
    # Placeholder implementation until we inspect the code:
    app = FastAPI(title="Purple Agent (Defender)")
    
    @app.post("/")
    async def handle_rpc(request: dict):
        return {"jsonrpc": "2.0", "result": "Purple Agent Ready", "id": request.get("id")}

    uvicorn.run(app, host=host, port=port)
```

## Step 3: Update Entrypoint
Update `main.py` to import and run the Purple Agent.

```python
# ... existing imports ...
from src.purple_logic.agent import run_purple_agent

# ... existing code ...

def start_purple_agent(args):
    """Initializes and runs the Purple Agent."""
    print("[Polyglot] Starting Purple Agent...")
    
    host = args.host or os.getenv("HOST", "0.0.0.0")
    port = args.port or int(os.getenv("PORT", 9050)) # Default to 9050 for Purple
    
    run_purple_agent(host, port)
```

## Step 4: Verification
1.  **Run Help:** `uv run main.py --help`
2.  **Run Purple Agent (Dry Run):** `uv run main.py --role PURPLE`
3.  **Docker Build:** `docker build -t polyglot-agent .`

