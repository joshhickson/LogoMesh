> **Status:** ACTIVE
> **Type:** Plan
> **Context:**
> * [2025-12-17]: Current Execution Plan.

# 20251127-Contextual-Discovery-Plan-Revision (DASHBOARD)

## 1. Context & Rationale

**Why does this document exist?**
This plan represents a **strategic pivot** executed on November 27, 2025. It supersedes and deprecates the original `20251124-Contextual-Discovery-Plan.md`.

**What changed?**
The original plan focused on "Mathematical Theory"—conducting deep research to prove the novelty of our "Contextual Debt" metric. However, the [Math Viability Analysis](20251127-Math-Viability-and-Novelty-Analysis.md) completed on Nov 27 confirmed that:
1.  Our proposed math (Cosine Similarity + Graph Centrality) is sufficient for the competition.
2.  Further theoretical research is diminishing returns.

**The New Direction:**
Consequently, we have halted "Theory Research" and shifted immediately to **"Implementation Specifications."** We are no longer asking *if* the math works; we are defining *how* the workers will implement it.

## 2. Referenced Documents

This plan synthesizes the strategic direction from:

- **The New Pivot:** [../../../00-Strategy/Business/20251118-Strategic-Pivot-Plan-CIS-Formalization.md](../../../00-Strategy/Business/20251118-Strategic-Pivot-Plan-CIS-Formalization.md)
- **Math Viability Analysis:** [20251127-Math-Viability-and-Novelty-Analysis.md](20251127-Math-Viability-and-Novelty-Analysis.md) (Confirms API viability)
- **The Team Feedback:** [20251127-Comparative-Analysis-of-Team-Feedback.md](20251127-Comparative-Analysis-of-Team-Feedback.md) (Confirms A2A Pivot)
- **Competition Strategy:** [../../../00-Strategy/Competition/20251102-AgentX AgentBeats Competition Analysis.md](../../../00-Strategy/Competition/20251102-AgentX AgentBeats Competition Analysis.md)

## 3. Objective: The Discovery Sprint (Updated)

This document outlines a revised "Discovery Sprint" to validate the core hypotheses of the Contextual Integrity Score (CIS). Following the 11/27 Viability Analysis, our focus shifts from **Math Theory** to **Implementation Specifications**.

## 4. The Dashboard (Execution Map)

| ID | Track | Task / Experiment | Assignee | Status | Context (Back) | Work (Forward) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1.1** | **Novelty** | **Product Novelty Audit**<br>Produce a "Product Novelty Memo" differentiating vs. DeepEval. | Deepti | `Pending Confirmation` | [Math Viability](20251127-Math-Viability-and-Novelty-Analysis.md) | [Create Memo](https://docs.google.com) |
| **1.2** | **Novelty** | **Embedding Feasibility Spike**<br>POC Jupyter notebook for OpenAI Embeddings API cost/limits. | Deepti | `Pending Confirmation` | [Strategy Pivot](../../../00-Strategy/Business/20251118-Strategic-Pivot-Plan-CIS-Formalization.md) | [Notebooks](../../../../notebooks/) |
| **1.3** | **Novelty** | **Composite Score Differentiation**<br>Report contrasting CIS (Composite) vs. singular metrics. | Alaa/Josh | `Pending Confirmation` | [Math Viability](20251127-Math-Viability-and-Novelty-Analysis.md) | [Create Report](.) |
| **2.1** | **Security** | **Minimal DBOM Schema (Spec-First)**<br>Define formal JSON schema for Decision Bill of Materials. | **OPEN** (was Hadiza) | `OPEN` | [Research Paper](../../../03-Research/Theory/20251115-Research_Paper-Contextual_Debt-A_Software_Liability.md) | [Contracts Package](../../../../packages/contracts/) |
| **2.2** | **Security** | **Crypto-Signature POC**<br>Implement DBOM schema signing using Auth0/jose. | Samuel | `Pending Confirmation` | [DBOM Spec](../../../01-Architecture/Specs/Contextual-Debt-Spec.md) | [POC Script](../../../../packages/core/) |
| **3.1** | **Specs** | **Worker Specification**<br>Define JSON Schemas for RationaleWorker & ArchitecturalWorker. | Garrett/Alaa | `Pending Confirmation` | [Math Viability](20251127-Math-Viability-and-Novelty-Analysis.md) | [Workers Package](../../../../packages/workers/) |
| **3.2** | **Specs** | **Green Agent Implementation Guide**<br>Guide on orchestration: Submission -> Workers -> Score. | Garrett/Alaa | `Pending Confirmation` | [Architecture](../../../01-Architecture/) | [Create Guide](.) |
| **4.1** | **Meta** | **Document Event Schema**<br>Design event schema for docs-as-code "inventory" (file.created, etc). | Aron | `Pending Confirmation` | [Ref Repair Log](20251202-Reference-Repair-Log.md) | [Contracts Package](../../../../packages/contracts/) |
| **4.2** | **Meta** | **Node-and-Edge Schema**<br>Define data model for the documentation graph itself. | Deepti | `Pending Confirmation` | [Onboarding](../../../../onboarding/) | [Contracts Package](../../../../packages/contracts/) |
| **4.3** | **Meta** | **Data Accessibility & Link Extraction**<br>Verify server access to docs and script link extraction. | Josh | `Pending Confirmation` | [Ref Repair Log](20251202-Reference-Repair-Log.md) | [Scripts](../../../../scripts/) |
| **5.1** | **GTM** | **"Winning Narrative" Blueprint**<br>Synthesize Competition Analysis + CIS into Strategy Memo. | Deepti | `Pending Confirmation` | [Comp Analysis](../../../00-Strategy/Competition/20251102-AgentX AgentBeats Competition Analysis.md) | [Create Memo](.) |
| **5.2** | **GTM** | **SDK & Auth0 Integration Spike**<br>POC Purple Agent using Auth0 Token Vault within SDK. | Samuel | `Pending Confirmation` | [Comp Analysis](../../../00-Strategy/Competition/20251102-AgentX AgentBeats Competition Analysis.md) | [Auth0 Samples](../../../../auth0-ai-samples/) |

## 5. Knowledge Gaps & Notes

*   **Track 2 (Security):** Hadiza is unavailable. Task 2.1 is critical path for Task 2.2. Needs reassignment.
*   **Track 4 (Meta):** Link Integrity System has been established (`reference_manifest.csv`). Task 4.3 is partially complete (audit scripts exist).
