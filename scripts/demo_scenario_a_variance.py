
import asyncio
import os
import sys
from statistics import stdev, mean

# Add src to path
sys.path.append(os.path.join(os.getcwd(), "src"))

from green_logic.scoring import ContextualIntegrityScorer
from tests.demo_payloads import ERC20_GOLDEN_CODE, ERC20_GOLDEN_RATIONALE

TASK_DESC = "Build a secure and exchange-grade cryptocurrency token class in Python (ERC20 standard)."

async def run_variance_test():
    print("--- SCENARIO A: VARIANCE TEST (Proof of Stability) ---")

    if not os.getenv("OPENAI_API_KEY"):
        print("ERROR: OPENAI_API_KEY not set. Cannot run CIS scoring.")
        return

    scorer = ContextualIntegrityScorer()
    scores = []

    print(f"Target: ERC20 Golden Sample")
    print(f"Evaluator: Green Agent (Contextual Integrity Scorer)")
    print("-" * 50)

    for i in range(5):
        print(f"Run {i+1}/5 | Evaluating...", end="", flush=True)

        # Mock Purple Response
        purple_response = {
            "sourceCode": ERC20_GOLDEN_CODE,
            "rationale": ERC20_GOLDEN_RATIONALE,
            "testCode": "pass"
        }

        # We assume static/dynamic checks passed for the "Golden" sample
        result = await scorer.evaluate(
            task_description=TASK_DESC,
            purple_response=purple_response,
            red_report=None,
            audit_result={"valid": True},
            sandbox_result={"success": True, "duration": 0.1, "output": "All tests passed"}
        )

        score = result["cis_score"]
        scores.append(score)
        print(f"  --> CIS Score: {score:.4f}")

    avg = mean(scores)
    std = stdev(scores) if len(scores) > 1 else 0.0

    print("-" * 50)
    print(f"Final Statistics:")
    print(f"  Average CIS: {avg:.4f}")
    print(f"  Std Dev:     {std:.4f}")

    if std < 0.05:
        print("\nSUCCESS: System is logically deterministic. (Std Dev < 0.05)")
    else:
        print("\nWARNING: Variance is high. Logic Review is unstable.")

if __name__ == "__main__":
    asyncio.run(run_variance_test())
