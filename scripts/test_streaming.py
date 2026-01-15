#!/usr/bin/env python3
"""
Quick test script to verify A2A streaming is working.
Sends a simple message to Purple Agent and watches tokens arrive in real-time.
"""
import asyncio
import sys
import time
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from agentbeats.client import send_message


async def test_streaming():
    """Test streaming from Purple Agent"""
    purple_url = "http://localhost:9001"
    
    print("Testing A2A Streaming...")
    print(f"Target: {purple_url}")
    print("Message: Write a Python hello world program")
    print("-" * 60)
    
    # Track token timing
    token_count = 0
    start_time = time.time()
    last_token_time = start_time
    
    # Custom event consumer to watch tokens arrive
    async def token_watcher(event, card):
        nonlocal token_count, last_token_time
        current_time = time.time()
        elapsed = current_time - last_token_time
        last_token_time = current_time
        
        # Show token arrival
        token_count += 1
        print(f"[Token {token_count:3d}] (+{elapsed:.3f}s) Event type: {type(event).__name__}")
    
    # Send message with streaming enabled
    result = await send_message(
        message="Write a Python hello world program with a docstring.",
        base_url=purple_url,
        streaming=True,
        consumer=token_watcher
    )
    
    total_time = time.time() - start_time
    
    print("-" * 60)
    print(f"\n✅ Streaming test complete!")
    print(f"Total tokens/events: {token_count}")
    print(f"Total time: {total_time:.2f}s")
    print(f"Average: {total_time/max(token_count,1):.3f}s per event")
    print(f"\nResponse length: {len(result['response'])} chars")
    print(f"\nFirst 200 chars of response:")
    print(result['response'][:200])


if __name__ == "__main__":
    asyncio.run(test_streaming())
