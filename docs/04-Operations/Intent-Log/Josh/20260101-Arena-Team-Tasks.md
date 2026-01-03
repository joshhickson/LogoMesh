---
status: ACTIVE
type: Plan
---
> **Context:**
> *   [2026-01-01]: Task list for the team to execute once the Agent Arena is live on Lambda.

# Arena Team Task List (2026-01-01)

## Overview
This document serves as a "Grab Bag" of tasks for the team (Alaa, Garrett, Samuel, Kuan, Josh, Deepti, Oleksander, Mark) to execute once the Agent Arena is fully operational on Lambda Cloud.
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

**Primary Reference:** [Contextual Debt Paper (Submission Draft)](../../../../docs/00-Strategy/IP/20251118-Copyright-Edition-Contextual-Debt-Paper.md)

### 3.1 Vector Scoring Implementation (Section 3.1 - 3.3)
*   **Context:** Migrate from LLM-based scoring to Vector-based scoring as defined in the **"Contextual Integrity Score ($CIS$)"** section of the IP paper.
*   **Reference:** See `docs/04-Operations/Embedding-Vectors/` for the full mathematical roadmap (Rationale, Architectural, and Testing Integrity).
*   **Task:** Install `sentence-transformers` in the container.
*   **Task:** Write a script `compare_vectors.py` that takes two text files (Intent, Code) and outputs their **Cosine Similarity** (Rationale Integrity - $R(\Delta)$).
*   **Integration:** Wire this script into the `ContextualIntegrityScorer` class.

### 3.2 DBOM Generator (Section 4.2)
*   **Context:** Implement the **"Decision Bill of Materials"** defined in Section 4.2 of the paper.
*   **Task:** Create a JSON schema that matches the tuple: $DBOM_i = \langle H(\Delta_i), \vec{v}_{intent}, \text{Score}_{CIS}, \sigma_{Judge} \rangle$.
*   **Task:** Implement a function that takes the Score Object and signs it (simulated signature for now) into a JSON file.

### 3.3 The "Filing System" (Session Persistence) - **CRITICAL PRIORITY (P0)**
*   **Context:** **COMPETITION SURVIVAL REQUIREMENT.** If the agent crashes mid-battle during the AgentBeats competition human judge's evaluation, we get a score of 0. We cannot rely on RAM.
*   **Task:** Implement a robust "Crash-Proof" filing system immediately.
*   **Mechanism:**
    *   **Write-Ahead Logging:** Every A2A message must be appended to `data/battles/{battle_id}/transcript.jsonl` *before* processing.
    *   **Recovery Mode:** On startup, the Green Agent must check for unfinished battles and resume them.
*   **Goal:** Zero data loss even if the container is killed by OOM (Out of Memory).

### 3.4 Vector Consistency Validation
*   **Context:** We cannot trust the vector math blindly. We need to prove that the scoring is consistent and aligns with human intuition.
*   **Task:** Create a test suite `tests/vector_consistency.py` with a "Golden Set" of known "Good" vs "Bad" code/intent pairs.
*   **Goal:** Verify that $CIS(\text{Good}) > CIS(\text{Bad})$ consistently across different embedding models.
*   **Metric:** Achieve a Pearson correlation > 0.8 with human labels.

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

### 4.3 Model Benchmarking & Selection
*   **Context:** We are currently using `Qwen/Qwen2.5-Coder-32B-Instruct`.
    *   **CONSTRAINT:** We have strictly limited the context window to **16,384 tokens** (`--max-model-len 16384`) to prevent OOM on the H100. All scenarios must fit within this budget.
    *   **DEPRECATED:** Do NOT use `Llama-3-70B` or `gpt-oss-20b`. They are too large or outdated.
*   **Task:** Run the `debugdump` scenario with different models (e.g., Llama-3, DeepSeek-Coder) and compare execution time vs. code quality.
*   **Task:** Establish a "Leaderboard" protocol where we can swap the Purple Agent's model to test "Model vs Model" dynamics (e.g., Qwen vs. GPT-4).

---

## 5. Presentation & UI (The "Decay Dashboard")

### 5.1 Node.js WebUI
*   **Context:** In [Meeting 8 (Deepti's Request)](../../Team/20251227-Logomesh-Meeting-8-[Josh_Deepti].md), we identified that a GUI is critical for the "Presentation" score.
*   **Task:** Build a lightweight Node.js/Express dashboard (or integrate into `onboarding/`).
*   **Core Feature:** **Graph "CIS Score vs. Time (Steps)"**.
    *   **Goal:** Differentiate from DeepEval by visually proving the **Decay Theorem** ($P(\text{Knowable})_t \approx e^{-(\lambda - \mu)t}$) defined in Section 3.4 of the [Contextual Debt Paper](../../../../docs/00-Strategy/IP/20251118-Copyright-Edition-Contextual-Debt-Paper.md).
    *   **Visual:** A line chart showing the CIS score dropping as the agent takes more steps without human review.

---

## 6. Future Work & Theoretical Extensions (Paper Only)

**Status:** **DO NOT BUILD for Competition.**
**Reasoning:** These concepts (Active Mitigation) technically violate the "Assessor" neutrality rule of the Green Agent track. They should be included in the **Discussion/Future Work** section of the submission paper to demonstrate long-term vision, but implemented *after* the competition.

### 6.1 The "Architect" Agent (Zero-Shot Project Manager)
*   **Concept:** A "0-1" innovation where the Green Agent acts as the **Orchestrator ($O$)** in the Glass Box Protocol (Section 4.1).
*   **Hypothesis:** By enforcing CIS constraints at *every step*, we can prevent the "Decay" usually seen in long-horizon agent tasks.

### 6.2 The "Healer" Agent (Active Mitigation)
*   **Concept:** Moving from "Passive Scoring" to "Active Mitigation" (Paper Section: Proactive Management).
*   **Hypothesis:** If Contextual Debt is detected, can the Green Agent *fix* it by auto-generating ADRs?

---

## 7. Strategic Alignment (Security Focus)

**Goal:** Ensure our "Type 2" (New Benchmark) submission also satisfies the "Type 3" (Lambda Security) requirements.

*   **Task:** **Reframe Contextual Debt as Security Liability.**
    *   **Action:** In the `README.md` and `Abstract`, explicitly state that "Contextual Debt is the root cause of logic vulnerabilities like IDOR and BOLA."
    *   **Logic:** "Bugs happen when code is written wrong. Vulnerabilities happen when code is written right (syntax) but for the wrong reason (intent)."
*   **Task:** **Highlight the Red Agent.**
    *   **Action:** Ensure the Demo Video shows the Red Agent *generating* the test cases that the Green Agent uses. This proves we are doing "Red Teaming" (Lambda Goal).
