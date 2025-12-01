# Consolidated Context & Action Plan (2025-11-28)

**Status:** LIVING DOCUMENT
**Source:** Consolidated from `logs/onboarding-logs/` and `logs/technical/josh-temp/`.
**Objective:** Provide a unified view of the project's strategic intent, current status, and outstanding action items to prevent misalignment and "Contextual Debt".

---

## 1. Strategic Context (The "Why")

### 1.1. The "Strategic Pivot" (Nov 19 - Nov 27)
The project is in a transition phase. We are moving away from a purely prototype-driven approach ("build it and see") towards a **Science-First** approach ("define the math, then build").
*   **Old Plan (`RECOVERY_PLAN.md`):** Focus on fixing build errors and getting a basic simulation running.
*   **New Plan (`Recommendation-Report` & `Contextual-Discovery-Plan`):** Focus on formalizing the "Contextual Integrity Score" (CIS) as a defensible metric (Vector Embeddings + Graph Centrality).
*   **Primary Goal:** To create a "Contextual Debt" benchmark that is mathematically sound and copyrightable.

### 1.2. The "Contextual Graph" Initiative (Nov 22 - Present)
To validate the CIS concept internally, we are applying it to our own documentation.
*   **Hypothesis:** If we can graph our own docs, we can measure our own "Contextual Debt" (disconnected or "dead" knowledge).
*   **Status:** We are building the tooling (`onboarding/` server + scripts) to map, visualize, and then restructure the `docs/` and `logs/` directories.

---

## 2. Latest Census: Documentation State (Nov 28)

**Activity:** Automated Link Audit & Hardening (Phase 1-5 of `Documentation-Organization-Master-Plan.md`).

*   **Total Links Found:** ~974
*   **Explicit Links (Markdown):** ~774 (mostly external or relative).
*   **Implicit Links (Plaintext):** ~200 (Found in `Strategic-Master-Log.md` and others).
*   **Actions Taken:**
    *   `scripts/audit_links.js`: Created to detect both types.
    *   `scripts/harden_links.js`: Executed to convert 195 implicit links into explicit Markdown links (`[path](path)`).
    *   `scripts/fix_hardened_links.js`: Executed to fix formatting (removed backticks).
*   **Current State:** The `logs/20251119-Strategic-Master-Log.md` is now **fully hyperlinked and functional**. The "Dead Text" debt has been paid down.

---

## 3. Consolidated Action Items

This list merges tasks from `20251126-josh-action-items.md`, `20251123-working-log.md`, and recent onboarding logs.

### 🟢 Active / In-Progress
*   **[Documentation] Visualize the Graph:** Update the `onboarding/` web app to load and display the new `doc_graph_raw.json` data (214+ edges).
    *   *Source:* `Documentation-Organization-Master-Plan.md` (Phase 4).
    *   *Owner:* Jules/Josh.
*   **[Documentation] Restructure Folders:** Consolidate `logs/` and `docs/` based on the graph analysis.
    *   *Source:* `20251123-working-log.md`.
    *   *Status:* **BLOCKED** until Visualization is confirmed and a "Restructure Proposal" is approved.
*   **[Research] Experiment 1.3 (Composite Score):** Write a report contrasting "Composite Score" vs. BLEU/CodeBERT.
    *   *Source:* `20251126-josh-action-items.md`.
    *   *Owner:* Josh/Alaa.
*   **[Research] Literature Search:** Use Google Scholar to find similar "composite metric" papers.
    *   *Source:* `20251126-josh-action-items.md`.
    *   *Owner:* Josh.

### 🟡 Pending / Deferred
*   **[Ops] Benchmark Research:** Investigate existing benchmarks (HumanEval, SWE-bench) for adaptation.
    *   *Source:* `20251126-josh-action-items.md`.
*   **[Ops] Google Docs Folder:** Create a dedicated folder for deliverables.
    *   *Source:* `20251126-josh-action-items.md`.
*   **[Team] Assign Implementation:** Identify a builder (e.g., "Garrett") for coding tasks.
    *   *Source:* `20251126-josh-action-items.md`.

### 🔴 Contradictions & Risks
1.  **Visualization vs. Restructuring:**
    *   *Conflict:* `20251123-working-log.md` implies we should consolidate *before* visualizing? No, it says "Phased Revisionary Plan" -> "Consolidation Strategy" then "Automated Reference Updates".
    *   *Resolution:* We chose "Visualize & Harden" *first* (Option A) to ensure safety. We are now ready to plan the Restructure.
2.  **Auth0 vs. Mock:**
    *   *Risk:* The codebase mocks Auth0 (`express-oauth2-jwt-bearer`), but "Meeting 1" logs mention security is critical.
    *   *Status:* Auth0 is currently de-scoped/mocked to focus on the *Metric* (CIS) for the Dec 19 deadline.

---

## 4. Immediate Next Steps (The "What Now")

Based on the completion of the "Link Hardening", the logical path is:

1.  **Verify Visualization:** Ensure the `onboarding` server actually displays the new graph (now that we have valid data).
2.  **Draft Restructure Plan:** Create `logs/technical/josh-temp/20251128-Restructure-Proposal-CIS-Driven.md` to map the specific moves (e.g., `logs/technical/` -> `docs/Engineering/`).
3.  **Execute Move:** Move files and update links using a script (to maintain the 100% link integrity we just achieved).
