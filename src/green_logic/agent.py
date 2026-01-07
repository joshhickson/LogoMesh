import json
import sqlite3
import os
import datetime

class GreenAgent:
    """
    The Green Agent is responsible for evaluating the performance of other agents
    based on the "Contextual Debt" framework.
    """

    def submit_result(self, result: dict):
        """
        Submits the final evaluation result.

        Args:
            result: A dictionary containing the evaluation results, including
                    'battle_id', 'score', and 'breakdown'.
        """
        battle_id = result.get("battle_id", "N/A")
        score = result.get("score", 0.0)
        breakdown = result.get("breakdown", "No breakdown provided.")

        # SQLite Persistence Implementation
        try:
            # Ensure data directory exists
            os.makedirs("data", exist_ok=True)

            db_path = os.path.join("data", "battles.db")
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()

            # Create table if it doesn't exist
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS battles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    battle_id TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    score REAL NOT NULL,
                    breakdown TEXT,
                    raw_result TEXT
                )
            """)

            # Prepare data
            timestamp = datetime.datetime.now().isoformat()
            raw_result = json.dumps(result)

            # Insert record
            cursor.execute("""
                INSERT INTO battles (battle_id, timestamp, score, breakdown, raw_result)
                VALUES (?, ?, ?, ?, ?)
            """, (battle_id, timestamp, score, breakdown, raw_result))

            conn.commit()
            conn.close()
            print(f"[GreenAgent] Result saved to {db_path}")

        except Exception as e:
            print(f"[GreenAgent] Error saving result to database: {e}")

        # Print to console for visibility (fallback from original implementation)
        print("\n" + "=" * 60)
        print(f"BATTLE EVALUATION COMPLETE: {battle_id}")
        print("=" * 60)
        print(f"Contextual Debt Score: {score:.2f}")
        print("-" * 60)
        print("Score Breakdown:")
        print(breakdown)
        print("=" * 60 + "\n")

        # The original tool returned a JSON string for confirmation.
        # This can be logged or sent to another service in the future.
        confirmation = {
            "status": "reported",
            "battle_id": battle_id,
            "contextual_debt_score": score,
        }
        print(f"[GreenAgent] Confirmation: {json.dumps(confirmation, indent=2)}")
