---
status: ACTIVE
type: Guide
---
> **Context:**
> *   [2025-12-29]: A step-by-step execution guide for Phase 3B (Dependency & Build Verification). Created to provide a deterministic source of truth for local execution before proceeding to Phase 4.

# Phase 3B: Dependency & Build Verification Guide

**Objective:** specific objective is to install dependencies, verify the local environment, and confirm the Docker build succeeds before attempting logic porting.

---

## Step 1: Python Dependency Installation
We use `uv` for fast, reliable Python package management.

```bash
# Sync dependencies from uv.lock
uv sync
```

*   **Verification:** Ensure it creates/updates the `.venv` directory.
*   **Troubleshooting:** If `uv` is not installed, install it: `curl -LsSf https://astral.sh/uv/install.sh | sh`

## Step 2: Node.js Dependency Installation
We use `pnpm` for the monorepo structure.

```bash
# Install Node.js dependencies
pnpm install
```

*   **Verification:** Ensure `node_modules` are populated and no `gyp` errors occur (some warnings are expected).

## Step 3: Entrypoint Verification (Local)
Before building the container, verify the Python entrypoint works locally.

```bash
# Run the help command
# Note: You might need to activate the venv first: source .venv/bin/activate
uv run main.py --help
```

*   **Expected Output:** A help message listing the `--role` argument (GREEN, PURPLE).

## Step 4: Docker Build Verification (The "Acid Test")
This confirms that the `Dockerfile` correctly copies the migrated source code (`src/`) and installs all dependencies in the container.

```bash
# Build the Polyglot Agent container
docker build -t polyglot-agent .
```

*   **Success Criteria:**
    *   The build completes successfully.
    *   Specifically, the `COPY src/ src/` step passes (proving Phase 3A migration worked).
    *   No critical errors during `uv sync` or `pnpm install` inside the container.

## Step 5: Update Logs
Once verification is complete, update the Scaffolding Log to reflect the current state.

*   **File:** `docs/04-Operations/Intent-Log/Technical/20251221-Consolidation-Artifacts/20251227-Polyglot-Scaffolding-Log.md`
*   **Action:** Add a new section `## [2025-12-29] Phase 3B Complete` and note the successful build.
