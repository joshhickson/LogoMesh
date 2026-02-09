# Context Manager Agent Specification (The "Librarian")

**Date:** 2026-02-05
**Based on:** `docs/00-Strategy/IP/Contextual-Debt-Paper.tex`
**Role:** The Guardian of Intent / The Curator of "Why"

---

## 1. The Problem: "Context Dumping" vs. "Context Integrity"
In standard autonomous coding workflows, the agent is often given the entire repository (dumped context). This leads to **"Comprehension Debt"**:
*   The agent sees *how* the code works (syntax) but not *why* it exists (intent).
*   The agent mimics patterns without understanding constraints, leading to "locally correct but globally incoherent" changes.
*   **Contextual Debt Paper Insight:** "Contextual Debt is the liability of unknowable code."

## 2. The Context Manager Agent (CMA)
The CMA does not write code. It curates the **Decision Bill of Materials (DBOM)** *before* the Worker touches the keyboard.

### Core Responsibilities
1.  **Intent Retrieval:** Find the "Why."
    *   Search `docs/` for relevant ADRs (Architectural Decision Records).
    *   Search git history for relevant commit messages ("Why was this line added 2 years ago?").
2.  **Constraint Generation:** Define the "Bounded Context."
    *   Identify "Load-Bearing Code" (code that implements critical business logic).
    *   Explicitly forbid the Worker from touching certain files (e.g., `src/green_logic`).
3.  **Task Bundling:** Create the input for the Purple Worker.

---

## 3. Workflow: The "Glass Box Protocol"

### Step 1: Human Definition
**User:** "Upgrade the `AuthService` to use Argon2 hashing."

### Step 2: Context Manager Action (The "Archeological Dig")
The CMA analyzes the request and the repo:
1.  **Identify Targets:** `src/auth.py`, `src/users.py`.
2.  **Identify Dependencies:** `src/db.py` (callers), `src/config.py` (settings).
3.  **Identify History (The "Why"):**
    *   *Finding:* Commit `a1b2c3d` (2024) switched from SHA256 to BCrypt. Message: "BCrypt is slower, prevents GPU cracking."
    *   *Insight:* Performance is a known trade-off.
4.  **Identify Constraints:**
    *   *Constraint:* `src/legacy_api.py` depends on the old hashing format for migration.

### Step 3: DBOM Construction (The "Constraint Packet")
The CMA generates a **Task Bundle** for the Purple Worker:

```json
{
  "task": "Upgrade AuthService to Argon2",
  "files": {
    "src/auth.py": "<content>",
    "src/config.py": "<content>"
  },
  "context_graph": {
    "historical_intent": "We prioritize security over speed (see commit a1b2c3d).",
    "architectural_constraints": [
      "Do NOT break backward compatibility in `src/legacy_api.py`.",
      "Update `requirements.txt` with `argon2-cffi`."
    ]
  },
  "success_criteria": [
    "Tests in `tests/test_auth.py` must pass.",
    "New hashing must resist GPU cracking (Argon2 parameters)."
  ]
}
```

### Step 4: Purple Worker Execution
The Worker receives the Bundle. It does not need to search the whole repo. It has the *code* and the *context*.
*   It writes the code.
*   It updates the tests.

### Step 5: The Frozen Judge Verification
The Judge (LogoMesh Arena) receives the submission.
*   **CIS Calculation:**
    *   **Rationale Integrity (R):** Did the Worker respect the "historical intent" provided by the CMA?
    *   **Testing Integrity (T):** Did the Worker break the legacy API?

---

## 4. Why This Solves the "Uroboros" Problem
*   The **Context Manager** enforces *history* (Immutable Past).
*   The **Frozen Judge** enforces *correctness* (Immutable Logic).
*   The **Purple Worker** is sandwiched between them. It cannot hallucinate new rules because the CMA explicitly provided the *old* rules, and the Judge explicitly checks them.

## 5. Implementation Strategy
*   **Tooling:** Use `grep`, `git log -p`, and RAG (Vector Search) over `docs/`.
*   **Model:** High-reasoning model (e.g., GPT-4o, Claude 3.5 Sonnet) for the CMA.
*   **Output:** A standard JSON format for the "Task Bundle."

---

## 6. Open Questions & Known Gaps

### A. The Snapshot Problem (Dependencies)
If the Judge is "Frozen" (running inside an immutable container/snapshot), how does it test code that depends on the *current* state of the repository?
*   **The Conflict:** The Frozen Judge's dependencies (e.g., `src/utils.py` at commit `C-100`) may be incompatible with the Worker's submission (which assumes `C`).
*   **Current Reality:** This is an unsolved architectural gap. A "perfect" Judge would need to dynamically build a container for every submission, which introduces the risk of the Worker modifying the container itself.
*   **Mitigation:** The Judge uses a "Stage 2 Loader" that mounts the Worker's `src/` directory over the container's `src/` directory *except* for the `green_logic` folder. This is imperfect but functional for most tasks.

### B. Handling Missing Intent (Contextual Debt Detection)
What happens if `Intent Retrieval` yields zero results? (No docs, commit messages are "fix bug").
*   **Risk:** The CMA assumes no constraints exist and allows the Worker to break hidden logic.
*   **Policy:** The CMA must be a **Contextual Debt Detector**.
    *   If Intent Confidence < 0.5, the CMA **HALTS** and asks the human for clarification.
    *   *Result:* The process forces humans to "pay down debt" (write docs) before automation can proceed.

### C. Emergency Protocol: Reverse-Engineering Intent
Sometimes humans are unavailable, and the show must go on.
*   **Scenario:** Legacy code, original author gone, zero docs.
*   **Action:** The CMA activates **"Archeologist Mode"**.
    1.  It feeds the code to a high-reasoning model (O1/Claude 3.5).
    2.  Prompt: *"Analyze this code. Infer the likely business rules and constraints it enforces based on variable names, control flow, and error handling. Generate a synthetic ADR."*
    3.  **Risk:** High hallucination risk. The AI might invent a reason that isn't true.
    4.  **Safeguard:** This "Synthetic Intent" is tagged as `[CONFIDENCE: LOW]` in the DBOM and requires explicit human sign-off before the Worker can execute.
