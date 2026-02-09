# Core Concept: Repo as a Purple Agent

**Date:** 2026-02-05
**Topic:** The "Repo as a Purple Agent" Architecture for Safe Self-Improvement
**Status:** Conceptual Draft

---

## 1. The Core Idea: "Repo as a Purple Agent"

This architecture reframes the entire software development lifecycle (SDLC) as a **Competitive Arena Game**. Instead of treating code changes as simple file edits, every proposed change is treated as a **Submission** from a "Purple Agent" (the Developer/OpenClaw) to a "Green Agent" (the Repository Guardian).

### The Players
1.  **The Frozen Judge (Stable/Old LogoMesh):**
    *   This is your existing "Green Agent" running in a container or on a separate machine.
    *   It represents the **Current Truth**. It holds the canonical definition of "What is Good Code?" through its immutable test suite and scoring logic.
    *   It is **Read-Only** to the Challenger.

2.  **The Challenger (OpenClaw as Purple):**
    *   This is the agent proposing a change (e.g., "Update `auth.py` to use Argon2").
    *   It operates in a sandbox with access to the source code but *without* authority to merge.
    *   Its goal is to win the "Game" (get the code merged) by satisfying the Judge.

3.  **The Protocol:**
    *   Instead of the agent just editing the file in place, it must present its proposed `auth.py` to the Arena as a **"Solution"** to a specific **"Task"** (e.g., "Update Auth Module").
    *   The submission format is identical to the Purple Agent API: `{ "sourceCode": "...", "rationale": "...", "testCode": "..." }`.

4.  **The Verdict:**
    *   The Frozen Judge runs its standard evaluation suite against the proposed code:
        *   **Red Agent Attack:** Can I break this new code?
        *   **Contextual Integrity Score (CIS):** Does the rationale match the code?
        *   **Regression Testing:** Do the old tests still pass?
    *   **Merge Condition:** If it passes (high CIS score, no Red Agent exploits), the code is deemed "safe" to merge.

---

## 2. Why This Solves the "Context Gap"

Standard autonomous agents struggle with "Contextual Debt" because they don't know *why* the code exists. This architecture forces them to prove they understand the context before their code is accepted.

### The "Task Bundle" as Context
To make this work, we introduce the **Context Manager Agent (CMA)** defined in `20260205-Context-Manager-Spec.md`. The CMA prepares the "Game Level" for the Challenger:

*   **Task:** "Refactor `db.py` to use connection pooling."
*   **Context:** The CMA bundles the relevant files (`db.py`, `config.py`) and historical constraints (ADRs, commit messages) into the Task definition.
*   **Win Condition:** The Challenger must submit code that not only works but *also* respects the constraints provided in the bundle.

### Example Workflow
1.  **Human:** "Fix the SQL injection in the user search."
2.  **Context Manager:** Finds `src/search.py`, sees it uses f-strings. Creates a Task: "Fix vulnerability in `src/search.py` without breaking the `SearchInterface`."
3.  **OpenClaw (Purple):** Writes a parameterized query version of `src/search.py`. Submits it to the Arena.
4.  **Frozen Judge (Green):**
    *   Runs Red Agent: Tries `' OR '1'='1`. Attack fails.
    *   Runs Logic Review: "Code uses safe parameterization."
    *   Calculates CIS: 0.92.
5.  **Result:** PR is auto-merged (or flagged for human approval).

---

## 3. Benefits of "Gamifying" Development

1.  **Objective Quality Gates:** Merges are no longer based on "looks good to me" but on **proven resilience** against the Red Agent.
2.  **Safe Autonomy:** The OpenClaw agent can be given broad goals ("Fix all P1 bugs") because the Judge prevents it from merging destructive code.
3.  **Calibration:** Every PR becomes a data point for calibrating the LogoMesh benchmark itself.
4.  **Uroboros Mitigation:** Because the Judge is "Frozen" (running a separate, trusted version of the code), the Agent cannot rewrite the rules to win the game.

## 4. Conclusion

By treating the "Repo as a Purple Agent," we transform the chaotic process of software engineering into a structured, measurable game. The **Context Manager** sets the rules, the **OpenClaw** plays the round, and the **Frozen Judge** keeps score.
