
import asyncio
import os
import sys

# Add src to path
sys.path.append(os.path.join(os.getcwd(), "src"))

from green_logic.scoring import ContextualIntegrityScorer
from red_logic.dependency_analyzer import analyze_dependencies, findings_to_vulnerabilities
from red_logic.red_report_types import RedAgentReport, Severity, Vulnerability

from tests.demo_payloads import (
    ERC20_GOLDEN_CODE, ERC20_GOLDEN_RATIONALE,
    ERC20_LAZY_CODE, ERC20_LAZY_RATIONALE,
    ERC20_VULNERABLE_CODE, ERC20_VULNERABLE_RATIONALE
)

TASK_DESC = "Build a secure and exchange-grade cryptocurrency token class in Python (ERC20 standard)."

async def run_iteration_test():
    print("--- SCENARIO B: ITERATION TEST (The Decay of Intent) ---")

    if not os.getenv("OPENAI_API_KEY"):
        print("ERROR: OPENAI_API_KEY not set. Cannot run CIS scoring.")
        return

    scorer = ContextualIntegrityScorer()

    # --- TURN 1: GOLDEN ---
    print("\n" + "="*60)
    print("TURN 1: Initial Submission (High Intent)")
    print("="*60)
    res1 = await scorer.evaluate(
        task_description=TASK_DESC,
        purple_response={"sourceCode": ERC20_GOLDEN_CODE, "rationale": ERC20_GOLDEN_RATIONALE, "testCode": "pass"},
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
        purple_response={"sourceCode": ERC20_LAZY_CODE, "rationale": ERC20_LAZY_RATIONALE, "testCode": "pass"},
        red_report=None,
        audit_result={"valid": True},
        sandbox_result={"success": True}
    )
    print(f"  > Rationale Integrity:   {res2['rationale_score']:.2f} (DROPPED)")
    print(f"  > Architecture Score:    {res2['architecture_score']:.2f}")
    print(f"  > Final CIS Score:       {res2['cis_score']:.3f} (WARNING)")

    # --- TURN 3: VULNERABLE ---
    print("\n" + "="*60)
    print("TURN 3: Collapse (Security Failure)")
    print("="*60)

    # Run Red Agent Logic (Static) manually to simulate the Embedded Attack
    findings = analyze_dependencies(ERC20_VULNERABLE_CODE)
    vulns = findings_to_vulnerabilities(findings)

    # Convert dicts to RedAgentReport object
    red_report_obj = RedAgentReport(
        attack_successful=len(vulns) > 0,
        vulnerabilities=[
            Vulnerability(
                severity=Severity(v['severity']),
                category=v['category'],
                title=v['title'],
                description=v['description'],
                exploit_code=v.get('exploit_code'),
                line_number=v.get('line_number'),
                confidence=v.get('confidence')
            ) for v in vulns
        ],
        attack_summary="Static analysis found critical issues."
    )

    if red_report_obj.attack_successful:
        print(f"  !! RED AGENT ALERT !!")
        for v in red_report_obj.vulnerabilities:
            print(f"  [CRITICAL] {v.title}")

    res3 = await scorer.evaluate(
        task_description=TASK_DESC,
        purple_response={"sourceCode": ERC20_VULNERABLE_CODE, "rationale": ERC20_VULNERABLE_RATIONALE, "testCode": "pass"},
        red_report=None,
        audit_result={"valid": True},
        sandbox_result={"success": True},
        red_report_obj=red_report_obj
    )
    print(f"  > Red Agent Penalty:     {res3.get('red_penalty_applied', 0):.1%}")
    print(f"  > Final CIS Score:       {res3['cis_score']:.3f} (REJECTED)")

if __name__ == "__main__":
    asyncio.run(run_iteration_test())
