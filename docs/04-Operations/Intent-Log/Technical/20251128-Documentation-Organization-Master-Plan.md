> **Status:** ACTIVE
> **Type:** Plan
> **Context:**
> * [2025-12-17]: Master plan for doc structure.

# Documentation Organization & Contextual Graph - Master Plan
**Date:** November 28, 2025
**Author:** Jules (Agent)
**Status:** DRAFT / FEASIBILITY

## 1. Objective
To systematically map, visualize, and eventually consolidate the `docs/` and `logs/` directories. This plan prioritizes **Contextual Integrity** (preserving meaning and connections) and **Safety** (ensuring zero data loss).

## 2. Phase 1: Feasibility & Discovery (The Probe)
**Goal:** Prove technical capability to read/traverse directories before investing in complex logic.
**Type:** Standalone Script (Throwaway/Prototype)

*   **Step 1.1:** Create `scripts/doc_access_probe.js`.
    *   *Logic:* Attempt to use `fs.readdir` and `fs.readFile` on `../docs` and `../logs` from the `onboarding/` context (or root context, depending on where we run it).
    *   *Test:* Verify it can see hidden files (if any) and navigate subdirectories.
*   **Step 1.2:** Run the script and capture output.
*   **Decision Gate:**
    *   **Success:** We can proceed with a script that generates the graph data.
    *   **Failure:** We must investigate permission issues or alternative "build-time" strategies.

## 3. Phase 2: The Mapper (Data Generation)
**Goal:** Create a high-fidelity "Contextual Map" (Adjacency List) of all documentation.

*   **Step 2.1:** Create `scripts/generate_doc_graph.js`.
    *   *Input:* `docs/` and `logs/` directories.
    *   *Logic:*
        1.  Recursively walk all directories.
        2.  Identify all `.md` files (Nodes).
        3.  Parse content for Markdown links [Title](path) (Edges).
        4.  Resolve all relative paths (e.g., `../foo.md`) to a canonical project-root path (e.g., `docs/foo.md`).
    *   *Output:* A JSON file (e.g., `onboarding/src/data/doc_graph_raw.json`) containing Nodes and Edges.

## 4. Phase 3: Verification (The "Painfully Redundant" Check)
**Goal:** Absolute certainty that the map matches the territory. **Zero files left behind.**

*   **Step 3.1: The Disk Census**
    *   Command: `find docs logs -name "*.md" | sort > verification/disk_manifest.txt`
    *   *Purpose:* A raw, OS-level list of what actually exists.

*   **Step 3.2: The Graph Census**
    *   Action: Write a utility to extract all Node IDs from `doc_graph_raw.json` and save to `verification/graph_manifest.txt` (sorted).

*   **Step 3.3: The Diff**
    *   Command: `diff verification/disk_manifest.txt verification/graph_manifest.txt`
    *   *Success Criteria:* The diff must be empty. Any file on disk not in the graph is a failure.

*   **Step 3.4: Manual Spot Check**
    *   Action: Randomly select 5 files from the disk.
    *   Task: Manually count the links in the file. Compare with the Edges listed in the JSON for that Node.
    *   *Purpose:* Verify the *parser* is not missing links.

## 5. Phase 4: Visualization & Analysis
**Goal:** See the "Islands" and "Redundancy" to inform the restructuring strategy.

*   **Step 5.1:** Feed `doc_graph_raw.json` into the `onboarding/` web app.
*   **Step 5.2:** Visual Review.
    *   Identify "Islands" (files with 0 connections).
    *   Identify "Hubs" (highly connected files).
    *   Identify "Broken Links" (Edges pointing to non-existent nodes).

## 6. Phase 5: Restructuring (The Move)
**Goal:** Consolidate folders based on the Map.

*   *Note:* The specific moves (e.g., "Merge logs into docs") will be decided AFTER Phase 5 analysis.
*   **Mechanism:**
    *   Use the Graph to find *every* file that links to `old_path/file.md`.
    *   Move file to `new_path/file.md`.
    *   Programmatically update the content of all referencing files to point to `new_path/file.md`.
    *   **Re-run Phase 3 Verification** after every batch move.
