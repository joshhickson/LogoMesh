> **🚀 Onboarding Start Here**
>
> **For the best onboarding experience, please start by viewing our interactive documentation hub.**
>
> 1.  Navigate to the `onboarding` directory in your terminal:
>     ```bash
>     cd onboarding
>     ```
> 2.  Follow the instructions in that directory's `README.md` file to start the local web server.
> 3.  Open the site in your browser (usually at `http://localhost:3000`).
>
> **Don't want to run a server?**
> *   **Current Roadmap:** Read the [Discovery Sprint Plan](docs/04-Operations/Intent-Log/Technical/20251127-Contextual-Discovery-Plan-Revision.md)
> *   **Theory:** Read the [Contextual Debt Research Paper](docs/03-Research/Theory/20251115-Research_Paper-Contextual_Debt-A_Software_Liability.md)

# LogoMesh: An Open Platform for Agent-on-Agent Evaluation

Welcome. This repo contains the LogoMesh monorepo: a TypeScript-based platform for evaluating AI agents and measuring our core metric, "Contextual Debt."

## ⚡ Quickstart (Polyglot Agent)

**Recommended for Evaluators & Competitors.**
The system now runs as a single Docker container that can assume different roles (Green, Purple, Red).

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) (ensure it's running).

1.  **Build the Container**
    ```bash
    docker build -t polyglot-agent .
    ```

2.  **Run the Green Agent (Evaluator)**
    This starts the orchestrator which will manage the evaluation lifecycle.
    ```bash
    docker run -p 8000:8000 -e OPENAI_API_KEY=your_key polyglot-agent --role GREEN
    ```

3.  **Run the Purple Agent (Defender)**
    This starts the defender agent which generates code solutions.
    ```bash
    docker run -p 8001:8000 -e OPENAI_API_KEY=your_key polyglot-agent --role PURPLE
    ```

4.  **Run the Red Agent (Attacker)**
    This starts the attacker agent which generates exploits.
    ```bash
    docker run -p 8002:8000 -e OPENAI_API_KEY=your_key polyglot-agent --role RED
    ```

---

## 🛠️ Manual Setup (Local Development)

**Recommended for Core Engineers.**
Follow these steps if you need to develop features or debug the Python/Node.js source directly.

### Prerequisites
*   **Python 3.12+**
*   **uv** (Python Package Manager): `pip install uv`
*   **Node.js v20+**
*   **pnpm** (`corepack enable`)

### Installation
1.  **Install Python Dependencies**
    ```bash
    uv sync
    ```

2.  **Install Node.js Dependencies**
    ```bash
    pnpm install
    ```

3.  **Run Agents Locally**
    ```bash
    # Green Agent
    uv run main.py --role GREEN

    # Purple Agent
    uv run main.py --role PURPLE

    # Red Agent
    uv run main.py --role RED
    ```

---

## 📚 Documentation Map

*   **Master Log:** [Polyglot Consolidation Master Log](docs/04-Operations/Intent-Log/Technical/20251231-Polyglot-Consolidation-Master-Log.md)
*   **Current Truth:** [Current Truth Source](docs/00_CURRENT_TRUTH_SOURCE.md)
*   **Core Concept:** [Contextual Debt Research Paper](docs/03-Research/Theory/20251115-Research_Paper-Contextual_Debt-A_Software_Liability.md)

## 🏗️ Repository Structure

*   `src/` - Agent Logic
    *   `green_logic/` - Evaluator & Orchestrator
    *   `purple_logic/` - Defender Wrapper
    *   `red_logic/` - Attacker Wrapper
    *   `agentbeats/` - Shared Library
*   `scenarios/` - Security Scenarios (Source of Truth for Purple/Red Logic)
*   `packages/` - Legacy Node.js Workspaces (Retained for reference/tools)
*   `docs/` - Comprehensive project documentation


## 🔍 Data Scientist Notes

*   **Output Schema:** See `docs/01-Architecture/Specs/Evaluation-Output-Schema.md` for the JSON structure.
*   **Example Data:** See `docs/onboarding/example-evaluation-report.json`.
*   **Notebooks:** Check `notebooks/` for exploration scripts.

---
*Maintained by the LogoMesh Team.*
