
import asyncio
import os
import sys

# Add src to path
sys.path.append(os.path.join(os.getcwd(), "src"))

# We need to bypass the 'a2a' import in red_logic if strictly running locally without SDK
# But since we installed dependencies, it might work if 'a2a' is in path?
# Actually 'a2a' was missing. We will mock Red Agent detection if needed,
# but let's try to use the full scorer which imports Red Report Parser.

from green_logic.scoring import ContextualIntegrityScorer
from red_logic.dependency_analyzer import analyze_dependencies, findings_to_vulnerabilities
from red_logic.red_report_types import RedAgentReport, Severity, Vulnerability

from tests.demo_payloads import (
    GOLDEN_CODE, GOLDEN_RATIONALE,
    LAZY_CODE, LAZY_RATIONALE,
    VULNERABLE_CODE, VULNERABLE_RATIONALE
)

TASK_DESC = "Implement an LRU Cache with get and put methods in O(1) time complexity."

async def run_iteration_test():
    print("--- SCENARIO B: ITERATION TEST (The Death Spiral) ---")

    if not os.getenv("OPENAI_API_KEY"):
        print("ERROR: OPENAI_API_KEY not set. Cannot run CIS scoring.")
        return

    scorer = ContextualIntegrityScorer()

    # --- TURN 1: GOLDEN ---
    print("\n[Turn 1] Submitting Golden Code...")
    res1 = await scorer.evaluate(
        task_description=TASK_DESC,
        purple_response={"sourceCode": GOLDEN_CODE, "rationale": GOLDEN_RATIONALE, "testCode": "pass"},
        red_report=None,
        audit_result={"valid": True},
        sandbox_result={"success": True}
    )
    print(f"  CIS Score: {res1['cis_score']:.3f} (Rationale: {res1['rationale_score']:.2f})")

    # --- TURN 2: LAZY ---
    print("\n[Turn 2] Submitting Lazy Code (Contextual Debt)...")
    res2 = await scorer.evaluate(
        task_description=TASK_DESC,
        purple_response={"sourceCode": LAZY_CODE, "rationale": LAZY_RATIONALE, "testCode": "pass"},
        red_report=None,
        audit_result={"valid": True},
        sandbox_result={"success": True}
    )
    print(f"  CIS Score: {res2['cis_score']:.3f} (Rationale: {res2['rationale_score']:.2f})")

    if res2['cis_score'] < res1['cis_score']:
        print("  >> Confirmed: Score dropped due to poor rationale.")

    # --- TURN 3: VULNERABLE ---
    print("\n[Turn 3] Submitting Vulnerable Code (Security Violation)...")

    # Run Red Agent Logic (Static) manually to simulate the Embedded Attack
    findings = analyze_dependencies(VULNERABLE_CODE)
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
        print(f"  >> Red Agent Triggered: Found {len(vulns)} vulnerabilities.")

    res3 = await scorer.evaluate(
        task_description=TASK_DESC,
        purple_response={"sourceCode": VULNERABLE_CODE, "rationale": VULNERABLE_RATIONALE, "testCode": "pass"},
        red_report=None, # We pass the object below
        audit_result={"valid": True},
        sandbox_result={"success": True},
        red_report_obj=red_report_obj
    )
    print(f"  CIS Score: {res3['cis_score']:.3f}")

    if res3['cis_score'] < 0.4:
        print("  >> Confirmed: Score crashed due to Red Agent penalty.")
    else:
        print(f"  >> WARNING: Score {res3['cis_score']} might be too high for a critical vuln!")

if __name__ == "__main__":
    asyncio.run(run_iteration_test())
