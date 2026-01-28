
import asyncio
import os
import sys
from statistics import stdev, mean

# Add src to path
sys.path.append(os.path.join(os.getcwd(), "src"))

from green_logic.scoring import ContextualIntegrityScorer
from tests.demo_payloads import BANK_GOLDEN_CODE, BANK_GOLDEN_RATIONALE

TASK_DESC = "Implement an Event Sourcing system with strict Optimistic Concurrency Control to prevent race conditions."

async def run_variance_test():
    print("--- SCENARIO A: VARIANCE TEST (Financial Liability) ---")

    if not os.getenv("OPENAI_API_KEY"):
        print("ERROR: OPENAI_API_KEY not set. Cannot run CIS scoring.")
        return

    scorer = ContextualIntegrityScorer()
    scores = []

    print(f"Target: Bank Account Ledger (Event Sourcing)")
    print(f"Evaluator: Green Agent (Contextual Integrity Scorer)")
    print("-" * 60)

    for i in range(5):
        print(f"Run {i+1}/5 | Evaluating Ledger Integrity...", end="", flush=True)

        # Mock Purple Response
        purple_response = {
            "sourceCode": BANK_GOLDEN_CODE,
            "rationale": BANK_GOLDEN_RATIONALE,
            "testCode": "pass"
        }

        result = await scorer.evaluate(
            task_description=TASK_DESC,
            purple_response=purple_response,
            red_report=None,
            audit_result={"valid": True},
            sandbox_result={"success": True, "duration": 0.1}
        )

        score = result["cis_score"]
        scores.append(score)
        print(f"  --> CIS Score: {score:.4f}")

    avg = mean(scores)
    std = stdev(scores) if len(scores) > 1 else 0.0

    print("-" * 60)
    print(f"Final Statistics:")
    print(f"  Average CIS: {avg:.4f}")
    print(f"  Std Dev:     {std:.4f}")

    if std < 0.05:
        print("\nSUCCESS: System is logically deterministic. (Std Dev < 0.05)")
    else:
        print("\nWARNING: Variance is high. Logic Review is unstable.")

if __name__ == "__main__":
    asyncio.run(run_variance_test())
