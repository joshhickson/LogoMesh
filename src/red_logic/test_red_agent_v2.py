#!/usr/bin/env python3
"""
Test script for Red Agent V2.

Run from project root:
    python -m red_logic.test_red_agent_v2
"""

import asyncio
import sys
import os

# Add parent path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from red_logic.orchestrator import RedAgentV2, AttackConfig


# Test cases with known vulnerabilities
TEST_CASES = [
    {
        "name": "SQL Injection (task-014)",
        "task_id": "task-014",
        "code": '''
class QueryBuilder:
    def __init__(self):
        self.query = ""
        self.params = []

    def select(self, *columns):
        cols = ", ".join(columns) if columns else "*"
        self.query = f"SELECT {cols}"
        return self

    def from_table(self, table):
        self.query += f" FROM {table}"  # Vulnerable!
        return self

    def where(self, column, operator, value):
        # VULNERABLE: Using f-string instead of parameterized query
        self.query += f" WHERE {column} {operator} '{value}'"
        return self

    def build(self):
        return self.query, self.params
''',
        "expected_severity": "CRITICAL",
        "expected_category": "sql_injection"
    },
    {
        "name": "Eval Injection",
        "task_id": None,
        "code": '''
def calculate(expression):
    """Calculate a math expression from user input."""
    # DANGEROUS: eval with user input
    result = eval(expression)
    return result
''',
        "expected_severity": "CRITICAL",
        "expected_category": "dangerous_function"
    },
    {
        "name": "Forbidden Import (task-001)",
        "task_id": "task-001",
        "code": r'''
import re
import socket  # FORBIDDEN for email validation

def validate_email(email: str) -> dict:
    # Using regex as required
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if re.match(pattern, email):
        # But also doing network call (FORBIDDEN)
        try:
            socket.gethostbyname(email.split('@')[1])
            return {"valid": True, "reason": "Valid and domain exists"}
        except:
            return {"valid": False, "reason": "Domain not found"}
    return {"valid": False, "reason": "Invalid format"}
''',
        "expected_severity": "HIGH",
        "expected_category": "forbidden_import"
    },
    {
        "name": "Loop in Fibonacci (task-004)",
        "task_id": "task-004",
        "code": '''
def fibonacci(n: int) -> int:
    """Calculate fibonacci number - SHOULD use recursion but uses loop!"""
    if n < 0:
        return 0
    if n <= 1:
        return n

    # VIOLATION: Using loop instead of recursion
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b
''',
        "expected_severity": "HIGH",
        "expected_category": "constraint_violation"
    },
    {
        "name": "Race Condition in Rate Limiter (task-002)",
        "task_id": "task-002",
        "code": '''
import time

class RateLimiter:
    def __init__(self, max_requests=10, window_seconds=60):
        self.max_requests = max_requests
        self.window = window_seconds
        self.requests = {}  # No thread safety!

    def is_allowed(self, client_id: str) -> bool:
        now = time.time()  # Using non-monotonic time

        # Clean old entries (race condition possible here)
        if client_id in self.requests:
            self.requests[client_id] = [
                t for t in self.requests[client_id]
                if now - t < self.window
            ]
        else:
            self.requests[client_id] = []

        # Check limit (race condition possible here)
        if len(self.requests[client_id]) >= self.max_requests:
            return False

        # Record request (race condition possible here)
        self.requests[client_id].append(now)
        return True
''',
        "expected_severity": "HIGH",
        "expected_category": "constraint_violation"  # Missing threading
    },
]


async def run_tests():
    """Run all test cases and report results."""
    print("=" * 70)
    print("RED AGENT V2 TEST SUITE")
    print("=" * 70)

    # Configure for testing (shorter timeouts)
    config = AttackConfig(
        enable_smart_layer=False,  # Disable for faster testing
        enable_reflection=False,
        max_total_time=30.0
    )

    agent = RedAgentV2(config)

    passed = 0
    failed = 0

    for i, test in enumerate(TEST_CASES, 1):
        print(f"\n[Test {i}/{len(TEST_CASES)}] {test['name']}")
        print("-" * 50)

        try:
            report = await agent.attack(
                code=test["code"],
                task_id=test.get("task_id"),
                task_description=f"Testing {test['name']}"
            )

            # Check results
            found_expected = False
            for vuln in report.vulnerabilities:
                severity_match = vuln.severity.value.lower() == test["expected_severity"].lower()
                category_match = test["expected_category"] in vuln.category.lower() or \
                                vuln.category.lower() in test["expected_category"]

                if severity_match or category_match:
                    found_expected = True
                    print(f"  ✅ Found: [{vuln.severity.value}] {vuln.title}")
                    print(f"     Category: {vuln.category}")
                    break

            if found_expected:
                print(f"  ✅ PASSED - Found expected vulnerability")
                passed += 1
            else:
                print(f"  ❌ FAILED - Expected {test['expected_severity']} {test['expected_category']}")
                print(f"     Found {len(report.vulnerabilities)} vulnerabilities:")
                for v in report.vulnerabilities[:3]:
                    print(f"       - [{v.severity.value}] {v.title} ({v.category})")
                failed += 1

            print(f"  Summary: {report.attack_summary[:80]}...")

        except Exception as e:
            print(f"  ❌ ERROR: {e}")
            failed += 1

    print("\n" + "=" * 70)
    print(f"RESULTS: {passed} passed, {failed} failed")
    print("=" * 70)

    return failed == 0


async def run_single_test_with_smart_layer():
    """Run a single test with smart layer enabled to verify LLM integration."""
    print("\n" + "=" * 70)
    print("SMART LAYER TEST (with LLM)")
    print("=" * 70)

    # This test needs LLM
    if not os.getenv("OPENAI_API_KEY"):
        print("⚠️  Skipping smart layer test - OPENAI_API_KEY not set")
        return True

    config = AttackConfig(
        enable_smart_layer=True,
        enable_reflection=False,
        max_total_time=45.0,
        smart_layer_timeout=30.0
    )

    agent = RedAgentV2(config)

    # Code with subtle logic flaw (hard for static analysis)
    code = '''
class BankAccount:
    def __init__(self, balance=0):
        self.balance = balance

    def withdraw(self, amount):
        # Logic flaw: check happens before other thread could modify balance
        if amount <= self.balance:
            # Another thread could withdraw here!
            self.balance -= amount
            return True
        return False

    def deposit(self, amount):
        self.balance += amount  # Not atomic!
'''

    print("\nAnalyzing code with potential race condition...")

    report = await agent.attack(
        code=code,
        task_id=None,
        task_description="Thread-safe bank account implementation"
    )

    print(f"\nFound {len(report.vulnerabilities)} vulnerabilities:")
    for v in report.vulnerabilities:
        print(f"  [{v.severity.value}] {v.title}")
        print(f"    {v.description[:100]}...")

    print(f"\nSummary: {report.attack_summary}")

    return True


if __name__ == "__main__":
    print("Starting Red Agent V2 Tests...\n")

    # Run static tests
    success = asyncio.run(run_tests())

    # Run smart layer test if API key available
    asyncio.run(run_single_test_with_smart_layer())

    sys.exit(0 if success else 1)
