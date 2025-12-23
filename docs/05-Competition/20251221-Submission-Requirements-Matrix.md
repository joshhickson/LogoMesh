> **Status:** ACTIVE
> **Type:** Spec
> **Context:**
> *   [2025-12-22]: Detailed matrix of submission requirements for both the Lambda (Red) and Custom (Green) tracks. updated with official Canvas guidelines for the Custom Track.

# Submission Requirements Matrix

## 1. Verification Status (Dec 22)

### What We Have Verified (Done)
*   **Submission Format:** The `SCENARIO_SPECIFICATIONS.md` file in Kuan's repo explicitly defines the directory structure (`submissions/{team}/{scenario}`), the required files (`plugin.py`, `scenario.toml`), and the "Success Criteria" (Attack Succeeded JSON).
*   **Agent Architecture:** The Lambda track *mandates* the use of the `ScenarioPlugin` class structure. This is the "Smoking Gun" evidence that disqualifies Samuel's CLI-based agent approach.
*   **Model Limits:** Confirmed the `gpt-oss-20b` (or 80GB H100 constraint) from the `README.md` and meeting notes.

### What Was Missing (Resolved)
*   **Custom Track Rules:** We have resolved the "Green Track" requirements (see Section 2).
*   **Blue Agent Baseline:** We are verifying the location of official scenarios (see Section 3).

## 2. Canvas: Custom Green Agent Guidelines (Official)

**Competition Track:** Create a New Benchmark (Green Agent)
**Status:** Verified as of Dec 23, 2025
**Source:** [https://rdi.berkeley.edu/agentx-agentbeats](https://rdi.berkeley.edu/agentx-agentbeats)

### 2.1. Submission Requirements
Every submission must include the following 6 artifacts:

| Artifact | Requirement Details |
| :--- | :--- |
| **1. Public GitHub Repository** | Must contain complete source code. Crucial: Must include a `README.md` that thoroughly describes the benchmark, setup instructions, and usage guide. |
| **2. Docker Image** | Your agent must be packaged as a Docker image that runs **end-to-end without manual intervention**. |
| **3. Baseline Purple Agent(s)** | You must submit at least one "Purple Agent" (test subject) that is **A2A (Agent-to-Agent) compatible**. Purpose: To demonstrate how your benchmark is evaluated in practice. |
| **4. AgentBeats Registration** | Both your Green Agent and your Baseline Purple Agent must be registered on the [AgentBeats Developer Platform](https://rdi.berkeley.edu/agentx-agentbeats). |
| **5. Abstract** | A brief text description of the tasks the green agent evaluates. |
| **6. Demo Video** | Maximum length: **3 minutes**. Must demonstrate the green agent in action. |

### 2.2. Technical Guidelines
*   **Automation:** The Green Agent must be fully automated (Proctor).
*   **Protocol:** Strict adherence to **A2A Protocol**. Green Agent acts as server/host.
*   **Stability:** Robust error handling; should not crash on unexpected Purple Agent behavior.
*   **Resource Usage:** Must run within "reasonable" limits.
*   **Reproducibility:** Consistent results; any A2A agent must be able to run it.

### 2.3. Scoring Methodology
*   **Dimensions:** Accuracy, Efficiency, Safety (Guardrails).
*   **Method:** Scoring must be **Automated** (Unit tests, Flag capture, LLM-as-a-Judge).

### 2.4. Judging Rubric (The 5 Pillars)
1.  **Technical Correctness:** Code quality, Docker stability, A2A compliance.
2.  **Reproducibility:** Can others run it easily?
3.  **Benchmark Design Quality:** Are tasks realistic?
4.  **Evaluation Methodology:** Is scoring nuanced and automated?
5.  **Innovation & Impact:** Does it fill a missing need?

## 3. Lambda Track Guidelines (Red/Blue)

### 3.1. Submission Requirements
| Artifact | Requirement Details |
| :--- | :--- |
| **Directory Structure** | `submissions/{team_name}/{scenario_id}/` |
| **Core Files** | `plugin.py` (ScenarioPlugin), `scenario.toml`, `README.md` |
| **Evidence** | `test_results/baseline_passed.json`, `test_results/attack_succeeded.json` |
| **Constraint** | Must use `GenericAttacker` / `GenericDefender` |

## 4. Strategic Implications (Consolidation)

1.  **Docker is King:** Both tracks require a Docker image. The "Polyglot" container approach is validated.
2.  **Purple Agent is Mandatory:** The Custom Track explicitly requires submitting a "Baseline Purple Agent". This confirms that moving Kuan's `generic_defender.py` to `src/blue_logic/` (as the Purple Agent) is a critical path task.
3.  **Registration:** We need to register *both* our Green and Purple agents on the platform.

## 5. Open Logistics Questions (To Be Answered)

### 5.1. Custom Track (Green Agent)
1.  **Docker Hosting:** The requirements specify a "Docker Image," but do not specify the registry.
    *   *Question:* Should we push to Docker Hub, GitHub Container Registry (ghcr.io), or a specific AgentBeats registry?
2.  **Video Submission:** "Demo Video (Max 3 mins)".
    *   *Question:* Is this a file upload (MP4) to the portal, or a hosted link (YouTube/Vimeo)?
3.  **Registration Authentication:** "Must be registered on the AgentBeats Developer Platform".
    *   *Question:* Does the agent require a runtime API key or Token to prove its registration identity during the competition?
4.  **Purple Agent Bundling:** "Submit at least one Purple Agent".
    *   *Question:* Do we register the Purple Agent as a separate entity on the platform, or is it implicitly bundled with the Green Agent submission?

### 5.2. Lambda Track (Red Agent)
1.  **Submission Batching:** "Submit 3-6 scenarios".
    *   *Question:* Should we create a separate Pull Request for each scenario (e.g., `submission/logmesh/dockerdoo`), or one combined PR for the team? (Git instructions imply one branch per scenario).
2.  **Validation Script:**
    *   *Question:* Is there a specific `validate_submission.py` script provided by Lambda to pre-check our `test_results/` before pushing?
