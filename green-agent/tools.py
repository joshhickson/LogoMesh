"""LogoMesh Green Agent Tools.

Simple tools for the green agent to:
1. Send coding tasks to purple agents
2. Report evaluation results
"""

import json
import agentbeats as ab
import httpx

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
Implement a simple rate limiter with the following requirements:

1. Create a class `RateLimiter` that limits requests per time window
2. Constructor: `RateLimiter(max_requests: int, window_seconds: int)`
3. Method: `is_allowed(client_id: str) -> bool`
4. Track requests per client independently
5. Clean up old entries to prevent memory leaks

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
2. Constructor: `LRUCache(capacity: int)`
3. Method: `get(key: str) -> any` - returns value or None
4. Method: `put(key: str, value: any) -> None`
5. When capacity is exceeded, evict the least recently used item
6. Both get and put should be O(1) operations

Provide your response as JSON with:
- sourceCode: Your implementation
- testCode: Unit tests (recommended)
- rationale: Explain your design decisions
"""
    }
]


@ab.tool
async def send_coding_task(purple_agent_url: str, battle_id: str) -> str:
    """
    Send a coding task to the purple agent and receive their solution.

    Args:
        purple_agent_url: The URL of the purple agent (e.g., http://localhost:9050/)
        battle_id: The current battle ID for tracking

    Returns:
        The purple agent's response containing sourceCode, testCode, and rationale
    """
    import random

    # Select a random task
    task = random.choice(CODING_TASKS)

    # Construct the message for the purple agent
    message = {
        "type": "coding_task",
        "battle_id": battle_id,
        "task_id": task["id"],
        "task_title": task["title"],
        "instructions": task["description"],
        "response_format": {
            "sourceCode": "Your implementation code",
            "testCode": "Your test code (optional but recommended)",
            "rationale": "Explanation of your design decisions"
        }
    }

    try:
        async with httpx.AsyncClient(timeout=300.0) as client:
            # Send as A2A message using proper protocol format
            task_prompt = f"""CODING TASK: {task['title']}

{task['description']}

IMPORTANT: Respond with valid JSON only (no markdown code blocks):
{{"sourceCode": "...", "testCode": "...", "rationale": "..."}}"""

            response = await client.post(
                purple_agent_url.rstrip('/') + '/',
                json={
                    "jsonrpc": "2.0",
                    "method": "message/send",
                    "params": {
                        "message": {
                            "messageId": f"task-{battle_id}",
                            "role": "user",
                            "parts": [{"type": "text", "text": task_prompt}]
                        }
                    },
                    "id": battle_id
                },
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()

            result = response.json()
            return json.dumps({
                "task_sent": task["title"],
                "task_id": task["id"],
                "purple_agent_response": result
            }, indent=2)

    except httpx.TimeoutException:
        return json.dumps({
            "error": "timeout",
            "message": f"Purple agent did not respond within 300 seconds",
            "task_sent": task["title"]
        })
    except httpx.HTTPStatusError as e:
        return json.dumps({
            "error": "http_error",
            "status_code": e.response.status_code,
            "message": str(e),
            "task_sent": task["title"]
        })
    except Exception as e:
        return json.dumps({
            "error": "unknown",
            "message": str(e),
            "task_sent": task["title"]
        })


@ab.tool
def report_result(battle_id: str, score: float, breakdown: str) -> str:
    """
    Report the final contextual debt evaluation result.

    Args:
        battle_id: The battle ID
        score: The final contextual debt score (0.0 to 1.0, higher is better)
        breakdown: A string explaining the score breakdown for each dimension

    Returns:
        Confirmation message
    """
    # Print to console for visibility
    print("\n" + "=" * 60)
    print(f"BATTLE EVALUATION COMPLETE: {battle_id}")
    print("=" * 60)
    print(f"Contextual Debt Score: {score:.2f}")
    print("-" * 60)
    print("Score Breakdown:")
    print(breakdown)
    print("=" * 60 + "\n")

    return json.dumps({
        "status": "reported",
        "battle_id": battle_id,
        "contextual_debt_score": score,
        "breakdown": breakdown
    }, indent=2)
