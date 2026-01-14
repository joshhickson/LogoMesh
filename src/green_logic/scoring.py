import asyncio
import json
import os
import re
import yaml
from pathlib import Path

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
        self.logic_review_timeout = 85
        
        # A-003 Implementation: Load architecture constraints
        constraints_path = Path(__file__).parent / "architecture_constraints.yaml"
        try:
            with open(constraints_path, 'r') as f:
                self.architecture_constraints = yaml.safe_load(f)
        except FileNotFoundError:
            print(f"Warning: Architecture constraints file not found at {constraints_path}")
            self.architecture_constraints = {}

    async def _perform_logic_review(
        self, task_description: str, source_code: str
    ) -> dict:
        """
        Perform a Senior Code Review using LLM-based logic evaluation.

        Args:
            task_description: The original task description.
            source_code: The submitted source code to review.

        Returns:
            A dict with 'logic_score' (0.0-1.0) and 'critique' (string).
            Returns fallback values on failure.
        """
        review_prompt = f"""You are a Senior Code Reviewer performing a deep logic analysis.

### Task Requirements
{task_description}

### Submitted Code
{source_code}

### Review Criteria
Evaluate the code on these dimensions:
1. **Edge Case Handling:** Does it handle nulls, empty inputs, boundary values, and error states?
2. **Algorithmic Complexity:** Is the solution optimally efficient? Could it be simpler?
3. **Constraint Adherence:** Does the code follow all constraints specified in the task?
4. **Correctness:** Will the logic produce correct results for all valid inputs?
5. **Robustness:** How well does it handle unexpected scenarios?

### Output Format
Return a JSON object with EXACTLY this structure:
{{
  "logic_score": 0.75,
  "critique": "Brief explanation of strengths and weaknesses..."
}}

The logic_score must be a float between 0.0 and 1.0:
- 0.0-0.3: Fundamentally flawed logic, missing critical edge cases
- 0.4-0.6: Acceptable but has notable gaps or inefficiencies
- 0.7-0.8: Good logic with minor issues
- 0.9-1.0: Excellent, handles all cases optimally"""

        try:
            response = await asyncio.wait_for(
                self.client.chat.completions.create(
                    model=os.getenv("MODEL_NAME", "gpt-4o-mini"),
                    messages=[
                        {"role": "system", "content": "You are a senior code reviewer."},
                        {"role": "user", "content": review_prompt},
                    ],
                    response_format={"type": "json_object"},
                ),
                timeout=self.logic_review_timeout,
            )

            content = response.choices[0].message.content
            review_data = json.loads(content)

            # Validate and clamp logic_score
            logic_score = float(review_data.get("logic_score", 0.5))
            logic_score = max(0.0, min(1.0, logic_score))

            return {
                "logic_score": logic_score,
                "critique": review_data.get("critique", "No critique provided."),
            }

        except asyncio.TimeoutError:
            return {"logic_score": 0.5, "critique": "Logic review timed out."}
        except Exception as e:
            return {"logic_score": 0.5, "critique": f"Logic review failed: {str(e)}"}

    def _evaluate_architecture_constraints(self, task_id: str, source_code: str) -> float:
        """
        A-003 Implementation: Evaluate task-specific architectural constraints.
        
        Args:
            task_id: Task identifier (e.g., "task-001", "task-002")
            source_code: The submitted source code to validate
        
        Returns:
            Penalty value between 0.0 (no violations) and 1.0 (critical violations)
        """
        if not task_id or task_id not in self.architecture_constraints:
            return 0.0  # No constraints defined, no penalty
        
        task_constraints = self.architecture_constraints[task_id].get("constraints", {})
        max_penalty = 0.0  # Track highest penalty (not cumulative)
        violations = []
        
        for constraint_name, constraint_rules in task_constraints.items():
            penalty = constraint_rules.get("penalty", 0.0)
            
            # Check forbidden imports
            forbidden_imports = constraint_rules.get("forbidden_imports", [])
            for forbidden in forbidden_imports:
                if re.search(rf"\\bimport\\s+{re.escape(forbidden)}\\b", source_code) or \
                   re.search(rf"\\bfrom\\s+{re.escape(forbidden)}\\s+import\\b", source_code):
                    violations.append(f"{constraint_name}: Forbidden import '{forbidden}'")
                    max_penalty = max(max_penalty, penalty)
                    break
            
            # Check required imports (any)
            required_imports_any = constraint_rules.get("required_imports_any", [])
            if required_imports_any:
                found_any = False
                for required in required_imports_any:
                    if required in source_code:
                        found_any = True
                        break
                if not found_any:
                    violations.append(f\"{constraint_name}: Missing required import (any of {required_imports_any})\")
                    max_penalty = max(max_penalty, penalty)
            
            # Check required imports (all)
            required_imports = constraint_rules.get(\"required_imports\", [])
            for required in required_imports:
                if re.search(rf\"\\bimport\\s+{re.escape(required)}\\b\", source_code) is None and \
                   re.search(rf\"\\bfrom\\s+{re.escape(required)}\\s+import\\b\", source_code) is None:
                    violations.append(f\"{constraint_name}: Missing required import '{required}'\")
                    max_penalty = max(max_penalty, penalty)
            
            # Check forbidden patterns (regex)
            forbidden_patterns = constraint_rules.get(\"forbidden_patterns\", [])
            for pattern in forbidden_patterns:
                if re.search(pattern, source_code, re.MULTILINE):
                    violations.append(f\"{constraint_name}: Forbidden pattern '{pattern}'\")
                    max_penalty = max(max_penalty, penalty)
                    break
        
        if violations:
            print(f\"[A-003] Architecture constraint violations for {task_id}:\")
            for v in violations:
                print(f\"  - {v}\")
        
        return max_penalty
    def _evaluate_test_specificity(self, task_id: str, test_code: str, task_description: str) -> float:
        """
        A-004 Implementation: Evaluate test assertion specificity and coverage.
        
        Args:
            task_id: Task identifier (e.g., "task-001")
            test_code: The submitted test code
            task_description: Original task description for context
        
        Returns:
            Specificity multiplier between 0.6 (weak tests) and 1.0 (excellent tests)
        """
        test_config_id = f"{task_id}-tests"
        if not task_id or test_config_id not in self.architecture_constraints:
            return 0.85  # Default: reasonable quality if no test config defined
        
        test_requirements = self.architecture_constraints[test_config_id].get("required_test_patterns", {})
        total_weight = 0.0
        matched_weight = 0.0
        matches = []
        
        test_code_lower = test_code.lower()
        
        for pattern_name, pattern_rules in test_requirements.items():
            weight = pattern_rules.get("weight", 0.1)
            total_weight += weight
            patterns = pattern_rules.get("patterns", [])
            
            # Check if any pattern matches
            for pattern in patterns:
                if re.search(pattern, test_code_lower, re.IGNORECASE | re.MULTILINE):
                    matched_weight += weight
                    matches.append(f"{pattern_name} ({weight:.2f})")
                    break  # Only count first match per pattern group
        
        if matches:
            print(f"[A-004] Test specificity matches for {task_id}: {', '.join(matches)}")
        
        # Calculate specificity score
        if total_weight > 0:
            coverage_ratio = matched_weight / total_weight
            # Map coverage ratio to specificity multiplier: [0, 1] -> [0.6, 1.0]
            specificity = 0.6 + (0.4 * coverage_ratio)
        else:
            specificity = 0.85  # Default if no patterns defined
        
        return min(1.0, max(0.6, specificity))
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
        incorporating the Red Agent's security audit, Tier 2 analysis, and LLM-based logic review.

        Reference: docs/00-Strategy/IP/20251118-Copyright-Edition-Contextual-Debt-Paper.md
        Formula: CIS = (0.2 * R) + (0.2 * A) + (0.2 * T) + (0.4 * Logic_Score)

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

        # 2. Architectural Integrity (A) - Vector + Constraints
        # Compare Rationale with Source Code
        a_vector_score = self.vector_scorer.calculate_similarity(rationale, source_code)
        
        # A-003 Implementation: Apply task-specific architectural constraints
        # Extract task_id from task_description or purple_response metadata
        task_id = purple_response.get("task_id") if isinstance(purple_response, dict) else None
        if not task_id:
            # Try to infer from task_description (fallback)
            for tid in ["task-001", "task-002", "task-003", "task-004"]:
                if tid in str(task_description).lower() or self.architecture_constraints.get(tid, {}).get("title", "").lower() in task_description.lower():
                    task_id = tid
                    break
        
        constraint_penalty = self._evaluate_architecture_constraints(task_id, source_code) if task_id else 0.0
        a_score = a_vector_score * (1.0 - constraint_penalty)
        
        # 3. Testing Integrity (T) - Vector + Test Specificity
        # Compare Source Code with Test Code
        t_vector_score = self.vector_scorer.calculate_similarity(source_code, test_code)
        
        # A-004 Implementation: Evaluate test assertion specificity
        # Check if tests verify key acceptance criteria (not just generic assertions)
        test_specificity = self._evaluate_test_specificity(task_id, test_code, task_description) if task_id else 0.85
        t_score = t_vector_score * test_specificity

        # A-002 Implementation: Explicit Cosine Similarity for Intent vs Code
        # Compute and store intent_code_similarity as separate diagnostic field
        # (Not yet used in CIS formula; reserved for validation analysis and reporting)
        intent_code_similarity = self.vector_scorer.calculate_similarity(task_description, source_code)

        # Capture Intent Vector for DBOM (Task 1.6)
        intent_vector = self.vector_scorer.get_embedding(task_description).tolist()

        # 4. Logic Review (L) - LLM-based Senior Code Review
        logic_review = await self._perform_logic_review(task_description, source_code)
        logic_score = logic_review["logic_score"]
        logic_critique = logic_review["critique"]

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

We have already calculated base scores for you:
- Rationale Similarity (Vector): {r_score:.2f}
- Architecture Similarity (Vector): {a_vector_score:.2f}
- Testing Similarity (Vector): {t_vector_score:.2f}
- Logic Score (LLM Review): {logic_score:.2f}

**Senior Code Review Critique:**
{logic_critique}

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

4. **Logic Score (L):**
   - Already calculated by Senior Code Review: {logic_score:.2f}
   - Use this value directly unless you have strong reasons to adjust based on other findings.

### 6. Output Format
Return a JSON object with this EXACT structure:
{{
  "rationale_score": 0.8,
  "architecture_score": 0.7,
  "testing_score": 0.6,
  "logic_score": {logic_score:.2f},
  "cis_score": 0.7,
  "logic_critique": "{logic_critique[:100]}...",
  "breakdown": "Explanation including vector score influence, logic review, and Tier 2 analysis..."
}}
Note: `cis_score` = (0.2 * R) + (0.2 * A) + (0.2 * T) + (0.4 * L). Logic Score has the highest weight.
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

            # Ensure logic_score and logic_critique are present
            if "logic_score" not in eval_data:
                eval_data["logic_score"] = logic_score
            if "logic_critique" not in eval_data:
                eval_data["logic_critique"] = logic_critique

            # Recalculate CIS with the weighted formula to ensure consistency
            # A-001 Documentation: CIS Weight Rationale
            # - R(Δ) [0.25]: Semantic alignment between task intent and rationale
            # - A(Δ) [0.25]: Architectural soundness of implementation structure
            # - T(Δ) [0.25]: Test coverage quality and assertion specificity
            # - L(Δ) [0.25]: Logic correctness via senior code review (LLM-based)
            # Equal weighting (25-25-25-25) ensures no single dimension dominates
            # and maintains defensibility against judge criticism of unvalidated metrics.
            r = float(eval_data.get("rationale_score", 0.0))
            a = float(eval_data.get("architecture_score", 0.0))
            t = float(eval_data.get("testing_score", 0.0))
            l = float(eval_data.get("logic_score", logic_score))
            
            # B-001 Implementation: Anchor Logic Score to Test Results
            # If sandbox tests failed, cap logic_score at 0.3 (tests are ground truth)
            if sandbox_result and not sandbox_result.get("success", False):
                l = min(l, 0.3)
                eval_data["logic_score_anchored"] = True
            
            # B-002 Implementation: Reweight to 25-25-25-25 (equal component weight)
            eval_data["cis_score"] = (0.25 * r) + (0.25 * a) + (0.25 * t) + (0.25 * l)

            # A-002 Implementation: Store Intent-Code Similarity
            # Separate diagnostic field for Intent vs Code semantic alignment
            # Reserved for validation analysis and future R(Δ) redefinition studies
            eval_data["intent_code_similarity"] = intent_code_similarity

            # Attach the real Intent Vector for the DBOM Generator
            eval_data["intent_vector"] = intent_vector
            return eval_data

        except Exception as e:
            print(f"Scoring failed: {e}")
            return {
                "rationale_score": 0.0,
                "architecture_score": 0.0,
                "testing_score": 0.0,
                "logic_score": logic_score,
                "logic_critique": logic_critique,
                "cis_score": 0.4 * logic_score,  # Only logic score contributes on failure
                "breakdown": f"Scoring failed due to error: {str(e)}",
                "intent_vector": intent_vector,
            }
