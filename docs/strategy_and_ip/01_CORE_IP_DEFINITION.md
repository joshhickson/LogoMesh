# Core Intellectual Property Definitions v0.1

This document provides the initial, high-level definitions for the core intellectual property that forms the basis of the LogoMesh product strategy. These concepts were first introduced in the foundational research paper, [*Contextual Debt: A Software Liability*](../20251115-Research_Paper-Contextual_Debt-A_Software_Liability.md).

## The Contextual Integrity Score (CIS) v0.1

The Contextual Integrity Score (CIS) is a quantifiable metric, ranging from 1-100, designed to assess the legal and operational risk associated with a given software component or pull request. It is calculated based on three primary inputs:

1.  **Rationale Integrity:** This measures the clarity and accessibility of the *intent* behind the code. It is determined by the presence and quality of links from the code to documented business requirements, architectural decisions (e.g., ADRs), or issue tracker tickets. A high score indicates a clear "why" for every "what."
2.  **Architectural Integrity:** This measures the code's adherence to the established, documented architecture and design patterns of the system. It analyzes dependencies and communication patterns to ensure they do not violate the system's explicit architectural rules.
3.  **Testing Integrity:** This measures the alignment of the testing suite with the documented rationale. It verifies that the tests are not just executing code, but are explicitly validating the business requirements and acceptance criteria outlined in the source-of-truth documentation.

## The Agent-as-a-Judge v0.1

The "Agent-as-a-Judge" is a specialized AI agent that acts as an automated, programmatic gatekeeper in the CI/CD pipeline. Its primary function is to prevent code with high Contextual Debt from being merged into the main branch.

Its conceptual operation is as follows:

1.  **Initiation:** The Agent activates upon the creation of a new pull request.
2.  **Context Graph Analysis:** It reads the code changes and compares them against a "Context Graph"—a knowledge graph derived from the company's documentation, ADRs, and issue tracking systems.
3.  **Automated Adjudication:** The Agent automatically fails the build or blocks the merge if the code cannot be programmatically linked to a documented "why." It requires a verifiable connection to an approved ADR, a specific feature ticket, or a documented business requirement. This enforces a "No Context, No Commit" policy.

The Agent will be trained on the proprietary dataset gathered during the Phase 1 consulting engagements.
