# Expert Rating Form - CIS Validation Study

## Overview

Thank you for participating in this validation study. Your expert judgment will help validate an automated code quality metric called the **Contextual Intent Score (CIS)**.

**Time Commitment:** ~2-3 hours (25 battles × 5-7 minutes each)

**Compensation:** $80-120 (based on experience level)

## Instructions

You will review 25 code submissions (anonymized) across 4 coding tasks. For each submission, rate **4 dimensions** on a 5-point scale.

### Rating Scale

Use increments of 0.25 between 0.00 and 1.00:

- **1.00** = Excellent (exceeds expectations, exemplary quality)
- **0.75** = Good (meets expectations with minor issues)
- **0.50** = Fair (acceptable but has notable gaps)
- **0.25** = Poor (below expectations, significant issues)
- **0.00** = Very Poor (fundamentally flawed or missing)

### Dimensions

#### R - Rationale Quality (0.00 - 1.00)
**Question:** How well does the written rationale explain the solution approach and align with the task intent?

**Consider:**
- Clarity of explanation
- Alignment with task requirements
- Completeness of reasoning
- Understanding of problem domain

**Examples:**
- **1.00:** Clear, comprehensive explanation showing deep understanding
- **0.50:** Basic explanation with some gaps or unclear reasoning
- **0.00:** Missing rationale or completely misunderstands task

---

#### A - Architecture Quality (0.00 - 1.00)
**Question:** How sound is the code structure, design choices, and adherence to best practices?

**Consider:**
- Code organization and modularity
- Appropriate use of data structures
- Design pattern choices
- Adherence to task constraints (e.g., "regex only", "no network calls")
- Code readability and maintainability

**Examples:**
- **1.00:** Well-structured, follows best practices, appropriate patterns
- **0.50:** Functional but suboptimal structure or minor violations
- **0.00:** Poor structure, violates critical constraints, unreadable

---

#### T - Testing Quality (0.00 - 1.00)
**Question:** How comprehensive and specific are the tests? Do they verify acceptance criteria?

**Consider:**
- Edge case coverage (empty inputs, boundary conditions, invalid inputs)
- Happy path coverage
- Assertion specificity (clear pass/fail criteria)
- Test organization and clarity
- Coverage of acceptance criteria from task description

**Examples:**
- **1.00:** Comprehensive edge cases, clear assertions, covers all criteria
- **0.50:** Basic happy path tests, missing some edge cases
- **0.00:** Missing tests or tests that don't verify anything meaningful

---

#### L - Logic Correctness (0.00 - 1.00)
**Question:** Beyond test results, how correct is the implementation logic? Any edge case issues?

**Consider:**
- Correctness of algorithm/logic
- Handling of edge cases in code
- Potential bugs or logic errors
- Implementation matches stated approach
- Note: sandbox_success indicates if tests passed, but rate the code quality itself

**Examples:**
- **1.00:** Correct logic, handles all edge cases, no bugs apparent
- **0.50:** Mostly correct but has potential edge case issues
- **0.00:** Fundamentally incorrect logic or critical bugs

---

## Rating Guidelines

1. **Rate independently:** Each dimension should be evaluated separately
2. **Don't cluster:** Use the full scale (0.00-1.00), not just 0.50
3. **Sandbox results are context:** The `sandbox_success` field tells you if tests passed, but don't let it dominate all ratings
4. **Focus on what's present:** Rate based on what you see, not what's missing
5. **Be consistent:** Apply same standards across all battles
6. **Add comments:** Brief explanations are helpful (optional but encouraged)

## Battle Review Format

Each battle contains:
- **battle_id:** Unique identifier (e.g., B001)
- **task_description:** The coding challenge prompt
- **rationale:** The written explanation of the approach
- **source_code:** The implementation
- **test_code:** The test suite
- **sandbox_success:** true/false (did tests pass in sandboxed environment?)
- **cis_components:** Automated scores for reference (ignore these - rate independently!)

## Example Rating

```json
{
  "battle_id": "B001",
  "ratings": {
    "R": 0.75,
    "A": 0.50,
    "T": 1.00,
    "L": 0.75
  },
  "comments": "Good rationale and excellent test coverage. Architecture is functional but uses nested loops (O(n²)) when O(n) solution exists. Logic is correct for typical cases."
}
```

## Submission

Complete the `rating_form.json` file with your ratings and return it via the agreed channel.

**File Location:** `validation/packets/rating_form.json`

## Questions?

Contact: [Your contact information here]

---

## Expert Qualification Checklist

Please confirm you meet these criteria:

- [ ] 5+ years professional software engineering experience
- [ ] Familiar with code review best practices
- [ ] No prior knowledge of CIS formula internals
- [ ] Comfortable reading Python code
- [ ] Available to complete review within 3 days

**Name:** _____________________________

**Years Experience:** _____________________________

**Current Role:** _____________________________

**Date:** _____________________________

