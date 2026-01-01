> **Status:** ACTIVE
> **Type:** Plan
> **Context:**
> *   [2026-01-01]: Strategy for migrating documentation to Sphinx/RST and cleaning up the `onboarding/` directory.

# Documentation Upgrade Strategy (2026-01-01)

## Executive Summary
This document outlines the plan to upgrade the project's documentation system from raw Markdown to **Sphinx with reStructuredText (RST)** and deploy it to **Read the Docs (RTD)**. It also covers the cleanup of the legacy `onboarding/` directory and the reorganization of the `docs/` folder structure.

**Key Resource:** This plan builds upon the technical roadmap defined in [Roadmap: RST & ReadTheDocs Migration Strategy](../Technical/20251218-Roadmap-RST-Migration-Strategy.md).

---

## 1. Prerequisites & Tooling

Before starting the migration, ensure you are familiar with the "Reference Integrity" tools. We must fix links *before* we break them by moving files.

### 1.1 The Toolset
*   **Audit Links:** [scripts/audit_links.js](../../../../scripts/audit_links.js) - Scans for broken links.
*   **Move File (Safe):** [scripts/move_file_with_refs.js](../../../../scripts/move_file_with_refs.js) - Moves a file and updates references.
*   **Harden Links:** [scripts/harden_links.js](../../../../scripts/harden_links.js) - Converts implicit paths to explicit links.

### 1.2 "How to Move a File" (The Protocol)
**Warning:** Do not use `mv` directly for documentation files.

1.  **Check References:** Run the audit script to see the current state.
    ```bash
    node scripts/audit_links.js
    ```
2.  **Execute the Move:** Use the script to move the file and update its inbound links.
    ```bash
    node scripts/move_file_with_refs.js docs/OldFolder/file.md docs/NewFolder/file.md
    ```
3.  **Verify:** Check the output for any "WARNING" messages regarding complex paths and manually verify the changes.
4.  **Re-Audit:** Run `node scripts/audit_links.js` again to confirm zero broken links.

---

## 2. The RST & Read the Docs Upgrade

**Goal:** Create a professional, searchable documentation site.

### 2.1 Prompting Jules (New Session Instructions)
When starting a new session to execute this upgrade, paste the following context to Jules:

> "I am ready to execute the RST and Read the Docs migration plan.
> 1.  Refer to the roadmap in `docs/04-Operations/Intent-Log/Technical/20251218-Roadmap-RST-Migration-Strategy.md`.
> 2.  **Phase 1:** Install `sphinx`, `myst-parser`, and `sphinx-rtd-theme`. Set up the `docs/conf.py` to support both `.rst` and `.md` files (Hybrid Approach).
> 3.  **Phase 2:** Verify that the 'Blockquote Headers' in our markdown files can be parsed or migrated to YAML frontmatter as described in the roadmap.
> 4.  **Phase 3:** Create the root `index.rst` that defines the `toctree` (Table of Contents) structure, linking to our existing markdown folders.
> 5.  **Phase 4:** Setup the local build command (`make html`) and fix any immediate warnings."

### 2.2 Addressing RST Concerns
*   **"I'm worried about current link formatting":**
    *   **Solution:** We will use **MyST-Parser**. This allows us to keep 95% of our files in **Markdown**. You do *not* need to rewrite everything in RST. Standard Markdown links `[Link](file.md)` work perfectly in MyST.
    *   **The Hybrid Model:** We will only use `.rst` for the "glue" files (like `index.rst`) that require advanced Sphinx features (like toctrees). Content remains in Markdown.

---

## 3. Onboarding & File Reorganization

**Goal:** Deprecate the legacy `onboarding/` web server and integrate its content into the main docs.

### 3.1 Outstanding Plans (To Be Executed)
*   [Restructure Proposal (CIS Driven)](../Technical/20251129-Restructure-Proposal-CIS-Driven.md): Use this as the blueprint for organizing the `docs/` folder into `Strategy`, `Architecture`, `Engineering`, etc.
*   [Onboarding Update Log](../Technical/20251130-session-log-onboarding-update.md): Review this for context on the previous attempt to fix the graph.

### 3.2 Action Plan
1.  **Move Content:** Move valuable content from `onboarding/` (like diagrams or guides) into `docs/02-Engineering/Onboarding/` using the `move_file_with_refs.js` script.
2.  **Integrate Graph:** Use `sphinxcontrib-mermaid` to render the dependency graph directly in Sphinx, replacing the need for the custom `onboarding` server.
3.  **Delete Legacy:** Once verified, delete the `onboarding/` directory to remove "Dead Code."

---

## 4. Reference Integrity Check
Refer to the [Reference Integrity Guide](../Technical/REFERENCE_INTEGRITY_GUIDE.md) for the "Zero Tolerance" policy on dangling edges.

*   **Before submitting the upgrade:** You must run `node scripts/audit_links.js` and ensure the `dangling-edges.csv` file is empty.
