---
status: ACTIVE
type: Guide
---
> **Context:**
> *   [2025-12-04]: Created in response to user request for instructions on operating the existing RST/Sphinx documentation setup.

# Guide: Operating the Documentation Site (Read the Docs)

This guide explains how to build and view the project's documentation locally using the existing Sphinx and reStructuredText (RST) setup.

## 1. Prerequisites

Ensure you have Python installed. You need to install the documentation dependencies:

```bash
# From the project root
pip install sphinx sphinx-rtd-theme myst-parser sphinx-design sphinxcontrib-mermaid
```

## 2. Building the Documentation

The documentation source lives in `docs/`. To build the static HTML site:

```bash
cd docs
# Run the build command
sphinx-build -b html . _build/html
```

*   **Note:** You might see warnings (e.g., "reference target not found"). These are often due to broken relative links in legacy logs. They generally do not prevent the site from building.

## 3. Viewing the Documentation

Once the build completes, you can view the site:

1.  **Locally:** Open `docs/_build/html/index.html` in your web browser.
    *   On Mac: `open docs/_build/html/index.html`
    *   On Windows: `start docs/_build/html/index.html`
    *   On Linux: `xdg-open docs/_build/html/index.html`

2.  **Navigation:**
    *   The `index.rst` file defines the main table of contents (Strategy, Architecture, Engineering, etc.).
    *   You can click through to read Markdown (`.md`) files, which are automatically rendered by the MyST parser.

## 4. Key Files

*   `docs/conf.py`: The configuration file. Controls the theme (`sphinx_rtd_theme`), extensions (Mermaid, MyST), and project metadata.
*   `docs/index.rst`: The "Homepage". Defines the structure using `.. toctree::` directives.
*   `docs/Makefile` / `docs/make.bat`: Helper scripts (you can use `make html` inside `docs/` if you have `make` installed).

## 5. Troubleshooting common issues

*   **Missing Title Warnings:** If you see "document ... doesn't have a title", ensure the file starts with a Markdown header (`# Title`).
*   **Mermaid Errors:** If diagrams don't render, ensure you have the `sphinxcontrib-mermaid` package installed.

---
**Status:** The implementation is complete. You can run the build command immediately.
