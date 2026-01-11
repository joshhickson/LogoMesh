---
status: ACTIVE
type: Checklist
created: 2026-01-09
context: Operations / Testing
---

# Evaluation & Testing Tasklist

**Purpose:** This document is for the operator (User) to verify the Green Agent's full functionality in an environment capable of running the necessary dependencies (Docker, GPU, Lambda).

## 1. Environment Setup
- [ ] **Docker:** Ensure Docker is running.
- [ ] **GPU Access:** (Optional) Verify NVIDIA drivers if running local LLM inference.
- [ ] **API Keys:** Check `.env` for `OPENAI_API_KEY` (if using OpenAI for Judge) or ensure `vllm` is running.

## 2. Dependency Verification
- [ ] **Install:** Run `uv sync` or `pip install -r requirements.txt`.
- [ ] **Verify Sentence Transformers:**
  - Run python: `from sentence_transformers import SentenceTransformer; model = SentenceTransformer('all-MiniLM-L6-v2')`
  - *Success:* Model downloads and loads without error.

## 3. Functional Testing (The "Iron Sharpens Iron" Loop)
### A. Basic Connectivity
- [ ] **Start Server:** `python -m src.green_logic.server` (or via `scripts/launch_arena.sh`).
- [ ] **Health Check:** `curl http://localhost:9040/docs` -> UI should load.

### B. Agent-to-Agent (A2A) Protocol
- [ ] **Mock Purple Agent:** Start a mock Purple Agent (or use `scripts/bash/test_agents.sh` if updated).
- [ ] **Send Task:** Post to `/actions/send_coding_task`:
  ```json
  {
    "battle_id": "test_manual_01",
    "purple_agent_url": "http://localhost:8000/message",
    "red_agent_url": null
  }
  ```
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
  - [ ] File contains `h_delta` and `v_intent`.
- [ ] **Check Database:**
  - [ ] Run `sqlite3 data/battles.db "SELECT * FROM battles;"`
  - [ ] Verify the new record exists and matches the DBOM hash.

## 5. Runtime Sandbox (In Progress)
- [ ] **Status Check:** Attempt to run `scripts/launch_arena.sh`.
- [ ] **Observe:** Does it successfully spin up isolated containers? (Current status: Likely incomplete).
