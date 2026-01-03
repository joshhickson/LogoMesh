> **Status:** ACTIVE
> **Type:** Guide
> **Context:**
> *   [2025-12-29]: A step-by-step execution guide for Porting the Green Agent (Phase 4). Created to provide a deterministic source of truth for local execution.

# Phase 4: Green Agent Porting Guide

**Objective:** Migrate the Green Agent logic from the legacy `green-agent/` directory to the new `src/green_logic/` structure, wire it to the `main.py` entrypoint, and clean up old artifacts.

---

## Step 1: Cleanup (Deletions)
Execute the following commands to remove legacy directories that have been superseded.

```bash
# Delete legacy agent directories
rm -rf green-agent/
rm -rf purple-agent/

# Delete the external directory (contents were moved to root in Phase 3A)
rm -rf external/
```

---

## Step 2: Create Green Agent Logic
Create the following files in `src/green_logic/`.

### 2.1. Create Directory
```bash
mkdir -p src/green_logic
touch src/green_logic/__init__.py
```

### 2.2. Create `src/green_logic/tasks.py`
This file defines the coding challenges the Green Agent sends.

```python
# Coding tasks to send to purple agents
CODING_TASKS = [
    {
        "id": "task-001",
        "title": "Email Validator",
        "description": """
Implement an email validation function with the following requirements:

1. Create a function `validate_email(email: str) -> dict`
2. Return {"valid": True/False, "reason": "explanation"}
3. Check for:
   - Presence of exactly one @ symbol
   - Non-empty local part (before @)
   - Valid domain (after @) with at least one dot
   - No spaces allowed
4. Handle edge cases gracefully

Provide your response as JSON with:
- sourceCode: Your implementation
- testCode: Unit tests (recommended)
- rationale: Explain your design decisions
"""
    },
    {
        "id": "task-002",
        "title": "Rate Limiter",
        "description": """
Implement a rate limiter class with the following requirements:

1. Create a class `RateLimiter` with a method `is_allowed(client_id: str) -> bool`
2. Limit clients to 10 requests per minute
3. Use an in-memory store (e.g., a dictionary)
4. The method should return `True` if the request is allowed, `False` otherwise
5. Ensure the solution is efficient and handles multiple clients

Provide your response as JSON with:
- sourceCode: Your implementation
- testCode: Unit tests (recommended)
- rationale: Explain your design decisions
"""
    },
    {
        "id": "task-003",
        "title": "LRU Cache",
        "description": """
Implement an LRU (Least Recently Used) Cache with the following requirements:

1. Create a class `LRUCache` with a fixed capacity
2. Implement `get(key)` and `put(key, value)` methods
3. If the cache is full, the `put` operation should evict the least recently used item
4. The cache should store key-value pairs
5. Both get and put should be O(1) operations

Provide your response as JSON with:
- sourceCode: Your implementation
- testCode: Unit tests (recommended)
- rationale: Explain your design decisions
"""
    }
]
```

### 2.3. Create `src/green_logic/agent.py`
This file defines the core agent class.

```python
import json

class GreenAgent:
    """
    The Green Agent is responsible for evaluating the performance of other agents
    based on the "Contextual Debt" framework.
    """

    def submit_result(self, result: dict):
        """
        Submits the final evaluation result.

        Args:
            result: A dictionary containing the evaluation results, including
                    'battle_id', 'score', and 'breakdown'.
        """
        # TODO: Implement SQLite persistence as per the migration manifest.
        # The result JSON should be saved to `data/battles.db`.

        battle_id = result.get("battle_id", "N/A")
        score = result.get("score", 0.0)
        breakdown = result.get("breakdown", "No breakdown provided.")

        # Print to console for visibility (fallback from original implementation)
        print("\n" + "=" * 60)
        print(f"BATTLE EVALUATION COMPLETE: {battle_id}")
        print("=" * 60)
        print(f"Contextual Debt Score: {score:.2f}")
        print("-" * 60)
        print("Score Breakdown:")
        print(breakdown)
        print("=" * 60 + "\n")

        # The original tool returned a JSON string for confirmation.
        # This can be logged or sent to another service in the future.
        confirmation = {
            "status": "reported",
            "battle_id": battle_id,
            "contextual_debt_score": score,
        }
        print(f"[GreenAgent] Confirmation: {json.dumps(confirmation, indent=2)}")
```

### 2.4. Create `src/green_logic/server.py`
This file implements the FastAPI server for A2A communication.

```python
import os
import json
import random
import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

from .agent import GreenAgent
from .tasks import CODING_TASKS

# --- Data Models ---
class SendTaskRequest(BaseModel):
    purple_agent_url: str
    battle_id: str

class ReportResultRequest(BaseModel):
    battle_id: str
    score: float
    breakdown: str

# --- Server Setup ---
app = FastAPI(
    title="Green Agent (Polyglot)",
    description="Agent for evaluating contextual debt of other agents.",
)

# In a real app, this might be a singleton or have a more complex lifecycle
agent = GreenAgent()

# --- Endpoints ---
@app.post("/actions/send_coding_task")
async def send_coding_task_action(request: SendTaskRequest):
    """
    Selects a random coding task and sends it to the Purple Agent for evaluation.
    This replicates the logic from the original send_coding_task tool.
    """
    task = random.choice(CODING_TASKS)
    # Network Hardening: Use env var if provided, else fallback to request param
    purple_agent_url = os.getenv("PURPLE_AGENT_URL", request.purple_agent_url)

    task_prompt = f"""CODING TASK: {task['title']}

{task['description']}

IMPORTANT: Respond with valid JSON only (no markdown code blocks):
{{"sourceCode": "...", "testCode": "...", "rationale": "..."}}"""

    try:
        async with httpx.AsyncClient(timeout=300.0) as client:
            # Clean URL and append slash if needed
            target = purple_agent_url.rstrip('/') + '/'

            response = await client.post(
                target,
                json={
                    "jsonrpc": "2.0",
                    "method": "message/send",
                    "params": {
                        "message": {
                            "messageId": f"task-{request.battle_id}",
                            "role": "user",
                            "parts": [{"type": "text", "text": task_prompt}]
                        }
                    },
                    "id": request.battle_id
                },
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            return response.json()
    except httpx.TimeoutException:
        raise HTTPException(status_code=408, detail="Request to Purple Agent timed out.")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"Error from Purple Agent: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unknown error occurred: {str(e)}")

@app.post("/actions/report_result")
async def report_result_action(request: ReportResultRequest):
    """
    Receives the final evaluation result and logs it.
    This endpoint wraps the GreenAgent's submit_result method.
    """
    result_data = {
        "battle_id": request.battle_id,
        "score": request.score,
        "breakdown": request.breakdown,
    }
    # The agent method handles the actual reporting (e.g., printing, saving to DB)
    agent.submit_result(result_data)
    return {"status": "reported", "battle_id": request.battle_id}

def run_server():
    """A helper function to run the server for the main entrypoint."""
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 9040))
    print(f"[GreenAgent] Starting server on {host}:{port}")
    uvicorn.run(app, host=host, port=port)
```

---

## Step 3: Update Entrypoint
Overwrite `main.py` at the root with this content to wire up the new server.

```python
import argparse
import os
import sys

# Ensure the src directory is in the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.green_logic.server import run_server

def start_green_agent(args):
    """Initializes and runs the Green Agent server."""
    print("[Polyglot] Starting Green Agent...")

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
    print(" (Logic not yet ported)")
    # TODO: Import and run purple agent logic from src/blue_logic

def main():
    """
    The main entrypoint for the Polyglot Agent.
    Parses command-line arguments to determine which agent role to start.
    """
    parser = argparse.ArgumentParser(description="AgentBeats Polyglot Entrypoint")
    parser.add_argument(
        "--role",
        choices=["GREEN", "PURPLE"],
        required=True,
        help="The role to play (Evaluator vs Defender)"
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

if __name__ == "__main__":
    main()
```

---

## Step 4: Verification
Run these commands to verify the migration.

1.  **Check File Structure:**
    ```bash
    ls -R src/green_logic
    ```
    *Expected:* `__init__.py`, `agent.py`, `server.py`, `tasks.py`

2.  **Verify Entrypoint:**
    ```bash
    python3 main.py --help
    ```
    *Expected:* Output showing usage instructions for `--role`.

3.  **Build Container (Final Check):**
    ```bash
    docker build -t polyglot-agent .
    ```
    *Expected:* Success (or failure on `pnpm install` / `uv sync` if dependencies aren't aligned, but `COPY` steps should pass).
