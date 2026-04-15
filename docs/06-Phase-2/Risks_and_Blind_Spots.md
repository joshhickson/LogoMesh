# Risks, Blind Spots & Brutal Realities

This document consolidates all identified architectural flaws, operational risks, and unanswered questions that threaten the success of the LogoMesh Phase 2 and NeurIPS 2026 submissions.

## 1. Architectural Integrity & Security (The "Uroboros" Threat)
**Status: Critical (P0)**
- **The Problem:** The LogoMesh architecture operates an embedded "Red Agent" (`src/red_logic/orchestrator.py`) directly within the primary Green Agent's Python process.
- **The Threat:** The Red Agent is explicitly designed to hunt for, generate, and execute malicious injections (SQL injections, prompt jailbreaks, C/C++ fuzzing, Solidity vulnerabilities). Because it runs in-process and handles untrusted code strings from external Purple Agents, any successful exploit could escape the sandbox and fully compromise the host machine.
- **Action Required:** Immediate Docker containerization/air-gapping of the Red Agent is mandatory before any mass simulations or live target auditing (especially for the newly selected Cybersecurity track) can begin.
- **Resolution Strategy:** See the [[2026-03-04] Red_Agent_Remediation_Plan.md](./%5B2026-03-04%5D%20Red_Agent_Remediation_Plan.md) for the "Persistent Sandbox" architecture.

## 2. Cryptographic Auditability Failures
**Status: High**
- **The Problem:** The system generates a Decision Bill of Materials (DBOM) artifact designed to provide passive auditability. It computes a SHA-256 hash (`h_delta`) of the `raw_result` JSON payload.
- **The Bug:** The DBOM generator in `src/green_logic/agent.py` hashes the **unsorted** JSON string (`json.dumps(result)`). However, the database storage routine saves the **sorted** JSON string (`json.dumps(result, sort_keys=True)`).
- **The Consequence:** Because the serialization order differs, cryptographic verification of the database record against the DBOM hash will consistently fail. This completely breaks the audit trail required for rigorous testing and potential NeurIPS dataset submission.
- **Resolution Strategy:** See the [[2026-03-04] Red_Agent_Remediation_Plan.md](./%5B2026-03-04%5D%20Red_Agent_Remediation_Plan.md) for the solution to enforce uniform JSON serialization.

## 3. Mathematical Scoring Loopholes
**Status: High**
- **The Problem:** The Contextual Integrity Score (CIS) is calculated via an LLM instructed to adjust ground-truth scores by a maximum of ±0.10.
- **The Bug:** While the code programmatically enforces a hard floor for Rationale (R), Architectural (A), and Testing (T) scores (`max(score, ground_truth - 0.10)`), **this constraint is entirely missing for the Logic (L) score.**
- **The Consequence:** The LLM can mathematically hallucinate or maliciously adjust the Logic score far below the intended limits, invalidating the evaluation metrics.
- **Resolution Strategy:** See the [[2026-03-04] Red_Agent_Remediation_Plan.md](./%5B2026-03-04%5D%20Red_Agent_Remediation_Plan.md) for the fix to bound Logic scores.

## 4. Academic Data Pipeline Readiness
**Status: High**
- **The Problem:** The team intends to submit the LogoMesh framework to the NeurIPS 2026 Datasets and Benchmarks track.
- **The Constraint:** The D&B track strictly mandates that all datasets be documented using the machine-readable **Croissant metadata format**.
- **The Blind Spot:** Currently, there is no engineered pipeline to extract the telemetry from the SQLite Battle Memory (`data/battles.db`) and the Docker Sandbox and format it into the required Croissant schema. Failure to provide compliant metadata will result in desk rejection of the paper.
- **Resolution Strategy:** See the [[2026-03-04] Red_Agent_Remediation_Plan.md](./%5B2026-03-04%5D%20Red_Agent_Remediation_Plan.md) for the strategy to export data using the Croissant schema.

## 5. Operational Ambiguities
**Status: Medium**
- **Competition Repository Rules:** The team is unsure if the AgentBeats competition rules mandate that their development repository remains public throughout the evaluation period or if they can develop in private until the submission deadline. This needs to be formally confirmed to protect the codebase from early competitive analysis.
- **Team Resource Allocation:** With the pivot to the Cybersecurity track, it is unclear exactly how the codebase needs to be adapted for Solidity or C/C++ targets. The specific division of labor between the internal engineering team (Josh, Oleksandr) and the academic algorithm designer (Yichen "Ethan") requires further clarification once Yichen is fully briefed on the repository structure.
