#!/usr/bin/env python3
"""
Tier 1 (Mistral-7B) Battle Runner
Executes 25 battles against Mistral-7B for C-NEW-001 baseline validation.
"""

import httpx
import sqlite3
import json
import time
import os
import sys
from datetime import datetime

# Import Harmony parser
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))
from green_logic.harmony_parser import HarmonyParser

# Configuration
GREEN_URL = "http://localhost:9000"
PURPLE_AGENT_URL = "http://localhost:9001"  # Purple Agent talks to Mistral on 8001
TOTAL_BATTLES = 25
DB_PATH = "data/battles_tier1_mistral.db"
LOG_DIR = "results/c_new_001_diversity_test"

# Ensure directories exist
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
os.makedirs(LOG_DIR, exist_ok=True)

log_file = os.path.join(LOG_DIR, "tier1_mistral_battles.log")

def init_db():
    """Initialize or create the Tier 1 Mistral database."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("PRAGMA journal_mode=WAL;")
    
    # Create table if not exists (server schema)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS battles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            battle_id TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            score REAL NOT NULL,
            breakdown TEXT,
            raw_result TEXT,
            dbom_hash TEXT
        )
    """)
    conn.commit()
    conn.close()
    print(f"[Tier1Mistral] Database initialized: {DB_PATH}")

def save_result(battle_data):
    """Save battle result to the Tier 1 Mistral database."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    battle_id = battle_data.get("battle_id", "unknown")
    timestamp = datetime.now().isoformat()
    score = battle_data.get("evaluation", {}).get("cis_score", 0.0)
    breakdown = json.dumps(battle_data.get("evaluation", {}).get("breakdown", {}))
    raw_result = json.dumps(battle_data)
    dbom_hash = ""
    
    try:
        cursor.execute(
            """
            INSERT INTO battles (battle_id, timestamp, score, breakdown, raw_result, dbom_hash)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (battle_id, timestamp, score, breakdown, raw_result, dbom_hash)
        )
        conn.commit()
        print(f"[Tier1Mistral] Saved: {battle_id} score={score:.2f}")
        return True
    except Exception as e:
        print(f"[Tier1Mistral] ERROR saving {battle_id}: {e}")
        return False
    finally:
        conn.close()

def run_battles():
    """Execute 25 battles against Green Agent (Mistral backend)."""
    init_db()
    
    with open(log_file, "w", encoding="utf-8") as f:
        f.write(f"Tier 1 (Mistral-7B) Battle Execution Log\n")
        f.write(f"Start Time: {datetime.now().isoformat()}\n")
        f.write(f"Total Battles: {TOTAL_BATTLES}\n")
        f.write(f"Database: {DB_PATH}\n")
        f.write(f"Model: mistralai/Mistral-7B-Instruct-v0.3\n")
        f.write("=" * 80 + "\n\n")
    
    client = httpx.Client(timeout=None)
    successful = 0
    failed = 0
    
    for i in range(1, TOTAL_BATTLES + 1):
        battle_id = f"tier1-mistral-{i:03d}"
        
        try:
            print(f"[Tier1Mistral] Battle {i}/{TOTAL_BATTLES}: {battle_id}...", end=" ", flush=True)
            
            # Send task to Green Agent
            response = client.post(
                f"{GREEN_URL}/actions/send_coding_task",
                json={
                    "battle_id": battle_id,
                    "purple_agent_url": PURPLE_AGENT_URL,
                },
                timeout=120
            )
            response.raise_for_status()
            result = response.json()
            
            # Save result
            if save_result(result):
                successful += 1
                score = result.get("evaluation", {}).get("cis_score", 0.0)
                elapsed = result.get("elapsed_seconds", 0)
                print(f"✓ {elapsed:.1f}s score={score:.2f}")
            else:
                failed += 1
                print(f"✗ SAVE FAILED")
        
        except httpx.TimeoutException:
            failed += 1
            print(f"✗ TIMEOUT")
        except Exception as e:
            failed += 1
            print(f"✗ ERROR: {e}")
    
    client.close()
    
    # Print summary
    print(f"\n{'='*80}")
    print(f"Tier 1 (Mistral-7B) Execution Complete")
    print(f"  Successful: {successful}/{TOTAL_BATTLES}")
    print(f"  Failed: {failed}/{TOTAL_BATTLES}")
    print(f"  Database: {DB_PATH}")
    print(f"  Log: {log_file}")
    print(f"{'='*80}")

if __name__ == "__main__":
    run_battles()
