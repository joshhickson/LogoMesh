# Core IP Definition (v0.1)

This document contains the initial working definitions for the core intellectual property of LogoMesh. These definitions are the basis for our future patent applications and product development.

## The Contextual Integrity Score (CIS) v0.1

The Contextual Integrity Score (CIS) is a numerical score from 1-100 that quantifies the legal and operational risk associated with a given code change. It is calculated based on three equally-weighted inputs:

1.  **Rationale Integrity (33.3%):** This measures the clarity and accessibility of the *why* behind the code.
    *   **Measurement:** A score is generated based on the presence and quality of a link between a code commit and a documented source of intent (e.g., a project management ticket, an Architectural Decision Record (ADR), or a formal specification). A commit with no discernible link automatically receives a score of 0. Quality is assessed by an LLM trained to evaluate the clarity and completeness of the linked rationale.

2.  **Architectural Integrity (33.3%):** This measures the code's adherence to the project's established architectural principles and patterns.
    *   **Measurement:** The score is determined by statically analyzing the code's dependencies and structure against a predefined "Context Graph" of the system's architecture. Violations, such as a backend service directly calling a frontend component, will decrease the score. The "Context Graph" is a formal representation of the intended architecture, maintained as part of the project's documentation.

3.  **Testing Integrity (33.3%):** This measures the sufficiency of the testing coverage in relation to the documented intent.
    *   **Measurement:** This is not just about code coverage percentage. The score is calculated by evaluating whether the tests validate the specific requirements outlined in the documented rationale. An LLM will be used to compare the test cases against the acceptance criteria of the linked ticket or ADR. Code can have 100% line coverage but a low Testing Integrity score if its tests do not address the stated business goal.

## The Agent-as-a-Judge v0.1

The Agent-as-a-Judge is a specialized, autonomous AI agent designed to act as a "critic" and gatekeeper within the CI/CD pipeline. Its primary function is to prevent code with low Contextual Integrity from being merged into the main branch.

**Conceptual Workflow:**

1.  **Trigger:** The Agent-as-a-Judge is triggered upon the creation of a new pull request.
2.  **Analysis:** It reads the pull request's code and its associated commit messages.
3.  **CIS Calculation:** The agent calculates the Contextual Integrity Score (CIS) for the proposed change by performing the three integrity checks described above.
4.  **Enforcement:**
    *   It automatically fails the build if the commit has no link to a documented source of intent (e.g., a ticket, ADR).
    *   It provides a detailed report in the pull request, highlighting specific areas of Rationale, Architectural, or Testing debt.
    *   It can be configured with a minimum acceptable CIS threshold (e.g., 80/100). If the score is below the threshold, the build fails.
5.  **Training Data:** The underlying AI models for the agent will be trained on the proprietary dataset gathered during the Phase 1 consulting engagements.
