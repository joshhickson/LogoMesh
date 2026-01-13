#!/usr/bin/env python3
"""
Smart Campaign Runner (Yin)
Executes the Green Agent testing loop to fill the coverage matrix.
"""

import os
import sys
import json
import time
import sqlite3
import random
import argparse
import httpx
from datetime import datetime
from rich.console import Console
from rich.table import Table
from rich.progress import Progress

# Add project root to path to import src modules if needed
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

# Import CODING_TASKS directly or define a fallback
try:
    from src.green_logic.tasks import CODING_TASKS
except ImportError:
    # Fallback if src not in path or module missing
    CODING_TASKS = [
        {"id": "task-001", "title": "Email Validator"},
        {"id": "task-002", "title": "Rate Limiter"},
        {"id": "task-003", "title": "LRU Cache"},
        {"id": "task-004", "title": "Recursive Fibonacci"},
    ]

DB_PATH = "data/battles.db"
DEFAULT_TARGET = 100
MAX_CONSECUTIVE_ERRORS = 5

console = Console()

def init_db():
    """Initialize the SQLite database if it doesn't exist."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Check if table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='battles'")
    if not cursor.fetchone():
        create_table(cursor)
    else:
        # Check if schema is correct (has task_title)
        cursor.execute("PRAGMA table_info(battles)")
        columns = [info[1] for info in cursor.fetchall()]
        if 'task_title' not in columns:
            console.print("[yellow]Schema mismatch (missing task_title). Recreating table...[/yellow]")
            cursor.execute("DROP TABLE battles")
            create_table(cursor)

    conn.commit()
    conn.close()

def create_table(cursor):
    console.print("[yellow]Creating table 'battles'...[/yellow]")
    cursor.execute("""
        CREATE TABLE battles (
            battle_id TEXT PRIMARY KEY,
            task_title TEXT,
            timestamp DATETIME,
            raw_result JSON
        )
    """)

def get_coverage_stats(cursor):
    """Query the database to get current coverage counts per task."""
    stats = {task['title']: 0 for task in CODING_TASKS}

    try:
        # Assuming task_title is populated. If not, we'd need to parse raw_result.
        # For this implementation, we rely on the insert logic to populate task_title.
        cursor.execute("SELECT task_title, COUNT(*) FROM battles GROUP BY task_title")
        rows = cursor.fetchall()
        for title, count in rows:
            if title in stats:
                stats[title] = count
            else:
                # Handle case where title might not match exactly or is a legacy task
                stats[title] = count
    except sqlite3.OperationalError:
        console.print("[red]Error querying database. Is the schema correct?[/red]")

    return stats

def get_next_task(stats):
    """Determine the most under-represented task."""
    # Find task with minimum count
    # Filter only tasks in our target list
    target_tasks = {t['title']: stats.get(t['title'], 0) for t in CODING_TASKS}

    # Sort by count (asc) then by title (for stability)
    sorted_tasks = sorted(target_tasks.items(), key=lambda item: (item[1], item[0]))

    next_task_title = sorted_tasks[0][0]
    current_count = sorted_tasks[0][1]

    # Find the full task object
    next_task = next((t for t in CODING_TASKS if t['title'] == next_task_title), None)

    return next_task, current_count

def run_campaign(url, target_samples, dry_run=False):
    """Main execution loop."""
    init_db()

    consecutive_errors = 0

    console.print(f"[bold green]Starting Smart Campaign Runner[/bold green]")
    console.print(f"Target: {target_samples} samples per task")
    console.print(f"Agent URL: {url}")

    while True:
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()

            # 1. Check State
            stats = get_coverage_stats(cursor)
            conn.close() # Close quickly to avoid locking

            # Display Dashboard
            table = Table(title="Campaign Coverage")
            table.add_column("Task", style="cyan")
            table.add_column("Count", justify="right")
            table.add_column("Progress", justify="left")

            completed_tasks = 0
            for task in CODING_TASKS:
                count = stats.get(task['title'], 0)
                if count >= target_samples:
                    completed_tasks += 1
                    bar = "[green]DONE[/green]"
                else:
                    pct = int((count / target_samples) * 20)
                    bar = "[" + "=" * pct + " " * (20 - pct) + "]"

                table.add_row(task['title'], str(count), bar)

            console.clear()
            console.print(table)

            if completed_tasks >= len(CODING_TASKS):
                console.print("[bold green]All targets met! Campaign complete.[/bold green]")
                break

            # 2. Select Target
            next_task, count = get_next_task(stats)
            console.print(f"Next Target: [bold]{next_task['title']}[/bold] (Current: {count})")

            # 3. Execute
            battle_id = f"auto_{int(time.time())}_{random.randint(1000,9999)}"
            payload = {
                "battle_id": battle_id,
                "task_id": next_task['id'],
                # "purple_agent_url": ... # Assuming server has default or env var
            }

            if dry_run:
                console.print("[yellow]DRY RUN: Skipping network request[/yellow]")
                # Simulate success
                time.sleep(1)

                # Mock DB insert for testing loop logic
                conn = sqlite3.connect(DB_PATH)
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT INTO battles (battle_id, task_title, timestamp, raw_result) VALUES (?, ?, ?, ?)",
                    (battle_id, next_task['title'], datetime.now(), json.dumps({"status": "mock_success"}))
                )
                conn.commit()
                conn.close()

            else:
                with httpx.Client(timeout=300.0) as client:
                    response = client.post(f"{url}/actions/send_coding_task", json=payload)
                    response.raise_for_status()
                    result = response.json()

                    # Store result - NOTE: The server might already store it.
                    # But the spec says "Auto-save the result (Persistence Logic)" in the server.
                    # However, to be safe and ensure our stats are up to date for this script,
                    # we verify if we need to insert it here or if the server does it.
                    # The server code `agent.submit_result(result)` suggests server handles it.
                    # BUT, this script reads from the DB.
                    # If the server and this script share the same DB path, we are good.

                    console.print(f"Success! Battle ID: {result.get('battle_id')}")
                    consecutive_errors = 0

                    # 10s Cool-down logic
                    console.print("Cooling down for 10s...")
                    time.sleep(10)

        except KeyboardInterrupt:
            console.print("[bold red]Stopped by user.[/bold red]")
            break
        except Exception as e:
            console.print(f"[bold red]Error: {e}[/bold red]")
            consecutive_errors += 1
            if consecutive_errors > MAX_CONSECUTIVE_ERRORS:
                console.print("[bold red]Too many consecutive errors. Aborting.[/bold red]")
                break
            time.sleep(5)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Green Agent Smart Campaign Runner")
    parser.add_argument("--url", default="http://localhost:9040", help="Green Agent API URL")
    parser.add_argument("--target", type=int, default=DEFAULT_TARGET, help="Target samples per task")
    parser.add_argument("--dry-run", action="store_true", help="Simulate execution without API calls")

    args = parser.parse_args()

    run_campaign(args.url, args.target, args.dry_run)
