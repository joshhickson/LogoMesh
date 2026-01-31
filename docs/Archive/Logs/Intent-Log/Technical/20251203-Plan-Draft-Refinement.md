---
status: SNAPSHOT
type: Log
---
> **Context:**
> * [2025-12-17]: Drafting session log.

# Plan Draft: Reference Integrity & Documentation Clean-Up

## Overview
This plan addresses the need for a revised Contextual Discovery Plan, improved link integrity management, and general repository organization. It aims to prevent "Contextual Debt" by ensuring all references remain valid and accessible.

## 1. Contextual Discovery Plan Revision
**Goal:** Transform `docs/04-Operations/Intent-Log/Technical/20251127-Contextual-Discovery-Plan-Revision.md` into a usable "Dashboard/Map" for the team.

**Changes:**
- **Structure:** Convert text lists into a clear Markdown Table.
- **Columns:** `ID | Track/Task | Assignee | Status | Context (Back) | Work (Forward)`
- **Assignee Updates:**
  - Hadiza -> `OPEN` (Role: Safety Architect)
  - Others -> Mark as `Pending Confirmation`
- **Navigation:**
  - "Back" links to strategic context (e.g., `Strategic-Pivot-Plan`).
  - "Forward" links to the workspace (e.g., `packages/workers/` or new spec files).

## 2. Link Integrity System ("The Database")
**Goal:** Create a "small database like a csv file" to sustain link integrity and prevent reference rot.

**Solution:** **The Reference Manifest**
- **Tool:** We will use a dedicated script (based on `scripts/audit_links.js`) to generate a `reference_manifest.csv`.
- **Location:** `docs/04-Operations/Intent-Log/Technical/reference_manifest.csv`
- **Workflow Instructions:**
  1.  **Before Moving Files:** Run `npm run audit-links` to update the manifest.
  2.  **Move Files:** Execute the file move.
  3.  **Repair:** Use the manifest to find all references (SourceFile, Line) to the moved file and update them.
  4.  **Verify:** Run `npm run audit-links` again to confirm 0 BROKEN links.

**Action:**
- Create/Update `scripts/audit_links.js` to output to a standardized location.
- Add `docs/04-Operations/Intent-Log/Technical/REFERENCE_INTEGRITY_GUIDE.md` with the instructions above.

## 3. Repository Clean-Up
**Goal:** Archive outdated files and remove clutter.

**Actions:**
1.  **Archive `GAP_ANALYSIS.md`:**
    - Move `docs/GAP_ANALYSIS.md` -> `docs/Archive/GAP_ANALYSIS.md`.
    - **Critical:** Update all existing links (verified via `grep` to exist in `Project_Status.md` and logs) to point to the new location (or add "Outdated" label).
2.  **Delete `preserved-docs-logs/`:**
    - `rm -rf preserved-docs-logs/` (Confirmed).
3.  **Root Review:**
    - Check `docs/20251102-AgentX...` and `docs/20251115-Research...`. If they are duplicates of files in `docs/00-Strategy` or `docs/03-Research`, they will be archived or deleted.

## 4. Execution Steps
1.  **Create Guide:** Write `docs/04-Operations/Intent-Log/Technical/REFERENCE_INTEGRITY_GUIDE.md`.
2.  **Generate Baseline:** Run link audit to create the initial CSV database.
3.  **Refactor Plan:** Overwrite `20251127-Contextual-Discovery-Plan-Revision.md` with the new Dashboard format.
4.  **Move & Repair:**
    - Move `GAP_ANALYSIS.md`.
    - Update references.
5.  **Clean Up:** Delete `preserved-docs-logs`.
