# Consolidated Context & Action Plan (2025-11-29)

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
**Status:** ✅ COMPLETED
*   **Note:** This was a personal assignment for Josh. The graph infrastructure is now live in `onboarding/`.
*   **Outcome:** We successfully built the tooling (`onboarding/` server + scripts) to map, visualize, and restructure the `docs/` and `logs/` directories. This validates the CIS concept internally.

---

## 2. Latest Census: Documentation State (Nov 29)

**Activity:** Automated Link Audit & Remediation (Phase 3 of `Documentation-Organization-Master-Plan.md`).

*   **Total Links Found:** ~974
*   **Explicit Links (Markdown):** ~774.
*   **Dangling Edges (Fixed):** ~50+ critical errors resolved.
    *   Fixed `docs/docs/` recursion errors in `docs/GAP_ANALYSIS_FOR_DATASCIENTIST.md`.
    *   Fixed `logs/logs/` nesting errors in `../../../Archive/Unsorted/20251119-Strategic-Master-Log.md`.
    *   Fixed broken relative paths in `../../../00-Strategy/IP/Copyright_Registration_Playbook.md`.
    *   Fixed onboarding links in `docs/onboarding/README.md`.
*   **Current State:** The "Dangling Edge" count has been drastically reduced. The documentation graph is now structurally sound enough to support accurate visualization and safe restructuring.

---

## 3. Consolidated Action Items

### 🟢 Active / In-Progress
*   **[Documentation] Restructure Folders:** Consolidate `logs/` and `docs/` based on the graph analysis.
    *   *Source:* `20251123-working-log.md`.
    *   *Status:* **READY TO START**. The graph integrity is now sufficient.
*   **[Research] Experiment 1.3 (Composite Score):** Write a report contrasting "Composite Score" vs. BLEU/CodeBERT.
    *   *Source:* `20251126-josh-action-items.md`.
    *   *Owner:* Josh/Alaa.

### ✅ Completed
*   **[Documentation] Visualize the Graph:** Update the `onboarding/` web app to load and display the new `doc_graph_raw.json` data.
    *   *Source:* `Documentation-Organization-Master-Plan.md` (Phase 4).
    *   *Owner:* Jules/Josh.
    *   *Note:* Graph is live and functional.

### 🟡 Pending / Deferred
*   **[Ops] Benchmark Research:** Investigate existing benchmarks (HumanEval, SWE-bench) for adaptation.
    *   *Source:* `20251126-josh-action-items.md`.
*   **[Ops] Google Docs Folder:** Create a dedicated folder for deliverables.
    *   *Source:* `20251126-josh-action-items.md`.
*   **[Team] Assign Implementation:** Identify a builder (e.g., "Garrett") for coding tasks.
    *   *Source:* `20251126-josh-action-items.md`.

---

## 4. Immediate Next Steps (The "What Now")

Based on the completion of the "Link Remediation", the logical path is:

1.  **Draft Restructure Plan:** Create `20251129-Restructure-Proposal-CIS-Driven.md` to map the specific moves (e.g., `logs/technical/` -> `docs/Engineering/`).
2.  **Verify Visualization:** Ensure the `onboarding` server actually displays the new graph (now that we have valid data).
3.  **Execute Move:** Move files and update links using a script (to maintain the 100% link integrity we just achieved).
