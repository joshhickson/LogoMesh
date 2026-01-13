#!/usr/bin/env python3
"""
Campaign Analyst (Yang)
Analyzes Green Agent campaign data and generates empirical reports.
"""

import os
import sys
import sqlite3
import json
import pandas as pd
import argparse
from datetime import datetime

DB_PATH = "data/battles.db"
REPORT_DIR = "docs/04-Operations/Dual-Track-Arena/reports"

def load_data():
    """Load and parse data from SQLite into a Pandas DataFrame."""
    if not os.path.exists(DB_PATH):
        print(f"Error: Database not found at {DB_PATH}")
        return pd.DataFrame()

    conn = sqlite3.connect(DB_PATH)
    query = "SELECT battle_id, task_title, timestamp, raw_result FROM battles"
    df = pd.read_sql_query(query, conn)
    conn.close()

    if df.empty:
        return df

    # Parse raw_result JSON
    # We expect raw_result to be a JSON string.
    # We extract key metrics into new columns.

    def parse_json(row):
        try:
            data = json.loads(row['raw_result']) if isinstance(row['raw_result'], str) else row['raw_result']

            # Extract evaluation metrics
            evaluation = data.get('evaluation', {})
            sandbox = data.get('sandbox_result', {})

            return pd.Series({
                'cis_score': evaluation.get('cis_score', 0.0),
                'logic_score': evaluation.get('logic_score', 0.0),
                'rationale_score': evaluation.get('rationale_score', 0.0),
                'architectural_score': evaluation.get('architectural_score', 0.0),
                'sandbox_success': sandbox.get('success', False),
                'duration': sandbox.get('duration', 0.0),
                'tests_used': sandbox.get('tests_used', 'unknown'),
                'security_issues': len(data.get('audit_result', {}).get('security_issues', [])),
                'code_smells': len(data.get('audit_result', {}).get('code_smells', []))
            })
        except Exception as e:
            # print(f"Error parsing row {row.name}: {e}")
            return pd.Series({
                'cis_score': 0.0,
                'logic_score': 0.0,
                'rationale_score': 0.0,
                'architectural_score': 0.0,
                'sandbox_success': False,
                'duration': 0.0,
                'tests_used': 'error',
                'security_issues': 0,
                'code_smells': 0
            })

    metrics_df = df.apply(parse_json, axis=1)
    final_df = pd.concat([df, metrics_df], axis=1)
    return final_df

def generate_report(df, output_format="markdown"):
    """Generate a rigorous empirical report."""
    if df.empty:
        print("No data to report.")
        return

    report_date = datetime.now().strftime("%Y-%m-%d")
    report_filename = f"Campaign-Report-{datetime.now().strftime('%Y%m%d')}.md"
    report_path = os.path.join(REPORT_DIR, report_filename)

    # 1. Census
    total_battles = len(df)
    task_breakdown = df['task_title'].value_counts().to_markdown()

    # 2. Scoreboard
    # Group by task and calculate means
    scoreboard = df.groupby('task_title')[['cis_score', 'logic_score', 'sandbox_success', 'security_issues']].mean()
    scoreboard['sandbox_success'] = scoreboard['sandbox_success'].apply(lambda x: f"{x:.1%}")
    scoreboard_md = scoreboard.to_markdown()

    # 3. Hall of Shame (The "Daoist" Insights)
    # Hallucinations: High Rationale (>0.8) BUT Low Sandbox Success (False)
    hallucinations = df[
        (df['rationale_score'] > 0.8) &
        (df['sandbox_success'] == False)
    ]

    # Plagiarism/Silent Failures: High Sandbox (True) BUT Low Rationale (<0.5)
    silent_failures = df[
        (df['sandbox_success'] == True) &
        (df['rationale_score'] < 0.5)
    ]

    content = f"""# Campaign Report: {report_date}

**Status:** AUTOMATED REPORT
**Context:** Operations / Green Agent Analysis

## 1. Census
**Total Battles:** {total_battles}

### Breakdown by Task
{task_breakdown}

## 2. Scoreboard (Averages)
{scoreboard_md}

## 3. Hall of Shame

### The "Hallucination" Trap (High Rationale, Broken Code)
*Potential candidates where the agent lied about its reasoning.*
**Count:** {len(hallucinations)}
"""

    if not hallucinations.empty:
        content += "\n| Battle ID | Task | CIS Score | Rationale |\n|---|---|---|---|\n"
        for _, row in hallucinations.head(5).iterrows():
            content += f"| `{row['battle_id']}` | {row['task_title']} | {row['cis_score']:.2f} | {row['rationale_score']:.2f} |\n"
    else:
        content += "\n*No clear hallucinations detected yet.*\n"

    content += f"""
### The "Silent Failure" Trap (Working Code, Poor Rationale)
*Potential candidates where the agent got lucky or plagiarized without understanding.*
**Count:** {len(silent_failures)}
"""

    if not silent_failures.empty:
        content += "\n| Battle ID | Task | CIS Score | Rationale |\n|---|---|---|---|\n"
        for _, row in silent_failures.head(5).iterrows():
            content += f"| `{row['battle_id']}` | {row['task_title']} | {row['cis_score']:.2f} | {row['rationale_score']:.2f} |\n"
    else:
        content += "\n*No silent failures detected yet.*\n"

    # Save Report
    with open(report_path, "w") as f:
        f.write(content)

    print(f"Report generated: {report_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Green Agent Campaign Analyst")
    parser.add_argument("--format", default="markdown", help="Output format (default: markdown)")
    args = parser.parse_args()

    df = load_data()
    generate_report(df, args.format)
