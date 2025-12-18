> **Status:** DRAFT
> **Type:** Plan
> **Context:**
> *   [2025-12-18]: Implementation plan for the Hybrid Sidecar Architecture, bridging the Node.js Control Plane with the Python/vLLM Inference Plane.
> **Superseded By:** -

# Hybrid Sidecar Implementation Plan

## 1. Executive Summary

This document outlines the implementation plan for the **Hybrid "Sidecar" Architecture** mandated by the "Unified Agentic Defense" strategy. The goal is to bridge the existing **Node.js/TypeScript Monorepo (Control Plane)** with a new **Python/vLLM Inference Engine (Inference Plane)**.

This architecture optimizes resources by running a single GPU node (vLLM) that serves both Team A (Green) and Team B (Red) agents via Multi-LoRA adapters, while retaining the robust Node.js infrastructure for orchestration, scoring, and data management.

---

## 2. Architectural Decision Matrix

The following architectural questions must be resolved by the team. This plan is built on the **Recommended Path**, but alternatives are documented below.

### Decision 1: Node.js vs. Python Responsibility (The Bridge)

*   **Option A: Direct Inference (Recommended)**
    *   **Concept:** Node.js (`packages/workers`) acts as the "Brain" (Control Plane). It holds the "Green Agent" business logic (Norms Database, Scoring Engine) and calls the vLLM Sidecar directly for inference and parsing (using the LoRA adapter).
    *   **Pros:** tighter integration with existing Node.js infrastructure; reduced latency (no double-hop); simplifies the stack (Python is just an inference engine).
    *   **Cons:** requires porting some logic (e.g., Norms DB) from `green-agent/` to Node.js.
*   **Option B: Delegation (Service-to-Service)**
    *   **Concept:** Node.js acts as a client to a full-fledged Python `green-agent` service. Node.js sends a high-level request (via A2A or HTTP), and the Python service handles the logic, calling vLLM internally.
    *   **Pros:** reuses existing `green-agent` code as-is; cleaner separation of concerns if Python logic is complex.
    *   **Cons:** increased complexity (managing another service); higher latency; Node.js becomes just a pass-through.

### Decision 2: Repository Structure (Polymorphism)

*   **Option A: Monorepo Integration (Recommended)**
    *   **Concept:** Create `packages/unified-agent/` (or `packages/python-agent/`) to house the shared Python codebase. This ensures version control consistency and simplifies CI/CD.
    *   **Pros:** Single source of truth; unified build process; easier to share configs.
*   **Option B: External Submodule**
    *   **Concept:** Keep the Python code in `external/` or a separate repo and pull it in at build time.
    *   **Pros:** Decouples the codebases.
    *   **Cons:** Deployment drift; harder to debug integration issues.

---

## 3. Recommended Architecture (Option A)

This plan assumes **Option A (Direct Inference)** and **Option A (Monorepo Integration)**.

### System Diagram

```mermaid
graph TD
    subgraph "Control Plane (Node.js)"
        Orchestrator[API Server] --> Workers
        Workers[Safe Workers] --> |HTTP POST /v1/chat/completions| vLLM
        Workers --> |Read/Write| Redis[(Redis)]
        Workers --> |Read/Write| DB[(SQLite)]
    end

    subgraph "Inference Plane (Python/vLLM)"
        vLLM[vLLM Sidecar]
        AdapterA[Green LoRA (Cyber-Sentinel)]
        AdapterB[Red LoRA (Context-Breaker)]
        vLLM -.-> AdapterA
        vLLM -.-> AdapterB
    end

    subgraph "Unified Agent Source"
        Source[packages/unified-agent] --> |Builds| DockerImage
        DockerImage --> vLLM
    end
```

### 3.1 Component Roles

1.  **Node.js Control Plane:**
    *   **`SidecarLlmClient`**: A specialized client in `packages/workers` that talks to `http://vllm-sidecar:8000/v1`. It handles model selection (`model="green_agent_adapter"` or `model="red_agent_adapter"`).
    *   **`RationaleDebtAnalyzer`**: Uses `SidecarLlmClient` to parse logs and calculate scores.
    *   **Orchestration**: Manages the battle lifecycle.

2.  **Python Inference Plane (Sidecar):**
    *   **vLLM Server**: Runs the Base Model (Llama-3-70B-AWQ).
    *   **Adapters**: Dynamically loads LoRA adapters based on the `model` parameter in the API request.

---

## 4. Implementation Steps

### Step 1: Create `packages/unified-agent` (Polymorphic Repo)

We will create a new package in the monorepo to house the Python source code for the unified agent. This directory will serve as the build context for the Python side of the system.

**Directory Structure:**
```
packages/unified-agent/
├── pyproject.toml         # Dependencies (vllm, openai, agentbeats)
├── src/
│   ├── common/            # Shared logic
│   ├── green_logic/       # Team A logic (Parsing/Norms source)
│   └── red_logic/         # Team B logic (Attack generation)
├── main.py                # Entrypoint (for standalone submission)
├── Dockerfile             # Unified Dockerfile
├── green_agent_card.toml  # Config for Green Role
└── red_agent_card.toml    # Config for Red Role
```

### Step 2: Update `docker-compose.yml`

We need to add the `vllm-sidecar` service.

```yaml
  vllm-sidecar:
    image: vllm/vllm-openai:latest  # Or custom build from packages/unified-agent
    ports:
      - "8000:8000"
    volumes:
      - ~/.cache/huggingface:/root/.cache/huggingface
    environment:
      - HUGGING_FACE_HUB_TOKEN=${HUGGING_FACE_HUB_TOKEN}
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    command: --model meta-llama/Meta-Llama-3-70B-Instruct --quantization awq --enable-lora --lora-modules green_agent_adapter=/app/adapters/green red_agent_adapter=/app/adapters/red
```

*Note: For local development without a GPU, we may need a CPU-only fallback or a mock service.*

### Step 3: Implement `SidecarLlmClient.ts`

Create `packages/workers/src/clients/SidecarLlmClient.ts`.

**Interface Compliance:**
It must implement the `LlmClient` interface defined in `packages/workers/src/analyzers.ts`.

**Key Logic:**
*   **Base URL:** Configurable via `LLM_SIDECAR_URL` (default: `http://vllm-sidecar:8000/v1`).
*   **Model Selection:** Accepts a model ID (e.g., `green_agent_adapter`) to route requests to the correct LoRA.
*   **Prompting:** Formats the `systemMessage` and `userMessage` into the OpenAI Chat Completion format.

### Step 4: Infrastructure & Client Configuration

*   **Docker Image:** Use `vllm/vllm-openai` as the base.
*   **Model Weights:** Use a volume mapping to persist weights (`~/.cache/huggingface`).
*   **Client Config:**
    *   **Python Agents (Standalone):** Configure `OPENAI_BASE_URL=http://localhost:8000/v1` and `OPENAI_API_KEY=EMPTY`.
    *   **Node.js Client:** Configure `LLM_SIDECAR_URL=http://vllm-sidecar:8000/v1`.

### Step 5: Bridge Logic (The "Glue")

*   Migrate the **Parsing Schemas** from `green-agent/` to a shared location (or replicate them in Node.js types) to ensure `RationaleDebtAnalyzer` interprets the vLLM output correctly.
*   Ensure `SidecarLlmClient` handles timeouts and connection errors gracefully, as the vLLM sidecar might take time to warm up.

---

## 5. Execution Plan

1.  **Approval:** Team reviews this plan and decides on Decision 1 & 2.
2.  **Scaffolding:** Create `packages/unified-agent` and move/refactor code from `green-agent` and `external/`.
3.  **Sidecar Setup:** Update `docker-compose.yml` and verify vLLM startup.
4.  **Client Implementation:** Write `SidecarLlmClient.ts` and integrate it into `RationaleDebtAnalyzer`.
5.  **Verification:** Run the E2E test suite to ensure the Node.js control plane can successfully query the vLLM sidecar.
