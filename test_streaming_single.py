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
    
    scorer = ContextualIntegrityScorer()
    
    # Simple test case: rate limiter
    task_desc = "Implement a rate limiter that restricts 100 API calls per 60 seconds"
    source_code = """
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
    """
    
    print("\n[TEST] Running streaming logic judge...")
    print(f"[INFO] Model: {os.getenv('MODEL_NAME', 'gpt-4o-mini')}")
    print(f"[INFO] Testing: Rate Limiter implementation")
    print(f"[INFO] This tests logic evaluation with complex code analysis")
    
    start_time = datetime.now()
    
    try:
        result = await scorer._perform_logic_review(task_desc, source_code)
        elapsed = (datetime.now() - start_time).total_seconds()
        
        print(f"\n✅ STREAMING COMPLETED SUCCESSFULLY")
        print(f"   Elapsed Time: {elapsed:.2f}s")
        print(f"   Logic Score: {result.get('logic_score', 'N/A')}")
        
        critique = result.get('critique', 'N/A')
        if len(critique) > 150:
            critique = critique[:150] + "..."
        print(f"   Critique: {critique}")
        
        # Check for timeout fallback (bad sign)
        if "timed out" in str(result.get('critique', '')).lower():
            print(f"\n⚠️  FAILED: Timeout fallback detected!")
            return False
        
        # Check for reasonable score
        score = result.get('logic_score')
        if score and 0.0 <= score <= 1.0:
            print(f"\n✅ Score is in valid range [0.0, 1.0]")
            return True
        else:
            print(f"\n⚠️  WARNING: Score {score} outside valid range")
            return False
        
    except Exception as e:
        elapsed = (datetime.now() - start_time).total_seconds()
        print(f"\n❌ STREAMING FAILED")
        print(f"   Elapsed Time: {elapsed:.2f}s")
        print(f"   Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


async def main():
    """Run the streaming test."""
    success = await test_streaming_logic_judge()
    
    print("\n" + "=" * 70)
    if success:
        print("RESULT: ✅ Streaming implementation WORKS CORRECTLY")
        print("        No timeouts, natural completion, signal-based detection")
        sys.exit(0)
    else:
        print("RESULT: ❌ Streaming implementation FAILED")
        print("        Check logs above for details")
        sys.exit(1)


if __name__ == "__main__":
    # Set environment for test
    os.environ.setdefault("MODEL_NAME", "gpt-4o-mini")
    os.environ.setdefault("OPENAI_API_KEY", os.getenv("OPENAI_API_KEY", ""))
    
    asyncio.run(main())
