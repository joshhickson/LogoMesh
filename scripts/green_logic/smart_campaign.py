import asyncio
import json
import logging
import os
import random
import sqlite3
import sys
import time
from datetime import datetime
from typing import Dict, List

import httpx
from rich.console import Console
from rich.live import Live
from rich.panel import Panel
from rich.progress import BarColumn, Progress, TextColumn
from rich.table import Table

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.FileHandler("smart_campaign.log"), logging.StreamHandler()],
)

console = Console()

# Configuration
DB_PATH = "data/battles.db"
GREEN_AGENT_URL = "http://localhost:9040/actions/send_coding_task"
PURPLE_AGENT_URL = "http://localhost:9001"
TARGET_SAMPLES = 100
COOL_DOWN_SECONDS = 10  # Throttling for H100
MAX_CONSECUTIVE_ERRORS = 5

# Task Definitions (Mirroring src/green_logic/tasks.py)
TASKS = ["task-001", "task-002", "task-003", "task-004"]


class SmartCampaignRunner:
    def __init__(self):
        self.consecutive_errors = 0
        self.total_battles = 0
        self._ensure_db()

    def _ensure_db(self):
        """Ensure the database exists."""
        if not os.path.exists(DB_PATH):
            logging.warning(f"Database {DB_PATH} not found. Waiting for first run...")
            os.makedirs("data", exist_ok=True)
            # Create a dummy connection to init file if needed, though server should do it
            conn = sqlite3.connect(DB_PATH)
            conn.close()

    def get_coverage(self) -> Dict[str, int]:
        """Query the database to get current coverage per task."""
        coverage = {task: 0 for task in TASKS}
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()

            # Since we don't have a task_id column, we have to parse raw_result
            # Optimization: Read only the last 1000 records to estimate,
            # OR read all but only select specific columns.
            # For now, let's try to be accurate.
            cursor.execute("SELECT raw_result FROM battles")
            rows = cursor.fetchall()

            for row in rows:
                try:
                    data = json.loads(row[0])
                    # Task title usually contains the ID or name we can map
                    # Current server.py sets "task" field in result to task['title']
                    # We need to map title back to ID or just count generic.
                    # Wait, server.py returns "task": task_title.
                    # We can infer from title.
                    title = data.get("task", "")
                    if "Email" in title: coverage["task-001"] += 1
                    elif "Rate" in title: coverage["task-002"] += 1
                    elif "LRU" in title: coverage["task-003"] += 1
                    elif "Fibonacci" in title: coverage["task-004"] += 1
                except:
                    pass

            conn.close()
        except sqlite3.OperationalError:
            # Table might not exist yet
            pass
        except Exception as e:
            logging.error(f"Error reading DB: {e}")

        return coverage

    def select_next_task(self, coverage: Dict[str, int]) -> str | None:
        """Select the most under-represented task."""
        # Filter tasks that haven't met the target
        needed = {t: c for t, c in coverage.items() if c < TARGET_SAMPLES}

        if not needed:
            return None  # All done!

        # Sort by count (ascending) and pick the first
        return sorted(needed.items(), key=lambda x: x[1])[0][0]

    async def run_battle(self, task_id: str):
        """Execute a single battle."""
        battle_id = f"auto_gen_{int(time.time())}_{random.randint(1000, 9999)}"
        payload = {
            "purple_agent_url": PURPLE_AGENT_URL,
            "battle_id": battle_id,
            "task_id": task_id
        }

        logging.info(f"Starting battle {battle_id} for {task_id}")

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(GREEN_AGENT_URL, json=payload)
            response.raise_for_status()
            return response.json()

    async def loop(self):
        """Main execution loop."""

        # UI Setup
        progress = Progress(
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
            TextColumn("{task.completed}/{task.total}"),
        )

        task_ids = {}
        for t in TASKS:
            task_ids[t] = progress.add_task(f"[cyan]{t}", total=TARGET_SAMPLES)

        with Live(Panel(progress, title="Smart Campaign Runner", subtitle="Yin Mode"), refresh_per_second=4) as live:

            while True:
                # 1. Update State
                coverage = self.get_coverage()
                completed_all = True

                for t, count in coverage.items():
                    progress.update(task_ids[t], completed=count)
                    if count < TARGET_SAMPLES:
                        completed_all = False

                if completed_all:
                    console.print("[bold green]All targets met! Campaign complete.[/bold green]")
                    break

                # 2. Select Target
                next_task = self.select_next_task(coverage)
                if not next_task:
                    break

                # 3. Throttling (Cool-down)
                console.print(f"[yellow]Cooling down for {COOL_DOWN_SECONDS}s (H100 Throttling Mitigation)...[/yellow]")
                await asyncio.sleep(COOL_DOWN_SECONDS)

                # 4. Execute
                try:
                    result = await self.run_battle(next_task)

                    # Reset error count on success
                    self.consecutive_errors = 0
                    self.total_battles += 1

                    # Quick Status
                    score = result.get("evaluation", {}).get("cis_score", 0.0)
                    console.print(f"[green]Battle {result['battle_id']} Complete. CIS: {score:.2f}[/green]")

                except Exception as e:
                    logging.error(f"Battle failed: {e}")
                    self.consecutive_errors += 1
                    console.print(f"[bold red]Error ({self.consecutive_errors}/{MAX_CONSECUTIVE_ERRORS}): {e}[/bold red]")

                    if self.consecutive_errors >= MAX_CONSECUTIVE_ERRORS:
                        console.print("[bold red]EMERGENCY STOP: Too many consecutive errors.[/bold red]")
                        sys.exit(1)

                    # Backoff on error
                    await asyncio.sleep(5)


if __name__ == "__main__":
    runner = SmartCampaignRunner()
    try:
        asyncio.run(runner.loop())
    except KeyboardInterrupt:
        console.print("[bold red]Campaign stopped by user.[/bold red]")
