---
status: ACTIVE
type: Checklist
created: 2026-01-09
context: Operations / Testing
---

# Evaluation & Testing Tasklist

**Purpose:** This document is for the operator (User) to verify the Green Agent's full functionality in an environment capable of running the necessary dependencies (Docker, GPU, Lambda).

## 1. Environment Setup
- [ ] **OS Check:** Ensure system is running **Ubuntu** (required for scripts).
- [ ] **Config:** Run `cp .env.example .env` to create the configuration file.
- [ ] **Docker:** Ensure Docker is running.
- [ ] **GPU Access:** (Optional) Verify NVIDIA drivers if running local LLM inference.
- [ ] **API Keys:** Check `.env` for `OPENAI_API_KEY` (if using OpenAI for Judge) or ensure `vllm` is running.

## 2. Dependency Verification
- [ ] **Install:** Run `uv sync` or `pip install -r requirements.txt`.
- [ ] **Verify Sentence Transformers:**
  - Run python: `from sentence_transformers import SentenceTransformer; model = SentenceTransformer('all-MiniLM-L6-v2')`
  - *Success:* Model downloads and loads without error.

## 3. Functional Testing (The "Iron Sharpens Iron" Loop)

> **Pro Tip:** For a detailed QA plan with negative test cases (e.g., testing forbidden loops or bad code), see the **[QA Testing Plan](../../Intent-Log/Josh/20260110-pr-88-testing-plan.md)**.

### A. Launch
**Note:** See [Quick Start Scripts](../20260110-Quick-Start-Scripts.md) for details.

- [ ] **Start Arena:** Run the automated launch script:
  ```bash
  sudo ./scripts/bash/launch_arena.sh
  ```
- [ ] **Verify Ports:**
  - Green Agent (Judge): `http://localhost:9000`
  - Purple Agent (Defender): `http://localhost:9001`
  - vLLM (Brain): `http://localhost:8000`
- [ ] **Health Check:** `curl http://localhost:9000/docs` -> UI should load.

### B. Agent-to-Agent (A2A) Protocol
- [ ] **Manual Override:** Open `src/green_logic/server.py` and modify the task selection logic to force **Task 004 (Fibonacci)** instead of `random.choice`.
  - *Why:* Hidden tests are currently hardcoded for Fibonacci only.
- [ ] **Send Task:** Post to `/actions/send_coding_task`:
  ```json
  {
    "battle_id": "test_manual_01",
    "purple_agent_url": "http://localhost:9001",
    "red_agent_url": null
  }
  ```
  *(Or use `sudo ./scripts/bash/test_agents.sh`)*

- [ ] **Verify Output:** Response should contain `cis_score` and `breakdown`.

### C. Multi-File Support (New)
- [ ] **Send File Task:** Post to `/actions/send_coding_task` with `files` payload:
  ```json
  {
    "battle_id": "test_files_01",
    "purple_agent_url": "...",
    "files": {
      "main.py": "print('hello')",
      "test_main.py": "def test_hello(): pass"
    }
  }
  ```
- [ ] **Verify:** Check logs to see if the "User Provided Task" path was triggered.

## 4. Integrity Verification (New Features)
### A. Vector Math
- [ ] **Check Logs:** Look for `[VectorScorer] loading embedding model...`.
- [ ] **Check Score:** Ensure `rationale_score`, `architecture_score`, and `testing_score` in the output are non-zero (unless the input was empty).

### B. Persistence & DBOM
- [ ] **Check Files:** After a test run, check `data/dboms/`.
  - [ ] File `dbom_test_manual_01.json` exists.
  - [ ] File contains `h_delta`, `v_intent`, and `sigma_judge`.
- [ ] **Check Database:**
  - [ ] Run `sqlite3 data/battles.db "SELECT * FROM battles;"`
  - [ ] Verify the new record exists and matches the DBOM hash.

## 5. Runtime Sandbox (Docker + File Injection)
- [ ] **Status Check:** Observe the logs during a request.
- [ ] **Verify Isolation:**
  - Look for logs indicating `[Sandbox] Creating container...`.
  - Confirm file transfer via `put_archive` (no volume mounts).
  - Confirm container cleanup (`[Sandbox] Container removed`).
- [ ] **Verify Grading:**
  - If code fails execution, verify Score is capped at `0.5`.
