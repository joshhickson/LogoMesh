# Technical Briefing: Kuan Zhou (System Architect / Security)

**Date:** 2025-12-03
**Status:** DRAFT (Ready for Review)
**Target Audience:** Kuan Zhou (New Team Member)
**Context:** High-performance onboarding for the AgentX "AgentBeats" Competition (Green Phase).

## 1. Executive Summary: The Mission (In-a-Nutshell)

Welcome to the team. **LogoMesh** is our submission for the AgentX "Green Agent" track. Our goal is to create a "Public Good" benchmark for the AI industry, which is a standardized, open-source metric called the **Contextual Integrity Score (CIS)**.

**The Core Problem:**
Currently, AI-generated code is evaluated on *correctness* (does it pass tests?) but not on *intent* (does it match the human's architectural and business goals?). This creates "Contextual Debt" which is a hidden liability where code works but is unmaintainable or insecure.

**The Solution (Our IP):**
We are building a **Green Agent** (The Evaluator) that measures this debt using three vector-based metrics:
1.  **Rationale Integrity:** Cosine similarity between requirements and code implementation (Vector Embeddings).
2.  **Architectural Integrity:** Graph centrality analysis to detect illegal dependencies (Graph Theory).
3.  **Testing Integrity:** Semantic coverage analysis (Embeddings + Coverage Reports).

**Strategic Note:**
You may see older documents referencing "Copyrights," "LLC Formation," or "SaaS Products." **Ignore them.** As of Dec 3, we have pivoted entirely to a non-commercial, open-source focus to win the competition.

## 2. Working Index: Keystone Documents

This index is curated to get you up to speed on the *current* technical state without wading through outdated logs.

### Pillar 1: Mission & Strategy (The "Why")
*Start here to understand the competition constraints and our pivot.*

*   [**The North Star (Consolidated Context)**](20251128-Consolidated-Context-and-Actions.md)
    *   *What it is:* The central source of truth for the current project state, recent decisions, and active action items.
*   [**Competition Rules (AgentBeats)**](20251126-AgentBeats-Competition-Info-Session-PDF.md)
    *   *What it is:* The official constraints for the "Green Agent" track.
*   [**Pivot Rationale (Recommendation Report)**](../../../02-Engineering/Verification/20251119-Recommendation-Report-Strategic-Path-Forward.md)
    *   *What it is:* The technical justification for why we moved from simple heuristics to the current vector-based approach.

### Pillar 2: Core Theory (The "What")
*The mathematical and theoretical foundation of the CIS.*

*   [**The Core Theory (Research Paper)**](../../../03-Research/Theory/20251115-Research_Paper-Contextual_Debt-A_Software_Liability.md)
    *   *What it is:* The academic definition of "Contextual Debt" and the "Decay Theorem."
*   [**Math Validation (Novelty Analysis)**](20251127-Math-Viability-and-Novelty-Analysis.md)
    *   *What it is:* Confirmation that our vector/graph approach is a viable and novel application for the competition.

### Pillar 3: Architecture & Specs (The "How")
*The blueprints for the system you will help harden.*

*   [**The Algorithm (CIS Spec)**](../../../01-Architecture/Specs/Contextual-Debt-Spec.md)
    *   *What it is:* The pseudo-code definition of how the score is calculated.
*   [**The Data Model (Output Schema)**](../../../01-Architecture/Specs/Evaluation-Output-Schema.md)
    *   *What it is:* The JSON structure of the report our agent generates.
*   [**CI/CD Pipeline (Reference)**](../../../01-Architecture/Diagrams/CI-Workflow.md)
    *   *What it is:* Overview of our Docker-based testing pipeline.

### Pillar 4: Execution Plan (The "When")
*Current roadmap and immediate next steps.*

*   [**Latest Plan Review (Meeting Minutes)**](../../Team/20251203-Meeting_Minutes-Josh_Deepti_Aladdin_Garrett.md)
    *   *What it is:* The most recent team sync where we adjusted the plan to fix discrepancies.
*   [**Discovery Sprint Roadmap**](20251127-Contextual-Discovery-Plan-Revision.md)
    *   *What it is:* The tactical plan we are currently executing. Focus on **Track 2 (Architecture)** and **Track 5 (Green Agent)**.

### 5. Pending Technical Documentation

**Note:** Josh and Deepti are currently performing a "Deep Consolidation" of the remaining technical docs. The following areas are currently in flux or missing and will be defined shortly:

1.  **Green Agent Implementation Details:** The specific architecture for the Green Agent (being worked on by Alaa and Garrett) is not yet fully documented.
2.  **Code Comparison Methodology:** The exact method for comparing code against requirements (Embeddings vs. Direct Diff) is under active debate and being resolved.
3.  **Consolidated Technical Manual:** A single, unified technical manual is being assembled to replace the scattered log files.
