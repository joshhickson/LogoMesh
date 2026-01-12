import json
import sqlite3
import pandas as pd
import argparse
import os
from datetime import datetime

# Configuration
DB_PATH = "data/battles.db"
REPORT_DIR = "docs/04-Operations/Dual-Track-Arena/reports"

class CampaignAnalyst:
    def __init__(self, db_path=DB_PATH):
        self.db_path = db_path

    def load_data(self):
        """Load and parse data from SQLite."""
        if not os.path.exists(self.db_path):
            raise FileNotFoundError(f"Database not found at {self.db_path}")

        conn = sqlite3.connect(self.db_path)
        df_raw = pd.read_sql_query("SELECT battle_id, timestamp, raw_result FROM battles", conn)
        conn.close()

        # Parse JSON
        parsed_data = []
        for _, row in df_raw.iterrows():
            try:
                data = json.loads(row['raw_result'])

                # Extract core metrics
                eval_data = data.get("evaluation", {})
                audit_data = data.get("audit_result", {})
                sandbox_data = data.get("sandbox_result", {})

                # Identify Task
                task_title = data.get("task", "Unknown")
                task_id = "unknown"
                if "Email" in task_title: task_id = "task-001"
                elif "Rate" in task_title: task_id = "task-002"
                elif "LRU" in task_title: task_id = "task-003"
                elif "Fibonacci" in task_title: task_id = "task-004"

                # New Metrics (Logic, Security, Smells)
                # Handle cases where new fields might be missing in older logs
                logic_score = eval_data.get("logic_score", 0.0)

                # Security Issues & Code Smells
                # Currently audit_result might be just {valid: bool} or new detailed object
                security_issues = audit_data.get("security_issues", [])
                code_smells = audit_data.get("code_smells", [])

                parsed_data.append({
                    "battle_id": row['battle_id'],
                    "timestamp": row['timestamp'],
                    "task_id": task_id,
                    "cis_score": eval_data.get("cis_score", 0.0),
                    "rationale_score": eval_data.get("rationale_score", 0.0),
                    "architecture_score": eval_data.get("architecture_score", 0.0),
                    "testing_score": eval_data.get("testing_score", 0.0),
                    "logic_score": logic_score,
                    "sandbox_success": sandbox_data.get("success", False),
                    "tests_used": sandbox_data.get("tests_used", "unknown"),
                    "security_issue_count": len(security_issues),
                    "code_smell_count": len(code_smells),
                    "security_issues_list": str([s['issue_type'] for s in security_issues]),
                    "code_smells_list": str([s['smell_type'] for s in code_smells])
                })
            except Exception as e:
                print(f"Skipping row {row['battle_id']}: {e}")

        return pd.DataFrame(parsed_data)

    def generate_report(self, df):
        """Generate a Markdown report."""
        os.makedirs(REPORT_DIR, exist_ok=True)
        report_path = os.path.join(REPORT_DIR, f"Campaign_Report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md")

        with open(report_path, "w") as f:
            f.write("# Campaign Report (Yang)\n\n")
            f.write(f"**Generated:** {datetime.now()}\n")
            f.write(f"**Total Battles:** {len(df)}\n\n")

            # 1. Census
            f.write("## 1. Census\n")
            f.write(df['task_id'].value_counts().to_markdown())
            f.write("\n\n")

            # 2. Scoreboard
            f.write("## 2. Scoreboard (Averages)\n")
            scoreboard = df.groupby('task_id')[['cis_score', 'logic_score', 'rationale_score', 'architecture_score', 'testing_score', 'sandbox_success']].mean()
            f.write(scoreboard.to_markdown())
            f.write("\n\n")

            # 3. Security & Quality
            f.write("## 3. Security & Code Quality\n")
            quality_board = df.groupby('task_id')[['security_issue_count', 'code_smell_count']].mean()
            f.write(quality_board.to_markdown())
            f.write("\n\n")

            # 4. Hall of Shame (Failures)
            f.write("## 4. Hall of Shame (Lowest CIS)\n")
            shame = df.sort_values('cis_score').head(5)[['battle_id', 'task_id', 'cis_score', 'logic_score', 'sandbox_success']]
            f.write(shame.to_markdown(index=False))
            f.write("\n\n")

            # 5. Hall of Fame (Best)
            f.write("## 5. Hall of Fame (Highest CIS)\n")
            fame = df.sort_values('cis_score', ascending=False).head(5)[['battle_id', 'task_id', 'cis_score', 'logic_score', 'sandbox_success']]
            f.write(fame.to_markdown(index=False))
            f.write("\n")

        print(f"Report generated: {report_path}")

if __name__ == "__main__":
    analyst = CampaignAnalyst()
    try:
        df = analyst.load_data()
        if not df.empty:
            analyst.generate_report(df)
        else:
            print("No data found to analyze.")
    except Exception as e:
        print(f"Analysis failed: {e}")
