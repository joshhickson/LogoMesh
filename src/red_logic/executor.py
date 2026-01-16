"""
Red Agent V2 Executor - A2A integration for the hybrid Red Agent.

This executor wraps RedAgentV2 and exposes it via the A2A protocol.
It replaces the GenericAttackerExecutor with a more sophisticated
multi-layered attack engine.
"""

import json
import logging
import re
from typing import Optional

from a2a.server.agent_execution import AgentExecutor, RequestContext
from a2a.server.events import EventQueue
from a2a.server.tasks import TaskUpdater
from a2a.types import TaskState, InvalidParamsError
from a2a.utils import new_agent_text_message, new_task
from a2a.utils.errors import ServerError

from .orchestrator import RedAgentV2, AttackConfig


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("red_agent_v2")


class RedAgentV2Executor(AgentExecutor):
    """
    A2A Executor for Red Agent V2.

    Receives attack requests via A2A protocol, runs the hybrid
    attack engine, and returns structured vulnerability reports.
    """

    def __init__(self, config: Optional[AttackConfig] = None):
        """
        Initialize the executor.

        Args:
            config: Optional attack configuration
        """
        self.agent = RedAgentV2(config)
        logger.info("[RedAgentV2Executor] Initialized with hybrid attack engine")

    async def execute(self, context: RequestContext, event_queue: EventQueue):
        """
        Execute an attack request.

        Expected input format (in message text):
        ```
        ATTACK OBJECTIVE:
        You are a Red Team agent...

        TARGET CODE:
        <code here>

        TASK: <optional task id or description>
        ```

        Output format:
        JSON vulnerability report matching RedAgentReport schema
        """
        # Create task
        msg = context.message
        if not msg:
            raise ServerError(error=InvalidParamsError(message="Missing message."))

        task = new_task(msg)
        await event_queue.enqueue_event(task)

        updater = TaskUpdater(event_queue, task.id, task.context_id)
        task_id = task.id

        try:
            # Extract message text
            message_text = context.get_user_input()
            logger.info(f"[RedAgentV2] Task {task_id}: Received attack request")

            # Parse the request to extract code and task info
            code, task_identifier, task_description = self._parse_attack_request(message_text)

            if not code:
                logger.warning(f"[RedAgentV2] Task {task_id}: No code found in request")
                await updater.update_status(
                    TaskState.completed,
                    new_agent_text_message(json.dumps({
                        "attack_successful": False,
                        "vulnerabilities": [],
                        "attack_summary": "No target code provided in request"
                    }))
                )
                return

            logger.info(f"[RedAgentV2] Task {task_id}: Extracted {len(code)} chars of code")
            if task_identifier:
                logger.info(f"[RedAgentV2] Task {task_id}: Task ID = {task_identifier}")

            # Run the hybrid attack
            report = await self.agent.attack(
                code=code,
                task_id=task_identifier,
                task_description=task_description
            )

            # Convert to JSON response
            response = self._format_report(report)

            logger.info(f"[RedAgentV2] Task {task_id}: Attack complete - "
                       f"{len(report.vulnerabilities)} vulnerabilities found")

            await updater.update_status(
                TaskState.completed,
                new_agent_text_message(response)
            )

        except Exception as e:
            logger.error(f"[RedAgentV2] Task {task_id}: Error - {e}", exc_info=True)
            await updater.update_status(
                TaskState.failed,
                new_agent_text_message(json.dumps({
                    "attack_successful": False,
                    "vulnerabilities": [],
                    "attack_summary": f"Attack failed with error: {str(e)}"
                }))
            )

    async def cancel(self, request: RequestContext, event_queue: EventQueue):
        """Cancel is not supported."""
        from a2a.types import UnsupportedOperationError
        raise ServerError(error=UnsupportedOperationError())

    def _parse_attack_request(self, message: str) -> tuple[str, Optional[str], str]:
        """
        Parse the attack request to extract code and task info.

        Args:
            message: Raw message text from orchestrator

        Returns:
            Tuple of (code, task_id, task_description)
        """
        code = ""
        task_id = None
        task_description = ""

        # Extract code between TARGET CODE: and next section
        code_match = re.search(
            r"TARGET CODE:\s*\n(.+?)(?=\n(?:TASK:|INSTRUCTIONS:|$))",
            message,
            re.DOTALL | re.IGNORECASE
        )
        if code_match:
            code = code_match.group(1).strip()
            # Remove markdown code blocks if present
            code = re.sub(r"^```(?:python)?\s*\n?", "", code)
            code = re.sub(r"\n?```$", "", code)

        # Alternative: look for code in triple backticks
        if not code:
            code_match = re.search(r"```(?:python)?\s*\n(.+?)```", message, re.DOTALL)
            if code_match:
                code = code_match.group(1).strip()

        # Extract task ID if present
        task_match = re.search(r"task-(\d+)", message, re.IGNORECASE)
        if task_match:
            task_id = f"task-{task_match.group(1).zfill(3)}"

        # Extract task description (everything before TARGET CODE)
        desc_match = re.search(r"^(.+?)(?=TARGET CODE:)", message, re.DOTALL | re.IGNORECASE)
        if desc_match:
            task_description = desc_match.group(1).strip()

        return code, task_id, task_description

    def _format_report(self, report) -> str:
        """
        Format RedAgentReport as JSON string.

        Args:
            report: RedAgentReport instance

        Returns:
            JSON string matching expected schema
        """
        vulnerabilities = []
        for v in report.vulnerabilities:
            vuln_dict = {
                "severity": v.severity.value,
                "category": v.category,
                "title": v.title,
                "description": v.description,
                "confidence": v.confidence
            }
            if v.exploit_code:
                vuln_dict["exploit_code"] = v.exploit_code
            if v.line_number:
                vuln_dict["line_number"] = v.line_number

            vulnerabilities.append(vuln_dict)

        return json.dumps({
            "attack_successful": report.attack_successful,
            "vulnerabilities": vulnerabilities,
            "attack_summary": report.attack_summary
        }, indent=2)
