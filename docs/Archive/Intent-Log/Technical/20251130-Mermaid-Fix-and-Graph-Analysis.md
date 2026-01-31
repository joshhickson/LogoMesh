---
status: SNAPSHOT
type: Log
---
> **Context:**
> * [2025-12-17]: Fix log for Mermaid graph.

# Session Log: Mermaid Diagram Fix and Graph Analysis

**Date:** November 30, 2025
**Driver:** Jules
**Topic:** Troubleshooting Onboarding Graph & Structural Analysis

## 1. Context & Issue
The user reported a "Mermaid diagram syntax error" on the `onboarding/index.html` page. This page is intended to be the "Discovery Sprint Hub," visualizing the relationships between project documents. The previous session log (`20251130-session-log-onboarding-update.md`) noted that the D3.js graph was replaced with a static Mermaid diagram, but it failed to render.

## 2. Troubleshooting & Resolution

### Root Cause Analysis
*   **Verification:** I ran the `scripts/verify_graph.py` script using Playwright. Surprisingly, it successfully detected an SVG element, suggesting the error might be intermittent or data-dependent.
*   **Code Review:** I inspected `scripts/generate_mermaid_list.js` and the raw data in `onboarding/doc_graph/doc_graph_raw.json`.
*   **Finding:** The raw JSON data contains file names with special characters (like quotes) and newlines. The original script did not sufficiently escape these characters when generating the Mermaid syntax. For example, a file named `20251118-Strategic Critique_ 'The Unknowable Code' vs. Seminal Technical Literature.md` or a prompt containing quotes could break the Mermaid parser if not handled correctly.

### The Fix
I updated `scripts/generate_mermaid_list.js` to include a robust `escapeMermaidLabel` function.
*   **Action:**
    *   Replaced double quotes (`"`) with `&quot;`.
    *   Replaced hashes (`#`) with `&#35;` to prevent them from being interpreted as comments.
    *   Stripped newlines to ensure label integrity.
*   **Outcome:** The graph was regenerated, and visual verification confirmed it renders correctly as a very large, vertical flowchart.

## 3. Structural Analysis: "Inherent Properties"
Once the graph was visible, we analyzed the "inherent properties" of the documentation structure that are not obvious from a file explorer.

### A. The "Vertical Spine" (Linearity)
*   **Observation:** The graph is forced into a massive vertical column (~9000px tall).
*   **Insight:** The documentation is currently structured more as a linear **list** or a "feed" rather than a highly interconnected web. The `scripts/generate_mermaid_list.js` explicitly enforces this by linking `Node(i)` to `Node(i+1)`. This reflects the project's current state: a chronological sequence of logs and thoughts, rather than a mature, cross-referenced wiki.

### B. Keystone Hubs (Hidden Centrality)
*   **Observation:** While most nodes form a straight line, a few nodes have a disproportionately high number of outgoing connections (fan-out).
*   **Key Hubs:**
    *   `docs/02-Engineering/Setup/Data-Scientist-Gap-Analysis.md`: Connects to schemas, specs, and status docs. This implies it is a critical "bridge" document.
    *   `docs/Archive/Legacy-Logs/20251117-Strategic-Master-Log.md` (and other Master Logs): These act as aggregators, pulling in context from many other files.
*   **Implication:** If these "Keystone" documents are outdated, the "Contextual Integrity" of the entire project suffers disproportionately.

### C. Archive Weight (Dead Weight)
*   **Observation:** A significant cluster of nodes (approx. 30%) belongs to `docs/Archive/`.
*   **Insight:** The visual weight of the archive is substantial. In a file explorer, these are hidden in a folder. In the graph, they take up massive screen real estate. This visualizes the "Contextual Debt" of the past—information that is preserved but potentially distracting or dragging down the "Recent Activity" signal.

### D. Activity Signal Saturation (The Green Wash)
*   **Observation:** Almost every node in the graph was highlighted green ("Recent Activity").
*   **Insight:** The "Recent Activity" filter is currently useless.
*   **Cause:** Bulk operations (like the link hardening scripts run in previous sessions) updated the file modification timestamps for *all* files.
*   **Conclusion:** File system timestamps are a poor proxy for "intellectual activity" in a monorepo where automated tooling is common. A true "Activity" metric would need to filter out automated commits or rely on Git history rather than `fs.stat`.

## 4. Next Steps
*   **Action Item:** Consider excluding `docs/Archive/` from the default onboarding visualization to reduce noise.
*   **Action Item:** Investigate using Git commit dates instead of file system `mtime` for the "Recent Activity" highlighter to ignore bulk refactors.
