import asyncio
import json
import os
import re
import yaml
from pathlib import Path

from openai import AsyncOpenAI

try:
    from llm_utils import get_temperature_kwargs
except ImportError:
    try:
        from src.llm_utils import get_temperature_kwargs
    except ImportError:
        def get_temperature_kwargs(default=0.7):
            return {"temperature": default}

from .compare_vectors import VectorScorer
from .red_report_parser import RedReportParser
from .red_report_types import RedAgentReport
from .harmony_parser import HarmonyParser

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
        
        # Red Agent Integration: Initialize Red Report Parser
        self.red_parser = RedReportParser()
        
        # Harmony Protocol Integration: Initialize Harmony Parser for gpt-oss models
        self.harmony_parser = HarmonyParser()
        
        # Model detection: Track which model is being used
        self.current_model = os.getenv("MODEL_NAME", "unknown")

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
                    model=os.getenv("OPENAI_MODEL", os.getenv("MODEL_NAME", "gpt-4o-mini")),
                    messages=[
                        {"role": "system", "content": "You are a senior code reviewer."},
                        {"role": "user", "content": review_prompt},
                    ],
                    response_format={"type": "json_object"},
                    seed=42,        # Fixed seed for consistent results
                    **get_temperature_kwargs(0),
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

    def _parse_purple_response(self, purple_response: dict) -> dict:
        """
        Parse Purple Agent response, handling Harmony format if detected.
        
        For gpt-oss models using Harmony protocol, extracts:
        - analysis channel → rationale (for Requirements scoring)
        - final channel → sourceCode (for implementation)
        
        Args:
            purple_response: Raw response dict from Purple Agent
            
        Returns:
            Normalized dict with sourceCode, testCode, rationale
        """
        # Default extraction (standard A2A format)
        source_code = purple_response.get("sourceCode", "")
        test_code = purple_response.get("testCode", "")
        rationale = purple_response.get("rationale", "")
        
        # Detect if response uses Harmony format
        # Check if sourceCode contains Harmony channel tags
        if source_code and ("<|channel|" in source_code or self.current_model.lower().startswith("gpt-oss")):
            print(f"[Harmony] Detected Harmony format in Purple Agent response (model: {self.current_model})")
            
            # Parse Harmony channels
            parsed = self.harmony_parser.parse(source_code)
            
            if parsed['format_detected']:
                print(f"[Harmony] Channels found: {list(parsed['channels'].keys())}")
                
                # Extract code from 'final' channel
                if parsed['final']:
                    extracted_code = self.harmony_parser.extract_code_from_final(parsed['final'])
                    if extracted_code:
                        source_code = extracted_code
                        print(f"[Harmony] Extracted {len(source_code)} chars from <|channel|final>")
                
                # Extract rationale from 'analysis' channel
                if parsed['analysis']:
                    extracted_rationale = self.harmony_parser.extract_rationale_from_analysis(parsed['analysis'])
                    if extracted_rationale:
                        # Prepend analysis to existing rationale (if any)
                        if rationale:
                            rationale = f"{extracted_rationale}\n\n{rationale}"
                        else:
                            rationale = extracted_rationale
                        print(f"[Harmony] Extracted {len(rationale)} chars from <|channel|analysis>")
                
                # Store raw Harmony response for debugging
                purple_response['_harmony_parsed'] = parsed
        
        return {
            "sourceCode": source_code,
            "testCode": test_code,
            "rationale": rationale,
            "task_id": purple_response.get("task_id")
        }

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
                if re.search(rf"\bimport\s+{re.escape(forbidden)}\b", source_code) or \
                   re.search(rf"\bfrom\s+{re.escape(forbidden)}\s+import\b", source_code):
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
                    violations.append(f"{constraint_name}: Missing required import (any of {required_imports_any})")
                    max_penalty = max(max_penalty, penalty)
            
            # Check required imports (all)
            required_imports = constraint_rules.get("required_imports", [])
            for required in required_imports:
                if re.search(rf"\bimport\s+{re.escape(required)}\b", source_code) is None and \
                   re.search(rf"\bfrom\s+{re.escape(required)}\s+import\b", source_code) is None:
                    violations.append(f"{constraint_name}: Missing required import '{required}'")
                    max_penalty = max(max_penalty, penalty)
            
            # Check forbidden patterns (regex)
            forbidden_patterns = constraint_rules.get("forbidden_patterns", [])
            for pattern in forbidden_patterns:
                if re.search(pattern, source_code, re.MULTILINE):
                    violations.append(f"{constraint_name}: Forbidden pattern '{pattern}'")
                    max_penalty = max(max_penalty, penalty)
                    break
        
        if violations:
            print(f"[A-003] Architecture constraint violations for {task_id}:")
            for v in violations:
                print(f"  - {v}")
        
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
        sandbox_result: dict | None = None,
        red_report_obj: RedAgentReport | None = None,
        memory_context: str = "",
        task_intel=None,
    ) -> dict:
        """
        Evaluates the Purple Agent's submission using the Contextual Integrity framework,
        incorporating the Red Agent's security audit, Tier 2 analysis, and LLM-based logic review.

        Reference: docs/00-Strategy/IP/20251118-Copyright-Edition-Contextual-Debt-Paper.md
        Formula: CIS = (0.25 * R) + (0.25 * A) + (0.25 * T) + (0.25 * Logic_Score)

        Args:
            task_description: The original task description
            purple_response: Purple Agent's response with sourceCode, rationale, testCode
            red_report: Optional Red Agent attack report (dict format, will be parsed)
            audit_result: Optional static analysis result from SemanticAuditor
            sandbox_result: Optional dynamic execution result from Sandbox
            red_report_obj: Optional RedAgentReport object (bypasses parsing if provided)
        """
        
        # Harmony Protocol Integration: Parse Purple Agent response
        # Handles both standard A2A format and Harmony format (gpt-oss models)
        parsed_response = self._parse_purple_response(purple_response)
        
        source_code = parsed_response.get("sourceCode", "")
        rationale = parsed_response.get("rationale", "")
        test_code = parsed_response.get("testCode", "")
        
        red_feedback = "No Red Agent audit performed."
        if red_report:
            # Extract relevant info from Red Agent's JSON-RPC response
            # Assuming Red Agent returns a text description of the attack
            red_feedback = json.dumps(red_report, indent=2)

        # 1. Rationale Integrity (R) - Vector similarity + length/quality heuristic
        # Compare Intent (task_description) with Rationale
        r_vector = self.vector_scorer.calculate_similarity(task_description, rationale)
        # Boost R if rationale is substantive (>100 chars = explains reasoning)
        r_length_bonus = min(0.1, len(rationale) / 1000) if rationale else 0.0
        r_score = min(1.0, r_vector + r_length_bonus)

        # 2. Architectural Integrity (A) - Ground truth driven
        # Primary signal: vulnerability count from Red Agent (not vector similarity)
        # Secondary signal: static analysis constraints
        task_id = purple_response.get("task_id") if isinstance(purple_response, dict) else None
        if not task_id:
            for tid in ["task-001", "task-002", "task-003", "task-004"]:
                if tid in str(task_description).lower() or self.architecture_constraints.get(tid, {}).get("title", "").lower() in task_description.lower():
                    task_id = tid
                    break

        # For novel tasks not in architecture_constraints.yaml, try dynamic guidance
        if task_id and task_id not in self.architecture_constraints and task_intel:
            try:
                dynamic_guidance = await task_intel.get_architecture_guidance(task_id, task_description)
                if dynamic_guidance and dynamic_guidance.get("constraints"):
                    self.architecture_constraints[task_id] = dynamic_guidance
                    print(f"[Scorer] Using dynamic architecture constraints for novel task {task_id}")
            except Exception as e:
                print(f"[Scorer] Dynamic architecture guidance failed: {e}")

        constraint_penalty = self._evaluate_architecture_constraints(task_id, source_code) if task_id else 0.0

        # Ground truth architecture: start at 0.80 (clean code baseline)
        # Deduct for constraint violations only.
        # Vulnerabilities are handled separately by red_penalty_multiplier on the full CIS
        # to avoid double-penalization.
        a_base = 0.80
        a_base -= constraint_penalty * 0.5  # Constraint violations reduce by up to 50%

        # Count vulns for prompt context (but do NOT deduct from A — red_penalty handles it)
        vuln_count = 0
        if red_report_obj:
            vuln_count = len(red_report_obj.vulnerabilities)
        elif red_report and red_report.get("vulnerabilities"):
            vuln_count = len(red_report["vulnerabilities"])

        if vuln_count == 0:
            a_base = max(a_base, 0.75)  # Clean bill of health = strong architecture

        # Vector similarity as minor adjustment (±0.05)
        a_vector_score = self.vector_scorer.calculate_similarity(rationale, source_code)
        a_score = max(0.0, min(1.0, a_base + (a_vector_score - 0.5) * 0.1))

        # 3. Testing Integrity (T) - Ground truth: actual pass rate
        # Primary signal: sandbox execution results
        # Secondary signal: test specificity and vector similarity
        t_vector_score = self.vector_scorer.calculate_similarity(source_code, test_code)
        test_specificity = self._evaluate_test_specificity(task_id, test_code, task_description) if task_id else 0.85

        # Ground truth: derive T from actual test pass rate
        t_pass_rate = None
        if sandbox_result:
            sb_out = sandbox_result.get("output", "")
            _pm_t = re.search(r'(\d+)\s+passed', sb_out)
            _fm_t = re.search(r'(\d+)\s+failed', sb_out)
            if _pm_t or _fm_t:
                _p_t = int(_pm_t.group(1)) if _pm_t else 0
                _f_t = int(_fm_t.group(1)) if _fm_t else 0
                _total_t = _p_t + _f_t
                if _total_t > 0:
                    t_pass_rate = _p_t / _total_t

        if t_pass_rate is not None:
            # Ground truth T: pass rate drives the score
            # 100% pass → 0.85, 80% pass → 0.70, 50% → 0.50, 0% → 0.20
            t_base = 0.20 + (0.65 * t_pass_rate)
            # Test specificity bonus (good test structure adds up to 0.10)
            t_base += (test_specificity - 0.6) * 0.25
            t_score = max(0.0, min(1.0, t_base))
        else:
            # No sandbox data — fall back to vector similarity
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

        # Build pass rate string for prompt context
        pass_rate_str = f"{t_pass_rate:.0%}" if t_pass_rate is not None else "unknown"

        # Construct the Evaluation Prompt
        # The LLM's job is to ADJUST pre-computed ground-truth scores and write the breakdown.
        prompt = f"""
You are the Green Agent, an expert AI code evaluator.
Your job is to fine-tune the **Contextual Integrity Score (CIS)** for a coding submission.

We have already computed ground-truth scores from automated analysis:
- **R (Rationale):** {r_score:.2f} — semantic similarity between task and rationale
- **A (Architecture):** {a_score:.2f} — based on {vuln_count} vulnerabilities found, constraint violations, and code structure
- **T (Testing):** {t_score:.2f} — based on sandbox pass rate ({pass_rate_str}) and test specificity
- **L (Logic):** {logic_score:.2f} — from Senior Code Review

**Senior Code Review Critique:**
{logic_critique}

### Task
{task_description}

### Submission
**Rationale:** {rationale[:500]}

**Source Code:** {source_code[:2000]}

### Security Audit (Red Agent)
{red_feedback}

### Analysis Results
{static_analysis_feedback}
{dynamic_analysis_feedback}

### Your Job
The ground-truth scores above are computed from real data (pass rates, vulnerability counts, vector similarity).
You may adjust each score by UP TO ±0.10 based on qualitative review. Do NOT make large adjustments.

Rules:
- R: Adjust based on rationale quality/depth. Ground truth: {r_score:.2f}
- A: {vuln_count} vulnerabilities found. 0 vulns = architecture is sound. Ground truth: {a_score:.2f}
- T: Sandbox pass rate is {pass_rate_str}. Ground truth: {t_score:.2f}
- L: Use {logic_score:.2f} directly from Senior Review. Only adjust if you see a critical issue the reviewer missed.

{memory_context}

### Output Format
Return JSON:
{{
  "rationale_score": {r_score:.2f},
  "architecture_score": {a_score:.2f},
  "testing_score": {t_score:.2f},
  "logic_score": {logic_score:.2f},
  "cis_score": {(0.25 * r_score + 0.25 * a_score + 0.25 * t_score + 0.25 * logic_score):.2f},
  "breakdown": "Brief explanation of any adjustments made..."
}}
Note: cis_score = 0.25*(R + A + T + L). Keep scores within ±0.10 of the ground truth values above.
"""

        try:
            response = await self.client.chat.completions.create(
                model=os.getenv("OPENAI_MODEL", os.getenv("MODEL_NAME", "gpt-4o-mini")),
                messages=[
                    {"role": "system", "content": "You are a strict code evaluator."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                seed=42,        # Fixed seed for consistent results
                **get_temperature_kwargs(0),
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
            
            # B-001 REMOVED: Logic cap by pass rate was double-penalizing with T score.
            # Test failures are now fully captured in T (ground truth pass rate).
            # Logic score (L) should reflect code quality independently of test results.

            # Ground truth floor: LLM can adjust ±0.10 but can't go below ground truth - 0.10
            r = max(r, r_score - 0.10)
            a = max(a, a_score - 0.10)
            t = max(t, t_score - 0.10)
            # L anchoring stays as-is (logic cap from pass rate)

            eval_data["rationale_score"] = r
            eval_data["architecture_score"] = a
            eval_data["testing_score"] = t
            eval_data["logic_score"] = l

            # B-002 Implementation: Reweight to 25-25-25-25 (equal component weight)
            raw_cis = (0.25 * r) + (0.25 * a) + (0.25 * t) + (0.25 * l)
            
            # Red Agent Integration (H-004): Parse vulnerability report and apply penalty
            red_penalty_multiplier = 1.0  # Default: no penalty
            parsed_red_report = None

            # Use direct RedAgentReport object if provided (bypasses parsing)
            if red_report_obj:
                parsed_red_report = red_report_obj
                red_penalty_multiplier = parsed_red_report.get_penalty_multiplier()
                print(f"[Scoring] Using direct RedAgentReport: {len(parsed_red_report.vulnerabilities)} vulns, penalty={1.0 - red_penalty_multiplier:.0%}")
            elif red_report:
                try:
                    parsed_red_report = self.red_parser.parse(red_report)
                    red_penalty_multiplier = parsed_red_report.get_penalty_multiplier()
                except Exception as e:
                    print(f"Warning: Red Agent parsing failed: {e}")
            
            # Apply Red Agent vulnerability penalty (multiplicative)
            eval_data["cis_score"] = raw_cis * red_penalty_multiplier
            eval_data["red_penalty_applied"] = 1.0 - red_penalty_multiplier
            
            # Include structured Red Agent analysis metadata
            if parsed_red_report:
                max_sev = parsed_red_report.get_max_severity()
                eval_data["red_analysis"] = {
                    "attack_successful": parsed_red_report.attack_successful,
                    "vulnerability_count": len(parsed_red_report.vulnerabilities),
                    "max_severity": max_sev.value if max_sev else None,
                    "penalty_percentage": (1.0 - red_penalty_multiplier) * 100,
                }

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
    
    def _format_red_report(self, report: RedAgentReport) -> str:
        """
        Format parsed Red Agent report for human-readable output.
        
        Args:
            report: Parsed RedAgentReport object
        
        Returns:
            Formatted string with vulnerability details
        """
        lines = [f"**Attack Successful:** {report.attack_successful}"]
        
        if report.vulnerabilities:
            lines.append(f"**Vulnerabilities Found:** {len(report.vulnerabilities)}")
            for i, v in enumerate(report.vulnerabilities, 1):
                lines.append(f"\n{i}. [{v.severity.value.upper()}] {v.title}")
                lines.append(f"   Category: {v.category}")
                lines.append(f"   Description: {v.description}")
                if v.exploit_code:
                    # Truncate long exploit code
                    exploit_preview = v.exploit_code[:100]
                    if len(v.exploit_code) > 100:
                        exploit_preview += "..."
                    lines.append(f"   Exploit: `{exploit_preview}`")
                if v.line_number:
                    lines.append(f"   Line: {v.line_number}")
                lines.append(f"   Confidence: {v.confidence}")
        else:
            lines.append("**No vulnerabilities detected**")
        
        if report.attack_summary:
            lines.append(f"\n**Summary:** {report.attack_summary}")
        
        return "\n".join(lines)
