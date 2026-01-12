import json
import os
from openai import AsyncOpenAI

from .compare_vectors import VectorScorer

class ContextualIntegrityScorer:
    def __init__(self):
        # Initialize the LLM client for the Green Agent's judgment
        self.client = AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY"),
            base_url=os.getenv("OPENAI_BASE_URL")
        )
        # Initialize Vector Scorer for math-based evaluation
        self.vector_scorer = VectorScorer()

    async def evaluate(
        self,
        task_description: str,
        purple_response: dict,
        red_report: dict | None,
        audit_result: dict | None = None,
        sandbox_result: dict | None = None
    ) -> dict:
        """
        Evaluates the Purple Agent's submission using the Contextual Integrity framework,
        incorporating the Red Agent's security audit and Tier 2 analysis results.

        Reference: docs/00-Strategy/IP/20251118-Copyright-Edition-Contextual-Debt-Paper.md
        Formula: CIS = w_r * R + w_a * A + w_t * T

        Args:
            task_description: The original task description
            purple_response: Purple Agent's response with sourceCode, rationale, testCode
            red_report: Optional Red Agent attack report
            audit_result: Optional static analysis result from SemanticAuditor
            sandbox_result: Optional dynamic execution result from Sandbox
        """
        
        source_code = purple_response.get("sourceCode", "")
        rationale = purple_response.get("rationale", "")
        test_code = purple_response.get("testCode", "")
        
        red_feedback = "No Red Agent audit performed."
        if red_report:
            # Extract relevant info from Red Agent's JSON-RPC response
            # Assuming Red Agent returns a text description of the attack
            red_feedback = json.dumps(red_report, indent=2)

        # 1. Rationale Integrity (R) - Vector based
        # Compare Intent (task_description) with Rationale
        r_score = self.vector_scorer.calculate_similarity(task_description, rationale)

        # 2. Architectural Integrity (A) - Vector + LLM
        # Compare Rationale with Source Code
        a_vector_score = self.vector_scorer.calculate_similarity(rationale, source_code)
        
        # 3. Testing Integrity (T) - Vector + LLM
        # Compare Source Code with Test Code
        t_vector_score = self.vector_scorer.calculate_similarity(source_code, test_code)

        # Capture Intent Vector for DBOM (Task 1.6)
        intent_vector = self.vector_scorer.get_embedding(task_description).tolist()

        # Format Tier 2 analysis results
        static_analysis_feedback = "No static analysis performed."
        if audit_result:
            static_analysis_feedback = f"""
**Static Analysis (AST) Result:**
- Valid: {audit_result.get('valid', 'N/A')}
- Penalty: {audit_result.get('penalty', 0)}
- Reason: {audit_result.get('reason', 'N/A')}
"""

        dynamic_analysis_feedback = "No dynamic tests executed."
        if sandbox_result:
            dynamic_analysis_feedback = f"""
**Dynamic Execution (Sandbox) Result:**
- Tests Passed: {sandbox_result.get('success', 'N/A')}
- Duration: {sandbox_result.get('duration', 0):.2f}s
- Output: {sandbox_result.get('output', 'N/A')[:500]}
"""

        # Construct the Evaluation Prompt
        prompt = f"""
You are the Green Agent, an expert AI code evaluator.
Your job is to calculate the final **Contextual Integrity Score (CIS)** for a coding submission.

We have already calculated base Vector Scores for you:
- Rationale Similarity: {r_score:.2f}
- Architecture Similarity: {a_vector_score:.2f}
- Testing Similarity: {t_vector_score:.2f}

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

### 4. Tier 2 Analysis Results
{static_analysis_feedback}
{dynamic_analysis_feedback}

### 5. Evaluation Criteria
Use the vector scores as a baseline, but adjust them based on the actual quality and security findings:

1. **Rationale Integrity (R):**
   - How well does the rationale explain the code? (Vector Baseline: {r_score:.2f})

2. **Architectural Integrity (A):**
   - Is the code secure? (Vector Baseline: {a_vector_score:.2f})
   - **CRITICAL:** If the Red Agent succeeded, this score MUST be < 0.3 regardless of vector similarity.
   - **CRITICAL:** If static analysis detected forbidden imports, this score MUST be < 0.2.

3. **Testing Integrity (T):**
   - Coverage and edge cases. (Vector Baseline: {t_vector_score:.2f})
   - **CRITICAL:** If dynamic sandbox tests failed, this score MUST be < 0.5.

### 6. Output Format
Return a JSON object with this EXACT structure:
{{
  "rationale_score": 0.8,
  "architecture_score": 0.7,
  "testing_score": 0.6,
  "cis_score": 0.7,
  "breakdown": "Explanation including vector score influence and Tier 2 analysis..."
}}
Note: `cis_score` is (0.33 * R) + (0.33 * A) + (0.33 * T).
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
            eval_data = json.loads(content)
            
            # Attach the real Intent Vector for the DBOM Generator
            eval_data["intent_vector"] = intent_vector
            return eval_data
            
        except Exception as e:
            print(f"Scoring failed: {e}")
            return {
                "rationale_score": 0.0,
                "architecture_score": 0.0,
                "testing_score": 0.0,
                "cis_score": 0.0,
                "breakdown": f"Scoring failed due to error: {str(e)}"
            }
