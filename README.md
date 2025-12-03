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

## ⚡ Quickstart (Docker)

**Recommended for Evaluators & Data Scientists.**
The fastest way to run the full system (Redis, API, Workers, Tests) is using Docker Compose.

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) (ensure it's running).

1.  **Clone & Build Containers**
    ```bash
    docker compose build --progress=plain
    ```

2.  **Run End-to-End Verification**
    This starts the entire stack and runs the integration tests to verify everything is working.
    ```bash
    docker compose up --build --abort-on-container-exit --exit-code-from e2e-tester
    ```
    *Success is indicated by a clean exit (code 0) from the test runner.*

3.  **Run Services Manually (Optional)**
    If you want to keep the services running to inspect them:
    ```bash
    docker compose up -d redis server worker-rationale worker-architectural worker-testing
    ```

---

## 🛠️ Manual Setup (Advanced)

**Recommended for Core Engineers.**
Follow these steps if you need to develop features or debug the Node.js source directly.

### Prerequisites
*   **Node.js v20+** (Use `nvm install`)
*   **pnpm** (`corepack enable`)
*   **Python 3.12+** (Required for `node-gyp`)
*   **Build Tools:**
    *   **Linux:** `make`, `gcc`, `g++`
    *   **Windows:** Visual Studio Build Tools (C++ Desktop Workload)

### Installation
1.  **Install Dependencies**
    ```bash
    pnpm install
    ```
    *Note: If you encounter `node-gyp` or `distutils` errors, ensure you have `setuptools` installed (`pip install setuptools`).*

2.  **Build Monorepo**
    ```bash
    pnpm run build
    ```

3.  **Run Tests**
    ```bash
    pnpm test
    ```

---

## 📚 Documentation Map

*   **Current Roadmap (Active):** [Discovery Sprint Dashboard](docs/04-Operations/Intent-Log/Technical/20251127-Contextual-Discovery-Plan-Revision.md)
*   **Core Concept:** [Contextual Debt Research Paper](docs/03-Research/Theory/20251115-Research_Paper-Contextual_Debt-A_Software_Liability.md)
*   **Technical Spec:** [Contextual Debt Metric Spec](docs/01-Architecture/Specs/Contextual-Debt-Spec.md)
*   **Evaluation Output:** [Schema Definition](docs/01-Architecture/Specs/Evaluation-Output-Schema.md)
*   **Project Context:** [Strategic Master Log](docs/04-Operations/Intent-Log/Technical/20251128-Consolidated-Context-and-Actions.md) (Background & Status)

## 🏗️ Repository Structure

*   `packages/` - Monorepo workspaces
    *   `core` - Core logic and orchestrator
    *   `server` - Express API
    *   `workers` - Isolated analysis workers
    *   `contracts` - **Shared TypeScript Interfaces & DTOs** (Not Smart Contracts)
*   `docs/` - Comprehensive project documentation
*   `onboarding/` - Interactive documentation graph viewer

## 🔍 Data Scientist Notes

*   **Output Schema:** See `docs/01-Architecture/Specs/Evaluation-Output-Schema.md` for the JSON structure.
*   **Example Data:** See `docs/onboarding/example-evaluation-report.json`.
*   **Notebooks:** Check `notebooks/` for exploration scripts.

---
*Maintained by the LogoMesh Team.*
