import os
import json
import random
import httpx
import asyncio
import time
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
import uvicorn

from .agent import GreenAgent
from .tasks import CODING_TASKS
from .scoring import ContextualIntegrityScorer
from .analyzer import SemanticAuditor
from .generator import TestGenerator

# --- Sandbox Initialization (with Docker fallback) ---
def _init_sandbox():
    """Initialize sandbox with fallback if Docker unavailable."""
    try:
        from .sandbox import Sandbox
        sb = Sandbox(timeout=5)
        print("[GreenAgent] Docker sandbox initialized successfully")
        return sb
    except Exception as e:
        print(f"[GreenAgent] WARNING: Docker unavailable ({e}), sandbox disabled")
        return None

# --- Data Models ---
class SendTaskRequest(BaseModel):
    purple_agent_url: str
    red_agent_url: str | None = None  # Optional for now, but recommended
    battle_id: str
    task_id: str | None = None  # Force a specific task
    files: dict[str, str] | None = None # For Task 1.5: Input Contract Definition
    custom_task: dict[str, str] | None = None
    # AgentBeats participant IDs (UUIDs) for leaderboard tracking
    participant_ids: dict[str, str] | None = None  # e.g., {"baseline": "019bc6a4-..."}

class ReportResultRequest(BaseModel):
    battle_id: str
    score: float
    breakdown: str

# --- Server Setup ---
app = FastAPI(
    title="Green Agent (Polyglot)",
    description="Agent for evaluating contextual debt of other agents.",
)

# --- Agent Card (required for AgentBeats health checks) ---
AGENT_CARD = {
    "name": "green_agent",
    "description": "Polyglot Green Agent (Evaluator) - LogoMesh Arena",
    "url": "",  # Will be set dynamically
    "version": "1.0.0",
    "defaultInputModes": ["text"],
    "defaultOutputModes": ["text"],
    "capabilities": {"streaming": False},
    "skills": []
}

@app.get("/.well-known/agent-card.json")
async def get_agent_card(request: Request):
    """Return agent card for A2A protocol discovery."""
    # Set URL dynamically from request
    base_url = str(request.base_url).rstrip('/')
    card = AGENT_CARD.copy()
    card["url"] = f"{base_url}/"
    return card

# In a real app, this might be a singleton or have a more complex lifecycle
agent = GreenAgent()
scorer = ContextualIntegrityScorer()
auditor = SemanticAuditor()
sandbox = _init_sandbox()  # May be None if Docker unavailable
test_generator = TestGenerator()

# Streaming configuration
STALL_THRESHOLD = 30.0  # seconds without token = hung inference

async def stream_purple_response(client: httpx.AsyncClient, purple_url: str, payload: dict, battle_id: str):
    """
    Call Purple Agent with natural completion detection (F-001 Phase 2).
    Uses stall detection instead of arbitrary timeouts.
    Returns the extracted response text from the Purple Agent.
    """
    purple_target = purple_url.rstrip('/') + '/'
    last_activity = time.time()
    
    print(f"[Natural Completion] Starting Purple Agent request for battle {battle_id}")
    
    try:
        # No timeout - wait for natural completion, only stall detection active
        async with client.stream("POST", purple_target, json=payload, headers={"Content-Type": "application/json"}, timeout=None) as response:
            response.raise_for_status()
            
            # Check if response is streaming (SSE) or complete JSON
            content_type = response.headers.get("content-type", "")
            
            if "text/event-stream" in content_type or "application/x-ndjson" in content_type:
                # Streaming response - read events
                print(f"[Natural Completion] Detected streaming response")
                accumulated_text = ""
                
                async for line in response.aiter_lines():
                    current_time = time.time()
                    
                    # Stall detection: 30s without any data
                    if current_time - last_activity > STALL_THRESHOLD:
                        print(f"[Natural Completion] STALL: No activity for {STALL_THRESHOLD}s")
                        raise TimeoutError(f"Inference stalled - no activity for {STALL_THRESHOLD}s")
                    
                    if not line or not line.strip():
                        continue
                    
                    last_activity = current_time
                    
                    # Parse SSE format: "data: {...}"
                    if line.startswith("data: "):
                        try:
                            event_data = json.loads(line[6:])
                            
                            # Extract text from A2A format
                            if "result" in event_data:
                                result = event_data["result"]
                                if "status" in result:
                                    status = result["status"]
                                    if "message" in status:
                                        message = status["message"]
                                        if "parts" in message and len(message["parts"]) > 0:
                                            text_part = message["parts"][0].get("text", "")
                                            if text_part:
                                                accumulated_text = text_part
                                                print(f"[Natural Completion] Received {len(text_part)} chars")
                            
                            # Check for completion signal
                            if event_data.get("type") == "done" or event_data.get("finish_reason"):
                                print(f"[Natural Completion] Stream completed naturally")
                                break
                                
                        except json.JSONDecodeError:
                            continue
                
                if accumulated_text:
                    print(f"[Natural Completion] Extracted {len(accumulated_text)} chars total")
                    return accumulated_text
                else:
                    print(f"[Natural Completion] WARNING: No text accumulated from stream")
                    return ""
            
            else:
                # Non-streaming response - read complete JSON
                print(f"[Natural Completion] Non-streaming response, reading complete JSON")
                content = await response.aread()
                last_activity = time.time()
                
                purple_result = json.loads(content)
                print(f"[Natural Completion] Response received naturally")
                
                # Extract the response text from the standard A2A format
                purple_text = purple_result.get("result", {}).get("status", {}).get("message", {}).get("parts", [{}])[0].get("text", "")
                
                if purple_text:
                    print(f"[Natural Completion] Extracted {len(purple_text)} chars from Purple Agent")
                    return purple_text
                else:
                    print(f"[Natural Completion] WARNING: No text found in response")
                    return ""
                    
    except httpx.TimeoutException:
        # This should never happen with timeout=None, but keep for safety
        print(f"[Natural Completion] Unexpected timeout (should not occur)")
        raise TimeoutError(f"Purple Agent timeout - unexpected")
    except Exception as e:
        print(f"[Natural Completion] Error: {type(e).__name__}: {e}")
        raise

# --- Endpoints ---
@app.post("/actions/send_coding_task")
async def send_coding_task_action(request: SendTaskRequest):
    """
    Orchestrates the "Iron Sharpens Iron" loop:
    1. Sends coding task to Purple Agent (Defender).
    2. (Optional) Sends Purple's code to Red Agent (Attacker).
    3. Evaluates the results using Contextual Integrity Score.
    4. Returns the combined results.
    """
    # Step 0: Handle provided files vs random task
    task_constraints = {}  # Algorithmic constraints for static analysis
    hidden_tests = None    # Green Agent's authoritative tests (Purple cannot cheat)

    if request.files:
        task_title = "User Provided Task"
        task_desc = f"Evaluate the provided files: {json.dumps(list(request.files.keys()))}"
        # If files are provided, we assume the Purple Agent needs to be instructed differently
        # or we are just scoring existing files. For this POC, we'll still send to Purple.
        task_prompt = f"""EVALUATE AND IMPROVE THESE FILES:
{json.dumps(request.files, indent=2)}

IMPORTANT: Respond with valid JSON only:
{{
    "sourceCode": "...",
    "testCode": "...",
    "rationale": "..."
}}"""
    elif request.custom_task:
        task_title = request.custom_task.get("title", "Custom Task")
        task_desc = request.custom_task.get("description", "")
        task_constraints = {}
        hidden_tests = None
        task_prompt = f"""CODING TASK: {task_title}

        {task_desc}

        IMPORTANT: Respond with valid JSON only (no markdown code blocks):
        {{
            "sourceCode": "...",
            "testCode": "...",
            "rationale": "..."
        }}"""

    else:
        if request.task_id:
            try:
                task = next(t for t in CODING_TASKS if t['id'] == request.task_id)
            except StopIteration:
                raise HTTPException(status_code=404, detail=f"Task {request.task_id} not found")
        else:
            # Select a random task from the available set
            task = random.choice(CODING_TASKS)
        
        task_title = task['title']
        task_desc = task['description']
        task_constraints = task.get('constraints', {})
        hidden_tests = task.get('hidden_tests')  # May be None
        task_prompt = f"""CODING TASK: {task_title}

{task_desc}

IMPORTANT: Respond with valid JSON only (no markdown code blocks):
{{
    "sourceCode": "...",
    "testCode": "...",
    "rationale": "..."
}}"""

    # Network Hardening: Use env var if provided, else fallback to request param
    purple_agent_url = os.getenv("PURPLE_AGENT_URL", request.purple_agent_url)
    red_agent_url = os.getenv("RED_AGENT_URL", request.red_agent_url)

    try:
        # --- Step 1: Purple Agent (Defense) with Streaming ---
        purple_target = purple_agent_url.rstrip('/') + '/'
        
        # Use streaming with stall detection (F-001 implementation)
        async with httpx.AsyncClient() as client:
            try:
                purple_text = await stream_purple_response(
                    client, 
                    purple_agent_url, 
                    {
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
                    request.battle_id
                )
                
                if not purple_text:
                    raise ValueError("Purple Agent returned empty response")
                
                print(f"DEBUG: Raw Purple Text (from stream): {purple_text}")
                
            except TimeoutError as te:
                return {
                    "battle_id": request.battle_id,
                    "task_id": request.task_id,
                    "error": f"Purple Agent inference stalled: {te}",
                    "outcome": "ERROR",
                    "timestamp": time.time()
                }
            except Exception as e:
                return {
                    "battle_id": request.battle_id,
                    "task_id": request.task_id,
                    "error": f"Purple Agent failed: {e}",
                    "outcome": "ERROR",
                    "timestamp": time.time()
                }
        
        # Try to parse the JSON inside the text
        try:
            # Clean up markdown code blocks if present
            clean_text = purple_text.strip()
            if clean_text.startswith("```json"):
                clean_text = clean_text[7:]
            elif clean_text.startswith("```"):
                clean_text = clean_text[3:]
            if clean_text.endswith("```"):
                clean_text = clean_text[:-3]
            
            purple_data = json.loads(clean_text.strip())
        except json.JSONDecodeError:
            # Fallback if Purple didn't return pure JSON
            purple_data = {
                "sourceCode": purple_text,
                "rationale": "Parsing failed",
                "testCode": ""
            }


        # --- Step 2: Red Agent (Attack) ---
        red_result_data = None
        if red_agent_url:
            red_target = red_agent_url.rstrip('/') + '/'

            attack_prompt = f"""ATTACK OBJECTIVE:
You are a Red Team agent. Your goal is to find vulnerabilities in the following code.

TARGET CODE:
{purple_data.get('sourceCode', '')}

INSTRUCTIONS:
Identify security flaws, logic errors, or edge cases.
Provide a proof-of-concept exploit if possible."""

            try:
                async with httpx.AsyncClient(timeout=120.0) as red_client:
                    red_response = await red_client.post(
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
                    red_result_data = red_response.json()
            except Exception as e:
                print(f"[GreenAgent] WARNING: Red Agent failed: {e}")
                red_result_data = None

        # --- Step 3: Tier 2 Analysis (Static + Dynamic) ---
        source_code = purple_data.get('sourceCode', '')
        purple_test_code = purple_data.get('testCode', '')

        # Check if source_code is actually a JSON string (Multi-file response)
        sandbox_payload = source_code
        if isinstance(source_code, str):
            trimmed_source = source_code.strip()
            if trimmed_source.startswith('{') and trimmed_source.endswith('}'):
                try:
                    sandbox_payload = json.loads(trimmed_source)
                    print("DEBUG: Detected multi-file JSON payload from Purple Agent.")
                except json.JSONDecodeError:
                    pass # Treat as regular string

        # Step 3.1: Static Analysis (AST)
        # Note: Auditor might need update for multi-file, but for now passing raw string or main file
        audit_source = source_code
        if isinstance(sandbox_payload, dict):
             # For auditing, just concatenate all files or pick main
             audit_source = "\n\n".join(sandbox_payload.values())

        audit_result = auditor.analyze(audit_source, task_constraints)
        print(f"DEBUG: Audit Result: {json.dumps(audit_result, indent=2)}")

        # Step 3.2: Dynamic Execution (Sandbox)
        # CRITICAL: Use hidden_tests if available (prevents Purple from cheating with weak tests)
        # If no hidden tests, generate adversarial tests dynamically using LLM
        sandbox_result = {"success": True, "output": "No tests provided", "duration": 0.0}
        tests_used = "none"
        tests_to_run = ""

        if hidden_tests and hidden_tests.strip():
            # Fast path: Use Green Agent's authoritative hidden tests
            tests_to_run = hidden_tests
            tests_used = "hidden"
            print(f"DEBUG: Using HIDDEN TESTS (static, {len(tests_to_run)} chars)")
        else:
            # Dynamic path: Generate adversarial tests using LLM
            tests_to_run = await test_generator.generate_adversarial_tests(
                task_desc, source_code
            )
            tests_used = "generated"
            print(f"DEBUG: Generated dynamic tests ({len(tests_to_run)} chars)")

        # Run the tests (hidden or generated) if we have any
        # Skip if sandbox unavailable (Docker not accessible in container)
        if sandbox is None:
            sandbox_result = {"success": True, "output": "Sandbox unavailable (no Docker)", "duration": 0.0}
            tests_used = "skipped"
            print(f"DEBUG: Sandbox skipped (Docker unavailable in container environment)")
        elif tests_to_run and tests_to_run.strip():
            sandbox_result = sandbox.run(sandbox_payload, tests_to_run)
        elif isinstance(sandbox_payload, dict):
            # If payload is a dict, it might contain self-contained tests
            # Try running without explicit test code argument
            sandbox_result = sandbox.run(sandbox_payload, "")
            tests_used = "embedded"
            print(f"DEBUG: Running Embedded tests in multi-file payload")

        print(f"DEBUG: Sandbox Result: success={sandbox_result['success']}, tests={tests_used}, duration={sandbox_result['duration']:.2f}s")

        # --- Step 4: Evaluation (Green Agent) ---
        evaluation = await scorer.evaluate(
            task_description=task_desc,
            purple_response=purple_data,
            red_report=red_result_data,
            audit_result=audit_result,
            sandbox_result=sandbox_result
        )

        # Apply penalties based on Tier 2 analysis
        if not audit_result['valid']:
            # Static analysis failed - apply penalty
            penalty = audit_result['penalty']
            evaluation['cis_score'] = evaluation.get('cis_score', 0) * (1 - penalty)
            evaluation['audit_penalty'] = penalty
            evaluation['audit_reason'] = audit_result['reason']

        if not sandbox_result['success']:
            # Dynamic tests failed - cap score at 0.5
            evaluation['cis_score'] = min(evaluation.get('cis_score', 0), 0.5)
            evaluation['sandbox_failed'] = True
            evaluation['sandbox_output'] = sandbox_result['output'][:500]  # Truncate for response size

        # Log Red Agent penalty if applied (Keep your local debug logs)
        if evaluation.get("red_penalty_applied", 0) > 0:
            red_analysis = evaluation.get("red_analysis", {})
            print(f"DEBUG: Red Agent penalty applied: {evaluation['red_penalty_applied'] * 100:.1f}%")
            print(f"DEBUG: Red Agent found {red_analysis.get('vulnerability_count', 0)} vulnerabilities "
                    f"(max severity: {red_analysis.get('max_severity', 'none')})")

        # --- Step 5: Return Combined Result ---
        # Build participants map for AgentBeats leaderboard
        # Use participant_ids if provided, otherwise use a placeholder
        # The key should match the 'name' field in scenario.toml participants
        participants = request.participant_ids or {"agent": request.battle_id}

        result = {
            "participants": participants,  # Required for AgentBeats leaderboard
            "battle_id": request.battle_id,
            "task": task_title,
            "purple_response": purple_data,
            "red_report": red_result_data,
            "audit_result": audit_result,
            "sandbox_result": {
                "success": sandbox_result['success'],
                "duration": sandbox_result['duration'],
                "tests_used": tests_used,  # "hidden", "purple", or "none"
                "output": sandbox_result['output'][:1000]  # Truncate for response size
            },
            "evaluation": evaluation
        }
        
        # Auto-save the result (Persistence Logic)
        print(f"DEBUG: Auto-saving result for battle {request.battle_id}")
        agent.submit_result(result)
        
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
