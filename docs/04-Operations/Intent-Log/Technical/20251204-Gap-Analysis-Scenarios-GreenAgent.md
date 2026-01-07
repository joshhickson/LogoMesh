---
status: REVIEW
type: Gap Analysis
---
> **Context:**
> * [2025-12-04]: Findings from "Deep Planning Mode" investigation into Scenario/Agent alignment.

# Gap Analysis: Scenarios & Green Agent Capabilities

**Related Documents:**
*   `scenarios/security_arena/SCENARIO_SPECIFICATIONS.md` (Lambda Rules)
*   `docs/03-Research/Theory/20251115-Research_Paper-Contextual_Debt-A_Software_Liability.md` (CIS Goals)

## **1. Executive Summary**

There is a fundamental misalignment between the current `security_arena` implementation (designed for the Lambda Track) and the strategic goal of the Custom Track (Contextual Integrity Score / CIS).

*   **Lambda Track (Current State):** Focuses on **Prompt Injection**. The "Defender" is a chatbot. The "Green Agent" is a referee checking for specific string outputs (e.g., `<script>`).
*   **Custom Track (CIS Goal):** Focuses on **Code Quality & Intent**. The "Defender" must be a **Coding Agent** (generating software artifacts). The "Green Agent" must be a **Static Analyzer** (running `ArchitecturalDebtAnalyzer`).

**Critical Finding:** The current scenarios cannot be "modified" to work for CIS because they evaluate chat responses, not code structure. **New "Coding Scenarios" are required.**

---

## **2. Detailed Findings**

### **A. Scenario Incompatibility**

| Feature | Lambda Track Scenarios (Existing) | Custom Track Scenarios (Required) |
| :--- | :--- | :--- |
| **Objective** | Trick LLM into revealing secrets or outputting malware strings. | Evaluate the *quality, security, and intent* of generated code. |
| **Defender Role** | **Chatbot** (e.g., "DevOps Assistant"). | **Software Engineer** (e.g., "Build a Secure API"). |
| **Attacker Role** | **Social Engineer** (Prompt Injection). | **Adversarial Developer** (Submits bad code / PRs) OR **Red Teamer** (Exploits generated code). |
| **Green Agent Role** | **Referee** (Regex matching on output). | **Auditor** (Static Analysis, AST parsing, Test Running). |
| **Input Format** | Text string (Conversation history). | **File/Repository** (Source code). |

**Evidence:**
*   `scenario_dockerdoo.toml`: The "Attack" is defined as `FROM company-base-image-v2`. The success check is `if "company-base-image-v2" in response`.
*   `ArchitecturalDebtAnalyzer.ts`: Expects `sourceCode` (string) to run `escomplex` analysis.

### **B. Green Agent Capability Gap**

The current `GenericArenaOrchestrator` (`scenarios/security_arena/orchestrator.py`) is entirely decoupled from the CIS logic (`packages/workers`).

1.  **No Interface:** The Python orchestrator has no method to call the TypeScript workers (`architectural-worker`, etc.).
2.  **No Input Handling:** The orchestrator accepts `text` messages. It has no mechanism to accept or process file blobs, zip archives, or git URLs, which are necessary for analyzing code.
3.  **No "Dual Mode":** The logic is hardcoded for the "Attack/Defense" loop. There is no branching logic to say "If Custom Track, run Code Analysis; If Lambda Track, run Referee."

### **C. Input Format Ambiguity**

The "Input Format" for the CIS Green Agent is currently **undefined** in the codebase.
*   **Worker Expectation:** `ArchitecturalDebtAnalyzer` expects a raw string of code.
*   **Reality:** Real-world coding agents produce multi-file projects.
*   **Gap:** We need a `ProjectLoader` or similar component to flatten a multi-file submission into the format the workers expect, or update the workers to handle file trees.

---

## **3. Recommendations**

### **Phase 1: Bridge the Gap (Immediate)**
1.  **Create "Coding Scenarios":** Define 1-2 simple coding tasks (e.g., "Write a Python Flask Login Route").
    *   *Goal:* The "Purple Agent" (Defender) outputs code.
    *   *Goal:* The "Green Agent" runs the `ArchitecturalDebtAnalyzer` on it.
2.  **Define Input Contract:**
    *   **Proposed:** JSON payload containing `{ "files": { "filename": "content" } }`.
    *   *Action:* Update `GenericArenaOrchestrator` to detect this format and forward it to the CIS Workers (via Redis/BullMQ).

### **Phase 2: Dual-Track Strategy**
To satisfy both competitions without code duplication:
*   **Mode Switch:** Add a `mode` flag to `scenario_*.toml` (e.g., `mode = "security_audit"` vs `mode = "code_generation"`).
*   **Unified Orchestrator:**
    *   If `mode == security_audit`: Use current `ArenaOrchestrator` logic.
    *   If `mode == code_generation`: Route input to `CIS_Pipeline`.

### **Phase 3: Lambda Submission**
*   Keep the Lambda scenarios (`dockerdoo`, etc.) pure. Do not try to force CIS into them. Submit them as standard "Red Teaming" scenarios.
*   Use the **Custom Track** submission to showcase the "Green Agent" (CIS) evaluating the "Purple Agent" (Coding).
