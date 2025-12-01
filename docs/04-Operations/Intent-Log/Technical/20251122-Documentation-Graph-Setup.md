# Log: Documentation Graph Setup

**Date:** November 22, 2025

This log details the setup of the foundational files for creating a knowledge graph of the project's documentation. The goal is to represent the documentation structure and its contextual relationships using graph theory.

## Summary of Actions

1.  **Directory Creation:** A new directory was created at `onboarding/doc_graph/` to house the documentation graph assets. This keeps the graph files organized and accessible for integration with the onboarding website.

    ```bash
    mkdir -p onboarding/doc_graph
    ```

2.  **File Migration:** The core graph definition files, previously generated in the `docs/` directory, were moved to the new `onboarding/doc_graph/` directory.

    *   `docs/documentation_graph.md` -> `onboarding/doc_graph/documentation_graph.md`
    *   `docs/documentation_graph.json` -> `onboarding/doc_graph/documentation_graph.json`

    ```bash
    mv docs/documentation_graph.md onboarding/doc_graph/
    mv docs/documentation_graph.json onboarding/doc_graph/
    ```

3.  **Graph Edge Initialization:** The primary graph data file, `onboarding/doc_graph/documentation_graph.json`, was updated to include a foundational `edges` array. This array is designed to store the contextual relationships (edges) between the documentation files (nodes).

    A template with four example edges was added to demonstrate how to define relationships such as "summarizes," "visualizes," "refines," and "revises." Each edge includes a `source`, `target`, `label`, and `weight` to capture the nature and strength of the connection.

    **Added `edges` structure:**
    ```json
      "edges": [
        {
          "source": "logs/20251121-LogoMesh-Onboarding-Meeting-2-Summary.md",
          "target": "../../../Archive/Unsorted/20251121-LogoMesh-Meeting-2.srt",
          "label": "summarizes",
          "weight": 0.9
        },
        {
          "source": "onboarding/index.html",
          "target": "[../../../Archive/Unsorted/20251119-Strategic-Master-Log.md](../../../Archive/Unsorted/20251119-Strategic-Master-Log.md)",
          "label": "visualizes",
          "weight": 0.8
        },
        {
          "source": "[../../../00-Strategy/Business/20251118-Strategic-Pivot-Plan-CIS-Formalization.md](../../../00-Strategy/Business/20251118-Strategic-Pivot-Plan-CIS-Formalization.md)",
          "target": "[docs/CONTEXTUAL_DEBT_SPEC.md](docs/CONTEXTUAL_DEBT_SPEC.md)",
          "label": "refines",
          "weight": 0.7
        },
        {
          "source": "[../../../00-Strategy/IP/20251118-Copyright-Edition-Contextual-Debt-Paper.md](../../../00-Strategy/IP/20251118-Copyright-Edition-Contextual-Debt-Paper.md)",
          "target": "docs/strategy_and_ip/20251115-Research_Paper-Contextual_Debt-A_Software_Liability.md",
          "label": "revises",
          "weight": 0.9
        }
      ]
    ```

## Next Steps

The foundational graph structure is now in place. The next phase involves:
1.  Collaboratively populating the `edges` array with more relationships.
2.  Integrating a graph visualization library (e.g., D3.js, Vis.js) into the `onboarding/index.html` site to render the graph from `documentation_graph.json`.

## Update: November 22, 2025

Further progress has been made to expand and visualize the knowledge graphs.

1.  **Log File Graph:** A separate knowledge graph was created specifically for the `logs` directory to analyze relationships between log files.
    *   `onboarding/log_graph/logs_graph.md`: Contains the file tree of the `logs` directory.
    *   `onboarding/log_graph/logs_graph.json`: Contains the node and edge data for the log graph. Example edges were added to demonstrate relationships like "summarizes" and "references".

2.  **Graph Visualization:** The main onboarding page, `onboarding/index.html`, has been updated to display the knowledge graphs.
    *   **D3.js Integration:** The D3.js library was added to render the graph data.
    *   **Interactive Graphs:** Two interactive, force-directed graphs are now rendered on the page, one for the documentation graph and one for the logs graph. This provides a visual and interactive way to explore the relationships between files.

## Next Steps: Serving and Security

With the visualization in place, the next priority is to make the onboarding site securely accessible to the team.

1.  **Lightweight Directory Serving:** Plan and implement a lightweight, local web server to serve the `onboarding` directory. This is necessary for the browser to correctly load the graph data from the JSON files via `fetch` requests.
2.  **Security Considerations:** The serving solution must be carefully configured to **only** expose the `onboarding` directory. The repository contains sensitive source code, configuration files, and intellectual property in other directories (`packages/`, `docs/strategy_and_ip/`, etc.) that must not be accessible via the web server.
3.  **Recommended Tools:**
    *   **Node.js:** Use a simple package like `http-server` or `serve` with a command explicitly pointing to the `onboarding` directory (e.g., `npx serve onboarding`).
    *   **Python:** Use Python's built-in `http.server` module, ensuring the command is run from within the `onboarding` directory itself (e.g., `cd onboarding && python -m http.server`).
4.  **Documentation:** Document the chosen method and provide clear instructions in `onboarding/[README.md](../../../../README.md)` for team members to start the server.

## Update: November 22, 2025 (Part 2)

To provide a robust and secure way to view the onboarding site, a self-contained Node.js server has been implemented directly within the `onboarding` directory.

1.  **Self-Contained Server:**
    *   A `package.json` and `server.js` file were created in the `onboarding` directory.
    *   The server uses `express` to serve static files and is explicitly configured to **only** serve content from the `onboarding` directory, preventing access to any other part of the repository.

2.  **Localized Dependencies:**
    *   The `express` dependency was installed locally within the `onboarding` directory, creating an `onboarding/node_modules` folder. This isolates the site's dependencies from the main project.

3.  **Updated Documentation:**
    *   **`onboarding/[README.md](../../../../README.md)`:** This file was updated with detailed instructions on how to install dependencies (`pnpm install`) and run the local server (`pnpm start`).
    *   **Root [README.md](../../../../README.md):** A prominent note was added to the top of the main project [README.md](../../../../README.md), directing new users to start in the `onboarding` directory for a guided experience.

This completes the setup of a secure, documented, and easy-to-use system for accessing the interactive onboarding documentation.
