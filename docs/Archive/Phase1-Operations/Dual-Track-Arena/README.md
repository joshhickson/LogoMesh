> **Note:**
> This entire directory was used for a temporary point-of-reference for rapid development and testing during Phase 1 of the AgentX AgentBeats competition. Do not trust these files.
status: REQUIRES EMPIRICAL VERIFICATION -- MAY CONTAIN INACCURACIES
type: Spec
---
> **Context:**
> *   [2026-01-03]: The temporary source of truth for the Dual-Track Arena (Custom Green Agent & Lambda Red/Blue Track).

# Dual-Track Arena: Temporary Source of Truth


## Overview
This directory serves as the **Operational Source of Truth** for the "Agent Arena." It consolidates the state, plans, and documentation for the agents competing in both the **AgentBeats Custom Track** (Green Agent Benchmark) and the **Lambda Security Arena Track** (Red/Blue Agents).

**Empirical file-level documentation for all code and major modules is now maintained in `file-reviews/`. This README is for high-level orientation and directory structure.**

**Purpose:**
*   To provide a single point of reference for the current technical state of each agent.
*   To host **solidified** plans (not drafts) for implementation and deployment.
*   To link abstract strategy (Intent Logs) with concrete code (`src/`, `scenarios/`).


## Directory Structure

Each subfolder below contains high-level plans and specs. For empirical, up-to-date file-level documentation, see `file-reviews/`.

### 1. [Embedding-Vectors](./Embedding-Vectors/)
*   **Role:** The Mathematical Core.
*   **Content:** Specifications for the **Contextual Integrity Score (CIS)**, including Rationale, Architectural, and Testing integrity metrics.
*   **Status:** **Definitive Specs.**
*   **Empirical docs:** See [file-reviews/green/scoring.md](file-reviews/green/scoring.md) and related review docs.

### 2. [green-agent](./green-agent/)
*   **Role:** The Judge / Proctor (Custom Track Submission).
*   **Content:** Operational state of the Green Agent (Evaluator).
*   **Code Reference:** `src/green_logic/`
*   **Empirical docs:** See [file-reviews/green/server.md](file-reviews/green/server.md), [analyzer.md](file-reviews/green/analyzer.md), etc.

### 3. [purple-agent](./purple-agent/)
*   **Role:** The Defender / Baseline (Common Requirement).
*   **Content:** Operational state of the Purple Agent (Target).
*   **Code Reference:** `src/purple_logic/`
*   **Empirical docs:** See `file-reviews/` for any purple agent modules (if present).

### 4. [red-agent](./red-agent/)
*   **Role:** The Attacker / Red Agent (Lambda Track Submission).
*   **Content:** Operational state of the Red Agent and Attack Scenarios.
*   **Code Reference:** `src/red_logic/` and `scenarios/security_arena/`
*   **Empirical docs:** See [file-reviews/red/](file-reviews/red/) for all Red Agent modules.

---

## How to Use This Folder
*   **Developers:** For high-level plans and architecture, use this README and subfolder docs. For empirical, up-to-date file-level documentation, always check `file-reviews/`.
*   **Onboarding:** Read the README in each subfolder for context, but rely on `file-reviews/` for the latest code-level truth.
*   **Updates:** Only commit **verified** changes to these files. Drafts belong in `docs/04-Operations/Intent-Log/`. All code and module documentation must be kept in sync with `file-reviews/`.
