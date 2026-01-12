---
status: DRAFT
type: Specification
created: 2026-01-12
context: Operations / Tooling
---

# Tool Spec: Campaign Analyst (`campaign_analyst.py`)

## 1. Purpose
To extract insights from the raw JSON data stored in `data/battles.db` and generate a rigorous empirical report for the research paper.

## 2. Dependencies
- Python 3.10+
- `pandas` (for aggregation)
- `sqlite3`
- `matplotlib` (optional, for generating charts/graphs if environment permits)

## 3. Core Logic

### A. Data Ingestion
- Connect to `data/battles.db`.
- Fetch all rows: `SELECT raw_result, timestamp FROM battles`.
- Parse `raw_result` (JSON) into a Pandas DataFrame.
- Columns to extract:
    - `task_id` / `task_name`
    - `cis_score`
    - `rationale_score` (from evaluation breakdown)
    - `architectural_score` (from evaluation breakdown)
    - `sandbox_success` (boolean)
    - `execution_time`
    - `model_name` (if available in Purple response)

### B. Metrics Calculation
1.  **Reliability Score:** % of battles where Sandbox passed.
2.  **Contextual Accuracy:** Average `cis_score` per Task.
3.  **Anomaly Detection:**
    - Identify "Hallucinations": High Rationale Score (>0.8) BUT Low Architectural Score (<0.2).
    - Identify "Silent Failures": Valid Code (High Arch) BUT Nonsense Rationale (Low Rationale).

### C. Report Generation
- Create a Markdown file: `docs/04-Operations/Dual-Track-Arena/reports/Campaign_Report_Latest.md`.
- **Sections:**
    1.  **Census:** Total battles, breakdown by task.
    2.  **Scoreboard:** Table of average scores.
    3.  **Hall of Shame:** List of specific `battle_id`s that failed spectacularly (useful for qualitative analysis in the paper).
    4.  **Hall of Fame:** Best performing instances.

## 4. Usage
```bash
python scripts/green_logic/campaign_analyst.py --output-format markdown
```
