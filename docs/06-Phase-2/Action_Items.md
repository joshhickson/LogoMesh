---
status: SNAPSHOT
type: Log
---
> **Context:**
> * [2026-02-28]: Phase 2 planning document. Archived for historical reference.

# Action Items (Linear Import Ready)

## P0: Priority Zero (Urgent)

1.  **Containerize Red Agent (Uroboros Risk Mitigation)**
    - **Description:** Implement strict Docker containerization/air-gapping for the Red Agent (`src/red_logic/orchestrator.py`) using the "Persistent Sandbox (Sidecar)" architecture via fast IPC.
    - **Owner:** Kuan (Mark) Zhou
    - **Reference:** `docs/06-Phase-2/[2026-02-28] Architecture-Overview.md`, `docs/06-Phase-2/Planning_and_Strategy/[2026-03-03] [post-meeting-brief] Phase 2 Strategic Realignment & Academic Dynamics.md`, [[2026-03-04] Red_Agent_Remediation_Plan.md](./Planning_and_Strategy/[2026-03-04]%20Red_Agent_Remediation_Plan.md)

2.  **Fix Cryptographic Auditability Failures**
    - **Description:** Modify `src/green_logic/agent.py` to enforce uniform, sorted string serialization (`json.dumps(result, sort_keys=True)`) during the hashing process for DBOM artifacts to fix mismatches.
    - **Owner:** Engineering Team
    - **Reference:** [[2026-03-04] Red_Agent_Remediation_Plan.md](./Planning_and_Strategy/[2026-03-04]%20Red_Agent_Remediation_Plan.md)

3.  **Schedule Academic Deliverables Sync**
    - **Description:** Schedule a follow-up meeting with Prof. Shi to explicitly clarify what LogoMesh can offer in terms of their NeurIPS paper (e.g., evaluation framework, specific baselines to compare against, or metrics that NeurIPS reviewers care about).
    - **Owner:** Joshua Hickson
    - **Reference:** `docs/06-Phase-2/Planning_and_Strategy/[2026-03-03] [post-meeting-brief] Phase 2 Strategic Realignment & Academic Dynamics.md`

4.  **Draft Written Technical Specifications for Ethan**
    - **Description:** Draft the written technical specifications for Ethan so he can begin algorithm design without relying on verbal translation.
    - **Owner:** Joshua Hickson
    - **Reference:** `docs/06-Phase-2/Planning_and_Strategy/[2026-03-03] [post-meeting-brief] Phase 2 Strategic Realignment & Academic Dynamics.md`

5.  **Confirm Competition Repository Rules**
    - **Description:** Determine if the competition rules require the repository to be public throughout the competition or if it can be kept private until the deadline.
    - **Owner:** Joshua Hickson
    - **Reference:** `docs/06-Phase-2/Meetings/[2026-03-03] Dr. Shi Meeting Minutes.md`

## P1: Priority One (High)

6.  **Fix Mathematical Scoring Loopholes**
    - **Description:** Add mathematical bounding (`max(l, logic_score - 0.10)`) to the Logic Integrity Score calculation in `src/green_logic/scoring.py` to prevent hallucinated deductions.
    - **Owner:** Engineering Team
    - **Reference:** [[2026-03-04] Red_Agent_Remediation_Plan.md](./Planning_and_Strategy/[2026-03-04]%20Red_Agent_Remediation_Plan.md)

7.  **Adapt Red Agent for Cybersecurity Track**
    - **Description:** Map the Red Agent's MCTS mutation logic to the specific vulnerabilities tested by the Phase 1 Cybersecurity winners (Ethernaut Arena, AgentSlug, Chai GPT). Leverage `task_intelligence.py` for dynamic prompts based on target language.
    - **Owner:** Engineering Team (Oleksandr & Josh)
    - **Reference:** `docs/06-Phase-2/Planning_and_Strategy/[2026-03-03] [post-meeting-brief] Phase 2 Strategic Realignment & Academic Dynamics.md`, [[2026-03-04] Red_Agent_Remediation_Plan.md](./Planning_and_Strategy/[2026-03-04]%20Red_Agent_Remediation_Plan.md)

8.  **Implement CI/CD Preliminary Checks**
    - **Description:** Implement basic GitHub Actions for linting/formatting (flake8, syntax checks) to catch superficial errors before PR reviews.
    - **Owner:** Kuan (Mark) Zhou
    - **Reference:** `docs/06-Phase-2/[2026-02-28] LogoMesh Phase 2 Kickoff Minutes.md`

9.  **Format Data for Croissant Metadata Compliance**
    - **Description:** Structure the output of the SQLite Battle Memory and the Docker Sandbox telemetry to automatically map to the Croissant schema for NeurIPS Datasets and Benchmarks track submission. Develop a script (e.g. `scripts/export_croissant.py`).
    - **Owner:** Engineering Team
    - **Reference:** `docs/06-Phase-2/Planning_and_Strategy/[2026-03-03] LogoMesh Phase 2 Planning & Meeting.md`, [[2026-03-04] Red_Agent_Remediation_Plan.md](./Planning_and_Strategy/[2026-03-04]%20Red_Agent_Remediation_Plan.md)

10. **Brief Yichen (Ethan) on Repository Structure**
    - **Description:** Provide Ethan with a detailed overview of the repository so his strengths can be identified and specific algorithm design tasks can be assigned to him.
    - **Owner:** Joshua Hickson
    - **Reference:** User Input (Clarification Protocol)

## P2: Priority Two (Medium)

11. **Track Generalization Strategy (Coding Agent)**
    - **Description:** Begin assessing how to adapt the LogoMesh evaluation engine to target the Coding Agent track, developing an A2A Task Router capable of dynamically parsing inputs and translating internal strategies into specific dialects (Python, Bash, C/C++).
    - **Owner:** Bakul Gupta
    - **Reference:** `docs/06-Phase-2/[2026-02-28] LogoMesh Phase 2 Kickoff Minutes.md`, `docs/06-Phase-2/Planning_and_Strategy/[2026-03-03] LogoMesh Phase 2 Planning & Meeting.md`
