---
status: ACTIVE
type: Guide
---
> **Context:**
> *   [2025-12-31]: A step-by-step execution guide for Phase 6B (Orchestration Logic).

# Phase 6B: Orchestration Logic Guide

**Objective:** Implement the "Iron Sharpens Iron" feedback loop in the Green Agent. This involves updating the Green Agent to orchestrate the interaction between the Purple Agent (Defender) and the Red Agent (Attacker).

**Workflow:**
1.  **Green -> Purple:** Send coding task (e.g., "Build an Email Validator").
2.  **Purple -> Green:** Receive secure code.
3.  **Green -> Red:** Send the secure code as a target (e.g., "Find vulnerabilities in this code").
4.  **Red -> Green:** Receive attack vector.
5.  **Green:** Evaluate the result (Contextual Integrity Score).

---

## Step 1: Update `src/green_logic/server.py`
We need to modify the `send_coding_task_action` endpoint to handle the multi-step workflow.

### 1.1. Add Red Agent Configuration
Update the `SendTaskRequest` model and environment variable handling to include the Red Agent URL.

### 1.2. Implement the Workflow
Rewrite `send_coding_task_action` to:
1.  Call Purple Agent (existing logic).
2.  Extract the code from Purple's response.
3.  Call Red Agent with the extracted code.
4.  Return a combined result.

## Step 2: Verification
1.  **Unit Test:** We can't easily unit test this without running all three agents, but we can verify the code structure and imports.
2.  **Docker Build:** Ensure the container still builds.

