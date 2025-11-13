# Tools — quick helpers

This folder contains small helper scripts useful for data scientists and maintainers doing quick EDA on evaluation outputs.

Current scripts
---------------
- `convert_eval_to_csv.py` — Convert one or more evaluation JSON files into a CSV (one row per analyzer). The script is intentionally minimal and depends only on the Python standard library.

Why this exists
---------------
The evaluation pipeline writes JSON reports (see `docs/EVAL_OUTPUT_SCHEMA.md` and `docs/onboarding/example-evaluation-report.json`). For quick exploratory analysis it's often easier to work with a CSV or a Pandas DataFrame. The converter turns every evaluation JSON into one or more CSV rows (one row per analyzer) so you can slice and aggregate easily.

Quick usage
-----------
From the repository root, using your Python environment:

```bash
# Convert the included example JSON to CSV
python tools/convert_eval_to_csv.py -i docs/onboarding/example-evaluation-report.json -o example-eval.csv

# Convert all JSON files found in logs/ to a single CSV
python tools/convert_eval_to_csv.py -i logs -o logs-evals.csv
```

Output columns
--------------
- `run_id` — evaluation run id
- `status` — run status
- `contextualDebtScore` — aggregated score (0-1)
- `createdAt`, `completedAt` — timestamps
- `analyzer` — analyzer key (e.g. `rationaleDebt`)
- `analyzer_score` — analyzer score (0-1)
- `analyzer_details` — human-readable details

Integration tips
----------------
- Use the converter as a preprocessing step for notebooks. For example, you can run the converter and then load the CSV in `pandas.read_csv(...)` in `notebooks/01-explore-sample-eval.ipynb`.
- The script skips files that fail to parse and prints a short warning. If you need stricter behavior, consider wrapping it in a small driver script that validates inputs first.

Suggested next improvements
---------------------------
- Add a small test (`tests/test_convert_eval_to_csv.py`) exercising the script against the `docs/onboarding/example-evaluation-report.json` file.
- Extend the script to accept nested or richer analyzer fields and normalize additional columns.
- Add a `--watch` mode or a thin wrapper that converts newly created JSON files automatically (useful for long-running evaluation producers).

If you'd like, I can add a test and update the notebook to call the converter and load the CSV automatically.
