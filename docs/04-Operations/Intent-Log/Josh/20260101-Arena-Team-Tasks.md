> **Status:** ACTIVE
> **Type:** Plan
> **Context:**
> *   [2026-01-01]: Task list for the team to execute once the Agent Arena is live on Lambda.

# Arena Team Task List (2026-01-01)

## Overview
This document serves as a "Grab Bag" of tasks for the team (Alaa, Garrett, Samuel, Kuan, Deepti, Josh) to execute once the Agent Arena is fully operational on Lambda Cloud.
**Rule:** Pick a task, assign your name to it in the Git log, and execute.

---

## 1. Red Team Tasks (Attack)

### 1.1 "The Wolf Pack" (Specialized Workers)
*   **Context:** We need to implement the "Contextual FGA Breaker" defined in the [Agent Arena Upgrade Plan](../Technical/20260101-Agent-Arena-Upgrade-Plan.md).
*   **Task:** Create a new Python module in `src/red_logic/workers/fga_breaker.py`.
*   **Logic:**
    *   Input: A set of "Business Rules" (e.g., "Users can only view their own data").
    *   Action: Generate API calls that try to access ID+1 (IDOR) or `/admin` endpoints.
    *   Goal: Successfully get a `200 OK` on a forbidden resource.

### 1.2 "Rationale Stuffing" Simulation
*   **Task:** Create a script that takes a "Bad Code" submission (known bug) and uses an LLM to generate "Perfect Documentation" for it.
*   **Goal:** Submit this to the Green Agent and see if it gets a high Rationale Integrity score. If it does, we need to tune our defense.

---

## 2. Blue Team Tasks (Defense)

### 2.1 The "AdAttack" Defense
*   **Context:** The "AdAttack" scenario (Adversarial Ads) is live.
*   **Task:** Update the Purple Agent to inspect the HTML/JS of the "Ads" it renders.
*   **Goal:** Successfully detect and block the prompt injection payload in the AdAttack scenario.

### 2.2 Docker Hardening
*   **Task:** The current Docker container runs as `root`.
*   **Goal:** Modify the `Dockerfile` to create a non-root user (`agent`) and ensure all processes run under this user. Verify that `vLLM` still works with these permissions.

---

## 3. Green Team Tasks (Evaluation)

### 3.1 Vector Scoring Implementation
*   **Context:** Migrate from LLM-based scoring to Vector-based scoring.
*   **Task:** Install `sentence-transformers` in the container.
*   **Task:** Write a script `compare_vectors.py` that takes two text files (Intent, Code) and outputs their Cosine Similarity.
*   **Integration:** Wire this script into the `ContextualIntegrityScorer` class.

### 3.2 DBOM Generator
*   **Task:** Create a JSON schema for the "Decision Bill of Materials" (DBOM).
*   **Task:** Implement a function that takes the Score Object and signs it (simulated signature for now) into a JSON file.

---

## 4. Infrastructure & Ops

### 4.1 Lambda "Quick Launch" Script
*   **Task:** Write a bash script `launch_arena.sh` that:
    1.  Checks if Docker is running.
    2.  Checks if the GPU is available (`nvidia-smi`).
    3.  Runs the `green-agent` container in detached mode.
    4.  Tails the logs.

### 4.2 Log Aggregation
*   **Task:** Configure the agents to write their logs to a shared volume (e.g., `/var/log/arena/`).
*   **Goal:** Ensure that if the container crashes, the logs are preserved on the host instance for debugging.
