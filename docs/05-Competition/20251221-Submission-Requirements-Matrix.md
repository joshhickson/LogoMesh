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
*   **Blue Agent Baseline:** Verified. Found 3 submissions + 1 example (see Section 3.2).

## 2. Canvas: Custom Green Agent Guidelines (Official)

**Competition Track:** Create a New Benchmark (Green Agent)
**Status:** Verified as of Dec 23, 2025
**Source:** [https://rdi.berkeley.edu/agentx-agentbeats](https://rdi.berkeley.edu/agentx-agentbeats)

### 2.1. Submission Requirements
Every submission must include the following 6 artifacts:

| Artifact | Requirement Details |
| :--- | :--- |
| **1. Public GitHub Repository** | Must contain complete source code. Crucial: Must include a `README.md` that thoroughly describes the benchmark, setup instructions, and usage guide. |
| **2. Docker Image** | Your agent must be packaged as a Docker image that runs **end-to-end without manual intervention**. **Must be published to the GitHub Container Registry (GHCR).** |
| **3. Baseline Purple Agent(s)** | You must submit at least one "Purple Agent" (test subject) that is **A2A (Agent-to-Agent) compatible**. Purpose: To demonstrate how your benchmark is evaluated in practice. |
| **4. AgentBeats Registration** | Both your Green Agent and your Baseline Purple Agent must be registered on the [AgentBeats Developer Platform](https://rdi.berkeley.edu/agentx-agentbeats). |
| **5. Abstract** | A brief text description of the tasks the green agent evaluates. |
| **6. Demo Video** | Maximum length: **3 minutes**. Must demonstrate the green agent in action. |

### 2.2. Technical Guidelines
*   **Automation:** The Green Agent must be fully automated (Proctor).
*   **Protocol:** Strict adherence to **A2A Protocol**. Green Agent acts as server/host.
*   **Entrypoint Interface:** The Docker image must accept specific CLI arguments to start the server:
    *   `--host`: Host address to bind to.
    *   `--port`: Port to listen on.
    *   `--card-url`: The URL to advertise in the agent card.
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

### 3.2. Verified Scenarios (Existing Implementation)
We have confirmed the following scenarios are present in `external/TEAM/`:
1.  **DockerDoo** (`dockerdoo`): Supply Chain / Hallucination Attack.
2.  **SolarSpike** (`solarspike`): Indirect Prompt Injection / Data Poisoning.
3.  **DebugDump** (`debugdump`): Prompt Extraction / Info Disclosure.
4.  **MedicalLeak** (`example_medical`): PII Extraction (Example Plugin).
*   **Missing:** "AdAttack" (Not found in repo).

## 4. Strategic Implications (Consolidation)

1.  **Docker is King:** Both tracks require a Docker image. The "Polyglot" container approach is validated.
2.  **Purple Agent is Mandatory:** The Custom Track explicitly requires submitting a "Baseline Purple Agent". This confirms that moving Kuan's `generic_defender.py` to `src/blue_logic/` (as the Purple Agent) is a critical path task.
3.  **Registration:** We need to register *both* our Green and Purple agents on the platform. The guidelines confirm they are treated as **Separate Entities** requiring distinct registrations.

## 5. Open Logistics Questions (Unverified)

### 5.1. Custom Track (Green Agent)
1.  **Video Submission:** "Demo Video (Max 3 mins)".
    *   *Status:* **Unverified**. The guidelines specify length but not the submission mechanism (File Upload vs. YouTube/Vimeo Link).
2.  **Registration Authentication:** "Must be registered on the AgentBeats Developer Platform".
    *   *Status:* **Unverified**. The technical method for enforcing runtime identity (Token, API Key, mTLS) is not specified in the current text.

### 5.2. Lambda Track (Red Agent)
1.  **Submission Batching:** "Submit 3-6 scenarios".
    *   *Status:* **Unverified**. No data on whether scenarios should be batched in one PR or submitted individually.
2.  **Validation Script:**
    *   *Status:* **Unverified**. No reference to a `validate_submission.py` script was found in the provided Lambda documentation.
