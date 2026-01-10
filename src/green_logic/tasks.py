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
""",
        "constraints": {}  # No special constraints
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
""",
        "constraints": {}  # No special constraints
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
""",
        "constraints": {}  # No special constraints
    },
    {
        "id": "task-004",
        "title": "Recursive Fibonacci",
        "description": """
Implement a Fibonacci function with the following STRICT requirements:

1. Create a function `fibonacci(n: int) -> int`
2. Return the n-th Fibonacci number (0-indexed: fib(0)=0, fib(1)=1, fib(2)=1, ...)
3. **CRITICAL CONSTRAINT: You MUST use recursion. No loops allowed.**
4. Handle edge cases (n < 0 should return 0)
5. Optimize if possible (memoization is allowed)

**ALGORITHMIC CONSTRAINTS (enforced by static analysis):**
- Must use recursive function calls
- No `for` or `while` loops permitted
- No imports of `os`, `sys`, or `subprocess`

Provide your response as JSON with:
- sourceCode: Your implementation
- testCode: Unit tests (recommended)
- rationale: Explain your design decisions
""",
        "constraints": {
            "require_recursion": True,
            "forbid_loops": True
        },
        "hidden_tests": """
# Hidden tests - Purple Agent's tests are IGNORED for this task
# These tests are run by the Green Agent to verify correctness
from solution import fibonacci

def test_fibonacci_base_cases():
    \"\"\"Test base cases: fib(0) = 0, fib(1) = 1\"\"\"
    assert fibonacci(0) == 0, "fib(0) should be 0"
    assert fibonacci(1) == 1, "fib(1) should be 1"

def test_fibonacci_small_values():
    \"\"\"Test small Fibonacci values\"\"\"
    assert fibonacci(2) == 1, "fib(2) should be 1"
    assert fibonacci(5) == 5, "fib(5) should be 5"
    assert fibonacci(10) == 55, "fib(10) should be 55"

def test_fibonacci_larger_value():
    \"\"\"Test a larger Fibonacci number\"\"\"
    assert fibonacci(15) == 610, "fib(15) should be 610"

def test_fibonacci_negative():
    \"\"\"Test negative input returns 0\"\"\"
    assert fibonacci(-1) == 0, "fib(-1) should be 0"
    assert fibonacci(-100) == 0, "fib(-100) should be 0"
"""
    }
]
