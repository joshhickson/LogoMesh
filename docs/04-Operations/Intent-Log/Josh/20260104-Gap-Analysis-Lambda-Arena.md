---
status: ACTIVE
type: Plan
---
> **Context:**
> *   [2026-01-04]: Strategic Gap Analysis based on Meeting 9 Minutes, focused on Lambda Competition readiness.
> *   **Superseded By:** N/A

# 2026-01-04 Gap Analysis: Lambda Arena & Competition Readiness

## Executive Summary
This document outlines the strategic plan to bridge the gap between our current "Arena" prototype and a winning submission for the Lambda x Berkeley AgentBeats Competition (Phase 1 deadline: Jan 16, 2026). It addresses immediate documentation needs, technical verification of the arena, and the strategic implementation of Red/Green agents.

**Log Storage:** All execution logs for this plan will be stored in the dedicated directory: `docs/04-Operations/Dual-Track-Arena/`.

---

## Phase 1: Setup & Documentation (Team Onboarding)
**Goal:** Ensure any team member (specifically Alaa and Deepti) can spin up a Lambda instance and connect via VS Code with zero friction.

### 1.1 Reformat "Noob Guides"
*   **Files:**
    *   `docs/04-Operations/Intent-Log/Josh/20260101-Lambda-Noob-Guide.md` (Windows)
    *   `docs/04-Operations/Intent-Log/Josh/20260101-Lambda-Noob-Guide-MacOS.md` (MacOS)
*   **Actions:**
    *   Update headers to standard format.
    *   Ensure all links are explicit and "GitHub clickable".
    *   Consolidate if possible or clearly distinguish.
    *   **Troubleshooting & Nuances (from Chat Logs):**
        *   **SSH Config:** Ensure `vscode-remote://ssh-remote+...` pattern is understood.
        *   **Extension:** `ms-vscode-remote.remote-ssh` is mandatory.
        *   **Workflow:** Connect -> Open Folder -> Install Extensions *on Remote* (Python, Pylance).
        *   **Network:** Verify `nvidia-smi` immediately.

### 1.2 Create `docs/AGENT_SETUP_CONTEXT.md`
*   **Goal:** A "Context Injection" file for Copilot/Agents to understand the environment bootstrapping process immediately, resolving all issues encountered in the `20260104-Agent-Battle-Chat.json` log.
*   **Content Checklist (Must Address):**
    *   **Environment Context:** Explicitly state we are running on the **Host** (Ubuntu 22.04), not inside a Docker container for development.
    *   **Dependency Gaps:**
        *   **Python:** The default Python might be too new (3.14 was picked by `uv`, breaking `ray`). **Mandate Python 3.12**.
        *   **Package Managers:** `uv`, `npm`, and `pnpm` are missing by default.
    *   **Bootstrapping Sequence (Proven):**
        1.  **Install `uv`:** `curl -LsSf https://astral.sh/uv/install.sh | sh` (Addresses: "Command 'uv' not found").
        2.  **Install Python 3.12:** `uv python install 3.12` (Addresses: `ray` installation error with Python 3.14).
        3.  **Sync Dependencies:** `uv sync --python 3.12` (Addresses: Missing `vllm`, `openai`, `pydantic`).
        4.  **Install Node.js v20:** `curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs` (Addresses: "Command 'node' not found").
        5.  **Install `pnpm`:** `sudo npm install -g pnpm` (Addresses: `EACCES` error when running without sudo).
        6.  **Install Node Deps:** `pnpm install` (Addresses: Missing `node_modules`).
    *   **Runtime Config:**
        *   **Context Length:** explicitly mention that `run_arena_test.sh` uses `--max-model-len 16384` to prevent 4096 token limit errors.
        *   **Model Location:** Verify models are downloaded to `~/.cache/huggingface` or handled automatically by `vllm`.
    *   **Git & Workflow:**
        *   Instructions for `gh auth login`.
        *   Reminder to `git add results/` and `vllm.log` (which were untracked in the session).

---

## Phase 2: Arena Technical Verification (Submission Readiness)
**Goal:** Verify the `security_arena` structure matches the rigorous Phase 1 requirements and that technical issues from the debug session are resolved.

### 2.1 Verify Technical Fixes
*   **Context Length:** The debug chat log indicated a context length error (4096 tokens).
    *   *Action:* Verify `run_arena_test.sh` contains `--max-model-len 16384`. (Already verified: It is present).
*   **Python Version:** The debug chat log indicated a conflict with Python 3.14.
    *   *Action:* Ensure `pyproject.toml` or `uv.lock` enforces Python < 3.13 or that the setup guide mandates 3.12.

### 2.2 Scenario Structure Audit
*   **Source:** `docs/05-Competition/Lambda × Berkeley AgentBeats Security Arena_ Building the Future of AI Security Testing.md`
*   **Checklist:**
    *   Does `scenarios/security_arena` match the expected PR structure?
    *   Do we have the required `attack_succeeded.json` output format?
    *   Are we using the correct model `gpt-oss-20b` (or `Qwen/Qwen2.5-Coder-32B-Instruct` as our proxy)?

### 2.3 Submission Workflow (Step 3)
*   **Problem:** We need to submit "Clean PRs" from a cloned repo, not our monorepo.
*   **Action:**
    *   Test the "Clone & Extract" workflow.
    *   Verify that `external/TEAM/agentbeats-lambda-[kzhou003-pull2-20251221]` logic is fully ported and reproducible in our arena.

---

## Phase 3: Lambda Track Strategy (Winning Phase 1)
**Goal:** Execute the "Dual Track" strategy (Red vs. Blue) to maximize points.

### 3.1 Red Agent Strategy (Step 4 & 5)
*   **Objective:** 1 Successful Attack (Min) to 15 Attempts (Max).
*   **Metric:** "Highly sophisticated, hard to find, deeply buried vulnerabilities."
*   **Action:**
    *   Analyze Mark's code (`external/TEAM/agentbeats-lambda-[kzhou003-pull2-20251221]`) as the "Gold Standard".
    *   Document the "Winning Logic" in `docs/04-Operations/Dual-Track-Arena/Red-Agent-Strategy.json`.

### 3.2 Green Agent Validation
*   **Objective:** Ensure Green Agent correctly identifies Purple Agent failures.
*   **Action:**
    *   Run scenarios where Purple Agent *should* fail and verify Green Agent catches it.

---

## Next Steps
1.  **Execute Phase 1 immediately:** Update the Noob Guides and create `docs/AGENT_SETUP_CONTEXT.md`.
2.  **Run Audit:** Perform the check in Phase 2.2.
3.  **Log Progress:** Create `docs/04-Operations/Dual-Track-Arena/20260104-Execution-Log.md`.
