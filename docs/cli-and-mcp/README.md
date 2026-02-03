# README: `feat/cli-and-mcp` Branch Strategy

This directory contains the core strategic documents defining the pivot for the `feat/cli-and-mcp` branch. The goal is to transform LogoMesh from a server-based "Benchmark Arena" into a local-first "Developer Companion" focused on code integrity.

While each document approaches the topic from a different angle (directive, operational concept, technical gap analysis, and market viability), they collectively define a unified strategy.

---

## Document Summaries

### 1. [`20260202-Pivot-Directive_ LogoMesh-Strategic-Realignment.md`](20260202-Pivot-Directive_%20LogoMesh-Strategic-Realignment.md)

This document is a direct order to realign the project's strategy in response to competitive threats, primarily from CodeRabbit.

-   **Auditor Mode Pivot:** Shift focus from "Semantic Alignment" (which competitors do) to **"Architectural Law."** The primary value is now in building a dependency graph of the codebase and enforcing structural rules (e.g., preventing controllers from calling the database directly).
-   **Architect Mode Pivot:** Rebrand from a simple "Auto-Coder" to a tool for **"Pre-Commit Falsification."** The identity is a "Red Team in a Box" that uses a local Monte Carlo Tree Search (MCTS) to attack generated code and prove its robustness.
-   **Key Asset:** The **Decision Bill of Materials (DBOM)** is identified as the critical enterprise feature, providing a verifiable audit trail of the code's validation.

### 2. [`20260202-Operational-Concept_ LogoMesh-CLI.md`](20260202-Operational-Concept_%20LogoMesh-CLI.md)

This document describes the day-to-day user experience and the two primary modes of the CLI.

-   **Philosophy:** "The Shield and The Sword."
-   **Auditor (`logomesh check`):** A passive "shield" that analyzes existing code for architectural violations and security vulnerabilities without modifying it.
-   **Architect (`logomesh build`):** An active "sword" that generates new code through a "Falsification Loop." It uses a Red Agent to attack the code, a Green Agent to judge it, and a refinement loop to fix it until it's proven robust.
-   **MCP Integration:** Both modes will be exposed through the Model Context Protocol (MCP), allowing them to be used within IDEs like VS Code as a "skill" that enhances existing AI assistants.

### 3. [`20260202-Gap-Analysis_ LogoMesh-Evolution.md`](20260202-Gap-Analysis_%20LogoMesh-Evolution.md)

This document provides a technical breakdown of the changes required to transition from the `master` branch's server-based architecture to the `feat/cli-and-mcp` branch's local-first model.

-   **Core Mission:** Decouple the "Intelligence" (Scoring, Red Agent) from the "Infrastructure" (Server, Database).
-   **Key Technical Gaps:**
    -   **Entry Point:** Move from a `server.py` to a `cli.py` and `mcp_server.py`.
    -   **Context:** Shift from static, cached task vectors to Just-In-Time (JIT) vector generation from any text input (e.g., git commits).
    -   **State:** Remove the tight coupling with the `Battles.db` database for CLI operations.
    -   **Execution:** Default to a `LocalSubprocessSandbox` instead of Docker for speed and ease of use.

### 4. [`20260202-LogoMesh_ Competitive-Analysis-&-Viability.md`](20260202-LogoMesh_%20Competitive-Analysis-&-Viability.md)

This market analysis assesses LogoMesh's unique position and provides strategic recommendations for success.

-   **Primary Competitor:** **CodeRabbit** is identified as the biggest threat, as it already dominates "Intent Verification" using vector embeddings.
-   **Strategic Pivot:** LogoMesh must differentiate itself by focusing on what vector-based tools cannot do well.
    -   **Auditor:** Position as an **"Architectural Compliance"** tool that enforces graph-based rules, not just semantic similarity.
    -   **Architect:** Market as **"Adversarial Integrity"** or "The Red Team in your IDE." The key innovation is the active, hostile falsification loop, not just helpful code generation.
-   **Local-First Advantage:** The local CLI approach (using vLLM) is a major strength, as it solves enterprise privacy concerns and allows for "offensive" Red Teaming that cloud providers' Terms of Service often forbid.
-   **AgentBeats Strategy:** For the competition, it recommends an **"Adaptive Compute"** strategy—using a fast, simple generation for easy tasks and reserving the slow, expensive MCTS loop for complex, security-critical tasks to avoid timeouts.
