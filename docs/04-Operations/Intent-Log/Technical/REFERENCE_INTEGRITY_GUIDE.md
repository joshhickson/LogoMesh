# Reference Integrity Guide

**Purpose:** This guide defines the workflow for maintaining link integrity within the LogoMesh documentation. It serves as the manual for the "Link Integrity System" (the Reference Manifest).

## The Core Rule
**"Never move a file without updating the Manifest first."**

Contextual Debt accumulates when files are moved or renamed, and the references to them (often hidden in logs or implicit plaintext paths) are broken. We prevent this by treating our documentation links as a database.

## The Tool: Reference Manifest
The "database" is a CSV file located at:
`docs/04-Operations/Intent-Log/Technical/reference_manifest.csv`

It tracks:
- **SourceFile:** Where the link is located.
- **Line:** The line number.
- **LinkText:** The anchor text (or plaintext path).
- **RawTarget:** The path as written in the link.
- **ResolvedTarget:** The calculated absolute path from the root.
- **Status:** `OK` or `BROKEN`.

## Workflow: Moving or Renaming Files

### 1. Generate Baseline
Before making any changes, ensure the manifest is up-to-date.
```bash
node scripts/audit_links.js
```

### 2. Identify References
Open `docs/04-Operations/Intent-Log/Technical/reference_manifest.csv` (or use `grep`) to find all references to the file you intend to move.

**Example:**
If moving `docs/GAP_ANALYSIS.md`, filter the CSV for:
- `ResolvedTarget` == `docs/GAP_ANALYSIS.md`
- `RawTarget` == `GAP_ANALYSIS.md` (or other variants)

### 3. Execute the Move
Move the file using filesystem commands.
```bash
mv docs/GAP_ANALYSIS.md docs/Archive/GAP_ANALYSIS.md
```

### 4. Repair References
Go through the list of identified source files from Step 2 and update the links to point to the new location.
- **Explicit Links:** Change `[Text](../GAP_ANALYSIS.md)` to `[Text](../Archive/GAP_ANALYSIS.md)`.
- **Implicit Links:** Change "Refer to `docs/GAP_ANALYSIS.md`" to "Refer to `docs/Archive/GAP_ANALYSIS.md`".

### 5. Verify Integrity
Run the audit script again to confirm zero broken links.
```bash
node scripts/audit_links.js
```
Open the generated CSV and verify that `Status` is `OK` for all rows (or filter for `BROKEN`).

## Automated Checks
This audit script should be run as part of the pre-commit checklist to ensure no "dangling edges" are introduced into the documentation graph.
