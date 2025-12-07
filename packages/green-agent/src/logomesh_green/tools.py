"""LogoMesh Green Agent Tools.

These tools are registered with agentbeats via the @ab.tool decorator
and are available to the green agent during battle orchestration.
"""

import os
import json
from typing import Any

import httpx

# Add vendor path for agentbeats if not installed
import sys
from pathlib import Path
VENDOR_PATH = Path(__file__).parent.parent.parent.parent.parent / "vendor" / "agentbeats" / "src"
if VENDOR_PATH.exists():
    sys.path.insert(0, str(VENDOR_PATH))

import agentbeats as ab

# Configuration
LOGOMESH_SERVER_URL = os.getenv("LOGOMESH_SERVER_URL", "http://localhost:3000")
REQUEST_TIMEOUT = 300.0  # 5 minutes for code generation tasks


# ============================================================================
# Coding Task Tools
# ============================================================================

@ab.tool
def get_coding_task() -> str:
    """
    Get a coding task from the task bank.

    Returns a task description that will be sent to the purple agent.
    """
    # TODO: In production, fetch from task bank/database
    # For now, return a sample task
    task = {
        "id": "task-001",
        "title": "Implement User Authentication Endpoint",
        "description": """
Implement a user authentication endpoint with the following requirements:

1. Create a POST /auth/login endpoint
2. Accept JSON body with { email: string, password: string }
3. Validate input fields (email format, password min length 8)
4. Return JWT token on success
5. Return appropriate error responses for invalid credentials
6. Include rate limiting consideration in your approach

Provide:
- Source code implementation
- Unit tests (optional but recommended)
- Rationale explaining your design decisions
""",
        "requirements": [
            "Input validation",
            "JWT token generation",
            "Error handling",
            "Security considerations"
        ]
    }
    return json.dumps(task, indent=2)


@ab.tool
async def send_coding_task(purple_agent_url: str, task: str, battle_id: str) -> str:
    """
    Send a coding task to the purple agent via A2A protocol.

    Args:
        purple_agent_url: The URL of the purple agent's A2A endpoint
        task: The coding task (JSON string)
        battle_id: Current battle ID for tracking

    Returns:
        The purple agent's solution as JSON string containing:
        - sourceCode: The implemented code
        - testCode: Optional test code
        - rationale: Explanation of approach
    """
    try:
        # Parse task to ensure it's valid JSON
        task_data = json.loads(task)

        # Construct A2A message
        a2a_message = {
            "type": "task_assignment",
            "battle_id": battle_id,
            "task": task_data,
            "instructions": "Please implement the coding task and provide your solution with source code, optional tests, and rationale."
        }

        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
            response = await client.post(
                purple_agent_url,
                json=a2a_message,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()

            solution = response.json()
            return json.dumps(solution, indent=2)

    except httpx.TimeoutException:
        return json.dumps({
            "error": "timeout",
            "message": f"Purple agent did not respond within {REQUEST_TIMEOUT}s"
        })
    except httpx.HTTPStatusError as e:
        return json.dumps({
            "error": "http_error",
            "status_code": e.response.status_code,
            "message": str(e)
        })
    except Exception as e:
        return json.dumps({
            "error": "unknown",
            "message": str(e)
        })


# ============================================================================
# Evaluation Tools
# ============================================================================

@ab.tool
async def evaluate_solution(
    source_code: str,
    test_code: str,
    rationale: str,
    battle_id: str
) -> str:
    """
    Send the purple agent's solution to LogoMesh server for contextual debt analysis.

    Args:
        source_code: The code produced by the purple agent
        test_code: Optional test code (empty string if none)
        rationale: The agent's explanation of their approach
        battle_id: Current battle ID for tracking

    Returns:
        JSON string with analysis results:
        - contextualDebtScore: Overall score (0.0-1.0, higher is better)
        - breakdown: Individual analyzer scores
    """
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{LOGOMESH_SERVER_URL}/v1/internal/analyze",
                json={
                    "sourceCode": source_code,
                    "testCode": test_code or "",
                    "rationale": rationale,
                    "battleId": battle_id
                },
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()

            result = response.json()
            return json.dumps(result, indent=2)

    except httpx.HTTPStatusError as e:
        # If the internal endpoint doesn't exist yet, return mock data
        if e.response.status_code == 404:
            return json.dumps({
                "warning": "Internal analyze endpoint not implemented yet",
                "contextualDebtScore": 0.5,
                "breakdown": {
                    "rationaleDebt": {"score": 0.5, "details": "Mock score"},
                    "architecturalDebt": {"score": 0.5, "details": "Mock score"},
                    "testingDebt": {"score": 0.5, "details": "Mock score"}
                }
            })
        return json.dumps({
            "error": "http_error",
            "status_code": e.response.status_code,
            "message": str(e)
        })
    except Exception as e:
        return json.dumps({
            "error": "analysis_failed",
            "message": str(e)
        })


# ============================================================================
# Battle Management Tools (MCP)
# ============================================================================

@ab.tool
async def update_battle_process(
    battle_id: str,
    message: str,
    reported_by: str,
    detail: dict[str, Any] | None = None
) -> str:
    """
    Log intermediate steps and information during the battle.

    This tool communicates with the AgentBeats MCP server to log progress.

    Args:
        battle_id: The current battle ID
        message: Human-readable status message
        reported_by: Source of the update (e.g., "green_agent", "purple_agent")
        detail: Optional structured data to include

    Returns:
        Confirmation message
    """
    # Log locally for debugging
    print(f"[Battle {battle_id}] {reported_by}: {message}")
    if detail:
        print(f"  Detail: {json.dumps(detail, indent=2)[:200]}...")

    # TODO: Implement actual MCP server communication
    # The MCP server URL is configured in scenario.toml
    # For now, just log locally

    return f"Logged: {message}"


@ab.tool
async def report_on_battle_end(
    battle_id: str,
    winner: str,
    detail: dict[str, Any] | None = None
) -> str:
    """
    Report the final battle result to the AgentBeats backend.

    Args:
        battle_id: The battle ID
        winner: The winning agent (for single-agent eval, always "purple_agent")
        detail: Final result details including contextual debt score

    Returns:
        Confirmation message
    """
    result = {
        "battle_id": battle_id,
        "winner": winner,
        "detail": detail or {}
    }

    print(f"[Battle {battle_id}] COMPLETE")
    print(f"  Winner: {winner}")
    if detail:
        print(f"  Contextual Debt Score: {detail.get('contextualDebtScore', 'N/A')}")

    # TODO: Implement actual MCP server communication to report result

    return f"Battle {battle_id} complete. Winner: {winner}"


# ============================================================================
# Orchestration Tool
# ============================================================================

@ab.tool
async def orchestrate_evaluation(battle_id: str, purple_agent_url: str) -> str:
    """
    Main orchestration function for contextual debt evaluation.

    This is the primary tool that runs the full evaluation flow:
    1. Get coding task
    2. Send to purple agent
    3. Collect solution
    4. Run analysis
    5. Report results

    Args:
        battle_id: The battle ID from AgentBeats
        purple_agent_url: The purple agent's A2A endpoint URL

    Returns:
        Final evaluation summary
    """
    # 1. Log battle start
    await update_battle_process(
        battle_id,
        "Starting contextual debt evaluation",
        "green_agent",
        {"purple_agent_url": purple_agent_url}
    )

    # 2. Get coding task
    task = get_coding_task()
    await update_battle_process(
        battle_id,
        "Retrieved coding task from task bank",
        "green_agent",
        {"task_preview": task[:200]}
    )

    # 3. Send task to purple agent
    await update_battle_process(
        battle_id,
        "Sending task to purple agent",
        "green_agent",
        {"target": purple_agent_url}
    )

    solution_json = await send_coding_task(purple_agent_url, task, battle_id)
    solution = json.loads(solution_json)

    # Check for errors
    if "error" in solution:
        await update_battle_process(
            battle_id,
            f"Error from purple agent: {solution.get('message', 'Unknown error')}",
            "green_agent",
            solution
        )
        await report_on_battle_end(
            battle_id,
            winner="none",
            detail={"error": solution, "contextualDebtScore": 0.0}
        )
        return f"Evaluation failed: {solution.get('message', 'Unknown error')}"

    # 4. Log solution received
    await update_battle_process(
        battle_id,
        "Solution received from purple agent",
        "purple_agent",
        {
            "has_source_code": bool(solution.get("sourceCode")),
            "has_test_code": bool(solution.get("testCode")),
            "has_rationale": bool(solution.get("rationale"))
        }
    )

    # 5. Run analysis
    await update_battle_process(
        battle_id,
        "Running contextual debt analysis",
        "green_agent",
        {}
    )

    result_json = await evaluate_solution(
        source_code=solution.get("sourceCode", ""),
        test_code=solution.get("testCode", ""),
        rationale=solution.get("rationale", ""),
        battle_id=battle_id
    )
    result = json.loads(result_json)

    # 6. Log analysis results
    await update_battle_process(
        battle_id,
        "Analysis complete",
        "green_agent",
        result
    )

    # 7. Report final result
    await report_on_battle_end(
        battle_id,
        winner="purple_agent",
        detail={
            "contextualDebtScore": result.get("contextualDebtScore", 0.0),
            "breakdown": result.get("breakdown", {})
        }
    )

    score = result.get("contextualDebtScore", 0.0)
    return f"Evaluation complete. Contextual Debt Score: {score:.2f}"
