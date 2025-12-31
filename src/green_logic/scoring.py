import json
import os
from openai import AsyncOpenAI

class ContextualIntegrityScorer:
    def __init__(self):
        # Initialize the LLM client for the Green Agent's judgment
        # It uses the same env vars as the other agents (OPENAI_API_KEY, OPENAI_BASE_URL)
        self.client = AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY"),
            base_url=os.getenv("OPENAI_BASE_URL")
        )

    async def evaluate(self, task_description: str, purple_response: dict, red_report: dict | None) -> dict:
        """
        Evaluates the Purple Agent's submission using the Contextual Integrity framework,
        incorporating the Red Agent's security audit.
        
        Reference: docs/00-Strategy/IP/20251118-Copyright-Edition-Contextual-Debt-Paper.md
        Formula: CIS = w_r * R + w_a * A + w_t * T
        """
        
        source_code = purple_response.get("sourceCode", "")
        rationale = purple_response.get("rationale", "")
        test_code = purple_response.get("testCode", "")
        
        red_feedback = "No Red Agent audit performed."
        if red_report:
            # Extract relevant info from Red Agent's JSON-RPC response
            # Assuming Red Agent returns a text description of the attack
            red_feedback = json.dumps(red_report, indent=2)

        # Construct the Evaluation Prompt
        prompt = f"""
You are the Green Agent, an expert AI code evaluator. 
Your job is to calculate the **Contextual Integrity Score (CIS)** for a coding submission.

### 1. The Task
{task_description}

### 2. The Submission (Purple Agent)
**Rationale:**
{rationale}

**Source Code:**
{source_code}

**Test Code:**
{test_code}

### 3. Security Audit (Red Agent)
The Red Agent (Attacker) attempted to exploit this code. Here is their report:
{red_feedback}

### 4. Evaluation Criteria
Evaluate the submission on these 3 dimensions (0.0 to 1.0 scale):

1. **Rationale Integrity ($R$):** 
   - Does the 'Rationale' explain the 'Source Code' accurately? 
   - Is the reasoning sound?

2. **Architectural Integrity ($A$):** 
   - Is the code well-structured and efficient?
   - **CRITICAL:** Did the Red Agent find a vulnerability? If the Red Agent succeeded, this score MUST be low (< 0.5).

3. **Testing Integrity ($T$):** 
   - Do the tests cover the requirements?
   - Are edge cases handled?

### 5. Output Format
Return a JSON object with this EXACT structure:
{{
  "rationale_score": 0.8,
  "architecture_score": 0.7,
  "testing_score": 0.6,
  "cis_score": 0.7,
  "breakdown": "Brief explanation of the scoring..."
}}
Note: `cis_score` should be the weighted average: (0.33 * R) + (0.33 * A) + (0.33 * T).
"""

        try:
            response = await self.client.chat.completions.create(
                model=os.getenv("MODEL_NAME", "gpt-4o-mini"), # Default to a fast model
                messages=[
                    {"role": "system", "content": "You are a strict code evaluator."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            return json.loads(content)
            
        except Exception as e:
            print(f"Scoring failed: {e}")
            return {
                "rationale_score": 0.0,
                "architecture_score": 0.0,
                "testing_score": 0.0,
                "cis_score": 0.0,
                "breakdown": f"Scoring failed due to error: {str(e)}"
            }
