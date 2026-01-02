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

## 2. The RST & Read the Docs Migration (Jules Handoff Packet)

**Instructions for Josh:** Copy the entire block below and paste it into a new chat session with Jules (or another agent) to execute the migration.

***

### 🤖 AGENT PROMPT: Start RST Migration

**Role:** You are the Documentation Architect.
**Objective:** Migrate the current `docs/` folder (Markdown) to a Sphinx-based documentation site without breaking existing links or Git history.

**Constraints:**
1.  **Hybrid Approach:** Do NOT convert `.md` files to `.rst`. Use **MyST-Parser** to support Markdown natively.
2.  **Package Manager:** Use `pnpm` for any JS dependencies (if needed), but Sphinx is Python-based. Use `pip install` for Sphinx tools.
3.  **Reference Integrity:** Do not break existing relative links.

**Execution Plan:**

#### Phase 1: Environment Setup
1.  Create `docs/requirements.txt` with:
    ```text
    sphinx>=7.0
    sphinx-rtd-theme
    myst-parser
    sphinx-design
    sphinxcontrib-mermaid
    ```
2.  Run `pip install -r docs/requirements.txt`.
3.  Run `sphinx-quickstart docs` (Accept defaults, separate build/source directories = no).

#### Phase 2: Configuration (`docs/conf.py`)
Overwrite `docs/conf.py` with this configuration to enable MyST:

```python
import os
import sys
sys.path.insert(0, os.path.abspath('..'))

project = 'LogoMesh'
copyright = '2026, LogoMesh Team'
author = 'Josh, Deepti, Alaa, Garrett, Samuel, Kuan, Mark'

extensions = [
    'myst_parser',
    'sphinx_rtd_theme',
    'sphinx.ext.autodoc',
    'sphinx.ext.viewcode',
    'sphinx_design',
    'sphinxcontrib.mermaid'
]

# MyST Configuration
myst_enable_extensions = [
    "colon_fence",
    "deflist",
]
source_suffix = {
    '.rst': 'restructuredtext',
    '.md': 'markdown',
}

templates_path = ['_templates']
exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store', 'node_modules']

html_theme = 'sphinx_rtd_theme'
html_static_path = ['_static']
```

#### Phase 3: Metadata Migration (Headers -> Frontmatter)
Write a script `scripts/migrate_headers_to_frontmatter.js` that:
1.  Scans all `.md` files in `docs/`.
2.  Parses the "Blockquote Header" (e.g., `> **Status:** ACTIVE`).
3.  Converts it into YAML Frontmatter at the very top of the file:
    ```yaml
    ---
    status: ACTIVE
    type: Plan
    ---
    ```
4.  **Dry Run First:** Log the changes before writing.

#### Phase 4: Structure (`docs/index.rst`)
Create a root `index.rst` that maps our directory structure. Do not list every file; list the folders.

```rst
LogoMesh Documentation
======================

.. toctree::
   :maxdepth: 2
   :caption: Strategy

   00-Strategy/index
   00_CURRENT_TRUTH_SOURCE

.. toctree::
   :maxdepth: 2
   :caption: Architecture

   01-Architecture/Specs/index
   01-Architecture/Diagrams/index

.. toctree::
   :maxdepth: 2
   :caption: Engineering

   02-Engineering/Setup/index
   02-Engineering/Onboarding/index

.. toctree::
   :maxdepth: 2
   :caption: Operations & Logs

   04-Operations/Intent-Log/index
```

#### Phase 5: Build & Verify
1.  Run `sphinx-build -b html docs/ docs/_build/html`.
2.  Check for warnings (broken links will show as warnings).
3.  If successful, create a `.readthedocs.yaml` file in the root for deployment.

***

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
