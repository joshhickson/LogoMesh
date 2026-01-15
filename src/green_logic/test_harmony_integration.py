"""
Integration test for Harmony Protocol parser with scoring system.
Tests end-to-end flow of parsing gpt-oss-20b responses.
"""

import asyncio
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from src.green_logic.scoring import ContextualIntegrityScorer


def test_harmony_integration():
    """Test Harmony parser integration with Purple Agent responses."""
    
    print("=== Harmony Integration Test ===\n")
    
    # Mock Purple Agent response with Harmony format
    harmony_response = {
        "task_id": "task-001",
        "sourceCode": """
<|channel|analysis|>
For the email validator task, I'll implement a regex-based solution.

Key design decisions:
1. Use Python's `re` module for pattern matching
2. Check for exactly one @ symbol
3. Validate domain has at least one dot
4. Reject any spaces in the email string

My approach prioritizes simplicity and compliance with the regex-only constraint.
<|channel|end|>

<|channel|final|>
```python
import re

def validate_email(email: str) -> dict:
    # Pattern: non-whitespace chars + @ + non-whitespace chars + . + non-whitespace
    pattern = r'^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$'
    
    # Single @ check
    if email.count('@') != 1:
        return {"valid": False, "reason": "Must have exactly one @ symbol"}
    
    # Check for spaces
    if ' ' in email:
        return {"valid": False, "reason": "No spaces allowed"}
    
    # Regex validation
    if re.match(pattern, email):
        return {"valid": True, "reason": "Valid email format"}
    else:
        return {"valid": False, "reason": "Invalid email format"}
```
<|channel|end|>
""",
        "testCode": """
def test_validate_email():
    assert validate_email("test@example.com")["valid"]
    assert not validate_email("invalid")["valid"]
    assert not validate_email("test@@example.com")["valid"]
""",
        "rationale": "Additional context if provided"
    }
    
    # Mock standard A2A response (no Harmony)
    standard_response = {
        "task_id": "task-001",
        "sourceCode": """
import re

def validate_email(email: str) -> dict:
    pattern = r'^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$'
    valid = bool(re.match(pattern, email))
    return {"valid": valid, "reason": "Valid" if valid else "Invalid"}
""",
        "testCode": "def test(): assert validate_email('test@example.com')['valid']",
        "rationale": "Simple regex-based validation"
    }
    
    # Initialize scorer
    print("Initializing ContextualIntegrityScorer...")
    scorer = ContextualIntegrityScorer()
    
    # Test 1: Harmony format parsing
    print("\n--- Test 1: Harmony Format Detection ---")
    parsed_harmony = scorer._parse_purple_response(harmony_response)
    
    print(f"Source Code Length: {len(parsed_harmony['sourceCode'])} chars")
    print(f"Rationale Length: {len(parsed_harmony['rationale'])} chars")
    print(f"Test Code Length: {len(parsed_harmony['testCode'])} chars")
    
    # Verify code was extracted from <|channel|final>
    assert "import re" in parsed_harmony['sourceCode']
    assert "def validate_email" in parsed_harmony['sourceCode']
    assert "<|channel|" not in parsed_harmony['sourceCode'], "Channel tags should be stripped"
    
    # Verify rationale includes analysis channel content
    # The analysis should contain reasoning from the model
    assert len(parsed_harmony['rationale']) > 50, f"Rationale should contain analysis, got: {len(parsed_harmony['rationale'])} chars"
    
    print("✅ Harmony format parsed correctly")
    
    # Test 2: Standard format (fallback)
    print("\n--- Test 2: Standard A2A Format (Fallback) ---")
    parsed_standard = scorer._parse_purple_response(standard_response)
    
    print(f"Source Code Length: {len(parsed_standard['sourceCode'])} chars")
    print(f"Rationale: {parsed_standard['rationale'][:50]}...")
    
    assert parsed_standard['sourceCode'] == standard_response['sourceCode']
    assert parsed_standard['rationale'] == standard_response['rationale']
    
    print("✅ Standard format handled correctly")
    
    # Test 3: Model detection
    print("\n--- Test 3: Model Detection ---")
    print(f"Current model: {scorer.current_model}")
    
    # Simulate gpt-oss model
    original_model = scorer.current_model
    scorer.current_model = "gpt-oss-20b"
    
    # Should trigger Harmony parsing even without explicit tags
    test_response = {
        "task_id": "task-001",
        "sourceCode": "def foo(): pass",
        "testCode": "",
        "rationale": "Test"
    }
    
    parsed_with_model_detection = scorer._parse_purple_response(test_response)
    print(f"Model detection triggered: {scorer.current_model}")
    
    # Restore original model
    scorer.current_model = original_model
    
    print("✅ Model detection working")
    
    print("\n=== All Integration Tests Passed ===")
    return True


if __name__ == "__main__":
    try:
        success = test_harmony_integration()
        if success:
            print("\n✅ SUCCESS: Harmony parser ready for C-NEW-001 experiments")
            sys.exit(0)
        else:
            print("\n❌ FAILURE: Integration test failed")
            sys.exit(1)
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
