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

### Dockerfile Strategy
Create a single `Dockerfile` at root that:
1.  From `node:20-bookworm` (Base).
2.  Installs Python 3.12 + `uv`.
3.  Copies `package.json` + `pnpm-lock.yaml` -> `pnpm install`.
4.  Copies `pyproject.toml` + `uv.lock` -> `uv sync`.
5.  Copies `src/` and `packages/`.
6.  Entrypoint: `scripts/start_polyglot.sh` (Starts Node + Python).

## 4. Porting Checklist (Logic Transfer)

- [ ] **Green Agent:**
    - Extract `CODING_TASKS` from `green-agent/tools.py`.
    - Create `src/green_logic/tasks.py`.
    - Implement `src/green_logic/agent.py` using `A2AStarletteApplication`.
- [ ] **Purple Agent:**
    - Verify `src/blue_logic/generic_defender.py` runs correctly.
