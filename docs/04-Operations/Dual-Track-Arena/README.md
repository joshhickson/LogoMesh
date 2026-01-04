---
status: ACTIVE
type: Spec
---
> **Context:**
> *   [2026-01-03]: The authoritative source of truth for the Dual-Track Arena (Custom Green Agent & Lambda Red/Blue Track).

# Dual-Track Arena: Source of Truth

## Overview
This directory serves as the **Operational Source of Truth** for the "Agent Arena." It consolidates the state, plans, and documentation for the agents competing in both the **AgentBeats Custom Track** (Green Agent Benchmark) and the **Lambda Security Arena Track** (Red/Blue Agents).

**Purpose:**
*   To provide a single point of reference for the current technical state of each agent.
*   To host **solidified** plans (not drafts) for implementation and deployment.
*   To link abstract strategy (Intent Logs) with concrete code (`src/`, `scenarios/`).

## Directory Structure

### 1. [Embedding-Vectors](./Embedding-Vectors/)
*   **Role:** The Mathematical Core.
*   **Content:** Specifications for the **Contextual Integrity Score (CIS)**, including Rationale, Architectural, and Testing integrity metrics.
*   **Status:** **Definitive Specs.** This folder defines *how* the Green Agent judges.

### 2. [green-agent](./green-agent/)
*   **Role:** The Judge / Proctor (Custom Track Submission).
*   **Content:** Operational state of the Green Agent (Evaluator).
*   **Code Reference:** `src/green_logic/`
*   **Status:** **Deployed on H100 (Lambda Cloud).**

### 3. [purple-agent](./purple-agent/)
*   **Role:** The Defender / Baseline (Common Requirement).
*   **Content:** Operational state of the Purple Agent (Target).
*   **Code Reference:** `src/purple_logic/`
*   **Status:** **Hybrid Dev Mode.** Running locally or on GCP L4 GPU.

### 4. [agentbeats-lambda](./agentbeats-lambda/)
*   **Role:** The Attacker / Red Agent (Lambda Track Submission).
*   **Content:** Operational state of the Red Agent and Attack Scenarios.
*   **Code Reference:** `src/red_logic/` and `scenarios/security_arena/`
*   **Status:** **Ported & Functional.** Running generic attacks using `GenericAttackerExecutor`.

---

## How to Use This Folder
*   **Developers:** Check the respective agent folder *before* starting work to verify the latest architectural decisions.
*   **Onboarding:** Read the README in each subfolder to understand the agent's responsibilities.
*   **Updates:** Only commit **verified** changes to these files. Drafts belong in `docs/04-Operations/Intent-Log/`.
