> **Status:** DRAFT
> **Type:** Spec
> **Context:**
> *   [2025-12-21]: Technical manifest for executing the "Polyglot" consolidation. Lists specific file moves and deletions.

# Migration Manifest: Polyglot Consolidation

## 1. Root Promotion (Python)
Move the contents of Kuan's repository to the root to establish the Python environment.

| Source | Target | Action |
| :--- | :--- | :--- |
| `external/TEAM/agentbeats-lambda-[...]/pyproject.toml` | `./pyproject.toml` | **MOVE** |
| `external/TEAM/agentbeats-lambda-[...]/uv.lock` | `./uv.lock` | **MOVE** |
| `external/TEAM/agentbeats-lambda-[...]/src/` | `./src/` | **MOVE** |
| `external/TEAM/agentbeats-lambda-[...]/scenarios/` | `./scenarios/` | **MOVE** |
| `external/TEAM/agentbeats-lambda-[...]/assets/` | `./assets/` | **MOVE** |

## 2. Legacy Cleanup (Deletions)
Remove the "CLI Wrapper" directories once their logic is verified as ported or redundant.

| Path | Reason | Action |
| :--- | :--- | :--- |
| `green-agent/` | Replaced by `src/green_logic/` | **DELETE** (After Port) |
| `purple-agent/` | Replaced by `src/blue_logic/` | **DELETE** |
| `external/` | Content promoted to root | **DELETE** |

## 3. Configuration Merges

### .gitignore Update
Append Python patterns to the existing Node.js `.gitignore`.
```text
# Python
__pycache__/
*.py[cod]
*$py.class
.venv/
venv/
.pytest_cache/
.coverage
htmlcov/
dist/
build/
*.spec
```

### Dockerfile Strategy (Completed)
*   **Status:** [x] Done (See [Scaffolding Log](20251227-Polyglot-Scaffolding-Log.md)).
*   **Implementation:** Created root `Dockerfile` (Node 20 + Python 3.12 + uv) and `main.py` entrypoint.

### Infrastructure Hardening (Lambda Prep)
*   **Status:** [ ] Pending.
*   **Task:** Create `Dockerfile.gpu` based on `nvidia/cuda:12.1.0-devel-ubuntu22.04`.
    *   Must install Python 3.12, Node.js v20, `uv`, and `pnpm`.
    *   Must include `vllm` for local inference.
*   **Task:** Create `scripts/start_lambda.sh` to launch vLLM and the Agent in parallel.

## 4. Porting Checklist (Logic Transfer)

- [ ] **Green Agent:**
    - Extract `CODING_TASKS` from `green-agent/tools.py`.
    - Create `src/green_logic/tasks.py`.
    - Implement `src/green_logic/agent.py` using `A2AStarletteApplication`.
    - [ ] **Network Hardening:** Replace all `localhost` and port `9050` references in `tools.py` with `os.getenv('PURPLE_AGENT_URL')`.
    - [ ] **vLLM Config:** Update `agent.py` / `run.sh` logic to accept `OPENAI_BASE_URL` and `MODEL_NAME` env vars for Sidecar routing.
    - [ ] **Persistence:** Rewrite `report_result` to save the evaluation JSON to `data/battles.db` (SQLite) instead of just printing to console.
- [ ] **Purple Agent:**
    - Verify `src/blue_logic/generic_defender.py` runs correctly.
- [ ] **Red Agent:**
    - [ ] **Scenario Implementation:** Implement `ad_attack` scenario based on the Lambda specification blueprint (Optional but recommended for score padding).
