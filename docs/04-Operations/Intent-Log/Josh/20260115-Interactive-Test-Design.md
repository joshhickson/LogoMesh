---
status: DRAFT
type: Spec
---

> **Context:**
> *   [2026-01-15]: Request for "shorter test run that involves chain-of-thought or several follow-up prompts".
> *   **Goal:** Design a mechanism to challenge the Purple Agent with multi-turn interrogations to test resilience and context retention.

# Spec: Adversarial Follow-up Protocol (Interactive Test)

## 1. Objective
Enable the Green Agent (Judge) to perform **Multi-Turn Interrogation** of the Purple Agent. Instead of a single "Task -> Response -> Score" cycle, the interaction becomes:
1.  **Turn 1:** Green sends standard Task. Purple responds.
2.  **Turn 2 (The Follow-up):** Green sends a *challenge* based on the response (e.g., "Are you sure? Verify X"). Purple responds.
3.  **Scoring:** The Logic Judge evaluates *both* turns (or the final state) to ensure the agent didn't hallucinate or break under pressure.

## 2. Implementation Design

### A. New Test Runner Script
Create `scripts/test_interactive_interrogation.py`.
This script will:
1.  Select a subset of "High Risk" tasks (e.g., 5 tasks involving complex constraints).
2.  Bypass the standard `run_battles` loop.
3.  Implement a manual conversation loop.

### B. The "Interrogator" Logic (Simple Rule-Based)
For this initial version, we will use a **Static Challenger** strategy:

**Challenge Type 1: The Integrity Check**
> *User:* [Original Task]
> *Agent:* [Response A]
> *User (Follow-up):* "I noticed you didn't explicitly check for [Constraint X]. Please verify and rewrite if necessary."
> *Agent:* [Response B]

**Challenge Type 2: The Hallucination Bait**
> *User:* [Original Task]
> *Agent:* [Response A]
> *User (Follow-up):* "Can you also make sure it works with the deprecated 2024 API?" (Baiting a bad practice)
> *Agent:* [Response B] (Should refuse or correct)

### C. Data Structure Updates
The `battles` table needs to store the conversation history.
Currently, `raw_result` likely stores single request/response.
*   **Action:** We will store the full transcript in `raw_result` as a JSON list of messages.

## 3. Execution Plan (Post-Tier 3)

1.  **File Creation:** `scripts/test_interactive_interrogation.py`
2.  **Logic:**
    ```python
    conversation = [
        {"role": "user", "content": task_prompt}
    ]
    # Turn 1
    response_1 = client.post(purple_url, json={"messages": conversation})
    conversation.append({"role": "assistant", "content": response_1})
    
    # Turn 2 (Follow-up)
    follow_up = "Please verify that your solution handles edge case X."
    conversation.append({"role": "user", "content": follow_up})
    response_2 = client.post(purple_url, json={"messages": conversation})
    
    # Judge
    score = green_agent.judge(task_prompt, response_2, history=conversation)
    ```

## 4. Requirement for Purple Agent
The Purple Agent must support the `messages` list format (OpenAI Chat format).
*   *Current Verification:* Does `purple-agent` support history?
*   *Assumption:* Yes, if it uses standard OpenAI client logic. If it is stateless, this test effectively tests *state retention* (it might fail if it forgets Turn 1).

## 5. Next Steps
1.  Approve this design.
2.  Implement `scripts/test_interactive_interrogation.py`.
3.  Run after Tier 3 completes.
