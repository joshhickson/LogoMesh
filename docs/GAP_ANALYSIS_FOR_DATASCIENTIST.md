# Gap Analysis & Onboarding Plan — Data Scientist

Date: 2025-11-13
Author: repo maintainer (verification run included)

Dear Deep,

A quick note to avoid confusion: the most recent updates and concrete recommendations were appended at the bottom of this document (look for the "Detailed recommendations (added)" and "Next action suggestion" sections). If you want the latest actionable items, start by scrolling to the end — the top of this file contains the narrative and background.


Purpose
-------
This document is a focused gap analysis and onboarding plan targeted at a Data Scientist reviewer with the profile you provided (experienced ML/Data Scientist, familiar with Python, SQL, model evaluation, and tooling such as Jupyter/Colab/VS Code). The deliverable has three goals:

1. Empirically verify the repository's current runtime state and surface any gaps relevant to a data scientist.
2. Provide an actionable, prioritized set of tasks and experiments that a data scientist can run immediately.
3. Ensure the repo's front-facing docs are clear enough that a data scientist will not be confused when setting up the project locally.

Quick verdict (pass/fail question)
---------------------------------
Will the data scientist be confused or have trouble finding instructions to set the project up for review?  
Answer: No — after the updates made on 2025-11-13 (README quickstart, verification notes, and CI docs). This document explains why and lists exactly what remains.

Executive summary of empirical verification
------------------------------------------
- I ran a full local verification on 2025-11-13: `pnpm install`, `pnpm run build`, and `docker compose up --build` (with fixes applied). The `e2e-tester` service completed and exited with code 0; Redis and workers reported successful "[Redis] Connection is ready." messages.
- The primary previous blocker (Redis EPIPE race) was addressed by:
  - Improving `packages/core/src/services/redis.ts` to use `lazyConnect`, disable the offline queue, and call `connect()` explicitly.
  - Normalizing the Redis entrypoint line endings in `docker-redis/Dockerfile` and making it executable.
  - Starting Redis with `--protected-mode no` inside the container for Compose network accessibility.
- TypeScript builds (`pnpm run build`) completed successfully after installing native build tools and Windows SDK where required.

What a data scientist will care about first
-----------------------------------------
1. How to reproduce evaluation outputs (where to run tests, which command to run, and where outputs/logs appear).
2. Where the evaluation data is written and how to parse it (file locations / output schema).
3. How to run small, focused experiments (e.g., re-run the rationale analyzer on a small sample and visualize the scores).
4. How to explore outputs interactively (notebooks, scripts, or lightweight dashboards).

Files / locations you will use frequently
----------------------------------------
- `packages/core` — core evaluation logic (analyzers, orchestration, Redis helper).
- `packages/server` — API server; integration surface for e2e tests.
- `packages/workers` — worker entrypoints and job handlers (rationale, architectural, testing analyzers).
- `logs/` — runtime logs and e2e run captures. Example: `logs/2025-11-13_docker_compose_logs.log`.
- `docs/GAP_ANALYSIS_FOR_DATASCIENTIST.md` — this doc.
- `docs/PROJECT_STATUS.md` — high-level project context and verified status.
- `docs/EVAL_OUTPUT_SCHEMA.md` — schema for evaluation JSON and a short example.
- `docs/onboarding/example-evaluation-report.json` — concrete example JSON that you can open in a notebook.

````markdown
# Gap Analysis & Onboarding Plan — Data Scientist

Date: 2025-11-13
Author: repo maintainer (verification run included)

Purpose
-------
This document is a focused gap analysis and onboarding plan targeted at a Data Scientist reviewer with the profile you provided (experienced ML/Data Scientist, familiar with Python, SQL, model evaluation, and tooling such as Jupyter/Colab/VS Code). The deliverable has three goals:

1. Empirically verify the repository's current runtime state and surface any gaps relevant to a data scientist.
2. Provide an actionable, prioritized set of tasks and experiments that a data scientist can run immediately.
3. Ensure the repo's front-facing docs are clear enough that a data scientist will not be confused when setting up the project locally.

Quick verdict (pass/fail question)
---------------------------------
Will the data scientist be confused or have trouble finding instructions to set the project up for review?  
Answer: No — after the updates made on 2025-11-13 (README quickstart, verification notes, and CI docs). This document explains why and lists exactly what remains.

Executive summary of empirical verification
------------------------------------------
- I ran a full local verification on 2025-11-13: `pnpm install`, `pnpm run build`, and `docker compose up --build` (with fixes applied). The `e2e-tester` service completed and exited with code 0; Redis and workers reported successful "[Redis] Connection is ready." messages.
- The primary previous blocker (Redis EPIPE race) was addressed by:
  - Improving `packages/core/src/services/redis.ts` to use `lazyConnect`, disable the offline queue, and call `connect()` explicitly.
  - Normalizing the Redis entrypoint line endings in `docker-redis/Dockerfile` and making it executable.
  - Starting Redis with `--protected-mode no` inside the container for Compose network accessibility.
- TypeScript builds (`pnpm run build`) completed successfully after installing native build tools and Windows SDK where required.

What a data scientist will care about first
-----------------------------------------
1. How to reproduce evaluation outputs (where to run tests, which command to run, and where outputs/logs appear).
2. Where the evaluation data is written and how to parse it (file locations / output schema).
3. How to run small, focused experiments (e.g., re-run the rationale analyzer on a small sample and visualize the scores).
4. How to explore outputs interactively (notebooks, scripts, or lightweight dashboards).

Files / locations you will use frequently
----------------------------------------
- `packages/core` — core evaluation logic (analyzers, orchestration, Redis helper).
- `packages/server` — API server; integration surface for e2e tests.
- `packages/workers` — worker entrypoints and job handlers (rationale, architectural, testing analyzers).
- `logs/` — runtime logs and e2e run captures. Example: `logs/2025-11-13_docker_compose_logs.log`.
- `docs/GAP_ANALYSIS_FOR_DATASCIENTIST.md` — this doc.
- `docs/PROJECT_STATUS.md` — high-level project context and verified status.
- `docs/EVAL_OUTPUT_SCHEMA.md` — schema for evaluation JSON and a short example.
- `docs/onboarding/example-evaluation-report.json` — concrete example JSON that you can open in a notebook.
- `notebooks/01-explore-sample-eval.ipynb` — example notebook that loads the example JSON and produces simple plots (histogram + bar chart).
- `tools/convert_eval_to_csv.py` — small CLI to convert evaluation JSON(s) into a CSV (one row per analyzer).
- `tools/README.md` — short usage notes for the tools.

````markdown
# Gap Analysis & Onboarding Plan — Data Scientist

Date: 2025-11-13
Author: repo maintainer (verification run included)

Purpose
-------
This document is a focused gap analysis and onboarding plan targeted at a Data Scientist reviewer with the profile you provided (experienced ML/Data Scientist, familiar with Python, SQL, model evaluation, and tooling such as Jupyter/Colab/VS Code). The deliverable has three goals:

1. Empirically verify the repository's current runtime state and surface any gaps relevant to a data scientist.
2. Provide an actionable, prioritized set of tasks and experiments that a data scientist can run immediately.
3. Ensure the repo's front-facing docs are clear enough that a data scientist will not be confused when setting up the project locally.

Quick verdict (pass/fail question)
---------------------------------
Will the data scientist be confused or have trouble finding instructions to set the project up for review?  
Answer: No — after the updates made on 2025-11-13 (README quickstart, verification notes, CI docs). This document explains why and lists exactly what remains.

Executive summary of empirical verification
------------------------------------------
- I ran a full local verification on 2025-11-13: `pnpm install`, `pnpm run build`, and `docker compose up --build` (with fixes applied). The `e2e-tester` service completed and exited with code 0; Redis and workers reported successful "[Redis] Connection is ready." messages.
- The primary previous blocker (Redis EPIPE race) was addressed by:
  - Improving `packages/core/src/services/redis.ts` to use `lazyConnect`, disable the offline queue, and call `connect()` explicitly.
  - Normalizing the Redis entrypoint line endings in `docker-redis/Dockerfile` and making it executable.
  - Starting Redis with `--protected-mode no` inside the container for Compose network accessibility.
- TypeScript builds (`pnpm run build`) completed successfully after installing native build tools and Windows SDK where required.

What a data scientist will care about first
-----------------------------------------
1. How to reproduce evaluation outputs (where to run tests, which command to run, and where outputs/logs appear).
2. Where the evaluation data is written and how to parse it (file locations / output schema).
3. How to run small, focused experiments (e.g., re-run the rationale analyzer on a small sample and visualize the scores).
4. How to explore outputs interactively (notebooks, scripts, or lightweight dashboards).

Files / locations you will use frequently
----------------------------------------
- `packages/core` — core evaluation logic (analyzers, orchestration, Redis helper).
- `packages/server` — API server; integration surface for e2e tests.
- `packages/workers` — worker entrypoints and job handlers (rationale, architectural, testing analyzers).
- `logs/` — runtime logs and e2e run captures. Example: `logs/2025-11-13_docker_compose_logs.log`.
- `docs/GAP_ANALYSIS_FOR_DATASCIENTIST.md` — this doc.
- `docs/PROJECT_STATUS.md` — high-level project context and verified status.
- `docs/EVAL_OUTPUT_SCHEMA.md` — schema for evaluation JSON and a short example.
- `docs/onboarding/example-evaluation-report.json` — concrete example JSON that you can open in a notebook.
- `notebooks/01-explore-sample-eval.ipynb` — example notebook that loads the example JSON and produces simple plots (histogram + bar chart).
- `tools/convert_eval_to_csv.py` — small CLI to convert evaluation JSON(s) into a CSV (one row per analyzer).
- `tools/run_single_analyzer.py` — lightweight scaffold to run a single analyzer locally (dry-run heuristics).
- `tools/README.md` — short usage notes for the tools.

Top-level gaps (prioritized for a Data Scientist)
-------------------------------------------------
1. Output format & example dataset: Addressed — `docs/EVAL_OUTPUT_SCHEMA.md` and `docs/onboarding/example-evaluation-report.json` now exist.
2. Interactive exploration: Partially addressed — `notebooks/01-explore-sample-eval.ipynb` scaffold was added (basic plots). A richer notebook with multiple example runs would be helpful.
3. Reproducible experiments: Partially addressed — `tools/convert_eval_to_csv.py` and `tools/run_single_analyzer.py` help with faster iteration. A TypeScript harness that invokes analyzers directly (from `packages/core`) could further speed iteration for engineering-driven experiments.
4. Data export & analytics tooling: Addressed — `tools/convert_eval_to_csv.py` converts JSON -> CSV; `tools/README.md` documents usage.
5. Metrics definitions: Addressed — `docs/CONTEXTUAL_DEBT_SPEC.md` documents the current aggregation logic and includes a worked example.

Actionable, prioritized tasks (first 7-day sprint for a data scientist)
------------------------------------------------------------------------
1. Add an evaluation-output schema document (short): `docs/EVAL_OUTPUT_SCHEMA.md` — DONE.
2. Create a sample notebook: `notebooks/01-explore-sample-eval.ipynb` — scaffolded (loads example JSON and produces simple charts). Consider expanding to handle multiple-run aggregation.
3. Implement a small script: `tools/run_single_analyzer.py` — DONE (dry-run scaffold to iterate locally).
4. Draft a short metric spec: `docs/CONTEXTUAL_DEBT_SPEC.md` — DONE (concise algorithm + worked example).
5. Add `README` section "Quick experiments" with the exact commands (pnpm/pnpm run build + docker compose or local harness) — README includes a Data Scientist onboarding block with commands.
6. Add a conversion script: `tools/convert_eval_to_csv.py` — DONE.
7. (Optional) Create a minimal dashboard (Streamlit or Observable) to show one-run summaries — still optional.

Concrete recipes (commands & tiny scripts)
-----------------------------------------
Run the verified E2E (repro):

```bash
# from repo root
pnpm install
pnpm run build
# requires Docker Desktop running
docker compose build --progress=plain
docker compose up --build --abort-on-container-exit --exit-code-from e2e-tester
```

If you want to explore a single analyzer output from an existing log (local quickstart):

```bash
# Convert example JSON -> CSV
python tools/convert_eval_to_csv.py -i docs/onboarding/example-evaluation-report.json -o example-eval.csv

# Run a single analyzer locally (dry-run)
python tools/run_single_analyzer.py -a rationale -i docs/onboarding/example-evaluation-report.json -o tmp/rationale-output.json
```

Suggested small helpers to add (I scaffolded most of these)
---------------------------------------------------------
- `docs/EVAL_OUTPUT_SCHEMA.md` (short doc + example JSON) — added.
- `notebooks/01-explore-sample-eval.ipynb` (loads the example JSON and visualizes) — scaffolded.
- `tools/convert_eval_to_csv.py` (JSON -> CSV) — added.
- `tools/run_single_analyzer.py` (invokes analyzer code path without running entire Compose stack) — added (dry-run heuristics).

Checklist to decide "No" for confusion
--------------------------------------
Before handing the repo to the data scientist, ensure the following are true:

- [x] README contains a clear Quickstart for Data Scientists (commands and prerequisites).
- [x] Project status reflects latest verification and points to the verification log.
- [x] There is a short `EVAL_OUTPUT_SCHEMA.md` describing evaluation JSON shape (added).
- [x] There is an example Jupyter notebook that reads a real evaluation JSON and produces interpretable plots (scaffold added at `notebooks/01-explore-sample-eval.ipynb`).
- [x] There is a small helper script that converts JSON outputs into a DataFrame/CSV for quick EDA (`tools/convert_eval_to_csv.py`).
- [x] There is a lightweight single-analyzer scaffold (`tools/run_single_analyzer.py`) for fast iteration.
- [x] Tools README (`tools/README.md`) documents the converter usage.

If all boxes are checked, answer to "Will the data scientist be confused?" can be confidently "No". Right now the repo is in a state where the data scientist will not be blocked by environment setup (the Quickstart in README ensures that), and there are now basic helpers and examples for quick EDA. Remaining optional work (dashboard, richer notebook, CI wiring) will further improve productivity.

Artifacts created in this pass
-----------------------------

- `docs/EVAL_OUTPUT_SCHEMA.md` — evaluation JSON schema and example.
- `notebooks/01-explore-sample-eval.ipynb` — notebook scaffold with simple visualizations.
- `tools/convert_eval_to_csv.py` — converter script.
- `tools/run_single_analyzer.py` — single-analyzer scaffold (dry-run heuristics).
## Gap Analysis & Onboarding — Data Scientist (consolidated)

Date: 2025-11-13 — consolidated summary

Purpose
-------
Provide a single, concise onboarding and gap-analysis page for a data scientist so they can get productive quickly. This file summarizes what's been done, where to find artifacts, a minimal quickstart, the remaining high-value work, and recommended next steps.

Quick verdict
-------------
You can hand this repository to a data scientist now without them getting stuck on setup. The README points to this gap-analysis and to the metric spec. The following artifacts were created to make exploration fast.

Key artifacts (created / updated)
--------------------------------
- `docs/EVAL_OUTPUT_SCHEMA.md` — canonical evaluation JSON schema + example.
- `docs/onboarding/example-evaluation-report.json` — concrete example JSON.
- `docs/CONTEXTUAL_DEBT_SPEC.md` — exact aggregation algorithm and worked example.
- `notebooks/01-explore-sample-eval.ipynb` — starter notebook that loads the example JSON and plots per-analyzer scores.
- `tools/convert_eval_to_csv.py` — CLI: JSON → CSV (one row per analyzer).
- `tools/run_single_analyzer.py` — scaffold to run a single analyzer locally (dry-run heuristics).
- `tools/README.md` — usage notes for the tools.
- `README.md` — updated with a "Data Scientist onboarding" quick links & commands block.

Minimal Quickstart for a data scientist
--------------------------------------
1) Convert example JSON to CSV (quick EDA):

```bash
python tools/convert_eval_to_csv.py -i docs/onboarding/example-evaluation-report.json -o example-eval.csv
```

2) Run a single analyzer locally (fast iteration without Docker Compose):

```bash
python tools/run_single_analyzer.py -a rationale -i docs/onboarding/example-evaluation-report.json -o tmp/rationale-output.json
```

3) Open the notebook and explore the CSV/JSON:

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .\.venv\Scripts\activate
pip install pandas matplotlib
jupyter notebook notebooks/01-explore-sample-eval.ipynb
```

Short checklist (ready-to-hand-off)
----------------------------------
- [x] Environment & build instructions present in `README.md` (Node v16, pnpm, Docker notes).
- [x] Gap-analysis & onboarding doc (`docs/GAP_ANALYSIS_FOR_DATASCIENTIST.md`) is reachable from the README.
- [x] Metric spec present (`docs/CONTEXTUAL_DEBT_SPEC.md`).
- [x] Canonical example JSON available (`docs/onboarding/example-evaluation-report.json`).
- [x] Quick EDA helpers present: `tools/convert_eval_to_csv.py` and `tools/run_single_analyzer.py`.
- [x] Starter notebook present (`notebooks/01-explore-sample-eval.ipynb`).

Remaining high-value work (not blocking)
----------------------------------------
1. Expand the notebook to load multiple JSONs from `logs/` and produce aggregated views (histogram over many runs, time series, per-analyzer distributions).
2. Add `docs/CONTEXTUAL_DEBT_SPEC.md` enhancements: uncertainty propagation and weighting experiments (optional but useful for research-grade analysis).
3. Add tests for the tools: `tests/test_convert_eval_to_csv.py` and `tests/test_run_single_analyzer.py`.
4. (Optional) Implement a TypeScript harness or `--mode node` in `tools/run_single_analyzer.py` to call the real analyzers when Node is available.

Recommended next steps (I can implement any of these)
----------------------------------------------------
- Expand the notebook to automatically convert available JSON logs to CSV and show aggregated plots (recommended).
- Add unit tests for the tools (quick to validate conversion/scaffold behavior).
- Implement `--mode node` in `tools/run_single_analyzer.py` so engineers can compare Python heuristics with the real TS analyzers.

Detailed recommendations (added)
--------------------------------
Below are the concrete, actionable recommendations I suggest we include here so a data scientist (or reviewer) can pick up work immediately. Each item includes a short acceptance criterion and a minimal implementation plan.

1) Expand the notebook to support multi-run aggregation
  - Why: Enables quick EDA across many evaluation runs (histogram, per-analyzer distributions, time series of `contextualDebtScore`).
  - Acceptance criteria: Notebook discovers JSON files in a target directory (default `logs/` and `docs/onboarding/`), calls `tools/convert_eval_to_csv.py` to produce an aggregated CSV, and renders:
    - per-analyzer violin/box plots (or histograms) for score distributions,
    - a time series of `contextualDebtScore` (if timestamps present), and
    - a summary table (count, mean, std) per analyzer and overall.
  - Minimal plan: Add a new notebook cell that (a) lists candidate JSONs, (b) invokes the converter via subprocess or Python import, (c) reads the resulting CSV with pandas, and (d) uses matplotlib/seaborn for plots. Handle malformed JSON by skipping and logging.

2) Add unit tests for the Python tools
  - Why: Prevent regressions and make the helpers CI-friendly for future changes.
  - Acceptance criteria: Tests validate the converter produces expected CSV rows for a small sample JSON and that `run_single_analyzer.py` returns a correctly structured JSON for each analyzer mode.
  - Minimal plan: Add `tests/test_convert_eval_to_csv.py` and `tests/test_run_single_analyzer.py` using `pytest` and small fixture JSON files under `tests/fixtures/`. Run tests locally with `pytest -q` and optionally wire a lightweight GitHub Actions workflow to run them on pushes.

3) Implement `--mode node` in `tools/run_single_analyzer.py` (optional but high value)
  - Why: Allows engineering parity checks by invoking the real TypeScript analyzer implementations when Node is available on the host.
  - Acceptance criteria: When `--mode node` is passed and Node is found, the script spawns the corresponding `node`/`pnpm` command under `packages/*` (guarded), captures JSON output, and writes it to the `-o` path. When Node isn't available, the script prints a clear message and falls back to the Python heuristic.
  - Minimal plan: Add an optional `--mode node` flag, use `shutil.which('node')` to detect Node, then `subprocess.run()` to call the TS harness (document expected TS command). Keep this guarded to avoid surprising failures on systems without Node.

Next action suggestion
----------------------
If you'd like, I'll implement item (1) now: expand and wire `notebooks/01-explore-sample-eval.ipynb` to call the converter and produce the aggregated plots. Say "do notebook" and I will make the notebook edits, run a quick local validation (convert a known example JSON into CSV and render one plot), and commit the changes. Alternatively, pick (2) or (3) and I'll start on that instead.

Where to get help
-----------------
- If something fails during setup, open `logs/2025-11-13_docker_compose_logs.log` for a recent run and check `logs/2025-11-12_readiness_and_fix_summary.log` for environment fixes.
- For questions about the metric design, consult `docs/CONTEXTUAL_DEBT_SPEC.md` and `docs/AgentX_Submission_Paper.md` for background.

End of consolidated onboarding doc.
