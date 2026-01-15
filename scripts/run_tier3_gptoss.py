#!/usr/bin/env python3
"""
Tier 3 (gpt-oss-20b) Battle Runner
Executes 25 battles against gpt-oss-20b with Harmony protocol parsing.
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
PURPLE_AGENT_URL = "http://localhost:9001"  # Purple Agent talks to gpt-oss-20b on 8002
TOTAL_BATTLES = 25
DB_PATH = "data/battles_tier3_gptoss.db"
LOG_DIR = "results/c_new_001_diversity_test"

# Ensure directories exist
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
os.makedirs(LOG_DIR, exist_ok=True)

log_file = os.path.join(LOG_DIR, "tier3_gptoss_battles.log")

def init_db():
    """Initialize or create the Tier 3 gpt-oss database."""
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
    print(f"[Tier3gptoss] Database initialized: {DB_PATH}")

def save_result(battle_data):
    """Save battle result to the Tier 3 gpt-oss database."""
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
        print(f"[Tier3gptoss] Saved: {battle_id} score={score:.2f}")
        return True
    except Exception as e:
        print(f"[Tier3gptoss] ERROR saving {battle_id}: {e}")
        return False
    finally:
        conn.close()

def run_battles():
    """Execute 25 battles against Green Agent (gpt-oss-20b backend)."""
    init_db()
    
    with open(log_file, "w", encoding="utf-8") as f:
        f.write(f"Tier 3 (gpt-oss-20b) Battle Execution Log\n")
        f.write(f"Start Time: {datetime.now().isoformat()}\n")
        f.write(f"Total Battles: {TOTAL_BATTLES}\n")
        f.write(f"Database: {DB_PATH}\n")
        f.write(f"Model: openai/gpt-oss-20b (Harmony Protocol)\n")
        f.write("=" * 80 + "\n\n")
    
    client = httpx.Client(timeout=None)
    successful = 0
    failed = 0
    
    for i in range(1, TOTAL_BATTLES + 1):
        battle_id = f"tier3-gptoss-{i:03d}"
        payload = {
            "battle_id": battle_id,
            "purple_agent_url": PURPLE_AGENT_URL,
        }
        
        start_time = time.time()
        try:
            print(f"[Tier3gptoss] Battle {i}/{TOTAL_BATTLES}: {battle_id}...", end=" ", flush=True)
            resp = client.post(f"{GREEN_URL}/actions/send_coding_task", json=payload)
            resp.raise_for_status()
            
            result = resp.json()
            duration = time.time() - start_time
            score = result.get("evaluation", {}).get("cis_score", 0.0)
            
            # Check if Harmony protocol was used
            purple_response = result.get("purple_response", {})
            purple_text = purple_response.get("sourceCode", "")
            
            harmony_detected = False
            if "<|channel|" in purple_text:
                harmony_detected = True
                harmony_info = f" [Harmony detected]"
            else:
                harmony_info = ""
            
            # Save to database
            if save_result(result):
                successful += 1
                status = "✓"
            else:
                failed += 1
                status = "✗"
            
            summary = f"{status} {duration:.1f}s score={score:.2f}{harmony_info}"
            print(summary)
            
            # Log to file
            with open(log_file, "a", encoding="utf-8") as f:
                f.write(f"[{i:02d}] {battle_id}\n")
                f.write(f"     Duration: {duration:.1f}s\n")
                f.write(f"     Score: {score:.2f}\n")
                f.write(f"     Harmony: {'YES' if harmony_detected else 'NO'}\n")
                f.write(f"     Status: {status}\n\n")
            
            # Cooldown
            if i < TOTAL_BATTLES:
                time.sleep(2)
                
        except Exception as e:
            failed += 1
            duration = time.time() - start_time
            error_msg = f"{type(e).__name__}: {str(e)[:100]}"
            print(f"✗ {duration:.1f}s ERROR: {error_msg}")
            
            with open(log_file, "a", encoding="utf-8") as f:
                f.write(f"[{i:02d}] {battle_id}\n")
                f.write(f"     Duration: {duration:.1f}s\n")
                f.write(f"     Error: {error_msg}\n\n")
            
            time.sleep(5)
    
    client.close()
    
    # Summary
    print("\n" + "=" * 80)
    print(f"Tier 3 (gpt-oss-20b) Execution Complete")
    print(f"  Successful: {successful}/{TOTAL_BATTLES}")
    print(f"  Failed: {failed}/{TOTAL_BATTLES}")
    print(f"  Database: {DB_PATH}")
    print(f"  Log: {log_file}")
    print("=" * 80)
    
    with open(log_file, "a", encoding="utf-8") as f:
        f.write("=" * 80 + "\n")
        f.write(f"Execution Summary\n")
        f.write(f"  Successful: {successful}/{TOTAL_BATTLES}\n")
        f.write(f"  Failed: {failed}/{TOTAL_BATTLES}\n")
        f.write(f"  End Time: {datetime.now().isoformat()}\n")

if __name__ == "__main__":
    run_battles()
