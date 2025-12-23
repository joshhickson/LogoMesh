> **Status:** DRAFT
> **Type:** Plan
> **Context:**
> *   [2025-12-21]: Proposed strategy to consolidate the fractured agent implementations (CLI vs Code) into a single "Polymorphic" repository for the AgentX competition.

# Proposed Consolidation Plan: The Polymorphic Repository

## 1. Executive Summary
We propose standardizing the codebase on **Kuan's `agentbeats-lambda` repository** structure. This structure complies with the strict **Lambda Track** submission requirements (Plugins, TOML config) while providing the flexibility to host the **Custom Track** (Green Agent) logic within the same codebase.

**The Goal:** A single Docker container that can act as either a "Red Agent" (Attacker) or "Green Agent" (Evaluator) based on its startup configuration (`main.py --role`).

## 2. The Current Fracture
*   **Repo A (Kuan):** `external/TEAM/agentbeats-lambda-[...]`. Code-based, specific to Lambda Track. Contains valid `ScenarioPlugin` implementations.
*   **Repo B (Samuel):** `green-agent/` and `purple-agent/`. CLI-based (`agentbeats run_agent`), specific to Custom Track. Lacks "Plugin" structure.
*   **Repo C (Monorepo):** `packages/workers`. Node.js services for Rationale/Architecture analysis.

## 3. The Consolidation Strategy ("Trojan Horse")

We will move all logic into a Unified Directory (likely `external/TEAM/agentbeats-lambda...` promoted to `agentbeats-unified` or root).

### 3.1. Directory Structure Target
```text
agentbeats-unified/
├── Dockerfile                   # Shared runtime (Python + Node Sidecar)
├── main.py                      # Polymorphic Entrypoint
├── pyproject.toml               # Python dependencies
├── src/
│   ├── common/                  # Shared A2A SDK, Logging
│   ├── red_logic/               # Kuan's Attacker Logic
│   ├── green_logic/             # Samuel's Evaluator Logic (Ported)
│   └── blue_logic/              # Kuan's Defender Logic (Mock Purple)
├── scenarios/                   # Lambda Track Submissions
│   └── security_arena/
│       └── submissions/
│           └── logmesh/         # OUR SCENARIOS (AdAttack, etc.)
└── packages/                    # (Optional) Node.js Sidecars
```

### 3.2. Migration Actions

#### Phase 1: The Green Migration
*   **Task:** Port `green-agent/tools.py` (Samuel) into `src/green_logic/evaluator.py`.
*   **Change:** Instead of `tools.py` (CLI Tool), implement a `GreenAgent` class that inherits from `BaseAgent`.
*   **Integration:** The `GreenAgent` will make HTTP calls to the Node.js "Rationale Worker" (running as a sidecar) to calculate CIS scores.

#### Phase 2: The Purple Consolidation
*   **Task:** Deprecate `purple-agent/`.
*   **Replacement:** Officially adopt `src/blue_logic/generic_defender.py` (Kuan's) as the "Mock Purple Agent".
*   **Reason:** It is already code-based and "Generic", making it perfect for the "Hybrid Sidecar" testing.

#### Phase 3: The Polymorphic Entrypoint
*   **Task:** Create `main.py` to route execution.
```python
# Pseudo-code
if role == "RED":
    run_scenario_plugin()
elif role == "GREEN":
    run_green_evaluator()
```

## 4. Handling the "Hybrid Sidecar" (Node.js)
The competition repo is Python-centric. The "Hybrid Sidecar" plan relies on Node.js workers.
*   **Proposal:** Run Node.js as a background process within the **same Docker container**.
*   **Mechanism:**
    1.  Dockerfile installs both Python and Node.js.
    2.  `entrypoint.sh` starts the Node.js server (`pnpm start:worker`) in the background.
    3.  `main.py` starts the Python Agent.
    4.  Python Agent talks to `http://localhost:3000` for Rationale Analysis.

## 5. Immediate Next Steps
1.  **Approval:** Confirm this architectural pivot.
2.  **Repo Surgery:** Move Kuan's repo code to a top-level `agentbeats-unified` folder (or clean root).
3.  **Porting:** Begin rewriting `tools.py` into `GreenAgent` class.
