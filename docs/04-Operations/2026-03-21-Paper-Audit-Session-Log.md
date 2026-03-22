---
status: SNAPSHOT
type: Log
---
> **Context:**
> *   2026-03-21: Full codebase-vs-paper audit of the Contextual Debt paper prior to professor submission. Session conducted by Claude Sonnet 4.6 with Joshua Hickson.

# Paper Audit and Code Correction Log — 2026-03-21

## 1. Overview

This log documents all code changes, paper corrections, and data analysis performed during the 2026-03-21 audit session. The goal was to verify every empirical and architectural claim in `docs/07-Joshua-Theory/Joshua Hickson/03.21.2026-Contextual-Debt-Paper_pdflatex.tex` against the live source code, correct any discrepancies, and prepare data to back the paper's empirical claims.

All changes were committed to branch `paper-audit-2026-03-21` and pushed to GitHub.

---

## 2. Code Changes

### 2.1 `src/green_logic/agent.py` — DBOM Hash Bug Fix

**File:** `src/green_logic/agent.py`, line 19
**Type:** Bug fix
**Severity:** Medium — the hash stored in every DBOM was not reproducible from the stored payload.

**Before:**
```python
raw_result = json.dumps(result)          # no sort_keys — key order is undefined
h_delta = hashlib.sha256(raw_result.encode()).hexdigest()
```

**After:**
```python
raw_result = json.dumps(result, sort_keys=True)   # deterministic key order
h_delta = hashlib.sha256(raw_result.encode()).hexdigest()
```

**Why it mattered:** `submit_result()` on line 97 already serialized to the database using `sort_keys=True`. The hash in `generate_dbom()` was computed from a *different* serialization (no `sort_keys`), meaning re-hashing the stored payload would never reproduce the stored hash. This made DBOM integrity verification impossible in practice.

---

### 2.2 `src/green_logic/refinement_loop.py` — Windows cp1252 Crash Fix

**File:** `src/green_logic/refinement_loop.py`, lines 130–131
**Type:** Bug fix
**Severity:** High on Windows — emoji in `print()` calls crash the server with `UnicodeEncodeError` on cp1252 terminals.

**Before:**
```python
print(f"[MetaAgent] 🧪 Created custom experiment: {experiment_name}")
print(f"[MetaAgent] 📐 Invariant: {invariant[:80]}...")
```

**After:**
```python
print(f"[MetaAgent] [TEST] Created custom experiment: {experiment_name}")
print(f"[MetaAgent] [RULE] Invariant: {invariant[:80]}...")
```

**Note:** Additional emoji characters exist throughout `refinement_loop.py` in print statements (lines 863, 1387, 1392) that would cause the same crash. These were not corrected in this session as the user chose to wrap up before the variance test was fully unblocked. If running the Green Agent on Windows, setting `PYTHONUTF8=1` before the process starts will suppress all such errors without source changes.

---

## 3. Paper Corrections

All corrections to `docs/07-Joshua-Theory/Joshua Hickson/03.21.2026-Contextual-Debt-Paper_pdflatex.tex`.

### 3.1 Section 4 — Bounded LLM Contribution

**Claim corrected:** "a mathematical floor enforcing the downward bound is applied to the R, A, and T components"

**Finding:** The L (Logic) component has no floor. Its prior cap (B-001) was removed to prevent double-penalization with T. The floor in `scoring.py` applies only to R, A, and T via `max(x, ground_truth - 0.10)`. L has no equivalent guard.

**Action:** Rewrote the paragraph to accurately state L lacks an enforced floor and reference Section 5.4 for explanation. Fixed a dangling `\ref{sec:cis}` (no such label exists) to hardcoded `Section~5.4`.

---

### 3.2 Section 5.1 — Rationale Integrity (R) Formula

**Claim corrected:** `R(Δ) = cos(v_code, v_intent)` — the paper implied R was computed from the source code vector against the task intent vector.

**Finding (`scoring.py` lines 347–351):** R is computed from `v_rationale` (the natural-language rationale text) against `v_intent` (the task description), plus a length bonus:
```
r_vector = cosine(task_description, rationale)
r_length_bonus = min(0.1, len(rationale) / 1000)
R = min(1.0, r_vector + r_length_bonus)
```
The separate metric `cos(v_code, v_intent)` drives the **Intent Penalty** (Section 5.5), not R.

**Action:** Rewrote formula to `R(Δ) = min(1, cos(v_rationale, v_intent) + β)` where `β = min(0.10, |rationale|/1000)`. Added clarifying note about the separate intent-code similarity metric.

---

### 3.3 Section 5.2 — Architectural Integrity (A): AST Claim

**Claim corrected:** "Abstract Syntax Tree (AST)-based constraint checking" — paper stated A used AST parsing for constraint validation.

**Finding (`scoring.py` `_evaluate_architecture_constraints()`):** All constraint checking uses `re.search()` regex pattern matching. No AST parsing occurs. A also has a `±0.05` vector adjustment and an LLM `±0.10` adjustment applied post-constraint-check.

**Action:** Changed "Abstract Syntax Tree (AST)" to "regular-expression-based pattern matching." Documented the `±0.05` vector and `±0.10` LLM adjustments that the paper previously omitted.

---

### 3.4 Section 5.3 — Testing Integrity (T): Formula and Sandbox

**Claim corrected (formula):** Paper stated `T = pass_rate` with "hard floor of 0.20." Actual formula is different.

**Finding (`scoring.py` lines 415–421):**
```
T = 0.20 + 0.65 × pass_rate + (test_specificity - 0.6) × 0.25
```
giving T = 0.85 at 100% pass rate, with a specificity bonus up to +0.10 (ceiling ~0.95).

**Claim corrected (sandbox):** Paper stated networking was "always disabled."

**Finding (`sandbox.py`):** `network_disabled=self._has_pytest` — networking is only disabled when the pre-built `logomesh-sandbox` image is available. In the fallback path (base Python image), networking is enabled to allow `pytest` installation.

**Action:** Rewrote T formula with the correct `0.20 + 0.65 × pass_rate` base, described specificity bonus, corrected sandbox networking caveat to conditional.

---

### 3.5 Section 5.4 — Logic Integrity (L): Missing Floor

**Claim corrected:** Paper implied L had a symmetric floor comparable to R, A, T.

**Finding (`scoring.py` lines 562–566):** R, A, T are floored at `max(x, ground_truth - 0.10)`. L has no floor. The comment in the code reads "L anchoring stays as-is." The prior B-001 cap was removed to prevent double-penalization with T.

**Action:** Rewrote Section 5.4 to honestly state L carries no enforced floor and explain the B-001 removal rationale.

---

### 3.6 Section 5.5 — Intent Penalty Trigger

**Claim corrected:** Paper stated the Intent Penalty triggers "when R(Δ) falls below threshold" — conflating R with the code-intent similarity metric.

**Finding (`scoring.py` lines 580–583):** The trigger uses `intent_code_similarity = cosine(task_description, source_code)` with threshold 0.35. This is entirely separate from R (which compares rationale to task, not code to task).

**Action:** Changed trigger description to `cos(v_code, v_intent) < 0.35` and clarified it is a distinct metric from R.

---

### 3.7 Section 6 — JSON Schema Example

**Multiple corrections:**
- `"max_severity": "low"` → `null` (correct when `vulnerability_count: 0`)
- Added `"penalty_percentage": 0.0` (emitted in output, was absent from example)
- Changed description from "rigid JSON schema" to "illustrative" (schema is not formally validated)
- Added note listing additional emitted fields: `logic_critique`, `intent_code_similarity`, `intent_vector`
- Noted that example CIS values (0.85/0.90/0.80/0.75/0.825) are illustrative, not from a real evaluation

---

### 3.8 Section 7 — Red Agent Hyperparameters

**Claim corrected:** Paper listed Max Rollout Depth = 10, Budget = 60.0s, Branching Factor = 3.

**Finding (`src/green_logic/server.py` `_init_red_agent()`, lines 76–80):** Runtime defaults used by the production server are:
- `max_steps = 5`
- `max_time_seconds = 20.0`
- `mcts_branches = 2`

The `RedAgentV3.__init__` class defaults (10/60/2) are overridden at startup. The Green Agent startup log confirms: `[GreenAgent] Embedded Red Agent V3 (MCTS-2b, 5 steps, 20.0s) initialized`.

**Action:** Corrected all three values in the hyperparameter table.

---

### 3.9 Section 7.1 — DBOM Serialization Caveat

**Claim corrected:** "contingent on consistent JSON serialization" — this caveat was present because the DBOM hash and stored payload used different serializations (the bug fixed in §2.1 above).

**Action (two changes):**
1. Removed "contingent on consistent JSON serialization" from the DBOM prose — the fix makes this unconditional.
2. Updated Phase 2 Roadmap Item 1 to note the serialization inconsistency "has since been resolved; both the DBOM hash and the `raw_result` column now use deterministic sort-keyed JSON serialization."

---

### 3.10 Section 8 — Variance Claim Removed

**Claim removed:** "The benchmark's variance of less than 0.05 across identical runs—achieved by anchoring to execution facts rather than model opinion—establishes a baseline for reproducibility in LLM-assisted code evaluation."

**Finding:** This claim is not backed by data in the repository. The 313 DBOM files in `data/dboms/` represent cross-submission variance (different Purple-generated solutions), not intra-submission evaluator variance (same code evaluated N times). No controlled repeat-evaluation data was found.

**Action:** Replaced with an accurate structural description: the hybrid design limits the non-deterministic surface to the Red Agent and Logic Integrity components; T is anchored to execution facts. No quantitative variance claim is made.

---

## 4. New Scripts and Data

### 4.1 `scripts/mine_existing_data.py`

Mines all existing data sources and writes `results/paper_data/existing_stats.json`.

**Sources:**
- `data/dboms/*.json` — 313 DBOM files
- `results/c_new_001_diversity_test/tier2_qwen_battles.log` — 25 Tier 2 Qwen battles

**Findings:**
- 313 total DBOM records; 215 are zero-score (Email Validator campaign, 2026-01-14 — Purple returned empty/unparseable code for all these runs)
- 98 non-zero battles from the Jan 13 campaign (Rate Limiter: 25, LRU Cache: 27, Recursive Fibonacci: 25, plus ~21 from an earlier run)
- Non-zero mean CIS: **0.632**, std: **0.156**, range: [0.05, 0.85]
- Tier 2 Qwen (25 battles, 2026-01-15): mean CIS: **0.666**, std: **0.124**
- `battles.db` is absent (was not retained after the Jan 13–14 campaigns); battle_ids in DBOM files do not encode task type, so per-task breakdown is not possible from DBOM files alone

### 4.2 `scripts/run_variance_test.py`

Controlled variance test with an embedded mock Purple server (port 9099). Submits fixed golden solutions (Rate Limiter, LRU Cache, Fibonacci) 5 times each to isolate evaluator variance from code-generation variance. Outputs `results/paper_data/variance_test.json`.

**Status:** Script is complete and correct but did not produce valid results in this session due to a Windows cp1252 emoji crash in the Green Agent server (see §2.2). The crash blocks task-002 and task-004; task-003 returns CIS=0.0 due to a separate error path.

**To run successfully:**
```bash
# Fix: start Green Agent with UTF-8 output mode
PYTHONUTF8=1 uv run main.py --role GREEN --host 127.0.0.1 --port 9009

# Then in another terminal
python3 scripts/run_variance_test.py
```

---

## 5. What Is Needed to Process the Original Phase 1 Baseline Results

The paper referenced a baseline variance claim ("< 0.05 across identical runs") that was originally supported by data from a teammate. That data was not present in the repository. To restore and validate this claim, the following is needed:

### 5.1 Minimum Data Required

The claim requires **intra-submission evaluator variance** data: the same fixed code submitted multiple times, with scores recorded per run.

| Field | Required | Notes |
|---|---|---|
| Task identifier | Yes | Which task(s) were tested (e.g., Rate Limiter, LRU Cache) |
| Source code submitted | Yes | The exact fixed code that was re-evaluated — must be identical across runs |
| CIS score per run | Yes | The final `cis_score` for each evaluation |
| Number of runs | Yes | Minimum 5 per task to compute meaningful std_dev |
| Component scores (R, A, T, L) | Optional but useful | Helps isolate which component drives variance |
| Red Agent results per run | Optional | Shows whether Red Agent introduced variance |

### 5.2 Acceptable File Formats

Any of the following can be parsed directly:

- **SQLite database** (`battles.db`) with the standard schema: `battle_id`, `score`, `raw_result` columns — provided `raw_result` contains a JSON blob with `cis_score` and the component breakdown
- **JSON file** — array of evaluation records, each with at minimum `{"task": "...", "cis_score": 0.XX, "run": N}`
- **The DBOM files** from the baseline run — if the original `data/dboms/` directory from the Phase 1 submission is available, and the battle_ids can be mapped to task types (e.g., via a separate manifest), these are sufficient
- **CSV** — with columns `task`, `cis_score`, optionally `r_score`, `a_score`, `t_score`, `l_score`

### 5.3 What Cannot Be Inferred from Existing Data

- **The 215 zero-score DBOM files** (Email Validator, Jan 14) cannot support a variance claim — they all score 0 regardless of the submission, indicating Purple returned broken code for every run
- **The 98 non-zero DBOM files** (Jan 13 campaign) represent different Purple-generated solutions per battle, not the same solution evaluated repeatedly — their std_dev (0.156) measures inter-submission quality spread, not evaluator reproducibility
- **The Tier 2 Qwen log** has only aggregate scores per battle with no per-component breakdown and no repeated submissions

### 5.4 Once the Data Is Provided

With the baseline data in hand, the process is:

1. Run `python3 scripts/mine_existing_data.py` (already parses DBOMs; can be extended for new sources)
2. Compute per-task `mean`, `std_dev`, `min`, `max` of CIS scores across repeated runs
3. If `max_per_task_std < 0.05`, the variance claim is supported — update Section 8 with the measured value:

```latex
Across [N] controlled evaluations of identical fixed solutions spanning [K] task
categories, the CIS pipeline exhibited a mean standard deviation of [X]
(max: [Y] across tasks), confirming variance below the 0.05 threshold that
would undermine reproducibility claims.
```

4. Compile the `.tex` in Overleaf (two passes for cross-references)
