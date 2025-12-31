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
