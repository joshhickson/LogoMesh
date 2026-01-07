---
status: ACTIVE
type: Guide
---
> **Context:**
> *   [2026-01-03]: Standard Operating Procedure for creating and managing documentation in the new Sphinx system.

# Documentation Management Instruction Manual

## 1. Overview
The LogoMesh documentation is now powered by **Sphinx** and **Read the Docs**. We use the **MyST-Parser**, which allows us to write documentation in standard Markdown (`.md`) while enjoying the power of reStructuredText (`.rst`).

## 2. Creating New Documents

### 2.1 File Location
Place new files in the appropriate subdirectory within `docs/`.
*   **Strategy:** `docs/00-Strategy/`
*   **Architecture:** `docs/01-Architecture/`
*   **Engineering:** `docs/02-Engineering/`
*   **Operations/Logs:** `docs/04-Operations/Intent-Log/`

### 2.2 Naming Convention
*   Use `kebab-case` for filenames (e.g., `my-new-feature.md`).
*   For logs, prefix with the date: `YYYYMMDD-Log-Title.md`.

### 2.3 Required Frontmatter
**Crucial:** All Markdown files must start with YAML Frontmatter defining their `status` and `type`. The old blockquote header style is deprecated.

**Template:**
```yaml
---
status: ACTIVE  # Options: ACTIVE, DRAFT, REVIEW, SNAPSHOT, DEPRECATED
type: Plan      # Options: Plan, Spec, Log, Guide, Research
---
```

### 2.4 Content Structure
*   Use standard Markdown.
*   Sphinx Directives (like `.. note::` or `.. toctree::`) can be used within Markdown using the MyST syntax (backticks and curly braces), or standard rst-style directives if needed.
*   **Mermaid:** Use standard code blocks with the `mermaid` language identifier.

## 3. Managing Navigation

### 3.1 Automatic Discovery
We utilize **glob patterns** in our `index.rst` files. This means:
*   **You do NOT need to manually add files to an index.**
*   Simply saving a file in a folder (e.g., `docs/00-Strategy/Business/`) will automatically add it to the documentation tree upon the next build.

### 3.2 Adding New Folders
If you create a new *folder* that isn't covered by an existing `index.rst`:
1.  Create an `index.rst` file inside that folder.
2.  Add the `toctree` directive with `:glob:`:
    ```rst
    Folder Name
    ===========

    .. toctree::
       :maxdepth: 1
       :glob:

       *
    ```
3.  Add a reference to this new folder in the *parent* directory's `index.rst`.

## 4. Building Locally

To preview your changes before pushing:

1.  **Activate Environment:** Ensure you have the python dependencies installed.
    ```bash
    pip install -r docs/requirements.txt
    ```
2.  **Build:** Run the build command from the root directory.
    ```bash
    sphinx-build -b html docs/ docs/_build/html
    ```
3.  **View:** Open `docs/_build/html/index.html` in your browser.

## 5. Troubleshooting
*   **Missing from Nav:** Ensure the file has a proper `.md` extension and is located in a folder included by a parent `index.rst`.
*   **Broken Links:** Run `node scripts/audit_links.js` to scan for broken relative links.

## 6. Maintaining the Source of Truth
To ensure `docs/00_CURRENT_TRUTH_SOURCE.md` remains accurate, you must regularly identify the most recent documentation.

### 6.1 Using the List Recent Docs Tool
We have provided a script to list all dated documents in the `docs/` directory, sorted by recency.

1.  **Run the script:**
    ```bash
    node scripts/list_recent_docs.js
    ```
2.  **Analyze the Output:** The script outputs a list of files starting with the most recent `YYYYMMDD` prefix.
3.  **Update Truth Source:** Use this list to identify new plans, logs, or specs that should be referenced or indexed in `00_CURRENT_TRUTH_SOURCE.md`.
