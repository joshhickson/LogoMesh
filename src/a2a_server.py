import os
import json
import random
import re
import httpx
import time
import logging
import asyncio
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import sys

from a2a_protocol.server import A2AStarletteApplication, DefaultRequestHandler
from a2a_protocol.agent_card import AgentCard

# --- Path Setup ---
# Add project root and src directory to path for both local and Docker environments
_project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_src_path = os.path.join(_project_root, "src")
for p in [_project_root, _src_path]:
    if p not in sys.path:
        sys.path.insert(0, p)

# --- Logging Setup ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()

# --- Import Green Logic Components ---
# Use try-except blocks to handle different import paths (local vs. Docker)
try:
    from green_logic.agent import GreenAgent
    from green_logic.tasks import CODING_TASKS
    from green_logic.scoring import ContextualIntegrityScorer
    from green_logic.analyzer import SemanticAuditor
    from green_logic.generator import TestGenerator
    from green_logic.red_report_types import RedAgentReport
    from green_logic.refinement_loop import RefinementLoop, create_refinement_task_prompt
    from green_logic.server import _init_sandbox, _init_red_agent, classify_task_complexity, stream_purple_response
except ImportError as e:
    logger.error(f"Failed to import green_logic components: {e}")
    # Attempt relative imports as a fallback
    from .green_logic.agent import GreenAgent
    from .green_logic.tasks import CODING_TASKS
    from .green_logic.scoring import ContextualIntegrityScorer
    from .green_logic.analyzer import SemanticAuditor
    from .green_logic.generator import TestGenerator
    from .green_logic.red_report_types import RedAgentReport
    from .green_logic.refinement_loop import RefinementLoop, create_refinement_task_prompt
    from .green_logic.server import _init_sandbox, _init_red_agent, classify_task_complexity, stream_purple_response


# --- Component Initialization ---
logger.info("Initializing Green Agent components...")
scorer = ContextualIntegrityScorer()
auditor = SemanticAuditor()
sandbox = _init_sandbox()
red_agent = _init_red_agent()
test_generator = TestGenerator()
refinement_loop = RefinementLoop(max_iterations=int(os.getenv("MAX_REFINEMENT_ITERATIONS", "2")))
ENABLE_REFINEMENT = os.getenv("ENABLE_REFINEMENT_LOOP", "true").lower() == "true"
logger.info("Green Agent components initialized.")

# --- Agent Logic Implementation ---

class LogoMeshGreenAgentExecutor:
    """
    The core logic for the LogoMesh Green Agent, adapted to the A2A protocol.
    This class orchestrates the evaluation of a coding task performed by another agent.
    """
    async def execute_task(self, task_input: dict) -> dict:
        """
        Orchestrates the evaluation loop, adapted from send_coding_task_action.
        """
        logger.info(f"Received task input: {json.dumps(task_input, indent=2)}")

        # 1. Parse A2A input to match original request structure
        battle_id = task_input.get("id", "unknown-battle")
        params = task_input.get("params", {})
        message = params.get("message", {})
        
        # Extract config and participants from the message text if it's a JSON string
        config = {}
        participants = {}
        message_text = ""
        for part in message.get("parts", []):
            if part.get("kind") == "text":
                message_text = part.get("text", "")
                break
        
        if message_text:
            try:
                msg_json = json.loads(message_text)
                config = msg_json.get("config", {})
                participants = msg_json.get("participants", {})
            except json.JSONDecodeError:
                logger.warning("Could not decode JSON from message text.")

        # Fallback to root params
        if not config:
            config = params.get("config", {})
        if not participants:
            participants = params.get("participants", {})

        task_id = config.get("task_id")
        purple_agent_url = participants.get("agent", {}).get("endpoint") or participants.get("purple", {}).get("endpoint")

        if not purple_agent_url:
            raise ValueError("No purple agent endpoint found in participants")

        logger.info(f"Starting evaluation for battle_id: {battle_id}, task_id: {task_id}")

        # 2. Define the Task
        if task_id:
            try:
                task = next(t for t in CODING_TASKS if t['id'] == task_id)
            except StopIteration:
                task = {"id": task_id, "title": task_id, "description": f"Novel task: {task_id}", "constraints": {}}
                logger.info(f"Novel task detected: {task_id}")
        else:
            task = random.choice(CODING_TASKS)

        task_title = task['title']
        task_desc = task['description']
        task_constraints = task.get('constraints', {})
        hidden_tests = task.get('hidden_tests')
        task_prompt = f'CODING TASK: {task_title}\n\n{task_desc}\n\nIMPORTANT: Respond with valid JSON only (no markdown code blocks):\n{{\n    "sourceCode": "...",\n    "testCode": "...",\n    "rationale": "..."\n}}'

        # 3. Call Purple Agent
        try:
            async with httpx.AsyncClient() as client:
                purple_text = await stream_purple_response(
                    client,
                    purple_agent_url,
                    {
                        "jsonrpc": "2.0",
                        "method": "message/send",
                        "params": {"message": {"kind": "message", "role": "user", "parts": [{"kind": "text", "text": task_prompt}]}},
                        "id": battle_id
                    },
                    battle_id
                )
            if not purple_text:
                raise ValueError("Purple Agent returned empty response")
        except Exception as e:
            logger.error(f"Error communicating with Purple Agent: {e}")
            return {"error": f"Purple Agent failed: {e}", "outcome": "ERROR"}

        # 4. Process Purple Agent's Response
        try:
            clean_text = purple_text.strip().removeprefix("```json").removesuffix("```").strip()
            purple_data = json.loads(clean_text)
        except json.JSONDecodeError:
            purple_data = {"sourceCode": purple_text, "rationale": "Parsing failed", "testCode": ""}
        
        source_code = purple_data.get('sourceCode', '')
        if not source_code or not source_code.strip():
            logger.warning("Empty sourceCode from Purple agent.")
            return {"cis_score": 0.10, "error": "Purple agent returned empty sourceCode"}

        # 5. Run Evaluation Pipeline (Red Agent, Sandbox, Scoring)
        task_complexity = classify_task_complexity(source_code)
        logger.info(f"Task complexity classified as: {task_complexity}")

        # Red Agent Attack
        red_result_data = None
        red_report_obj = None
        if red_agent:
            try:
                red_report_obj = await red_agent.attack(code=source_code, task_id=task_id, task_description=task_desc)
                if red_report_obj:
                    red_result_data = red_report_obj.to_dict() # Assuming a to_dict method
                    logger.info(f"Red Agent found {len(red_report_obj.vulnerabilities)} vulnerabilities.")
            except Exception as e:
                logger.warning(f"Red Agent attack failed: {e}")

        # Static and Dynamic Analysis
        audit_result = auditor.analyze(source_code, task_constraints)
        
        tests_to_run = hidden_tests or await test_generator.generate_adversarial_tests(task_desc, source_code)
        sandbox_result = {"success": True, "output": "Sandbox disabled"}
        if sandbox and tests_to_run:
            sandbox_result = sandbox.run(source_code, tests_to_run)
        
        # Scoring
        evaluation = await scorer.evaluate(
            task_description=task_desc,
            purple_response=purple_data,
            red_report=red_result_data,
            audit_result=audit_result,
            sandbox_result=sandbox_result,
            red_report_obj=red_report_obj,
        )

        # 6. (Optional) Refinement Loop
        # This is a simplified version. The full loop is complex and may need more state.
        if ENABLE_REFINEMENT and refinement_loop.should_continue(iteration=1, test_passed=sandbox_result['success'], score=evaluation.get('cis_score', 0)):
             logger.info("Entering refinement loop...")
             # The full refinement logic would go here, involving more calls to the purple agent.
             # For this integration, we will skip the loop's implementation for brevity.
             pass

        # 7. Format and Return Final Result
        final_result = {
            "battle_id": battle_id,
            "task": task_title,
            "evaluation": evaluation,
            "purple_response": purple_data,
            "red_report": red_result_data,
            "audit_result": audit_result,
            "sandbox_result": sandbox_result,
        }
        
        logger.info(f"Evaluation complete. Final score: {evaluation.get('cis_score', 'N/A')}")
        return final_result


# --- A2A Server Setup ---

def create_app() -> FastAPI:
    """
    Creates the A2A-compliant FastAPI application.
    """
    agent_card_path = os.path.join(_project_root, 'agent_card.toml')
    logger.info(f"Loading agent card from: {agent_card_path}")
    card = AgentCard.from_toml(agent_card_path)

    agent_executor = LogoMeshGreenAgentExecutor()

    handler = DefaultRequestHandler(
        agent_card=card,
        agent_executor={
            "logomesh.audit.task-015": agent_executor.execute_task
        }
    )

    app = A2AStarletteApplication(
        agent_card=card,
        request_handler=handler,
    )

    logger.info("A2A Starlette application created successfully.")
    return app

if __name__ == "__main__":
    fastapi_app = create_app()
    logger.info("Starting Uvicorn server for A2A agent...")
    uvicorn.run(
        fastapi_app,
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
    )
