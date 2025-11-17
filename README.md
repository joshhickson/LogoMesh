# LogoMesh: An Open Platform for Agent-on-Agent Evaluation

Welcome — and thanks for jumping in. This repo contains the LogoMesh monorepo: a TypeScript-based platform for evaluating AI agents and measuring our core metric, "Contextual Debt." The codebase is organized as pnpm workspaces and includes the API server, worker processes, and test harness used during development and evaluation.

Quick links
- Project Plan: `PROJECT_PLAN.md`
- Project status & overview: `docs/PROJECT_STATUS.md`
- Gap analysis for new reviewers: `docs/GAP_ANALYSIS_FOR_DATASCIENTIST.md`
- CI guidance for running e2e in GitHub Actions: `docs/CI_COMPOSE_E2E_WORKFLOW.md`

Who this README is for
- Engineers who will develop the system (backend, infra, eval logic).
- Data scientists and evaluators who need a clear, reproducible path to run the system locally and inspect evaluation output (this README includes a dedicated Quickstart section for you).

Quickstart for Data Scientists (recommended)

Prerequisites (local machine)
- Node.js v20+ — use `nvm` (or nvm-windows) to install and select the version specified in `.nvmrc`:

```bash
# Installs the version specified in .nvmrc
nvm install

# Selects the version for the current shell
nvm use
```

- Enable `corepack` for pnpm:

```bash
corepack enable
```

- Python (3.8–3.11) and `setuptools` for native builds (node-gyp):

```bash
pip install --user setuptools
```

- On Windows: **Visual Studio Build Tools**. This is required for native Node.js modules like `isolated-vm`.
  - Download the installer directly from the [Visual Studio website](https://visualstudio.microsoft.com/visual-cpp-build-tools/).
  - During installation, you **must** select the **"Desktop development with C++"** workload. This includes the necessary C++ compiler, libraries, and the Windows SDK.
  - After installation, **restart your computer** to ensure the environment variables are updated correctly.
- **Docker Desktop**. This is required to run the full end-to-end test suite, which uses Docker Compose.
  - Download and install Docker Desktop from the [official Docker website](https://www.docker.com/products/docker-desktop/).
  - During or after installation, ensure that virtualization is enabled in your system's BIOS and that Docker is configured to use the **WSL 2 backend**, which is the modern standard. Follow the [official Microsoft guide to enable WSL 2](https://learn.microsoft.com/en-us/windows/wsl/install) if prompted.

Recommended local steps

1) Install dependencies and build the monorepo:

```bash
pnpm install
pnpm run build
```

2) Run the end-to-end verification (local, Docker Compose):

```bash
docker compose build --progress=plain
docker compose up --build --abort-on-container-exit --exit-code-from e2e-tester
```

This will start Redis, the API server, workers, and the `e2e-tester`. The Compose command returns the exit code of the `e2e-tester` service so the test result is visible directly in the terminal.

If you prefer to run services individually (faster iteration):

```bash
# Start Redis locally (container)
docker compose up -d redis

# Start the API server (in-process):
pnpm --filter @logomesh/server start

# Start workers in separate terminals:
pnpm --filter @logomesh/workers start:rationale
pnpm --filter @logomesh/workers start:architectural
pnpm --filter @logomesh/workers start:testing

# Run the e2e tests against the running API
pnpm --filter @logomesh/server test
```

Where to look for results
- Evaluation outputs and logs are written by default into the repository `logs/` folder during local runs. See `logs/2025-11-13_docker_compose_logs.log` for a recent successful verification run.

- Evaluation output schema & example JSON:
	- `docs/EVAL_OUTPUT_SCHEMA.md` describes the canonical output fields and includes a small example.
	- `docs/onboarding/example-evaluation-report.json` contains a concrete example you can open directly in a notebook.

Developer notes / environment gotchas
- Node v20+ is required due to dependencies like `vite` used in the `vitest` test runner.
- On Windows make sure a Windows SDK is installed and the machine restarted after installing Visual Studio Build Tools.
- If you hit a native build error during `pnpm install`, try:

```bash
CXXFLAGS="-std=c++14" pnpm install
```

Where to go next (role-specific)
- Data Scientist onboarding: quick links and commands to get productive:

	- Gap analysis & onboarding plan: `docs/GAP_ANALYSIS_FOR_DATASCIENTIST.md`
	- Metric spec (how the score is computed): `docs/CONTEXTUAL_DEBT_SPEC.md`
	- Evaluation output schema + example JSON: `docs/EVAL_OUTPUT_SCHEMA.md` and `docs/onboarding/example-evaluation-report.json`
	- Example notebook: `notebooks/01-explore-sample-eval.ipynb`
	- Small helpers: `tools/convert_eval_to_csv.py`, `tools/run_single_analyzer.py`, `tools/README.md`

	Quick commands:

	```bash
	# Convert example JSON -> CSV
	python tools/convert_eval_to_csv.py -i docs/onboarding/example-evaluation-report.json -o example-eval.csv

	# Run a single analyzer locally (dry-run, fast iteration)
	python tools/run_single_analyzer.py -a rationale -i docs/onboarding/example-evaluation-report.json -o tmp/rationale-output.json
	```

- If you're an engineer: see `docs/PROJECT_STATUS.md` and the new CI docs for build/verify guidance.

Thank you for reviewing the repo — we've designed these instructions so someone with a strong data science background (familiar with Python, Node, Docker, and ML stacks) can get up to speed quickly. If anything is unclear, open an issue or ping the maintainer in the repo.
