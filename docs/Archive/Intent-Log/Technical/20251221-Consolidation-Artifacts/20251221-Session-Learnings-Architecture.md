---
status: SNAPSHOT
type: Log
---
> **Context:**
> *   [2025-12-21]: Key architectural learnings from the deep review of the repository state vs. competition requirements.

# Session Learnings: Architectural Diagnostics

## 1. The "Black Box" Trap
We discovered that **Samuel's Green Agent** relies on the `agentbeats run_agent` CLI command. While convenient for quick starts, this tool abstracts away the event loop, making it impossible to intercept messages for "Contextual Integrity" analysis.
*   **Lesson:** You cannot build a "Glass Box" system (LogoMesh) using "Black Box" tools. We must use the SDK at the code level (`A2AStarletteApplication`).

## 2. The Node.js vs. Python Conflict
*   **Strategy A (Unified Plan):** Envisions a pure Python repo (vLLM Client + Python Logic).
*   **Strategy B (Hybrid Sidecar):** Envisions a Node.js Orchestrator/Sidecar.
*   **Resolution:** The competition submission format (`plugin.py`) forces a Python-centric architecture. The Node.js components (Rationale Worker) must run as background "Sidecars" within the Docker container, accessed via local HTTP, rather than being the primary entry point.

## 3. Submission Format Rigidity
The Lambda Track is strict:
*   Submissions must follow the `submissions/{team}/{scenario}` directory structure.
*   Agents must be implemented as `ScenarioPlugin` classes.
*   **Impact:** Kuan's repository structure is not just a "suggestion"; it is the required schema. We must conform the entire monorepo to fit *inside* or *around* this structure, not the other way around.

## 4. Future Risks (Watchouts)

### 4.1. The "Docker Monster" (Dependency Hell)
Merging the Node.js monorepo (`pnpm`, `node-gyp`) with the Python AI stack (`uv`, `vLLM`) in a single Dockerfile is high-risk.
*   **Risk:** Native module compilation failures (`node-gyp`) are likely when `pnpm install` runs in a Python-heavy base image.
*   **Mitigation:** Use a multi-stage build or carefully layered installation commands (Python first, then Node).

### 4.2. The "Ground Truth" Gap
Alaa Elobaid identified that "LLM-as-a-Judge" without calibration is subjective ("Vibe Grading").
*   **Risk:** The Green Agent may produce "valid" scores that are mathematically meaningless.
*   **Action:** We must locate the **CI-Bench** dataset (referenced in `Unified AI Competition Development Plan`) and use it to calibrate the Rationale Worker's cosine similarity thresholds.
