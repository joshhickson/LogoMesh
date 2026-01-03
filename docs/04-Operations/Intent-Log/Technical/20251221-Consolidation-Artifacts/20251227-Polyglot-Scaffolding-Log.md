---
status: ACTIVE
type: Log
---
> **Context:**
> *   [2025-12-27]: Log of the "Polyglot" scaffolding process, documenting file creation and next steps.

# Polyglot Scaffolding Log

## 1. Artifacts Created

| File | Purpose | Status |
| :--- | :--- | :--- |
| `Dockerfile` | Defines the hybrid runtime environment (Node.js 20 + Python 3.12). Uses `pnpm` for sidecars and `uv` for agents. | **Created** (Draft) |
| `main.py` | The "Polymorphic Entrypoint". Parses CLI args (`--role`, `--host`, `--port`) and dispatches to Green or Purple logic. | **Created** (Skeleton) |

## 2. Verification Steps (Dry Run)

### Docker Build
*   **Command:** `docker build -t polyglot-agent .`
*   **Expected Result:** Should fail at `COPY src/ src/` because `src/` does not exist yet (source code hasn't been moved from `external/`).
*   **Status:** Pending Source Migration.

### Entrypoint Logic
*   **Command:** `python3 main.py --role GREEN --host 0.0.0.0 --port 9040`
*   **Expected Result:** Should print `[Polyglot] Starting Green Agent...` and exit (Logic not ported).
*   **Status:** Verified (Skeleton exists).

## 3. Pending Actions (Next Steps)

### A. Source Migration (The "Big Move")
*   [x] Move `external/TEAM/agentbeats-lambda-[...]/src/` to `./src/`.
*   [x] Move `external/TEAM/agentbeats-lambda-[...]/scenarios/` to `./scenarios/`.
*   [x] Move dependency files (`pyproject.toml`, `uv.lock`) to root.

### B. Dependency Installation
*   [ ] Run `uv sync` to install Python dependencies.
*   [ ] Run `pnpm install` to install Node.js dependencies.

### C. Logic Wiring
*   [ ] **Green Agent:** Import `src.green_logic.agent` in `main.py`.
*   [ ] **Purple Agent:** Import `src.blue_logic.generic_defender` in `main.py`.
*   [ ] **Sidecars:** Add `pnpm start:sidecar` script to `package.json`.
