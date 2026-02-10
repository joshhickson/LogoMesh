# High-Level Concept: OpenClaw Multi-Agent Setup (The "Frozen Judge" Architecture)

**Date:** 2026-02-05
**Topic:** Autonomous Coding Agent Setup for LogoMesh Self-Improvement
**Context:** Based on the Architectural Review (`20260205-Architectural-Review-Self-Improvement.md`), we must prevent the "Uroboros" (reward hacking) problem by separating the Agent from the Judge.

---

## 1. Definition: What is "OpenClaw"?
For this document, "OpenClaw" is defined as a high-agency, open-source autonomous coding agent framework (conceptually similar to OpenHands/OpenDevin or a custom implementation). It possesses:
*   **Capabilities:** File editing, shell execution, web browsing, Docker management.
*   **Model:** Powered by local (Qwen/Llama 3) or API (Claude/GPT-4) models.
*   **Goal:** To execute high-level plans from `docs/cli-and-mcp` autonomously.

## 2. Architectural Requirement: The "Frozen Judge"
To prevent the agent from rewriting the tests to pass (reward hacking), the evaluation logic (`src/green_logic`, `src/red_logic`, `scenarios/`) must be **structurally immutable** from the agent's perspective.

### The "Two-Process" Rule
The Agent and the Judge must run in separate execution contexts with strict permission boundaries.

---

## 3. Hardware Implementation Concepts

### Option A: The "Dockerized Bastion" (Single Powerful PC)
*Best for: Local development, single GPU (e.g., RTX 4090).*

**Structure:**
1.  **Host OS:** Runs the Docker Daemon and the **Judge Container (LogoMesh)**.
2.  **Agent Container (OpenClaw):** Runs the autonomous agent.
    *   **Volume Mounts:**
        *   `./src`: Read/Write (The "Student" code).
        *   `./tests`: Read/Write (The "Student" tests).
        *   `./src/green_logic`: **Read-Only** (The "Judge" logic).
        *   `./scenarios`: **Read-Only** (The "Judge" scenarios).
    *   **Network:** Access to LLM API / Local vLLM. No access to Host Docker socket (to prevent escaping).

**Workflow:**
1.  **Plan:** User drops a markdown plan into `docs/cli-and-mcp/TODO/`.
2.  **Act:** OpenClaw reads the plan, edits `src/auth.py`.
3.  **Verify:** OpenClaw runs `logomesh check src/auth.py`.
    *   *Note:* This command actually triggers a call to the **Judge Container** (via a restricted API or shared volume watcher) to perform the evaluation.
    *   The Agent *cannot* modify the `logomesh` binary or the `green_logic` source.
4.  **Refine:** OpenClaw reads the JSON report from the Judge and iterates.

---

### Option B: The "Air-Gapped Oracle" (Multi-PC Setup)
*Best for: High-security environments, separating inference compute from logic.*

**Hardware:**
*   **PC 1 (The Worker):** Runs OpenClaw (The Agent).
    *   Specs: High CPU/RAM for compilation and tooling.
*   **PC 2 (The Oracle):** Runs LogoMesh (The Judge) + LLM Inference (vLLM).
    *   Specs: High GPU (H100/4090) for Green/Red Agent models.

**Network Topology:**
*   **Connection:** Local LAN (Gigabit/10GbE).
*   **Protocol:** MCP (Model Context Protocol) or REST API.

**Workflow:**
1.  **Act:** OpenClaw (PC 1) modifies code in its local repo.
2.  **Submit:** OpenClaw commits code to a `staging` branch.
3.  **Judge:** LogoMesh (PC 2) pulls the `staging` branch (read-only).
4.  **Evaluate:** PC 2 runs the full attack/defense suite.
5.  **Report:** PC 2 posts the `ContextualIntegrityScore` and `RedReport` back to a shared dashboard or directly to OpenClaw via MCP.

**Security Benefit:**
*   OpenClaw literally cannot modify the evaluation logic because it resides on a physically different machine (PC 2) where OpenClaw has no SSH access.
*   This is the **Gold Standard** for avoiding the Uroboros problem.

---

## 4. The Self-Improvement Loop (Safe Mode)

How does OpenClaw "improve" LogoMesh without breaking it?

**Constraint:** The Agent is **only** allowed to improve:
1.  **CLI Features:** `src/cli.py`, `src/utils/` (Better UX, logging).
2.  **Documentation:** `docs/` (Clearer guides).
3.  **New Scenarios:** `scenarios/new_scenario.toml` (Expanding the benchmark).
    *   *Rule:* New scenarios are stuck in "Draft" mode until approved by a Human or a Master Green Agent.

**The "Meta-Evaluator" Process:**
1.  **Task:** "Create a scenario for SQL Injection in a GraphQL resolver."
2.  **Agent Action:** OpenClaw writes `scenarios/graphql_injection.toml` and `plugins/graphql_plugin.py`.
3.  **Verification:**
    *   The **Frozen Judge** (PC 2) runs the *new* scenario against a *known vulnerable* target (Golden Sample).
    *   If the scenario fails to detect the vulnerability, the Judge rejects the Agent's work.
    *   *Result:* The Agent improved the benchmark (added a valid test) without lowering the bar.

## 5. Summary
To build a self-improving system with OpenClaw:
1.  **Isolate the Judge:** Use Read-Only mounts (Single PC) or a separate machine (Multi-PC).
2.  **Restrict Scope:** Agent improves *features* and *content*, not *scoring logic*.
3.  **Validate the Validator:** New tests written by the Agent must demonstrate they can catch known bugs (Mutation Testing) before being accepted.
