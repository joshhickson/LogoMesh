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

# Allow temporarily skipping tasks via environment variable (e.g., SKIP_TASK_IDS="task-001")
# Email Validator (task-001) is now RE-ENABLED per A-000
# To skip specific tasks, use: export SKIP_TASK_IDS="task-001,task-002"
DEFAULT_SKIP_TASK_IDS = set()  # A-000 COMPLETE: Email Validator re-enabled for Stage 3
env_skip = os.getenv("SKIP_TASK_IDS", "").strip()
ENV_SKIP_TASK_IDS = {tid.strip() for tid in env_skip.split(",") if tid.strip()} if env_skip else set()
SKIP_TASK_IDS = DEFAULT_SKIP_TASK_IDS.union(ENV_SKIP_TASK_IDS)

ACTIVE_TASKS = [t for t in CODING_TASKS if t.get("id") not in SKIP_TASK_IDS]
SKIP_TASK_TITLES = {t['title'] for t in CODING_TASKS if t.get('id') in SKIP_TASK_IDS}
if not ACTIVE_TASKS:
    raise SystemExit("No active tasks after applying SKIP_TASK_IDS. Aborting.")

DB_PATH = "data/battles.db"
DEFAULT_TARGET = 100
MAX_CONSECUTIVE_ERRORS = 5

# Task-specific timeouts (in seconds) based on inference complexity
# Empirically tuned to reflect actual vLLM inference times for different task types
TASK_TIMEOUT_MAP = {
    "Email Validator": 90,      # Regex pattern matching, relatively fast
    "Rate Limiter": 75,         # Algorithmic logic, fast
    "LRU Cache": 100,           # Data structure complexity, moderate
    "Recursive Fibonacci": 120,  # Deep recursion analysis + memoization, slowest
}

# Timeout behavior settings
BASE_TIMEOUT = 120.0            # Fallback timeout for unknown tasks
TIMEOUT_BACKOFF = 60.0          # Additional timeout on retry
MAX_TIMEOUT_RETRIES = 2         # Max retries after timeout (don't retry forever)

console = Console()

def is_server_alive(url):
    """Quick health check: verify Green Agent is responding."""
    try:
        with httpx.Client(timeout=5.0) as client:
            response = client.get(f"{url}/docs", follow_redirects=False)
            return response.status_code < 500
    except Exception as e:
        console.print(f"[dim]Health check failed: {type(e).__name__}[/dim]")
        return False

def get_task_timeout(task_title):
    """Get recommended timeout for a specific task based on inference complexity."""
    return TASK_TIMEOUT_MAP.get(task_title, BASE_TIMEOUT)

def init_db():
    """Initialize the SQLite database if it doesn't exist."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Check if table exists; if missing, create using server-compatible schema
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='battles'")
    if not cursor.fetchone():
        create_table(cursor)
    else:
        # Table exists; inspect and migrate if legacy
        cursor.execute("PRAGMA table_info(battles)")
        columns = [info[1] for info in cursor.fetchall()]
        if 'task_title' in columns:
            console.print("[yellow]Detected legacy 'task_title' schema; attempting minimal migration...[/yellow]")
            # If no server columns, add them to allow server inserts to succeed
            needed = []
            for col in ['score', 'breakdown', 'dbom_hash']:
                if col not in columns:
                    needed.append(col)
            for col in needed:
                # Add columns without NOT NULL constraints for compatibility
                cursor.execute(f"ALTER TABLE battles ADD COLUMN {col} TEXT")
            # Ensure raw_result exists (legacy has it); ensure timestamp exists
            cursor.execute("PRAGMA table_info(battles)")
            columns = [info[1] for info in cursor.fetchall()]
            console.print("[green]Legacy table upgraded with server columns: " + ", ".join([c for c in ['score','breakdown','dbom_hash'] if c in columns]) + "[/green]")
        else:
            console.print("[green]Detected server schema; reading will parse raw_result.[/green]")

    conn.commit()
    conn.close()

def create_table(cursor):
    console.print("[yellow]Creating table 'battles' (server-compatible schema)...[/yellow]")
    cursor.execute("""
        CREATE TABLE battles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            battle_id TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            score REAL NOT NULL,
            breakdown TEXT,
            raw_result TEXT,
            dbom_hash TEXT
        )
    """)

def get_coverage_stats(cursor, tasks):
    """Query the database to get current coverage counts per task."""
    stats = {task['title']: 0 for task in tasks}

    try:
        # Detect schema
        cursor.execute("PRAGMA table_info(battles)")
        columns = [info[1] for info in cursor.fetchall()]

        if 'task_title' in columns:
            # Legacy schema path
            cursor.execute("SELECT task_title, COUNT(*) FROM battles GROUP BY task_title")
            rows = cursor.fetchall()
            for title, count in rows:
                if title in stats:
                    stats[title] = count
                else:
                    stats[title] = count
        else:
            # Server schema path: parse raw_result JSON to extract task title
            cursor.execute("SELECT raw_result FROM battles")
            rows = cursor.fetchall()
            for (raw_json,) in rows:
                if not raw_json:
                    continue
                try:
                    obj = json.loads(raw_json)
                except Exception:
                    continue
                title = obj.get('task') or obj.get('task_title')
                if title and title in stats:
                    stats[title] += 1
                elif title:
                    # Unknown title, track it anyway in stats map
                    stats[title] = stats.get(title, 0) + 1
    except sqlite3.OperationalError as e:
        console.print(f"[red]Error querying database: {e}[/red]")

    return stats

def get_next_task(stats, tasks):
    """Determine the most under-represented task."""
    target_tasks = {t['title']: stats.get(t['title'], 0) for t in tasks}

    sorted_tasks = sorted(target_tasks.items(), key=lambda item: (item[1], item[0]))

    next_task_title = sorted_tasks[0][0]
    current_count = sorted_tasks[0][1]

    next_task = next((t for t in tasks if t['title'] == next_task_title), None)

    return next_task, current_count

def run_campaign(url, target_samples, dry_run=False, skip_titles=None):
    """Main execution loop."""
    init_db()

    skip_titles = set(skip_titles or SKIP_TASK_TITLES)
    tasks = [t for t in ACTIVE_TASKS if t['title'] not in skip_titles]
    if not tasks:
        console.print("[red]No tasks remain after applying skips.[/red]")
        return

    consecutive_errors = 0

    console.print(f"[bold green]Starting Smart Campaign Runner[/bold green]")
    console.print(f"Target: {target_samples} samples per task")
    console.print(f"Agent URL: {url}")
    if skip_titles:
        console.print(f"[yellow]Skipping tasks: {', '.join(sorted(skip_titles))}[/yellow]")

    while True:
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()

            # 1. Check State
            stats = get_coverage_stats(cursor, tasks)
            conn.close() # Close quickly to avoid locking

            # Display Dashboard
            table = Table(title="Campaign Coverage")
            table.add_column("Task", style="cyan")
            table.add_column("Count", justify="right")
            table.add_column("Progress", justify="left")

            completed_tasks = 0
            for task in tasks:
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

            if completed_tasks >= len(tasks):
                console.print("[bold green]All targets met! Campaign complete.[/bold green]")
                break

            # 2. Select Target
            next_task, count = get_next_task(stats, tasks)
            console.print(f"Next Target: [bold]{next_task['title']}[/bold] (Current: {count})")

            # 3. Execute
            battle_id = f"auto_{int(time.time())}_{random.randint(1000,9999)}"
            # Ensure Purple Agent URL is provided (required by Green Agent API)
            purple_url = os.getenv("PURPLE_AGENT_URL", "http://localhost:9001")
            payload = {
                "battle_id": battle_id,
                "task_id": next_task['id'],
                "purple_agent_url": purple_url,
            }

            if dry_run:
                console.print("[yellow]DRY RUN: Skipping network request[/yellow]")
                # Simulate success
                time.sleep(1)

                # Mock DB insert depending on detected schema
                conn = sqlite3.connect(DB_PATH)
                cursor = conn.cursor()
                cursor.execute("PRAGMA table_info(battles)")
                columns = [info[1] for info in cursor.fetchall()]
                if 'score' in columns:
                    cursor.execute(
                        """
                        INSERT INTO battles (battle_id, timestamp, score, breakdown, raw_result, dbom_hash)
                        VALUES (?, ?, ?, ?, ?, ?)
                        """,
                        (
                            battle_id,
                            datetime.now().isoformat(),
                            0.0,
                            "dry-run",
                            json.dumps({"task": next_task['title'], "status": "mock_success"}),
                            ""
                        )
                    )
                else:
                    cursor.execute(
                        "INSERT INTO battles (battle_id, task_title, timestamp, raw_result) VALUES (?, ?, ?, ?)",
                        (battle_id, next_task['title'], datetime.now(), json.dumps({"status": "mock_success"}))
                    )
                conn.commit()
                conn.close()

            else:
                # Use task-specific timeout for intelligent request handling
                task_timeout = get_task_timeout(next_task['title'])
                retry_count = 0
                
                while retry_count <= MAX_TIMEOUT_RETRIES:
                    try:
                        with httpx.Client(timeout=task_timeout) as client:
                            console.print(f"[dim](timeout: {task_timeout}s)[/dim]", end=" ")
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
                            break  # Request succeeded, exit retry loop

                    except httpx.TimeoutException:
                        retry_count += 1
                        if retry_count > MAX_TIMEOUT_RETRIES:
                            # Exhausted retries; treat as error
                            console.print(f"[bold red]Timeout (after {MAX_TIMEOUT_RETRIES} retries)[/bold red]")
                            raise
                        
                        # Check if server is alive before retrying
                        if is_server_alive(url):
                            extended_timeout = task_timeout + (TIMEOUT_BACKOFF * retry_count)
                            console.print(f"[yellow]Timeout detected (server alive). Retrying with {extended_timeout}s timeout (attempt {retry_count}/{MAX_TIMEOUT_RETRIES})...[/yellow]")
                            task_timeout = extended_timeout
                            time.sleep(2)  # Brief pause before retry
                        else:
                            console.print(f"[bold red]Server not responding. Aborting.[/bold red]")
                            raise

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
    parser.add_argument(
        "--skip-task",
        action="append",
        default=[],
        help="Task title to skip (can be repeated)",
    )

    args = parser.parse_args()

    run_campaign(args.url, args.target, args.dry_run, skip_titles=args.skip_task)
