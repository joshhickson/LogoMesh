# Evaluation Output Schema

This document describes the JSON schema used for evaluation reports produced by the LogoMesh evaluation pipeline and provides a small example you can use while developing analysis notebooks.

Location of an example JSON in this repository:

- `../../onboarding/example-evaluation-report.json`

Top-level shape
----------------

Fields (brief):

- `id` (string): unique identifier for the evaluation run.
- `status` (string): run status, e.g. `complete` or `failed`.
- `contextualDebtScore` (number): aggregated score in the range [0, 1]. Higher means more contextual debt.
- `report` (object): per-analyzer breakdown with sub-objects for each analyzer. Each analyzer object contains at minimum `score` (number) and `details` (string).
- `createdAt` / `completedAt` (ISO timestamp strings): run timestamps.

Example JSON
------------

The following example is taken from `../../onboarding/example-evaluation-report.json` and demonstrates a minimal, canonical output.

```json
{
  "id": "01J8Y2Z5X3N4Q5R6S7T8V9W0X2",
  "status": "complete",
  "contextualDebtScore": 0.77,
  "report": {
    "rationaleDebt": {
      "score": 0.9,
      "details": "The rationale is clear, well-structured, and discusses potential trade-offs."
    },
    "architecturalCoherenceDebt": {
      "score": 0.8,
      "details": "Code is well-structured with a low cyclomatic complexity score of 5."
    },
    "testingVerificationDebt": {
      "score": 0.6,
      "details": "Tests cover the happy path, but no explicit tests for edge cases were found."
    }
  },
  "createdAt": "2025-12-15T10:00:00.000Z",
  "completedAt": "2025-12-15T10:01:15.000Z"
}
```

How to use this file
--------------------

- For quick EDA, copy the example JSON into a notebook cell and convert the `report` object into a flat table (one row per analyzer) to visualize scores.
- When writing converters (JSON → CSV/DataFrame), expect analyzer keys inside `report` to vary depending on which analyzers were run; write a small adapter to normalize keys to columns.

Suggested next automation
-------------------------

- Add a small script `tools/convert_eval_to_csv.py` which reads an evaluation JSON and writes a row-per-analyzer CSV. This is a low-effort helper that accelerates exploratory analysis.

If you want, I can scaffold that script and a minimal Jupyter notebook that loads this example and produces a histogram and a bar chart of per-analyzer scores.
