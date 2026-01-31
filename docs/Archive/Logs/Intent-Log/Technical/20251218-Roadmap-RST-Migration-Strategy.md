---
status: ACTIVE
type: Plan
---
> **Context:**
> * [2025-12-18]: Strategic roadmap for the upcoming migration to Sphinx/ReadTheDocs. Created by Jules to guide future agents.

# Roadmap: RST & ReadTheDocs Migration Strategy

**Objective:** Modernize the documentation infrastructure by migrating from a raw Markdown filesystem to a structured **Sphinx** documentation site hosted on **Read the Docs (RTD)**. This migration aims to automate "Reference Integrity," enable multi-version builds (Public vs. Private), and replace fragile legacy tooling (the `onboarding/` graph).

---

## 1. The Core Strategy: "Bridge, Don't Rewrite"

**Guidance for Future Agents:**
Do not attempt to convert 100+ Markdown files into reStructuredText (`.rst`) in a single pass. This destroys Git history, alienates developers familiar with Markdown, and is prone to conversion errors. Instead, use a hybrid approach.

### 1.1 Use MyST-Parser
Adopt **MyST-Parser** (Markedly Structured Text), a rich Sphinx extension that parses Markdown into the Sphinx internal document tree. This allows us to keep the majority of our content in `.md` while gaining the power of Sphinx directives.

*   **Action:** Install `myst-parser`.
*   **Configuration (`conf.py`):**
    ```python
    extensions = ["myst_parser"]
    source_suffix = {
        '.rst': 'restructuredtext',
        '.md': 'markdown',
    }
    ```

---

## 2. Metadata Architecture: Headers to Frontmatter

**Context:**
In Phase 1 of the Refactor, we applied "Blockquote Headers" (e.g., `> **Status:** ACTIVE`) to ensuring human readability. For Phase 2 (Sphinx), we should evolve this into machine-readable metadata.

### 2.1 Programmatic Conversion
Create a script to convert the Blockquote Headers into **YAML Frontmatter**. MyST-Parser supports standard YAML frontmatter, which can be accessed by Sphinx extensions for indexing and filtering.

*   **Transformation Logic:**
    *   *Input:*
        ```markdown
        > **Status:** ACTIVE
        > **Type:** Plan
        > **Context:**
        > * [2025-12-18]: ...
        ```
    *   *Output:*
        ```yaml
        ---
        status: ACTIVE
        type: Plan
        context_date: 2025-12-18
        context_note: "..."
        ---
        ```

### 2.2 Automated Indices
Once converted, use the `sphinx-design` or custom Jinja2 templates to automatically generate "Dynamic Indices."
*   *Example:* A page that automatically lists all documents with `type: Plan` and `status: ACTIVE`, eliminating the need to manually maintain `README.md` lists.

---

## 3. Visualizations: Replacing Legacy Artifacts

**Context:**
The `onboarding/` directory contains a custom Node.js server and D3.js visualization that is currently fragile and disconnected from the build process.

### 3.1 Adopt `sphinxcontrib-mermaid`
Replace the manual rendering of diagrams with the standard Sphinx extension.
*   **Action:** Install `sphinxcontrib-mermaid`.
*   **Benefit:** All existing Mermaid code blocks in Markdown files will be automatically rendered as PNGs or SVGs in the built documentation.

### 3.2 The "Big Graph" (Documentation Dependency Tree)
Instead of regex-parsing files to build a D3 graph (which is error-prone), generate the graph from the **Sphinx Doctree**.
*   **Strategy:** Write a small Sphinx extension (or use `sphinx.ext.graphviz`) that traverses the internal document tree after the build.
*   **Logic:** Since Sphinx already resolves all internal links (`:doc:` or `[]()`), it "knows" the perfect dependency graph. Extract this graph and render it using Graphviz or Mermaid. This guarantees the visualization is 100% accurate to the build state.

---

## 4. Quality Assurance: "Reference Integrity" via CI

**Context:**
We spent significant effort in Phase 0 repairing broken links ("Dangling Edges"). We must prevent regression.

### 4.1 Strict Link Checking
Sphinx has a built-in link checker that is far more robust than regex scripts.
*   **Configuration (`conf.py`):** Set `nitpicky = True`. This treats broken references as **Build Errors**, not warnings.
*   **CI Pipeline:**
    Add a step to `.github/workflows/ci.yml`:
    ```yaml
    - name: Docs Link Check
      run: sphinx-build -b linkcheck docs/ _build/linkcheck
    ```
*   **Outcome:** A Pull Request that breaks a link (internal or external) will fail the build, preventing the "Dangling Edge" problem from returning.

---

## 5. Security & Strategy: Public vs. Private Builds

**Context:**
The project has a "Public Good" tier (Competition Entry) and a "Commercial Strategy" tier (Copyrights, SaaS). These currently coexist in the repo, creating confusion.

### 5.1 Conditional Compilation (Tags)
Use Sphinx **Tags** to manage this separation without maintaining two repositories.

*   **Implementation:**
    Wrap sensitive sections or mark entire files using the `only` directive (supported in MyST via `{eval-rst}` block or `::: only` syntax).
    ```markdown
    ::: only private
    # Commercial Strategy
    This section discusses our SaaS pricing model...
    :::
    ```

*   **Build Targets:**
    *   **Public Build:** `sphinx-build -t public ...` (Excludes private content).
    *   **Internal Build:** `sphinx-build -t private ...` (Includes everything).

---

## 6. Execution Plan (Next Steps)

1.  **Environment Setup:**
    *   Create `docs/requirements.txt`:
        ```text
        sphinx>=7.0
        sphinx-rtd-theme
        myst-parser
        sphinxcontrib-mermaid
        ```
2.  **Initialization:**
    *   Run `sphinx-quickstart` in `docs/`.
    *   Configure `conf.py` with the extensions listed above.
3.  **Bridge Validation:**
    *   Run a test build to see how many Markdown files render correctly "out of the box."
    *   Fix relative link issues (Markdown relative links often need adjustment to work as Sphinx `:doc:` references).
4.  **Header Migration:**
    *   Develop the conversion script (Headers -> Frontmatter).
5.  **Cleanup:**
    *   Delete `onboarding/` once the Mermaid integration is verified.

---
*Created by Jules (Agent) - 2025-12-18*
