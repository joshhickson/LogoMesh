---
status: ACTIVE
type: Spec
---
> **Context:**
> * [2025-12-17]: The Core Algorithm Spec.

# Contextual Debt: Technical Specification

**Related Documents:**
*   **Theory & Research:** [Contextual Debt: A Software Liability](../../03-Research/Theory/20251115-Research_Paper-Contextual_Debt-A_Software_Liability.md) (The theoretical basis for this metric)
*   **Output Schema:** [Evaluation Output Schema](Evaluation-Output-Schema.md)

Last updated: 2025-11-13

Purpose
-------
This short spec documents the current algorithm used to compute the top-level `contextualDebtScore` produced by the evaluation orchestrator. It is intentionally concise and includes the exact pseudo-code that matches the current implementation so a data scientist can both interpret existing outputs and iterate on the metric.

Summary (one sentence)
----------------------
The `contextualDebtScore` is the arithmetic mean of the per-analyzer scores (each normalized to [0,1]) produced by the rationale, architectural, and testing analyzers; the final value is rounded to two decimal places.

Current algorithm (precise)
---------------------------
- Inputs:
  - `rationaleResult.overallScore` — number in [0,1]
  - `archResult.score` — number in [0,1]
  - `testResult.score` — number in [0,1]

- Algorithm (pseudo-TypeScript, matches `packages/core/src/orchestration/evaluationOrchestrator.ts`):

```ts
const totalScore = (rationaleResult.overallScore + archResult.score + testResult.score) / 3;
const contextualDebtScore = parseFloat(totalScore.toFixed(2));
```

- Output: `contextualDebtScore` (number, 0.00–1.00)

Worked example (from example-evaluation-report.json)
--------------------------------------------------
- rationaleDebt.score (overallScore) = 0.90
- architecturalCoherenceDebt.score = 0.80
- testingVerificationDebt.score = 0.60

Compute:

```
total = (0.90 + 0.80 + 0.60) / 3 = 0.766666... -> round to 2 dp -> 0.77
```

Implementation notes & edge cases
--------------------------------
- Missing analyzers: the current implementation assumes all three analyzers return numeric scores. If a child job fails or an analyzer returns `null`, the orchestrator currently will throw or produce `null` values. Future work should explicitly handle missing analyzers (e.g., omit from denominator or use conservative defaults).
- Score normalization: analyzers must produce scores in the [0,1] range. If an analyzer returns values on a different scale, normalize before aggregation.
- Weighting: the current approach uses equal weights. If product requirements prioritize one analyzer (for example, giving rationale more importance), switch to a weighted mean:

```ts
const weights = { rationale: 0.5, architectural: 0.3, testing: 0.2 };
const weighted = (rationaleResult.overallScore * weights.rationale + archResult.score * weights.architectural + testResult.score * weights.testing) / (weights.rationale + weights.architectural + weights.testing);
```

- Rounding: we use `toFixed(2)` and parse back to number for display/serialization. Keep rounding consistent across consumers.

Suggested improvements (prioritized)
-----------------------------------
1. Robust missing-data handling: explicitly document and implement behavior when analyzer jobs fail.
2. Configurable weights: expose weights via configuration so experiments can compare variants without code changes.
3. Uncertainty quantification: return per-analyzer confidence or variance and propagate it into an error bar for the overall score.
4. Multi-run aggregation: provide both single-run score and aggregated statistics over multiple runs (mean, std, percentiles).

Where this is implemented
-------------------------
- Aggregation code: `packages/core/src/orchestration/evaluationOrchestrator.ts` — see the `aggregatorWorker` where the three analyzer results are averaged and rounded.

How to cite this spec from README
--------------------------------
Add a link to this file from the README's Data Scientist Quickstart so incoming reviewers can immediately find the metric definition and the worked example.
