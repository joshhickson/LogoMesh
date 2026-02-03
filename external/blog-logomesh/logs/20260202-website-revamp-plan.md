---
status: [DRAFT]
type: [Plan]
---
> **Context:**
> *   [2026-02-02]: This document outlines a high-level plan to update the LogoMesh website, which exists as a submodule. The goal is to align its content with the current reality of the main LogoMesh repository and improve its user experience.

# Website Revamp Plan: Aligning with Project Reality

This document outlines a high-level plan to update the LogoMesh website. The primary goal is to transition the site from a conceptual manifesto to an accurate reflection of the project's concrete achievements and current state, coupled with a general user experience enhancement.

---

## Phase 1: Content Realignment - "What We Actually Built"

### **What:**
Update all website content to accurately describe the "Multi-Agent Evaluation Arena" that was developed and is present in the `master` branch of the main LogoMesh repository. This involves replacing the conceptual "Cyber-Sentinel" narrative with a clear explanation of the functioning system.

**Key Content to Add:**
*   **Explain the Architecture:** Detail the Green (Judge), Red (Attacker), and Purple (Participant) agent architecture.
*   **Detail the CIS Score:** Break down the Contextual Integrity Score (CIS) and its components (Rationale, Architecture, Testing, Logic).
*   **Showcase the Technology:** Describe the key technical components that were actually implemented, such as:
    *   The adversarial Red Agent using Monte Carlo Tree Search (MCTS).
    *   The use of a Docker sandbox for secure, ground-truth test execution.
    *   The Battle Memory (SQLite) and Strategy Evolver (UCB1 bandit) for self-improvement.
*   **Present Real Results:** Replace conceptual pillars with actual results, such as the baseline scores achieved across the 20-task library.

### **Why:**
The current website describes a future vision ("Cyber-Sentinel") rather than the accomplished reality ("Evaluation Arena"). Aligning the content with the existing codebase will:
*   **Build Credibility:** Demonstrate that LogoMesh is not just an idea but a functioning platform with tangible results.
*   **Provide Clarity:** Give visitors a clear and accurate understanding of what the project does *right now*.
*   **Create a Foundation:** Establish a solid, truthful baseline before communicating any future pivots or plans.

### **How (Implementation Plan):**
To gather the necessary information, I will perform a systematic review of the main `LogoMesh` repository. My primary source of truth will be the code and documentation in the `master` branch.

1.  **High-Level Summary from Root `README.md`:** I will start by thoroughly reading the main `README.md` in the LogoMesh repository. This file is the best source for the official project description, the architecture diagram, the CIS scoring formula, and the baseline results table. This will form the narrative backbone of the new website content.

2.  **Architectural Deep Dive from `src/`:** To get details on the agent architecture, I will analyze the structure of the `src/` directory.
    *   I will examine the contents of `src/green_logic/`, `src/red_logic/`, and `src/purple_logic/` to understand the specific responsibilities of the Judge, Attacker, and baseline Participant agents.
    *   Key files like `scoring.py` (for the CIS calculation), `orchestrator.py` (for MCTS logic), and `sandbox.py` (for Docker execution) will provide the technical details needed to write authoritatively about how the system works.

3.  **Task Library from `src/green_logic/tasks.py`:** I will read the `tasks.py` file to extract the list of the 20 curated coding tasks. This will allow me to create a "Task Library" section on the website, showcasing the breadth of the evaluation benchmark.

4.  **Configuration and Setup from `docker-compose.yml` and `main.py`:** I will review the Docker files and the main entrypoint to understand the setup process. This will inform a "Quick Start" or "How to Run" section, explaining how a user could run the evaluation arena themselves.

5.  **Leverage Existing Analysis in `docs/04-Operations/Dual-Track-Arena/`:** This directory contains pre-existing file reviews and summaries that can accelerate the content gathering process. I will cross-reference these documents, particularly the reviews within `file-reviews/green/`, `file-reviews/red/`, and `file-reviews/purple/`, with the live source code to quickly extract key implementation details, noting any discrepancies due to recent commits.

By synthesizing information from these key files, I can construct a comprehensive and accurate picture of the project's current state and replace the website's conceptual content with a description of the tangible, implemented system.

---

## Phase 2: User Experience (UX) Overhaul

### **What:**
Perform a high-level visual and structural refresh of the website to create a more modern, professional, and engaging user experience. This is not a complete redesign, but an enhancement of the existing structure.

**Focus Areas:**
*   **Visual Hierarchy:** Improve the layout to better guide the user's eye to the most important information (e.g., the CIS score, the architecture diagram).
*   **Typography and Readability:** Refine font choices, sizes, and spacing to make the dense, technical information easier to read and digest.
*   **Color Palette:** Evolve the existing dark theme to be more dynamic and visually appealing, while maintaining a professional, security-focused aesthetic.
*   **Incorporate Visual Aids:** Create and embed simple diagrams or visuals to help explain complex concepts like the agent interaction loop or the CIS score breakdown.
*   **Dynamic Research Paper Rendering:** Replace the static `external\blog-logomesh\archive\contextual-debt-liability.html` page (which will be archived) with a new page that can dynamically render a `.tex` file. This will allow the research paper to be updated simply by replacing the source file, without requiring any HTML changes.

### **Why:**
While the current site is functional, a polished user experience is critical for establishing authority and keeping users engaged. A better UX will:
*   **Enhance Comprehension:** Make the project's complex technical details more accessible to a broader audience.
*   **Increase Trust:** A professional and well-designed website signals a mature and serious project.
*   **Improve Engagement:** Encourage visitors to spend more time exploring the research, results, and core concepts.
