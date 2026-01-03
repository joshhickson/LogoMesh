import json

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
        # TODO: Implement SQLite persistence as per the migration manifest.
        # The result JSON should be saved to `data/battles.db`.

        battle_id = result.get("battle_id", "N/A")
        score = result.get("score", 0.0)
        breakdown = result.get("breakdown", "No breakdown provided.")

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
