import sqlite3
import json
import os

def check_db():
    db_path = "data/battles.db"
    if not os.path.exists(db_path):
        print(f"Error: {db_path} not found.")
        return

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check WAL mode
        cursor.execute("PRAGMA journal_mode;")
        mode = cursor.fetchone()[0]
        print(f"Journal Mode: {mode}")

        # Check records
        cursor.execute("SELECT COUNT(*) FROM battles")
        count = cursor.fetchone()[0]
        print(f"Total Battles in DB: {count}")

        if count > 0:
            cursor.execute("SELECT battle_id, score, timestamp FROM battles ORDER BY id DESC LIMIT 5")
            rows = cursor.fetchall()
            print("\nRecent Battles:")
            for row in rows:
                print(f"ID: {row[0]}, Score: {row[1]}, Time: {row[2]}")
        
        conn.close()
    except Exception as e:
        print(f"Error checking DB: {e}")

if __name__ == "__main__":
    check_db()
