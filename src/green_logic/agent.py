import json
import sqlite3
import os
import datetime
import hashlib

class GreenAgent:
    """
    The Green Agent is responsible for evaluating the performance of other agents
    based on the "Contextual Debt" framework.
    """

    def generate_dbom(self, result: dict) -> dict:
        """
        Implements Task 1.6: Decision Bill of Materials (DBOM) Generator.
        DBOM = < H(Delta), v_intent, Score_CIS, sigma_Judge >
        """
        battle_id = result.get("battle_id", "N/A")
        raw_result = json.dumps(result)
        
        # 1. H(Delta) - Hash of the change/result
        h_delta = hashlib.sha256(raw_result.encode()).hexdigest()
        
        # 2. v_intent - Real Intent Vector (Task 1.6)
        # Extract the actual embedding vector from the evaluation results
        v_intent = result.get("evaluation", {}).get("intent_vector", [0.0] * 384)
        
        # 3. Score_CIS - The final score
        score_cis = result.get("evaluation", {}).get("cis_score", 0.0)
        
        # 4. sigma_Judge - Simulated signature (HMAC or similar)
        # For now, we simulate this with a unique string.
        sigma_judge = f"SIG_GREEN_{battle_id}_{h_delta[:8]}"

        dbom = {
            "dbom_version": "1.0",
            "battle_id": battle_id,
            "h_delta": h_delta,
            "v_intent": v_intent,
            "score_cis": score_cis,
            "sigma_judge": sigma_judge,
            "timestamp": datetime.datetime.now().isoformat()
        }
        
        # Save to file system
        os.makedirs("data/dboms", exist_ok=True)
        dbom_path = os.path.join("data/dboms", f"dbom_{battle_id}.json")
        with open(dbom_path, "w") as f:
            json.dump(dbom, f, indent=2)
        
        return dbom

    def submit_result(self, result: dict):
        """
        Submits the final evaluation result.

        Args:
            result: A dictionary containing the evaluation results, including
                    'battle_id', 'score', and 'breakdown'.
        """
        battle_id = result.get("battle_id", "N/A")
        evaluation = result.get("evaluation", {})
        score = evaluation.get("cis_score", result.get("score", 0.0))
        breakdown = evaluation.get("breakdown", result.get("breakdown", "No breakdown provided."))

        # Generate DBOM (Task 1.6)
        dbom = self.generate_dbom(result)
        print(f"[GreenAgent] DBOM generated: data/dboms/dbom_{battle_id}.json")

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
                    raw_result TEXT,
                    dbom_hash TEXT
                )
            """)
            
            # Enable Write-Ahead Logging for crash-proof persistence (Task 1.3)
            cursor.execute("PRAGMA journal_mode=WAL;")

            # Prepare data
            timestamp = datetime.datetime.now().isoformat()
            raw_result = json.dumps(result)
            dbom_hash = dbom["h_delta"]

            # Insert record
            cursor.execute("""
                INSERT INTO battles (battle_id, timestamp, score, breakdown, raw_result, dbom_hash)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (battle_id, timestamp, score, breakdown, raw_result, dbom_hash))

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
            "dbom_hash": dbom["h_delta"]
        }
        print(f"[GreenAgent] Confirmation: {json.dumps(confirmation, indent=2)}")
