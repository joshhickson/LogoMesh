#!/usr/bin/env python3
"""
Quick test of streaming implementation with a single battle.
Validates that the A2A streaming approach works without timeouts.
"""

import asyncio
import json
import os
import sys
from datetime import datetime

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

async def test_streaming_logic_judge():
    """Test the streaming-based logic judge."""
    print("=" * 70)
    print("TEST: A2A Streaming Logic Judge")
    print("=" * 70)
    
    from green_logic.scoring import ContextualIntegrityScorer
    
    # Simple test response
    test_response = {
        "solution_code": """
def rate_limiter(func):
    '''Rate limiting decorator using sliding window.'''
    from collections import defaultdict
    from time import time
    
    call_times = defaultdict(list)
    
    def wrapper(*args, **kwargs):
        now = time()
        user_id = kwargs.get('user_id', 'default')
        
        # Remove old calls outside window
        call_times[user_id] = [t for t in call_times[user_id] if now - t < 60]
        
        if len(call_times[user_id]) >= 100:
            raise Exception('Rate limit exceeded')
        
        call_times[user_id].append(now)
        return func(*args, **kwargs)
    
    return wrapper
        """.strip(),
        "architecture_notes": "Uses sliding window with timestamp tracking per user",
        "test_cases": "Includes basic rate limit enforcement test",
        "task_id": "test-rate-limiter"
    }
    
    scorer = ContextualIntegrityScorer()
    
    print("\n[TEST] Running streaming logic judge...")
    print(f"[INFO] Model: {os.getenv('MODEL_NAME', 'gpt-4o-mini')}")
    print(f"[INFO] Testing with: Rate Limiter implementation")
    
    start_time = datetime.now()
    
    try:
        result = await scorer._perform_logic_review(test_response)
            task_desc = "Implement a rate limiter that restricts 100 API calls per 60 seconds"
            source_code = test_response["solution_code"]
            result = await scorer._perform_logic_review(task_desc, source_code)
        elapsed = (datetime.now() - start_time).total_seconds()
        
        try:
            task_desc = "Implement a rate limiter that restricts 100 API calls per 60 seconds"
            source_code = test_response["solution_code"]
            result = await scorer._perform_logic_review(task_desc, source_code)
            elapsed = (datetime.now() - start_time).total_seconds()
        print(f"\n✅ STREAMING COMPLETED SUCCESSFULLY")
        print(f"   Time: {elapsed:.2f}s")
        print(f"   Logic Score: {result.get('logic_score', 'N/A')}")
        print(f"   Critique: {result.get('critique', 'N/A')[:100]}...")
        
        # Check for timeout fallback (bad sign)
        if "timed out" in str(result.get('critique', '')).lower():
            print(f"\n⚠️  WARNING: Timeout fallback detected!")
            return False
        
        return True
        
    except Exception as e:
        elapsed = (datetime.now() - start_time).total_seconds()
        print(f"\n❌ STREAMING FAILED")
        print(f"   Time: {elapsed:.2f}s")
        print(f"   Error: {str(e)}")
        return False


async def main():
    """Run the streaming test."""
    success = await test_streaming_logic_judge()
    
    print("\n" + "=" * 70)
    if success:
        print("RESULT: ✅ Streaming implementation works correctly")
        print("        No timeouts, natural completion with signal detection")
        sys.exit(0)
    else:
        print("RESULT: ❌ Streaming implementation failed")
        print("        Check logs above for details")
        sys.exit(1)


if __name__ == "__main__":
    # Set environment for test
    os.environ.setdefault("MODEL_NAME", "gpt-4o-mini")
    os.environ.setdefault("OPENAI_API_KEY", os.getenv("OPENAI_API_KEY", ""))
    
    asyncio.run(main())
