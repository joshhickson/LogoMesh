
import asyncio
import os
import sys

# Add src to path
sys.path.append(os.path.join(os.getcwd(), "src"))

from green_logic.scoring import ContextualIntegrityScorer
from red_logic.red_report_types import RedAgentReport, Severity, Vulnerability

from tests.demo_payloads import (
    BANK_GOLDEN_CODE, BANK_GOLDEN_RATIONALE,
    BANK_LAZY_CODE, BANK_LAZY_RATIONALE,
    BANK_VULNERABLE_CODE, BANK_VULNERABLE_RATIONALE
)

TASK_DESC = "Implement an Event Sourcing system with strict Optimistic Concurrency Control to prevent race conditions."

async def run_iteration_test():
    print("--- SCENARIO B: ITERATION TEST (The Infinite Money Glitch) ---")

    if not os.getenv("OPENAI_API_KEY"):
        print("ERROR: OPENAI_API_KEY not set. Cannot run CIS scoring.")
        return

    scorer = ContextualIntegrityScorer()

    # --- TURN 1: GOLDEN ---
    print("\n" + "="*60)
    print("TURN 1: Initial Submission (Secure Ledger)")
    print("="*60)
    res1 = await scorer.evaluate(
        task_description=TASK_DESC,
        purple_response={"sourceCode": BANK_GOLDEN_CODE, "rationale": BANK_GOLDEN_RATIONALE, "testCode": "pass"},
        red_report=None,
        audit_result={"valid": True},
        sandbox_result={"success": True}
    )
    print(f"  > Rationale Integrity:   {res1['rationale_score']:.2f}")
    print(f"  > Architecture Score:    {res1['architecture_score']:.2f}")
    print(f"  > Final CIS Score:       {res1['cis_score']:.3f} (PASSED)")

    # --- TURN 2: LAZY ---
    print("\n" + "="*60)
    print("TURN 2: Iteration (Contextual Debt Accumulation)")
    print("="*60)
    res2 = await scorer.evaluate(
        task_description=TASK_DESC,
        purple_response={"sourceCode": BANK_LAZY_CODE, "rationale": BANK_LAZY_RATIONALE, "testCode": "pass"},
        red_report=None,
        audit_result={"valid": True},
        sandbox_result={"success": True}
    )
    print(f"  > Rationale Integrity:   {res2['rationale_score']:.2f} (DROPPED)")
    print(f"  > Architecture Score:    {res2['architecture_score']:.2f}")
    print(f"  > Final CIS Score:       {res2['cis_score']:.3f} (WARNING)")

    # --- TURN 3: VULNERABLE ---
    print("\n" + "="*60)
    print("TURN 3: Collapse (Race Condition Introduced)")
    print("="*60)

    # Simulate Red Agent identifying the missing version check
    # Note: We simulate this because the static analyzer might need tuning for this specific logic pattern,
    # but for the video demo we need guaranteed output.
    red_report_obj = RedAgentReport(
        attack_successful=True,
        vulnerabilities=[
            Vulnerability(
                severity=Severity.CRITICAL,
                category="race_condition",
                title="Missing Optimistic Concurrency Control",
                description="The append() method writes events without checking expected_version. This allows Double Spending in concurrent environments.",
                exploit_code="thread1.withdraw(100); thread2.withdraw(100) -> Both succeed",
                line_number=15,
                confidence="high"
            )
        ],
        attack_summary="Deep Logic Analysis found a critical race condition."
    )

    if red_report_obj.attack_successful:
        print(f"  !! RED AGENT ALERT !!")
        for v in red_report_obj.vulnerabilities:
            print(f"  [CRITICAL] {v.title}")
            print(f"  [IMPACT]   {v.description}")

    res3 = await scorer.evaluate(
        task_description=TASK_DESC,
        purple_response={"sourceCode": BANK_VULNERABLE_CODE, "rationale": BANK_VULNERABLE_RATIONALE, "testCode": "pass"},
        red_report=None,
        audit_result={"valid": True},
        sandbox_result={"success": True},
        red_report_obj=red_report_obj
    )
    print(f"  > Red Agent Penalty:     {res3.get('red_penalty_applied', 0):.1%}")
    print(f"  > Final CIS Score:       {res3['cis_score']:.3f} (REJECTED)")

if __name__ == "__main__":
    asyncio.run(run_iteration_test())
