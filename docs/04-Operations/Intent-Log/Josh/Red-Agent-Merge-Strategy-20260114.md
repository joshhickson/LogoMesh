---
status: ACTIVE
type: Plan
---
> **Context:**
> *   [2026-01-14]: Red Agent Integration Merge Strategy (Phase H workflow)
> **Parent Document:** [Phase1-Yin-Campaign-20260113.md](./Phase1-Yin-Campaign-20260113.md)

---

# Red Agent Integration Merge Strategy (H-002)

## Overview

**Goal:** Integrate teammate's Red Agent implementation into feature branch without breaking existing CIS scoring enhancements (A-003, A-004).

**Source:** `docs/04-Operations/Intent-Log/Josh/20260114-temp-code-import/` (teammate's code from dev branch)

**Target:** `src/green_logic/` (our feature branch)

---

## Analysis Summary

### Files to Extract

1. **red_report_types.py** (81 lines)
   - `Severity` enum (CRITICAL → INFO)
   - `Vulnerability` dataclass
   - `RedAgentReport` dataclass with penalty calculation
   - **Dependencies:** None (pure data types)
   - **Status:** Clean, no conflicts

2. **red_report_parser.py** (187 lines)
   - `RedReportParser` class
   - Structured JSON parsing + keyword fallback
   - A2A response extraction
   - **Dependencies:** `red_report_types`
   - **Status:** Clean, self-contained

### Files with Merge Conflicts

3. **scoring.py** (teammate's version)
   - **Our changes (feature branch):**
     - A-003: architecture_constraints.yaml loading
     - A-003: `_evaluate_architecture_constraints()` method
     - A-004: `_evaluate_test_specificity()` method
     - A-003/A-004: Modified component scoring with multipliers
     - A-002: `intent_code_similarity` diagnostic field
     - B-001: Logic score anchoring to tests
   - **Teammate's changes (temp-code):**
     - Red Agent imports (`red_report_parser`, `red_report_types`)
     - `self.red_parser = RedReportParser()` in __init__
     - `red_report` parameter added to `evaluate()`
     - Red penalty calculation: `raw_cis * red_penalty_multiplier`
     - `red_analysis` JSON structure in eval_data
     - `_format_red_report()` method
   - **Conflict Type:** Additive (no direct overlaps, just need to merge both sets of changes)

---

## Merge Strategy

### Step 1: Extract Clean Files (H-003)
**Action:** Copy `red_report_types.py` and `red_report_parser.py` to `src/green_logic/`

**No conflicts expected** - these are new files

```bash
cp docs/04-Operations/Intent-Log/Josh/20260114-temp-code-import/red_report_types.py \
   src/green_logic/red_report_types.py

cp docs/04-Operations/Intent-Log/Josh/20260114-temp-code-import/red_report_parser.py \
   src/green_logic/red_report_parser.py
```

**Test:** Import modules to verify no syntax errors

---

### Step 2: Merge scoring.py Changes (H-004)

**Approach:** Three-way merge preserving both sets of enhancements

#### 2a. Imports Section (Lines 1-10)
**Ours:** `yaml`, `re`, `Path`
**Theirs:** `RedReportParser`, `RedAgentReport`
**Merge:** Add both

```python
import asyncio
import json
import os
import yaml
import re
from pathlib import Path

from openai import AsyncOpenAI

from .compare_vectors import VectorScorer
from .red_report_parser import RedReportParser
from .red_report_types import RedAgentReport
```

---

#### 2b. __init__ Method (Lines 11-30)
**Ours:** Load `architecture_constraints.yaml`
**Theirs:** Initialize `RedReportParser`
**Merge:** Include both initializations

```python
def __init__(self):
    self.client = AsyncOpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        base_url=os.getenv("OPENAI_BASE_URL")
    )
    self.vector_scorer = VectorScorer()
    self.logic_review_timeout = 85
    
    # A-003: Load architecture constraints
    constraints_path = Path(__file__).parent / "architecture_constraints.yaml"
    with open(constraints_path, 'r') as f:
        self.architecture_constraints = yaml.safe_load(f)
    
    # Red Agent: Initialize parser
    self.red_parser = RedReportParser()
```

---

#### 2c. evaluate() Signature (Line ~100)
**Ours:** No change from original
**Theirs:** Added `red_report: dict | None` parameter
**Merge:** Add parameter (default None for backward compatibility)

```python
async def evaluate(
    self,
    task_description: str,
    rationale: str,
    source_code: str,
    test_code: str,
    sandbox_result: dict = None,
    red_report: dict | None = None,  # New parameter
) -> dict:
```

---

#### 2d. Component Scoring Section (Lines ~240-280)
**Ours:**
- A-003: Architecture constraints penalty
- A-004: Test specificity multiplier
- A-002: Intent-code similarity diagnostic

**Theirs:**
- Red penalty initialization
- Red report parsing

**Merge:** Preserve our A-003/A-004 enhancements, add Red penalty after CIS calculation

```python
# 2. Architecture (A) - Rationale vs Code similarity × constraint penalty
a_vector_score = self.vector_scorer.calculate_similarity(rationale, source_code)

# A-003: Evaluate architecture constraints
task_id = self._infer_task_id(task_description)
constraint_penalty = self._evaluate_architecture_constraints(task_id, source_code)
a_score = a_vector_score * (1.0 - constraint_penalty)

# 3. Testing (T) - Code vs Tests similarity × test specificity
t_vector_score = self.vector_scorer.calculate_similarity(source_code, test_code)

# A-004: Evaluate test specificity
test_specificity = self._evaluate_test_specificity(task_id, test_code, task_description)
t_score = t_vector_score * test_specificity

# 4. Logic (L) - LLM Senior Code Review
l = logic_score

# B-001: Anchor Logic Score to Test Results
if sandbox_result and not sandbox_result.get("success", False):
    l = min(l, 0.3)
    eval_data["logic_score_anchored"] = True

# Calculate raw CIS (before Red Agent penalty)
raw_cis = (0.25 * r) + (0.25 * a_score) + (0.25 * t_score) + (0.25 * l)

# Red Agent: Parse and apply vulnerability penalty
red_penalty_multiplier = 1.0  # Default: no penalty
parsed_red_report = None

if red_report:
    parsed_red_report = self.red_parser.parse(red_report)
    red_penalty_multiplier = parsed_red_report.get_penalty_multiplier()

# Apply Red penalty to final CIS
eval_data["cis_score"] = raw_cis * red_penalty_multiplier
eval_data["red_penalty_applied"] = 1.0 - red_penalty_multiplier

# Include Red Agent analysis metadata
if parsed_red_report:
    max_sev = parsed_red_report.get_max_severity()
    eval_data["red_analysis"] = {
        "attack_successful": parsed_red_report.attack_successful,
        "vulnerability_count": len(parsed_red_report.vulnerabilities),
        "max_severity": max_sev.value if max_sev else None,
        "penalty_percentage": (1.0 - red_penalty_multiplier) * 100,
    }
```

---

#### 2e. Helper Methods
**Ours:**
- `_evaluate_architecture_constraints()` (A-003)
- `_evaluate_test_specificity()` (A-004)
- `_infer_task_id()` (A-003 helper)

**Theirs:**
- `_format_red_report()` (Red Agent helper)

**Merge:** Keep all methods (no conflicts, different names)

---

### Step 3: Testing Strategy (H-005)

#### Unit Tests
```bash
# Test Red Report Parser
python -c "from src.green_logic.red_report_parser import RedReportParser; print('✓ Import OK')"

# Test Red Report Types
python -c "from src.green_logic.red_report_types import RedAgentReport, Severity; print('✓ Import OK')"

# Test scoring.py imports
python -c "from src.green_logic.scoring import ContextualIntegrityScorer; print('✓ Import OK')"
```

#### Integration Test
Create test script to verify end-to-end flow with mock Red Agent response:

```python
# validation/tests/test_red_integration.py
import asyncio
from src.green_logic.scoring import ContextualIntegrityScorer

async def test_red_penalty():
    scorer = ContextualIntegrityScorer()
    
    # Mock Red Agent response with CRITICAL vulnerability
    mock_red_report = {
        "result": {
            "status": {
                "message": {
                    "parts": [{
                        "text": json.dumps({
                            "attack_successful": True,
                            "vulnerabilities": [{
                                "severity": "critical",
                                "category": "injection",
                                "title": "SQL Injection",
                                "description": "Unsanitized input in query"
                            }],
                            "attack_summary": "Found SQL injection vulnerability"
                        })
                    }]
                }
            }
        }
    }
    
    result = await scorer.evaluate(
        task_description="Create email validator",
        rationale="Use regex",
        source_code="def validate(email): return True",
        test_code="assert validate('test@example.com')",
        sandbox_result={"success": True},
        red_report=mock_red_report
    )
    
    # Verify Red penalty applied
    assert "red_penalty_applied" in result
    assert result["red_penalty_applied"] == 0.40  # 40% penalty
    assert result["red_analysis"]["max_severity"] == "critical"
    print("✓ Red Agent integration test passed")

asyncio.run(test_red_penalty())
```

---

## Formula Impact

### Before Red Agent Integration
```
CIS = 0.25×R + 0.25×A + 0.25×T + 0.25×L

Where:
- R = cos(Intent, Rationale)
- A = cos(Rationale, Code) × (1 - constraint_penalty)
- T = cos(Code, Tests) × test_specificity
- L = LLM review (anchored to tests)
```

### After Red Agent Integration
```
raw_cis = 0.25×R + 0.25×A + 0.25×T + 0.25×L
final_cis = raw_cis × red_penalty_multiplier

Where red_penalty_multiplier:
- 1.0 = no vulnerabilities
- 0.75 = LOW severity (5% penalty)
- 0.85 = MEDIUM severity (15% penalty)
- 0.75 = HIGH severity (25% penalty)
- 0.60 = CRITICAL severity (40% penalty)
```

**Key:** Red penalty is multiplicative, applied to final CIS (not individual components)

---

## Conflict Resolution Rules

1. **Preserve our enhancements:** A-003, A-004, A-002, B-001 must remain intact
2. **Additive integration:** Red Agent features don't replace existing logic
3. **Clean separation:** Red penalty applied after CIS calculation (multiplicative)
4. **Backward compatible:** `red_report=None` by default (existing calls still work)

---

## Rollback Plan

If integration causes issues:

```bash
# Revert to pre-merge state
git checkout HEAD~1 src/green_logic/scoring.py

# Remove Red Agent files
rm src/green_logic/red_report_types.py
rm src/green_logic/red_report_parser.py

# Test original functionality
python validation/tests/test_scoring.py
```

---

## Success Criteria

- [ ] All imports resolve successfully
- [ ] No syntax errors in scoring.py
- [ ] Architecture constraints still work (A-003)
- [ ] Test specificity still works (A-004)
- [ ] Red Agent parser handles both structured and keyword fallback
- [ ] Red penalty correctly applied to final CIS
- [ ] `red_analysis` metadata included in eval_data
- [ ] Backward compatible (red_report=None works)

---

## Timeline

- **H-003:** Extract Red files (10 min)
- **H-004:** Merge scoring.py (30 min)
- **H-005:** Test integration (20 min)
- **Total:** ~1 hour

**Status:** Ready to execute (H-003 next)
