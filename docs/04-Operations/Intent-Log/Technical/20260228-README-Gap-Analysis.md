# **README Gap Analysis Log**

This document compares the current empirical state of the OpenClaw/LogoMesh codebase (as documented in docs/Analysis\_Compilation.md) against the claims made in the project's Phase 1 README.md. It identifies inaccuracies in documentation and tracks the required patches to ensure transparency with academic and open-source contributors.

## **1\. Contextual Integrity Score (CIS) Calculation & Penalties**

**Original README Claim:**

CIS \= (0.25×R \+ 0.25×A \+ 0.25×T \+ 0.25×L) × red\_penalty × intent\_penalty

"Critical \= ×0.70, High \= ×0.80, Medium \= ×0.90" (Red Penalty)

"Up to ×0.30 if similarity ≈ 0" (Intent Penalty)

**Empirical Reality:**

* The formula structure is correct.  
* The **Red Penalty** multipliers in the code (src/green\_logic/red\_report\_types.py) are actually **Critical: 0.60x, High: 0.75x, Medium: 0.85x**.  
* The **Intent Penalty** in the code (src/green\_logic/scoring.py) scales *down to a floor of 0.30x* (a 70% reduction), rather than an "up to 0.30x reduction" (which would imply a multiplier of 0.70x).

**Resolution:** *PATCHED.* The README Penalty Multipliers table has been updated to reflect the exact float values in the codebase (0.60, 0.75, 0.85) and the Intent mismatch floor scaling has been clarified.

## **2\. Sandbox Execution & Testing Integrity (T Score)**

**Original README Claim:**

"Testing Integrity... 100% pass \= 0.85, 80% pass \= 0.72, 0% \= 0.20"

**Empirical Reality:**

* The base formula is 0.20 \+ (0.65 \* pass\_rate). A 0% pass rate does **not strictly floor the score at 0.20**.  
* The code includes a test\_specificity bonus (t\_base \+= (test\_specificity \- 0.6) \* 0.25). If the code fails all tests (0%) but has default test specificity (0.85), the score is 0.2625, not 0.20.  
* The sandbox networking is conditionally disabled (only if pytest is pre-installed), not strictly disabled for all executions.

**Resolution:** *PATCHED.* The README component table now specifies 0% \= \~0.20 (plus dynamic test specificity bonuses). The conditional network isolation flaw has been documented in the newly added "Security Considerations" section.

## **3\. LLM Logic Integrity (L Score) Adjustment Cap**

**Original README Claim:**

"LLM can only adjust ±0.10 — the ground-truth score is the anchor... LLM adjustment cap of ±0.10 | LLM can refine but can't override ground truth"

**Empirical Reality:**

* The src/green\_logic/scoring.py codebase programmatically enforces the \-0.10 floor constraint for R, A, and T scores via max(score, ground\_truth \- 0.10).  
* However, this programmatic floor is **missing for the Logic (L) score**. The LLM *can* mathematically override the ground truth for the Logic score beyond the ±0.10 cap.

**Resolution:** *PATCHED.* The blanket claim regarding the ±0.10 cap has been removed. The README explicitly notes that R, A, and T have programmatic floors, while the Logic (L) score currently relies solely on strict prompt constraints.

## **4\. Database & DBOM Hashing**

**Original README Claim:**

"Decision Bill of Materials (DBOM) — Cryptographic audit trail... Every evaluation produces a DBOM — a JSON file containing: h\_delta: SHA-256 hash of the evaluation decision"

**Empirical Reality:**

* The integrity check is structurally broken due to JSON serialization inconsistencies.  
* generate\_dbom hashes the *unsorted* JSON string of the result.  
* submit\_result saves the *sorted* JSON string (sort\_keys=True) to the SQLite database.  
* Verifying the database record against the DBOM hash will reliably fail.

**Resolution:** *PATCHED.* Added a "Phase 1 Known Limitation" callout warning researchers that DBOM cryptographic verification is currently experimental and will fail validation due to json.dumps() key sorting. Canonical serialization slated for Phase 2\.

## **5\. Merkle Chaining**

**Original README Claim:**

The README broadly claimed a "cryptographic audit trail for every evaluation decision".

**Empirical Reality:**

* There is **no active implementation of Merkle Chaining** or cryptographic linking between sequential records in the database.

**Resolution:** *PATCHED.* Explicitly stated in the DBOM limitation callout that Merkle chaining across sequential records does not exist and is a roadmap item for Phase 2\.

## **6\. Agent Isolation Boundaries**

**Original README Claim:**

The README diagrams showed the Red Agent as an "Embedded attacker" inside the Green Agent.

**Empirical Reality:**

* There is **no strict programmatic boundary** (no container or separate process) separating the Red Agent from the Green Agent. The Red Agent is passed the Purple Agent's untrusted code directly as a string and maintains full access to standard library modules (os, subprocess).

**Resolution:** *PATCHED.* Added a dedicated "Security Considerations (Phase 1 Infrastructure Gaps)" section detailing the "Uroboros Risk" of running an un-sandboxed Red Agent in-process with the Orchestrator.