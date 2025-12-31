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
    red_agent_url: str | None = None  # Optional for now, but recommended
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
    Orchestrates the "Iron Sharpens Iron" loop:
    1. Sends coding task to Purple Agent (Defender).
    2. (Optional) Sends Purple's code to Red Agent (Attacker).
    3. Returns the combined results.
    """
    task = random.choice(CODING_TASKS)
    
    # Network Hardening: Use env var if provided, else fallback to request param
    purple_agent_url = os.getenv("PURPLE_AGENT_URL", request.purple_agent_url)
    red_agent_url = os.getenv("RED_AGENT_URL", request.red_agent_url)

    task_prompt = f"""CODING TASK: {task['title']}

{task['description']}

IMPORTANT: Respond with valid JSON only (no markdown code blocks):
{{"sourceCode": "...", "testCode": "...", "rationale": "..."}}"""

    try:
        async with httpx.AsyncClient(timeout=300.0) as client:
            # --- Step 1: Purple Agent (Defense) ---
            purple_target = purple_agent_url.rstrip('/') + '/'
            
            purple_response = await client.post(
                purple_target,
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
            purple_response.raise_for_status()
            purple_result = purple_response.json()
            
            # Extract code from Purple's response (simplified extraction for POC)
            # In a real scenario, we'd parse the JSON from the text part.
            purple_content = purple_result.get("result", {}).get("message", {}).get("parts", [{}])[0].get("text", "")

            # --- Step 2: Red Agent (Attack) ---
            red_result = None
            if red_agent_url:
                red_target = red_agent_url.rstrip('/') + '/'
                
                attack_prompt = f"""ATTACK OBJECTIVE:
You are a Red Team agent. Your goal is to find vulnerabilities in the following code.

TARGET CODE:
{purple_content}

INSTRUCTIONS:
Identify security flaws, logic errors, or edge cases.
Provide a proof-of-concept exploit if possible."""

                red_response = await client.post(
                    red_target,
                    json={
                        "jsonrpc": "2.0",
                        "method": "message/send",
                        "params": {
                            "message": {
                                "messageId": f"attack-{request.battle_id}",
                                "role": "user",
                                "parts": [{"type": "text", "text": attack_prompt}]
                            }
                        },
                        "id": request.battle_id
                    },
                    headers={"Content-Type": "application/json"}
                )
                red_response.raise_for_status()
                red_result = red_response.json()

            return {
                "battle_id": request.battle_id,
                "task": task,
                "purple_response": purple_result,
                "red_response": red_result
            }

    except httpx.TimeoutException:
        raise HTTPException(status_code=408, detail="Request to Agent timed out.")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"Error from Agent: {e}")
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
