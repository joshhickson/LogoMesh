---
status: ACTIVE
type: Checklist
created: 2026-01-09
context: Operations / Testing
---



# Evaluation & Testing Tasklist

> **Empirical Verification (2026-01-30):**
> This checklist is empirically verified against the current codebase, scripts, and deployment configs. All port numbers, endpoints, and steps are accurate as of this date. See:
> - [src/green_logic/server.py](../../../src/green_logic/server.py)
> - [scripts/bash/launch_arena.sh](../../../scripts/bash/launch_arena.sh)
> - [docker-compose.agents.yml](../../../docker-compose.agents.yml)
> - [file-reviews/green/server.md](../file-reviews/green/server.md)
> - [file-reviews/green/tasks.md](../file-reviews/green/tasks.md)
> - [file-reviews/green/analyzer.md](../file-reviews/green/analyzer.md)
> - [file-reviews/green/scoring.md](../file-reviews/green/scoring.md)
> - [file-reviews/green/sandbox.md](../file-reviews/green/sandbox.md)
> - [file-reviews/green/generator.md](../file-reviews/green/generator.md)
> - [file-reviews/green/compare_vectors.md](../file-reviews/green/compare_vectors.md)
> - [file-reviews/green/agent.md](../file-reviews/green/agent.md)

**Canonical Port Mapping:**

| Component   | launch_arena.sh | docker-compose.agents.yml |
|-------------|-----------------|--------------------------|
| Green Agent | 9000            | 9009                     |
| Purple Agent| 9001            | 9010                     |
| Red Agent   | 9021            | (not in compose)         |
| Brain (vLLM)| 8000            | 8000                     |

**Purpose:** This document is for the operator to empirically verify the Green Agent's full functionality in an environment with Docker (and optionally GPU/LLM inference).


## 1. Environment Setup
- [ ] **OS Check:** Ubuntu is recommended for scripts (launch_arena.sh assumes Linux paths), but Docker can run on any OS with adjustments.
- [ ] **Config:** Run `cp .env.example .env` (if present) to create the configuration file.
- [ ] **Docker:** Ensure Docker is running and accessible (required for sandbox and agent containers).
- [ ] **GPU Access:** (Optional) Verify NVIDIA drivers if running local LLM inference (vLLM container).
- [ ] **API Keys:** Set `OPENAI_API_KEY` in `.env` (if using OpenAI for Judge) or ensure vLLM is running for local inference.


## 2. Dependency Verification
- [ ] **Install:** Run `uv sync` (if using uv) or `pip install -r requirements.txt` in the project root.
- [ ] **Verify Sentence Transformers:**
  - Run: `python -c "from sentence_transformers import SentenceTransformer; model = SentenceTransformer('all-MiniLM-L6-v2')"`
  - *Success:* Model downloads and loads without error.


## 3. Functional Testing ("Iron Sharpens Iron" Loop)

> **Pro Tip:** For negative test cases and advanced QA, see [QA Testing Plan](../../Intent-Log/Josh/20260110-pr-88-testing-plan.md).

### A. Launch
**Choose one launch method:**

- **[Option 1: launch_arena.sh (host network, default for full arena)]**
  - Run: `sudo ./scripts/bash/launch_arena.sh`
  - Ports:
    - Green Agent: `http://localhost:9000`
    - Purple Agent: `http://localhost:9001`
    - Red Agent: `http://localhost:9021`
    - Brain (vLLM): `http://localhost:8000`

- **[Option 2: docker-compose.agents.yml (local dev, no Red Agent)]**
  - Run: `docker compose -f docker-compose.agents.yml up --build`
  - Ports:
    - Green Agent: `http://localhost:9009`
    - Purple Agent: `http://localhost:9010`
    - Brain (vLLM): `http://localhost:8000`

- [ ] **Health Check:**
  - For Green Agent: `curl http://localhost:<port>/docs` (replace `<port>` with 9000 or 9009)
  - FastAPI UI should load.


### B. Agent-to-Agent (A2A) Protocol
- [ ] **Manual Override:** In `src/green_logic/server.py`, modify the task selection logic to force Task 004 (Fibonacci):
  - Replace `random.choice(CODING_TASKS)` with `next(t for t in CODING_TASKS if t['id'] == 'task-004')`.
  - *Why:* Hidden tests are hardcoded for Fibonacci only.
- [ ] **Send Task:** POST to `/actions/send_coding_task` on the Green Agent:
  ```json
  {
    "battle_id": "test_manual_01",
    "purple_agent_url": "http://localhost:<purple_port>",
    "red_agent_url": null
  }
  ```
  - Use port 9001 (launch_arena.sh) or 9010 (docker-compose.agents.yml).
  - Or use: `sudo ./scripts/bash/test_agents.sh`
- [ ] **Verify Output:** Response should contain `cis_score` and `breakdown` fields.


### C. Multi-File Support
- [ ] **Send File Task:** POST to `/actions/send_coding_task` with a `files` payload:
  ```json
  {
    "battle_id": "test_files_01",
    "purple_agent_url": "http://localhost:<purple_port>",
    "files": {
      "main.py": "print('hello')",
      "test_main.py": "def test_hello(): pass"
    }
  }
  ```
- [ ] **Verify:** Check Green Agent logs for "User Provided Task" path triggered.


## 4. Integrity Verification
### A. Vector Math & Scoring
- [ ] **Check Logs:** Look for `[VectorScorer] loading embedding model...` in Green Agent logs.
- [ ] **Check Score:** Ensure `rationale_score`, `architecture_score`, and `testing_score` in the output are non-zero (unless the input was empty).

### B. Persistence & DBOM
- [ ] **Check Files:** After a test run, check `data/dboms/`.
  - [ ] File `dbom_<battle_id>.json` exists.
  - [ ] File contains `h_delta`, `v_intent`, and `sigma_judge` fields.
- [ ] **Check Database:**
  - [ ] Run: `sqlite3 data/battles.db "SELECT * FROM battles;"`
  - [ ] Verify the new record exists and matches the DBOM hash.


## 5. Runtime Sandbox (Docker + File Injection)
- [ ] **Status Check:** Observe Green Agent logs during a request.
- [ ] **Verify Isolation:**
  - Look for `[Sandbox] Creating container...` in logs.
  - Confirm file transfer via Docker's `put_archive` (not volume mounts).
  - Confirm container cleanup: `[Sandbox] Container removed`.
- [ ] **Verify Grading:**
  - If code fails execution, verify Score is capped at `0.5` (see scoring.py).
