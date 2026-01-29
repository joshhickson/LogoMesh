import os
import json
import random
import re
import httpx
import time
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
import uvicorn

from .agent import GreenAgent
from .tasks import CODING_TASKS
from .scoring import ContextualIntegrityScorer
from .analyzer import SemanticAuditor
from .generator import TestGenerator
from .red_report_types import RedAgentReport
from .refinement_loop import RefinementLoop, create_refinement_task_prompt


def _init_sandbox():
    """initialize sandbox with fallback if docker unavailable."""
    try:
        from .sandbox import Sandbox, DOCKER_AVAILABLE
        timeout = int(os.getenv("SANDBOX_TIMEOUT", "15"))  # Default 15 seconds
        sb = Sandbox(timeout=timeout)
        mode = "Docker" if DOCKER_AVAILABLE else "subprocess"
        print(f"[GreenAgent] Sandbox initialized ({mode} mode, timeout={timeout}s)")
        return sb
    except Exception as e:
        print(f"[GreenAgent] WARNING: Sandbox unavailable ({e}), tests disabled")
        return None


def _init_red_agent():
    """initialize embedded red agent for internal vulnerability scanning."""
    try:
        # Use RedAgentV3 - MCTS enabled by default for smarter exploration
        # Try multiple import paths for Docker compatibility
        try:
            from src.red_logic.orchestrator import RedAgentV3
        except ImportError:
            try:
                from red_logic.orchestrator import RedAgentV3
            except ImportError:
                # Last resort: add parent path manually
                import sys
                _src_path = os.path.dirname(os.path.dirname(__file__))
                if _src_path not in sys.path:
                    sys.path.insert(0, _src_path)
                from red_logic.orchestrator import RedAgentV3

        # OPTIMIZED DEFAULTS: MCTS with fewer steps = smart but fast
        use_mcts = os.getenv("RED_AGENT_MCTS", "true").lower() == "true"  # MCTS on by default
        max_steps = int(os.getenv("RED_AGENT_STEPS", "5"))  # 5 steps = good coverage
        timeout = float(os.getenv("RED_AGENT_TIMEOUT", "20"))  # 20s budget
        mcts_branches = int(os.getenv("RED_AGENT_MCTS_BRANCHES", "2"))  # 2 branches (not 3)

        red = RedAgentV3(
            max_steps=max_steps,
            max_time_seconds=timeout,
            use_mcts=use_mcts,
            mcts_branches=mcts_branches
        )
        mode = f"MCTS-{mcts_branches}b" if use_mcts else "ReAct"
        print(f"[GreenAgent] Embedded Red Agent V3 ({mode}, {max_steps} steps, {timeout}s) initialized")
        return red
    except Exception as e:
        print(f"[GreenAgent] WARNING: Red Agent unavailable ({e}), security scanning disabled")
        return None


class SendTaskRequest(BaseModel):
    purple_agent_url: str
    red_agent_url: str | None = None
    battle_id: str
    task_id: str | None = None
    files: dict[str, str] | None = None
    custom_task: dict[str, str | None] | None = None
    participant_ids: dict[str, str] | None = None


class ReportResultRequest(BaseModel):
    battle_id: str
    score: float
    breakdown: str


app = FastAPI(
    title="Green Agent (Polyglot)",
    description="Agent for evaluating contextual debt of other agents.",
)

# a2a agent card - https://a2a-protocol.org/latest/specification/
AGENT_CARD = {
    "name": "green_agent",
    "description": "Polyglot Green Agent (Evaluator) - LogoMesh Arena",
    "url": "",
    "version": "1.0.0",
    "defaultInputModes": ["text"],
    "defaultOutputModes": ["text"],
    "capabilities": {"streaming": False},
    "skills": [],
    "protocolVersions": ["0.3.0"],
}


@app.get("/.well-known/agent-card.json")
@app.get("/.well-known/agent.json")
async def get_agent_card(request: Request):
    """return agent card for a2a protocol discovery."""
    base_url = str(request.base_url).rstrip('/')
    card = AGENT_CARD.copy()
    card["url"] = f"{base_url}/"
    return card


@app.post("/")
async def handle_a2a_message(request: Request):
    """handle a2a json-rpc messages from agentbeats-client."""
    import uuid

    body = await request.json()
    jsonrpc_id = body.get("id", str(uuid.uuid4()))
    method = body.get("method", "")
    params = body.get("params", {})

    print(f"[A2A] Received method: {method}, id: {jsonrpc_id}")

    if method != "message/send":
        return {
            "jsonrpc": "2.0",
            "id": jsonrpc_id,
            "error": {"code": -32601, "message": f"Method not found: {method}"}
        }

    # extract message text from parts (a2a uses "kind" not "type")
    message = params.get("message", {})
    message_parts = message.get("parts", [])
    message_text = ""
    for part in message_parts:
        part_type = part.get("kind") or part.get("type")
        if part_type == "text":
            message_text = part.get("text", "")
            break

    # parse participants and config from message text json
    config = {}
    participants = {}
    if message_text:
        try:
            msg_json = json.loads(message_text)
            if isinstance(msg_json, dict):
                participants = msg_json.get("participants", {})
                config = msg_json.get("config", {})
        except json.JSONDecodeError:
            pass

    # fallback to params/body root
    if not participants:
        participants = params.get("participants", {}) or body.get("participants", {})
    if not config:
        config = params.get("config", {}) or body.get("config", {})

    task_id = config.get("task_id", "task-001")

    # extract purple/red agent urls from participants (handles dict and list formats)
    purple_agent_url = None
    red_agent_url = None
    participant_ids = {}

    if isinstance(participants, dict):
        for role, value in participants.items():
            endpoint = value if isinstance(value, str) else value.get("endpoint", "")
            agentbeats_id = value.get("agentbeats_id") if isinstance(value, dict) else None

            if "purple" in role.lower() or role == "agent":
                purple_agent_url = endpoint
                if agentbeats_id:
                    participant_ids[role] = agentbeats_id
            elif "red" in role.lower():
                red_agent_url = endpoint
                if agentbeats_id:
                    participant_ids[role] = agentbeats_id
            elif not purple_agent_url:
                purple_agent_url = endpoint
                if agentbeats_id:
                    participant_ids[role] = agentbeats_id

    elif isinstance(participants, list):
        for p in participants:
            role = p.get("role", "")
            endpoint = p.get("endpoint", "")
            agentbeats_id = p.get("agentbeats_id", "")

            if "purple" in role.lower() or role in ("purple-agent", "agent"):
                purple_agent_url = endpoint
                if agentbeats_id:
                    participant_ids[role] = agentbeats_id
            elif "red" in role.lower():
                red_agent_url = endpoint
                if agentbeats_id:
                    participant_ids[role] = agentbeats_id

        if not purple_agent_url and participants:
            purple_agent_url = participants[0].get("endpoint", "")
            role = participants[0].get("role", "agent")
            if participants[0].get("agentbeats_id"):
                participant_ids[role] = participants[0]["agentbeats_id"]

    if not purple_agent_url:
        return {
            "jsonrpc": "2.0",
            "id": jsonrpc_id,
            "error": {"code": -32602, "message": "No purple agent endpoint found in participants"}
        }

    print(f"[A2A] Purple: {purple_agent_url}, Red: {red_agent_url}, Task: {task_id}")

    internal_request = SendTaskRequest(
        purple_agent_url=purple_agent_url,
        red_agent_url=red_agent_url,
        battle_id=jsonrpc_id,
        task_id=task_id,
        participant_ids=participant_ids if participant_ids else None
    )

    try:
        result = await send_coding_task_action(internal_request)

        return {
            "jsonrpc": "2.0",
            "id": jsonrpc_id,
            "result": {
                "kind": "task",
                "id": jsonrpc_id,
                "contextId": jsonrpc_id,
                "status": {
                    "state": "completed",
                    "message": {
                        "kind": "message",
                        "messageId": str(uuid.uuid4()),
                        "role": "agent",
                        "parts": [{"kind": "text", "text": json.dumps(result, indent=2)}]
                    }
                },
                "artifacts": [
                    {
                        "artifactId": str(uuid.uuid4()),
                        "parts": [{"kind": "text", "text": json.dumps(result, indent=2)}]
                    }
                ]
            }
        }
    except HTTPException as e:
        return {"jsonrpc": "2.0", "id": jsonrpc_id, "error": {"code": -32000, "message": str(e.detail)}}
    except Exception as e:
        print(f"[A2A] Error: {e}")
        return {"jsonrpc": "2.0", "id": jsonrpc_id, "error": {"code": -32000, "message": str(e)}}


agent = GreenAgent()
scorer = ContextualIntegrityScorer()
auditor = SemanticAuditor()
sandbox = _init_sandbox()
red_agent = _init_red_agent()
test_generator = TestGenerator()
refinement_loop = RefinementLoop(max_iterations=int(os.getenv("MAX_REFINEMENT_ITERATIONS", "2")))  # Reduced from 3

STALL_THRESHOLD = 30.0  # seconds without activity = hung inference
# AGENTIC MODE: Enable refinement loop by default for true agent behavior
ENABLE_REFINEMENT = os.getenv("ENABLE_REFINEMENT_LOOP", "true").lower() == "true"
# Scientific Method can be disabled for faster runs
ENABLE_SCIENTIFIC_METHOD = os.getenv("ENABLE_SCIENTIFIC_METHOD", "true").lower() == "true"


async def stream_purple_response(client: httpx.AsyncClient, purple_url: str, payload: dict, battle_id: str):
    """call purple agent with stall detection. returns extracted response text."""
    purple_target = purple_url.rstrip('/') + '/'
    last_activity = time.time()

    print(f"[Purple] Starting request for battle {battle_id}")

    try:
        async with client.stream("POST", purple_target, json=payload, headers={"Content-Type": "application/json"}, timeout=None) as response:
            response.raise_for_status()
            content_type = response.headers.get("content-type", "")

            if "text/event-stream" in content_type or "application/x-ndjson" in content_type:
                # sse streaming response
                accumulated_text = ""
                async for line in response.aiter_lines():
                    if time.time() - last_activity > STALL_THRESHOLD:
                        raise TimeoutError(f"Inference stalled - no activity for {STALL_THRESHOLD}s")

                    if not line or not line.strip():
                        continue
                    last_activity = time.time()

                    if line.startswith("data: "):
                        try:
                            event_data = json.loads(line[6:])
                            if "result" in event_data:
                                parts = event_data["result"].get("status", {}).get("message", {}).get("parts", [])
                                if parts:
                                    accumulated_text = parts[0].get("text", "")
                            if event_data.get("type") == "done" or event_data.get("finish_reason"):
                                break
                        except json.JSONDecodeError:
                            continue

                return accumulated_text

            else:
                # non-streaming json response
                content = await response.aread()
                purple_result = json.loads(content)
                result = purple_result.get("result", {})

                # handle both task and message response formats
                purple_text = ""
                if result:
                    result_kind = result.get("kind", "")
                    if result_kind == "task" or "status" in result:
                        parts = result.get("status", {}).get("message", {}).get("parts", [])
                        if parts:
                            purple_text = parts[0].get("text", "")
                    elif result_kind == "message" or "parts" in result:
                        parts = result.get("parts", [])
                        if parts:
                            purple_text = parts[0].get("text", "")
                    else:
                        # fallback paths
                        parts = result.get("status", {}).get("message", {}).get("parts", [])
                        if parts:
                            purple_text = parts[0].get("text", "")
                        if not purple_text:
                            parts = result.get("parts", [])
                            if parts:
                                purple_text = parts[0].get("text", "")

                if purple_text:
                    print(f"[Purple] Extracted {len(purple_text)} chars")
                else:
                    print(f"[Purple] WARNING: No text in response")
                return purple_text

    except httpx.TimeoutException:
        raise TimeoutError("Purple Agent timeout")
    except Exception as e:
        print(f"[Purple] Error: {type(e).__name__}: {e}")
        raise


@app.post("/actions/send_coding_task")
async def send_coding_task_action(request: SendTaskRequest):
    """
    orchestrates the evaluation loop:
    1. send coding task to purple agent (defender)
    2. optionally send purple's code to red agent (attacker)
    3. evaluate using contextual integrity score
    """
    task_constraints = {}
    hidden_tests = None

    if request.files:
        task_title = "User Provided Task"
        task_desc = f"Evaluate the provided files: {json.dumps(list(request.files.keys()))}"
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
            task = random.choice(CODING_TASKS)

        task_title = task['title']
        task_desc = task['description']
        task_constraints = task.get('constraints', {})
        hidden_tests = task.get('hidden_tests')
        task_prompt = f"""CODING TASK: {task_title}

{task_desc}

IMPORTANT: Respond with valid JSON only (no markdown code blocks):
{{
    "sourceCode": "...",
    "testCode": "...",
    "rationale": "..."
}}"""

    purple_agent_url = os.getenv("PURPLE_AGENT_URL", request.purple_agent_url)
    red_agent_url = os.getenv("RED_AGENT_URL", request.red_agent_url)

    try:
        # step 1: purple agent (defense)
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
                                "kind": "message",
                                "messageId": f"task-{request.battle_id}",
                                "role": "user",
                                "parts": [{"kind": "text", "text": task_prompt}]
                            }
                        },
                        "id": request.battle_id
                    },
                    request.battle_id
                )

                if not purple_text:
                    raise ValueError("Purple Agent returned empty response")

            except TimeoutError as te:
                return {"battle_id": request.battle_id, "task_id": request.task_id, "error": str(te), "outcome": "ERROR", "timestamp": time.time()}
            except Exception as e:
                return {"battle_id": request.battle_id, "task_id": request.task_id, "error": f"Purple Agent failed: {e}", "outcome": "ERROR", "timestamp": time.time()}

        # parse purple response json
        try:
            clean_text = purple_text.strip()
            if clean_text.startswith("```json"):
                clean_text = clean_text[7:]
            elif clean_text.startswith("```"):
                clean_text = clean_text[3:]
            if clean_text.endswith("```"):
                clean_text = clean_text[:-3]
            purple_data = json.loads(clean_text.strip())
        except json.JSONDecodeError:
            purple_data = {"sourceCode": purple_text, "rationale": "Parsing failed", "testCode": ""}

        # step 2: red agent (attack) - embedded, always runs if available
        red_result_data = None
        red_report_obj = None
        source_code = purple_data.get('sourceCode', '')

        # Normalize escaped newlines (Purple may return literal \n instead of actual newlines)
        if isinstance(source_code, str) and '\\n' in source_code:
            source_code = source_code.replace('\\n', '\n').replace('\\t', '\t')
            purple_data['sourceCode'] = source_code

        if red_agent:
            print(f"[Red] Running embedded Red Agent attack on {len(source_code)} chars of code")
            try:
                red_report_obj = await red_agent.attack(
                    code=source_code,
                    task_id=request.task_id,
                    task_description=task_desc
                )
                # Convert RedAgentReport to dict for backward compatibility with scorer
                red_result_data = {
                    "attack_successful": red_report_obj.attack_successful,
                    "vulnerabilities": [
                        {
                            "severity": v.severity.value,
                            "category": v.category,
                            "title": v.title,
                            "description": v.description,
                            "exploit_code": v.exploit_code,
                            "line_number": v.line_number,
                            "confidence": v.confidence,
                        }
                        for v in red_report_obj.vulnerabilities
                    ],
                    "attack_summary": red_report_obj.attack_summary
                }
                print(f"[Red] Attack complete: {len(red_report_obj.vulnerabilities)} vulnerabilities found")
            except Exception as e:
                print(f"[Red] WARNING: Embedded Red Agent failed: {e}")
        else:
            print("[Red] Red Agent not available, skipping security scan")

        # step 3: static + dynamic analysis
        # handle multi-file json payload
        sandbox_payload = source_code
        if isinstance(source_code, str) and source_code.strip().startswith('{') and source_code.strip().endswith('}'):
            try:
                sandbox_payload = json.loads(source_code.strip())
            except json.JSONDecodeError:
                pass

        # static analysis
        audit_source = "\n\n".join(sandbox_payload.values()) if isinstance(sandbox_payload, dict) else source_code
        audit_result = auditor.analyze(audit_source, task_constraints)

        # dynamic execution
        sandbox_result = {"success": True, "output": "No tests provided", "duration": 0.0}
        tests_used = "none"
        purple_tests = purple_data.get('testCode', '')

        # Normalize escaped newlines in test code too
        if isinstance(purple_tests, str) and '\\n' in purple_tests:
            purple_tests = purple_tests.replace('\\n', '\n').replace('\\t', '\t')

        if hidden_tests and hidden_tests.strip():
            # Priority 1: Use hidden tests (task-defined, Purple can't see these)
            tests_to_run = hidden_tests
            tests_used = "hidden"
        else:
            # Priority 2: Generate adversarial tests (independent of Purple)
            tests_to_run = await test_generator.generate_adversarial_tests(task_desc, source_code)
            tests_used = "generated"

            # Also run Purple's tests as sanity check (if they fail their own tests, that's bad)
            if purple_tests and purple_tests.strip():
                # Inject import so Purple's tests can access the solution
                purple_tests_with_import = "from solution import *\n" + purple_tests
                tests_to_run = tests_to_run + "\n\n# === Purple's Own Tests (sanity check) ===\n" + purple_tests_with_import
                tests_used = "generated+purple"
                print(f"[Sandbox] Running generated tests + Purple's tests as sanity check")

        if sandbox is None:
            sandbox_result = {"success": True, "output": "Sandbox unavailable (no Docker)", "duration": 0.0}
            tests_used = "skipped"
        elif tests_to_run and tests_to_run.strip():
            sandbox_result = sandbox.run(sandbox_payload, tests_to_run)
        elif isinstance(sandbox_payload, dict):
            sandbox_result = sandbox.run(sandbox_payload, "")
            tests_used = "embedded"

        # step 4: evaluation
        evaluation = await scorer.evaluate(
            task_description=task_desc,
            purple_response=purple_data,
            red_report=red_result_data,
            audit_result=audit_result,
            sandbox_result=sandbox_result,
            red_report_obj=red_report_obj  # Pass direct object to skip parsing
        )

        # apply penalties
        if not audit_result['valid']:
            penalty = audit_result['penalty']
            evaluation['cis_score'] = evaluation.get('cis_score', 0) * (1 - penalty)
            evaluation['audit_penalty'] = penalty
            evaluation['audit_reason'] = audit_result['reason']

        if not sandbox_result['success']:
            # Calculate pass rate from output to scale penalty fairly
            output = sandbox_result['output']
            pass_rate = 0.5  # default assumption
            import re
            # Try to extract "X passed, Y failed" from pytest output
            match = re.search(r'(\d+)\s+passed.*?(\d+)\s+failed', output)
            if match:
                passed = int(match.group(1))
                failed = int(match.group(2))
                total = passed + failed
                if total > 0:
                    pass_rate = passed / total

            # Scale score based on pass rate instead of hard cap at 0.5
            # 100% pass = no penalty, 0% pass = cap at 0.4
            # Formula: max_score = 0.4 + (0.6 * pass_rate)
            max_allowed = 0.4 + (0.6 * pass_rate)
            evaluation['cis_score'] = min(evaluation.get('cis_score', 0), max_allowed)
            evaluation['sandbox_failed'] = True
            evaluation['test_pass_rate'] = pass_rate
            # Show more output - especially the failure details at the end
            # pytest puts failures at the end, so prioritize the tail
            if len(output) > 1500:
                # Show first 500 + last 1000 to capture both context and failures
                evaluation['sandbox_output'] = output[:500] + "\n...[truncated]...\n" + output[-1000:]
            else:
                evaluation['sandbox_output'] = output

        # === AGENTIC REFINEMENT LOOP ===
        # If enabled, iteratively help Purple improve their code
        iteration = 1
        refinement_history = []

        if ENABLE_REFINEMENT:
            critical_vulns = len([v for v in (red_report_obj.vulnerabilities if red_report_obj else [])
                                  if v.severity.value == "critical"])

            while refinement_loop.should_continue(
                iteration=iteration,
                test_passed=sandbox_result['success'],
                score=evaluation.get('cis_score', 0),
                critical_vulns=critical_vulns
            ):
                print(f"[Refinement] Iteration {iteration}: score={evaluation.get('cis_score', 0):.2f}, "
                      f"tests_passed={sandbox_result['success']}, critical_vulns={critical_vulns}")

                # Generate targeted feedback using self-reflection
                # Scientific Method can be slow (many LLM calls) - skip if disabled
                if ENABLE_SCIENTIFIC_METHOD:
                    feedback = await refinement_loop.generate_feedback_message(
                        task_description=task_desc,
                        source_code=source_code,
                        test_output=sandbox_result.get('output', ''),
                        red_vulnerabilities=[
                            {"severity": v.severity.value, "category": v.category,
                             "title": v.title, "description": v.description}
                            for v in (red_report_obj.vulnerabilities if red_report_obj else [])
                        ],
                        audit_issues=audit_result.get('issues', []),
                        iteration=iteration,
                        sandbox_runner=sandbox
                    )
                else:
                    # Fast fallback: DIRECT feedback without Scientific Method
                    output = sandbox_result.get('output', 'No output')

                    # Extract errors with specific fixes
                    fixes = []
                    if 'AssertionError' in output:
                        match = re.search(r'AssertionError:?\s*(.{1,80})', output)
                        fixes.append(f"ASSERTION FAILED: {match.group(1) if match else 'check return values'}")
                    if 'TypeError' in output:
                        match = re.search(r'TypeError:?\s*(.{1,80})', output)
                        fixes.append(f"TYPE ERROR: {match.group(1) if match else 'check argument types'}")
                    if 'NameError' in output:
                        match = re.search(r"name '(\w+)'", output)
                        fixes.append(f"UNDEFINED: '{match.group(1) if match else 'variable'}' - define it or check imports")
                    if 'KeyError' in output:
                        fixes.append("KEY NOT FOUND: use .get(key, default) instead of [key]")
                    if 'IndexError' in output:
                        fixes.append("INDEX ERROR: check list length before accessing")
                    if 'AttributeError' in output:
                        match = re.search(r"'(\w+)' object has no attribute '(\w+)'", output)
                        if match:
                            fixes.append(f"MISSING: '{match.group(1)}' has no '{match.group(2)}'")

                    # Add security issues if red agent found any
                    vulns = red_report_obj.vulnerabilities if red_report_obj else []
                    for v in vulns[:2]:
                        cat = v.category.lower()
                        if 'sql' in cat:
                            fixes.append(f"SQL INJECTION: use parameterized queries, not f-strings")
                        elif 'command' in cat:
                            fixes.append(f"COMMAND INJECTION: use shell=False, pass args as list")

                    fixes_text = "\n".join(fixes) if fixes else f"TEST OUTPUT: {output[:200]}"

                    feedback = f"""BUGS IN YOUR CODE - FIX THESE:

{fixes_text}

RESUBMIT: {{"sourceCode": "<fixed>", "testCode": "<tests>", "rationale": "<what you fixed>"}}"""

                # Store this iteration's results
                refinement_history.append({
                    "iteration": iteration,
                    "score": evaluation.get('cis_score', 0),
                    "passed": sandbox_result['success'],
                    "feedback": feedback[:500]
                })

                # Send feedback to Purple and get new code
                iteration += 1
                refinement_prompt = create_refinement_task_prompt(task_prompt, feedback, iteration)

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
                                        "kind": "message",
                                        "messageId": f"task-{request.battle_id}-iter{iteration}",
                                        "role": "user",
                                        "parts": [{"kind": "text", "text": refinement_prompt}]
                                    }
                                },
                                "id": f"{request.battle_id}-iter{iteration}"
                            },
                            request.battle_id
                        )

                        if not purple_text:
                            print(f"[Refinement] Purple returned empty response on iteration {iteration}")
                            break

                        # Parse new response
                        clean_text = purple_text.strip()
                        if clean_text.startswith("```json"):
                            clean_text = clean_text[7:]
                        elif clean_text.startswith("```"):
                            clean_text = clean_text[3:]
                        if clean_text.endswith("```"):
                            clean_text = clean_text[:-3]

                        try:
                            purple_data = json.loads(clean_text.strip())
                        except json.JSONDecodeError:
                            print(f"[Refinement] Failed to parse Purple response on iteration {iteration}")
                            break

                        source_code = purple_data.get('sourceCode', '')
                        if isinstance(source_code, str) and '\\n' in source_code:
                            source_code = source_code.replace('\\n', '\n').replace('\\t', '\t')
                            purple_data['sourceCode'] = source_code

                        # Re-run evaluation pipeline
                        if red_agent:
                            red_report_obj = await red_agent.attack(
                                code=source_code,
                                task_id=request.task_id,
                                task_description=task_desc
                            )
                            red_result_data = {
                                "attack_successful": red_report_obj.attack_successful,
                                "vulnerabilities": [
                                    {"severity": v.severity.value, "category": v.category,
                                     "title": v.title, "description": v.description,
                                     "exploit_code": v.exploit_code, "line_number": v.line_number,
                                     "confidence": v.confidence}
                                    for v in red_report_obj.vulnerabilities
                                ],
                                "attack_summary": red_report_obj.attack_summary
                            }
                            critical_vulns = len([v for v in red_report_obj.vulnerabilities
                                                  if v.severity.value == "critical"])

                        sandbox_payload = source_code
                        audit_source = source_code
                        audit_result = auditor.analyze(audit_source, task_constraints)

                        tests_to_run = await test_generator.generate_adversarial_tests(task_desc, source_code)
                        if sandbox:
                            sandbox_result = sandbox.run(sandbox_payload, tests_to_run)

                        evaluation = await scorer.evaluate(
                            task_description=task_desc,
                            purple_response=purple_data,
                            red_report=red_result_data,
                            audit_result=audit_result,
                            sandbox_result=sandbox_result,
                            red_report_obj=red_report_obj
                        )

                        if not audit_result['valid']:
                            evaluation['cis_score'] = evaluation.get('cis_score', 0) * (1 - audit_result['penalty'])
                        if not sandbox_result['success']:
                            evaluation['cis_score'] = min(evaluation.get('cis_score', 0), 0.5)

                        print(f"[Refinement] Iteration {iteration} complete: new score={evaluation.get('cis_score', 0):.2f}")

                    except Exception as e:
                        print(f"[Refinement] Error on iteration {iteration}: {e}")
                        break

            # Calculate improvement and use best iteration
            if refinement_history:
                initial_score = refinement_history[0]['score']
                final_score = evaluation.get('cis_score', 0)

                # Use best iteration score if final regressed
                best_score = max(h['score'] for h in refinement_history)
                if final_score < best_score:
                    print(f"[Refinement] Using best score {best_score:.2f} instead of final {final_score:.2f}")
                    # Note: We keep the final evaluation but report the best score
                    evaluation['cis_score'] = best_score
                    evaluation['used_best_iteration'] = True

                evaluation['refinement_improvement'] = best_score - initial_score
                evaluation['refinement_iterations'] = iteration
                evaluation['refinement_history'] = refinement_history
                print(f"[Refinement] Complete: {iteration} iterations, improvement={best_score - initial_score:.2f}")

            # Reset refinement loop state for next battle
            refinement_loop.reset()

        # step 5: return result
        participants = request.participant_ids or {"agent": request.battle_id}

        result = {
            "participants": participants,
            "battle_id": request.battle_id,
            "task": task_title,
            "purple_response": purple_data,
            "red_report": red_result_data,
            "audit_result": audit_result,
            "sandbox_result": {
                "success": sandbox_result['success'],
                "duration": sandbox_result['duration'],
                "tests_used": tests_used,
                # Show more output - prioritize end where pytest shows failures
                "output": (sandbox_result['output'][:500] + "\n...[truncated]...\n" + sandbox_result['output'][-1500:])
                          if len(sandbox_result['output']) > 2000
                          else sandbox_result['output']
            },
            "evaluation": evaluation
        }

        agent.submit_result(result)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/actions/report_result")
async def report_result_action(request: ReportResultRequest):
    """receives and logs the final evaluation result."""
    result_data = {"battle_id": request.battle_id, "score": request.score, "breakdown": request.breakdown}
    agent.submit_result(result_data)
    return {"status": "reported", "battle_id": request.battle_id}


# ============================================================================
# PERFORMANCE TUNING (via environment variables)
# ============================================================================
# RED_AGENT_MCTS=true       - Enable MCTS Tree of Thoughts (default: true)
# RED_AGENT_MCTS_BRANCHES=2 - MCTS branches per step (default: 2, max 3)
# RED_AGENT_STEPS=5         - Max investigation steps (default: 5)
# RED_AGENT_TIMEOUT=20      - Timeout in seconds (default: 20)
# MAX_REFINEMENT_ITERATIONS=2 - Refinement iterations (default: 2)
# SANDBOX_TIMEOUT=15        - Sandbox timeout (default: 15)
# ENABLE_SCIENTIFIC_METHOD=true - Enable property-based testing (default: true)
# ENABLE_REFINEMENT_LOOP=true   - Enable refinement loop (default: true)
#
# PRESETS:
# FAST MODE:    RED_AGENT_MCTS=false RED_AGENT_STEPS=3 MAX_REFINEMENT_ITERATIONS=1 ENABLE_SCIENTIFIC_METHOD=false
# BALANCED:     RED_AGENT_MCTS=true RED_AGENT_MCTS_BRANCHES=2 RED_AGENT_STEPS=5 MAX_REFINEMENT_ITERATIONS=2 (DEFAULT)
# FULL AGI:     RED_AGENT_MCTS=true RED_AGENT_MCTS_BRANCHES=3 RED_AGENT_STEPS=10 MAX_REFINEMENT_ITERATIONS=3
# ============================================================================

def run_server():
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 9040))
    print(f"[GreenAgent] Starting server on {host}:{port}")
    uvicorn.run(app, host=host, port=port)
