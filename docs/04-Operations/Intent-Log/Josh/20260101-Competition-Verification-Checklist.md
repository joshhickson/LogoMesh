> **Status:** ACTIVE
> **Type:** Checklist
> **Context:**
> *   [2026-01-01]: Verification Checklist derived from the "Judge Evaluation Simulation" and Competition Guidelines.

# Competition Verification Checklist (2026-01-01)

## Overview
This checklist serves as the final gatekeeper for our submission. It is derived from the [Judge Evaluation Simulation Report](../Technical/20251107-LogoMesh%20AgentX%20Judge%20Evaluation%20Simulation.md) ("The Composite Judge") and the [Submission Requirements Matrix](../../../05-Competition/20251221-Submission-Requirements-Matrix.md).

**Rule:** A checkmark here is not just "done"; it is "defensible against a hostile judge."

---

## 1. The "Dawn Song" Filter (Security & Robustness)
*Source: Section 1.3 of Evaluation Simulation*

*   [ ] **The "Prompt Injection" Defense:**
    *   **Question:** Does our Green Agent (Evaluator) sanitize inputs from the Purple Agent (Test Subject)?
    *   **Verification:** Verify that `rationaleDebtAnalyzer.ts` (or Python equivalent) does *not* blindly pass the Purple Agent's output into our scoring LLM without context barriers.
    *   **Defense:** Implement the "Adversarial Context Defense" (KL Divergence) defined in the [Agent Arena Upgrade Plan](../Technical/20260101-Agent-Arena-Upgrade-Plan.md).

*   **The "Crash Test" (Reproducibility):**
    *   **Question:** Can a malicious Purple Agent crash our Green Agent?
    *   **Verification:** Run the Green Agent against a Purple Agent that returns:
        *   Malformed JSON.
        *   A 10MB string (buffer overflow attempt).
        *   Infinite loops (timeout check).
    *   **Constraint:** The Green Agent *must* return a valid "Fail" report, not crash.

---

## 2. The "Auth0" Filter (Identity & Secrets)
*Source: Section 1.3 of Evaluation Simulation*

*   [ ] **The "Naive" Credential Check:**
    *   **Question:** Are we passing API keys in the JSON payload?
    *   **Verification:** Audit `evaluation.routes.ts` and the NATS message schema.
    *   **Critique:** If `apiKey` is visible in the payload, we fail.
    *   **Remediation:** If a full Identity Provider isn't feasible, ensure keys are injected via Environment Variables in the Docker container and *never* passed over the wire in the evaluation request body.

---

## 3. The "EvoGit" Filter (DevEx & Infrastructure)
*Source: Section 1.2 of Evaluation Simulation*

*   [ ] **The "Integration" Check:**
    *   **Question:** Is our result just a static JSON file?
    *   **Verification:** Ensure the [DBOM (Decision Bill of Materials)](../Technical/20260101-Agent-Arena-Upgrade-Plan.md) is structured to be ingested by a CI/CD pipeline.
    *   **Evidence:** The README should show a snippet of how to "Break the Build" if the CIS score is too low.

*   **The "One-Command" Run:**
    *   **Question:** Can the judge run it in 5 minutes?
    *   **Verification:**
        *   `git clone`
        *   `docker run ...`
        *   **Result:** It works. No "missing .env", no "npm install failed".

---

## 4. The "Novelty" Defense (Contextual Debt vs. Prior Art)
*Source: Section 2.2 of Evaluation Simulation*

*   [ ] **The "DeepEval" Differentiator:**
    *   **Question:** Why is this different from DeepEval's "Contextual Relevancy"?
    *   **Defense:** Our documentation must explicitly state: "DeepEval measures a *static retrieval state*. We measure a *dynamic reasoning process* and the *compounding* of debt over time."
    *   **Action:** Ensure the `README.md` and the Abstract (Submission Requirement #5) include this specific sentence.

*   **The "PromptDebt" Citation:**
    *   **Action:** Cite "PromptDebt (ArXiv:2509.20497)" in our `RELATED_WORK.md` or README to show we are aware of it and differentiating ourselves (Quantitative vs. Qualitative).

---

## 5. Submission Artifact Verification
*Source: Submission Requirements Matrix*

*   [ ] **1. Public GitHub Repo:** `README.md` is complete.
*   [ ] **2. Docker Image:** Published to GHCR.
*   [ ] **3. Baseline Purple Agent:** The "Blue Logic" is packaged and runnable as a test subject.
*   [ ] **4. Registration:** Both agents are registered on the platform.
*   [ ] **5. Abstract:** Written and differentiates from DeepEval.
*   [ ] **6. Demo Video:** < 3 minutes. Shows the "Iron Sharpens Iron" loop.

---

## 6. The "Red Team" Final Audit
*   [ ] **Self-Hack:** Use the [Contextual FGA Breaker](../Josh/20260101-Arena-Team-Tasks.md) to attack our own Green Agent.
*   [ ] **Result:** If we successfully exploit ourselves, we are not ready.
