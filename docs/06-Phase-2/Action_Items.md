# Action Items (Linear Import Ready)

## P0: Priority Zero (Urgent)

1.  **Containerize Red Agent (Uroboros Risk Mitigation)**
    - **Description:** Implement strict Docker containerization/air-gapping for the Red Agent (`src/red_logic/orchestrator.py`) to prevent host machine contamination from executing potentially malicious code (e.g., C/C++ fuzzing or Solidity vulnerabilities).
    - **Owner:** Kuan (Mark) Zhou
    - **Reference:** `docs/06-Phase-2/[2026-02-28] Architecture-Overview.md`, `docs/06-Phase-2/Planning_and_Strategy/[2026-03-03] [post-meeting-brief] Phase 2 Strategic Realignment & Academic Dynamics.md`

2.  **Schedule Academic Deliverables Sync**
    - **Description:** Schedule a follow-up meeting with Prof. Shi to explicitly clarify what LogoMesh can offer in terms of their NeurIPS paper (e.g., evaluation framework, specific baselines to compare against, or metrics that NeurIPS reviewers care about).
    - **Owner:** Joshua Hickson
    - **Reference:** `docs/06-Phase-2/Planning_and_Strategy/[2026-03-03] [post-meeting-brief] Phase 2 Strategic Realignment & Academic Dynamics.md`

3.  **Draft Written Technical Specifications for Ethan**
    - **Description:** Draft the written technical specifications for Ethan so he can begin algorithm design without relying on verbal translation.
    - **Owner:** Joshua Hickson
    - **Reference:** `docs/06-Phase-2/Planning_and_Strategy/[2026-03-03] [post-meeting-brief] Phase 2 Strategic Realignment & Academic Dynamics.md`

4.  **Confirm Competition Repository Rules**
    - **Description:** Determine if the competition rules require the repository to be public throughout the competition or if it can be kept private until the deadline.
    - **Owner:** Joshua Hickson
    - **Reference:** `docs/06-Phase-2/Meetings/[2026-03-03] Dr. Shi Meeting Minutes.md`

## P1: Priority One (High)

5.  **Adapt Red Agent for Cybersecurity Track**
    - **Description:** Map the Red Agent's MCTS mutation logic to the specific vulnerabilities tested by the Phase 1 Cybersecurity winners (Ethernaut Arena, AgentSlug, Chai GPT).
    - **Owner:** Engineering Team (Oleksandr & Josh)
    - **Reference:** `docs/06-Phase-2/Planning_and_Strategy/[2026-03-03] [post-meeting-brief] Phase 2 Strategic Realignment & Academic Dynamics.md`

6.  **Implement CI/CD Preliminary Checks**
    - **Description:** Implement basic GitHub Actions for linting/formatting (flake8, syntax checks) to catch superficial errors before PR reviews.
    - **Owner:** Kuan (Mark) Zhou
    - **Reference:** `docs/06-Phase-2/[2026-02-28] LogoMesh Phase 2 Kickoff Minutes.md`

7.  **Format Data for Croissant Metadata Compliance**
    - **Description:** Structure the output of the SQLite Battle Memory and the Docker Sandbox telemetry to automatically map to the Croissant schema for NeurIPS Datasets and Benchmarks track submission.
    - **Owner:** Engineering Team
    - **Reference:** `docs/06-Phase-2/Planning_and_Strategy/[2026-03-03] LogoMesh Phase 2 Planning & Meeting.md`

8.  **Brief Yichen (Ethan) on Repository Structure**
    - **Description:** Provide Ethan with a detailed overview of the repository so his strengths can be identified and specific algorithm design tasks can be assigned to him.
    - **Owner:** Joshua Hickson
    - **Reference:** User Input (Clarification Protocol)

## P2: Priority Two (Medium)

9.  **Track Generalization Strategy (Coding Agent)**
    - **Description:** Begin assessing how to adapt the LogoMesh evaluation engine to target the Coding Agent track, developing an A2A Task Router capable of dynamically parsing inputs and translating internal strategies into specific dialects (Python, Bash, C/C++).
    - **Owner:** Bakul Gupta
    - **Reference:** `docs/06-Phase-2/[2026-02-28] LogoMesh Phase 2 Kickoff Minutes.md`, `docs/06-Phase-2/Planning_and_Strategy/[2026-03-03] LogoMesh Phase 2 Planning & Meeting.md`
