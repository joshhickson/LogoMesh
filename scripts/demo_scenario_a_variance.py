
import asyncio
import os
import sys
import numpy as np
from statistics import stdev, mean

# Add src to path
sys.path.append(os.path.join(os.getcwd(), "src"))

from green_logic.scoring import ContextualIntegrityScorer
from tests.demo_payloads import GOLDEN_CODE, GOLDEN_RATIONALE

TASK_DESC = "Implement an LRU Cache with get and put methods in O(1) time complexity."

async def run_variance_test():
    print("--- SCENARIO A: VARIANCE TEST (Signal-to-Noise) ---")

    if not os.getenv("OPENAI_API_KEY"):
        print("ERROR: OPENAI_API_KEY not set. Cannot run CIS scoring.")
        return

    scorer = ContextualIntegrityScorer()
    scores = []

    print(f"Running 5 evaluations on identical Golden Sample...")

    for i in range(5):
        print(f"  Run {i+1}/5...", end="", flush=True)

        # Mock Purple Response
        purple_response = {
            "sourceCode": GOLDEN_CODE,
            "rationale": GOLDEN_RATIONALE,
            "testCode": "pass # Tests assumed passed for this check"
        }

        # We assume static/dynamic checks passed for the "Golden" sample to isolate Logic/Rationale variance
        result = await scorer.evaluate(
            task_description=TASK_DESC,
            purple_response=purple_response,
            red_report=None,
            audit_result={"valid": True},
            sandbox_result={"success": True, "duration": 0.1, "output": "All tests passed"}
        )

        score = result["cis_score"]
        scores.append(score)
        print(f" CIS: {score:.3f}")

    avg = mean(scores)
    std = stdev(scores) if len(scores) > 1 else 0.0

    print("\nResults:")
    print(f"  Average CIS: {avg:.3f}")
    print(f"  Std Dev:     {std:.3f}")
    print(f"  Variance:    {(std/avg)*100:.2f}%")

    if std < 0.05:
        print("\nSUCCESS: Variance is low. The metric is stable.")
    else:
        print("\nWARNING: Variance is high. Logic Review may be unstable.")

if __name__ == "__main__":
    asyncio.run(run_variance_test())
