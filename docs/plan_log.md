# Future Work & Tactical Plan Log

This document serves as a backlog of identified tasks and improvements for the LogoMesh project. These are items that should be addressed after the core architectural and strategic goals are met.

## Tactical Next Steps (as of 2025-11-07)

1.  **Developer Workflow Integration:**
    *   **Goal:** Make the evaluation report more actionable for developers.
    *   **Implementation Idea:** Automatically create a GitHub issue with the evaluation summary, linking back to the full report. This would directly address the judge's comparison to the EvoGit precedent.

2.  **Orchestrator Robustness & Hardening:**
    *   **Goal:** Protect the "Green Agent" evaluator from misbehaving or malicious "Purple Agents."
    *   **Implementation Ideas:**
        *   Implement strict timeouts for all interactions with the Purple Agent.
        *   Add retry logic for transient network errors.
        *   Implement schema validation for all incoming data from the Purple Agent.

3.  **Integrate a Real LLM:**
    *   **Goal:** Replace the mock LLM in the `RationaleDebtAnalyzer` with a real implementation to generate credible analysis.
    *   **Implementation Ideas:**
        *   Integrate with an OpenAI client (e.g., `gpt-4o-mini`).
        *   Move the API key to a secure secret management system.
        *   Perform prompt engineering to refine the accuracy and reliability of the analysis.

4.  **Finalize Documentation and Narrative:**
    *   **Goal:** Polish all public-facing documents to ensure they tell a compelling and coherent story.
    *   **Implementation Ideas:**
        *   Review and update `README.md` to reflect the latest architecture and the "Cyber-Sentinel" narrative.
        *   Review and update `docs/AgentX_Submission_Paper.md` to proactively address the "novelty" concerns and highlight the strengths of the multi-step trace.
