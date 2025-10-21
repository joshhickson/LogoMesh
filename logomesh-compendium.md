
--- START OF README.md ---

# LogoMesh

**Discussion Channel:** <https://discord.gg/6ydDxzMjvD>

> *A recursive thought engine for humans and AI—designed to evolve meaning, resolve contradictions, and externalize self-reflection.*

LogoMesh is a local-first cognitive framework that enables users to create, organise, and navigate complex ideas through interconnected “thought bubbles,” nested segments, and flexible metadata filters. The application is built on a React front-end and a Node.js/Express back-end and stores data in SQLite by default. All processing occurs on the local machine unless the user explicitly installs a cloud-aware plug-in.

---

## Project Status

| Phase | Objective | High-level Deliverables | Status |
|-------|-----------|-------------------------|--------|
| 0 | Framework Skeleton | React/Node scaffold, baseline tests | Complete |
| 1 | Core Functionality | Thought graph, JSON I/O, initial plug-in scaffold | Complete |
| **2** | Hardened Spine | Type-safe codebase, secure plug-in sandbox, TaskEngine, LLM gateway, observability | **Resumed after hiatus** |
| 2 b | Memory Layer | Vector store, summarisation and relevance routing, read-only FlowMesh CLI | Planned |
| 3 | Working-Memory Features | Adaptive chunking, replay API, glossary reconciliation | Planned |
| 4 | Knowledge Graph & Ontology | Contradiction detection, multi-user collaboration, conflict resolution | Vision |

Current version: **0.2.0**
Target runtime: Node.js 16 or newer.
**Environment Status**: ✅ Development environment stabilized (09.10.2025)

---

## Key Capabilities

### Operational Components

* Thought bubbles with titles, descriptions, tags, and colour coding.
* Nested segments within each thought, each with its own attributes.
* Attribute-based filtering with optional canvas highlighting.
* JSON import and export for data portability and AI integration.
* Normalised SQLite schema for reliable local persistence.
* Foundational plug-in host implemented with a vm2 sandbox.

### Infrastructure Under Construction (Phase 2)

* Multi-language plug-in runtime (Node.js operational; Python in progress).
* Secure DevShell interface for development commands.
* TaskEngine for workflow orchestration.
* LLM gateway with audit logging and runner isolation.
* Observability stack (structured logging, health checks, performance metrics).

---

## Quick Start

### Prerequisites

* Node.js 16 or newer
* npm
* Git

### Installation

```bash
git clone https://github.com/joshhickson/LogoMesh.git
cd LogoMesh
npm install
```

### Running in Development

```bash
# Start both the frontend and backend services concurrently
npm run dev
```

* Front-end: <http://localhost:3000>
* API root: <http://localhost:3001/api/v1>

### Database Configuration

An SQLite database file is created automatically in the `data/` directory. All environment variables, including the database connection string, are managed in `core/config.ts`. To override the default settings, you can create a `.env` file in the root of the project.

```env
DATABASE_URL=sqlite:./data/custom.db
# Example for PostgreSQL:
# DATABASE_URL=postgresql://user:pass@host:5432/db
```

---

## High-Level Architecture

```
React Front-end  →  Express API  →  SQLite (or configured RDBMS)
        │                  │
   UI Components       Core Services
                       - IdeaManager
                       - EventBus
                       - PluginHost
                       - TaskEngine (under development)
```

*Front-end technologies:* React 18, Cytoscape.js for graph rendering, Tailwind CSS for layout.
*Back-end technologies:* Express.js with TypeScript, vm2 plug-in sandbox, structured logging with pino, and a centralized configuration management system in `core/config.ts`.

---

## Development Guide

### Repository Layout

```
/src/           React front-end
/server/src/    Express back-end
/core/          Shared business logic
/contracts/     TypeScript interfaces
/plugins/       Plug-in ecosystem
/docs/          Architectural records and specifications
```

### Routine Tasks

```bash
# Run the full test suite (frontend and backend)
npm run test:e2e
```

Known open issues are tracked in the GitHub issue queue.

---

## Roadmap Extract

### Immediate Objectives (Phase 2)

| Category | Task |
|----------|------|
| Security | Finalise plug-in sandbox and DevShell permissions |
| Observability | Health-check endpoint, structured logs, back-pressure metrics |
| Task engine | Workflow chain: LLM → plug-in → system |
| Local LLM | Initial Ollama executor with audit logging |

### Subsequent Milestones

* **Phase 2 b:** Vector store integration and summarisation plug-ins.
* **Phase 3:** Automatic document digestion and replay API.
* **Phase 4:** Multi-user knowledge graph with ontology management.

Detailed architectural records (ADR) and requests for comment (RFC) are maintained under `/docs/`.

---

## API Overview (selected endpoints)

```
GET    /api/v1/thoughts            List thoughts
POST   /api/v1/thoughts            Create thought
GET    /api/v1/thoughts/:id        Retrieve thought
PUT    /api/v1/thoughts/:id        Update thought
DELETE /api/v1/thoughts/:id        Delete thought

POST   /api/v1/portability/export  Export data
POST   /api/v1/portability/import  Import data

GET    /api/v1/plugins             List registered plug-ins
POST   /api/v1/plugins/:id/execute Invoke plug-in command
```

A full API reference is planned, but not yet available.

---

## Contribution Guidelines

1. Fork the repository and create a feature branch.
2. Follow the coding standards: TypeScript in new back-end code, ESLint and Prettier formatting.
3. Include unit tests for new functionality and update documentation where relevant.
4. Submit a pull request with a clear description of the change.

Architectural changes require an accompanying RFC in `/docs/rfc` before implementation.

---

## Deployment Notes

* **Local production build**

  ```bash
  # Build the frontend
  npm run build

  # Build the backend
  cd server && npm run build
  ```

* **Replit deployment**

  1. Import the repository into Replit.
  2. Provide environment variables in the Replit UI.
  3. Use the Deployments tab to provision the back-end service.

---

## Data Exchange Format (example)

```json
{
  "id": "thought-001",
  "title": "Example Thought",
  "description": "High-level concept",
  "tags": [
    { "name": "philosophy", "color": "#f97316" }
  ],
  "segments": [
    {
      "id": "segment-001",
      "title": "Key Point",
      "content": "Detailed information...",
      "attributes": [
        {
          "fieldName": "Category",
          "fieldValue": "Quote",
          "fieldType": "text"
        }
      ]
    }
  ]
}
```

---

## Licence

LogoMesh is released under the MIT licence. You are free to copy, modify, and distribute the software, provided that the licence terms are respected.

---

## Support and Community

* Documentation index is located in `/docs/index.md`.
* Bug reports and feature requests should be opened in the GitHub issue tracker.
* Real-time discussion is available in the Discord server linked above.

---

Created and maintained by [Josh Hickson](https://github.com/joshhickson).

--- END OF README.md ---

--- START OF docs/future-vision.md ---

# Future Vision: A "Genius Level" Approach

This document outlines a long-term vision for the LogoMesh project, focusing on building a system that is not just well-architected, but also self-healing and self-improving.

## Core Principles

*   **Automation:** Automate everything that can be automated, from code quality checks to dependency management and deployments.
*   **Resilience:** Design the system to be resilient to failure, with a focus on self-healing and graceful degradation.
*   **Adaptability:** Build a system that can adapt to changing requirements and technologies with minimal human effort.
*   **AI-Augmentation:** Leverage AI to augment the development process, from coding and testing to architectural design.

## Key Initiatives

1.  **Hyper-automated Quality Gates:** Go beyond the current CI pipeline. Integrate advanced static analysis tools (like SonarQube or CodeClimate) and set up automated quality gates that block any code that doesn't meet a very high standard. The goal would be to make it impossible to introduce new technical debt.
2.  **Automated Dependency Management on Steroids:** Use tools like Dependabot or Renovate, but configure them to not just create PRs, but to also run a comprehensive suite of tests and automatically merge the changes if they pass. This would ensure the project is always up-to-date with the latest and most secure dependencies, without any human intervention.
3.  **Observability and Self-healing:** Implement a sophisticated observability platform that can not only monitor the application's health but also automatically detect and recover from failures. For example, using circuit breakers, automated rollbacks, and other resilience patterns.
4.  **AI-Augmented Development Workflow:** This is where it gets really interesting. You could build a system where AI agents (like me) are an integral part of the development process. For example, an AI could automatically refactor code to improve its quality, write new tests for every new feature, and even suggest architectural improvements. The human developers would then act as reviewers and architects, guiding the AI agents.
5.  **Living Documentation:** Instead of writing documentation that quickly becomes outdated, you could generate it automatically from the code and the tests. This would ensure that the documentation is always an accurate reflection of the system's current state.


--- END OF docs/future-vision.md ---

--- START OF docs/IMPLEMENTATION_PLAN.md ---


# Phase 2 Implementation Plan - Survival Edition

**Status**: ⏳ RESCOPED FOR REALITY
**Goal**: Ship hardened spine, not enterprise fantasies
**Duration**: 4 weeks of **actual deliverable work**
**Prerequisites**: Phase 1 completed (SQLite backend, React frontend, basic plugin scaffolding)

> **🎯 REALITY CHECK**: Single developer, Replit environment, 50-60% effective time assumption

## 🛡️ Architectural Preservation Rules (Non-Negotiable)

**Layer Boundary Enforcement:**
- Frontend (`src/`) NEVER imports from `core/` or `server/` directly
- Core services (`core/services/`) communicate only via EventBus or well-defined interfaces
- LLM layer (`core/llm/`) remains purely execution-focused, no business logic
- Storage adapters (`core/storage/`) remain implementation details behind contracts

**Plugin System Integrity:**
- All plugin execution MUST go through PluginHost sandbox
- Plugin capabilities MUST be declared in manifest before runtime
- Plugin crashes MUST NOT affect core system stability

**Event-Driven Architecture:**
- TaskEngine coordination MUST use EventBus for cross-service communication
- No synchronous calls between major subsystems

## Week 1: Foundation Reality Check (4 working days, slip allowed to Day 5 ONLY if TS strict breaks >20% tests)

### Task 1: TypeScript Migration (Days 1-2)
**FOCUS**: Convert only `core/` and `server/` to TS strict - leave `src/` JS until Week 2 stretch

**Core Goals:**
- Convert `core/` and `server/` directories to TypeScript strict mode
- Enable TypeScript strict mode with CI gate that **fails on any `any`**
- Fix compilation errors systematically
- Integrate `eslint-plugin-import` + `@typescript-eslint/recommended` rules; CI fails on lint
- **CI LOCK**: Build fails if any JS files remain in core/server or strict mode violations exist

**Verification Gates:**
- ✅ `npx tsc --noEmit` passes with 0 errors for core/ and server/
- ✅ CI fails immediately on any `any` type or JS file in core/server
- ✅ All imports resolve correctly

### Task 2: Secrets Management Stub (Day 3)
**FOCUS**: Basic security spine - prevent credential leaks

**Core Goals:**
- Create `.env.example` + `config.ts` wrapper
- CI fails if repo contains literal "sk-", "jwtSecret=changeme", "OPENAI_API_KEY=", or `AWS_(ACCESS|SECRET)_KEY=`
- Basic JWT session handling in AuthService
- **NO FANCY UI** - just working backend security

**Verification Gates:**
- ✅ CI blocks any hardcoded secrets
- ✅ JWT tokens work for session management
- ✅ `.env.example` template exists

### Task 3: Rate Limit + Health Check (Day 4)
**FOCUS**: Basic monitoring and protection

**Core Goals:**
- Add rate limiting middleware (100 req/min per IP, whitelist `/status`)
- `GET /status` returns `{queueLag, dbConn, pluginSandboxAlive, heapUsedMB}`
- Basic request validation on critical endpoints

**Verification Gates:**
- ✅ Rate limiting blocks abuse at 100rpm/IP
- ✅ `/status` endpoint returns 200 with metrics
- ✅ Invalid requests get rejected properly

## Week 2: LLM Spine + Plugin Foundation (includes half-day "bug pit" buffer)

Half-day bug-pit = Week 2 Day 6 AM, no feature work.

### Task 4: Slice LLM Monolith (Days 1-3)
**FOCUS**: Break LLMOrchestrator death grip - no fancy audit UI yet

**Core Goals:**
- Create `LLMGateway` (rate limit, basic auth)
- Split `ConversationOrchestrator` (state machine only)
- Create `RunnerPool` (per-model execution)
- **KEEP** existing audit logging - don't rebuild it

**Verification Gates:**
- ✅ `/api/thoughts` smoke test passes
- ✅ `/api/plugins/list` smoke test passes
- ✅ `/api/auth/login` smoke test passes
- ✅ Single prompt starvation test proves RunnerPool isolation
- ✅ Queue wait >5s **with 1 busy runner** fails gate
- ✅ LLM components can be tested independently

### Task 5: Basic Plugin Sandbox (Days 4-5)
**FOCUS**: Node.js plugins only - secure the foundation

**Core Goals:**
- Implement secure plugin runtime with `vm2`
- Basic filesystem restrictions (read-only by default)
- Plugin permission manifest validation
- **Node.js ONLY** - no multi-language fantasies yet

**Verification Gates:**
- ✅ "Hello world" plugin executes safely
- ✅ Hello-world plugin cannot read '/etc/passwd'
- ✅ Plugin crashes don't affect system

## Week 3: EventBus Reliability + Storage Boundary

### Task 6: EventBus Back-pressure (Days 1-3)
**FOCUS**: Make EventBus production-ready

**Core Goals:**
- Use in-memory queue + exponential backoff
- Add at-least-once delivery for critical workflows
- Implement message `deliveryId` + dedupe table in memory
- **SCOPE CUT**: Persistence deferred to Phase 2b
- **NO COMPLEX UI** - just working coordination

**Verification Gates:**
- ✅ EventBus drains 5k messages batch-test (offline), ≤2× RTT baseline
- ✅ Critical messages don't get lost
- ✅ System stays responsive under load

### Task 7: Storage Service Boundary (Days 4-5)
**FOCUS**: Abstract storage coupling - no vector search yet

**Core Goals:**
- Create thin `DataAccessService` between IdeaManager ↔ StorageAdapter
- Remove direct StorageAdapter coupling from business logic
- **DEFER** vector operations to Phase 2b
- Prep sed script to update IdeaManager test imports

**Verification Gates:**
- ✅ Business logic doesn't import StorageAdapter directly
- ✅ Existing functionality preserved
- ✅ Ready for future vector DB without business logic changes

## Week 4: Minimal TaskEngine + Load Testing (Day 7 = scope cut or lock branch, no new code after noon)

### Task 8: Basic TaskEngine (Days 1-4)
**FOCUS**: Prove LLM → Plugin chains work

**Core Goals:**
- Extend existing LLMTaskRunner for multi-executor support
- Build simple ExecutorRegistry (LLM + Plugin only)
- Create basic pipeline schema (JSON workflows)
- Include `schemaVersion` field; reject unknown versions
- **3-step max**: LLM → Plugin → System response

**Verification Gates:**
- ✅ TaskEngine executes LLM→Plugin workflow in <5s median
- ✅ Uses existing LLMTaskRunner retry logic
- ✅ Basic pipeline JSON validation works

### Task 9: Load Test & Stabilize (Days 5-6)
**FOCUS**: Make it production-ready

**Core Goals:**
- Stress test EventBus + LLM under 250 req/min sustained, spike 500
- Fix critical performance bottlenecks
- Basic observability with pino logging
- Profile heap with `clinic flame` during load; leak <5 MB/min
- **Note**: Run on local Docker or paid VM for realistic load testing

**Verification Gates:**
- ✅ Artillery 250rpm 5-min run: no 5xx, ≤2% 429
- ✅ p50 API latency ≤250ms, p95 ≤600ms under 250rpm run
- ✅ System handles sustained load without crashing
- ✅ All Week 1-3 functionality still works under load

## 🚫 Explicitly Deferred to Phase 2b (Week 5-8)

**Cut Without Mercy:**
- DevShell UI and natural language interface
- Multi-language plugin runtime (Python, Go, Rust)
- Vector similarity search and embeddings
- Advanced plugin marketplace features
- Semantic clustering and VTC implementation
- WebSocket real-time UIs
- Advanced security hardening
- Comprehensive audit dashboard
- Plugin hot-reload and development toolkit

## Success Criteria (Binary Pass/Fail)

**Essential Gates:**
- ✅ TS strict passes (core, server)
- ✅ ESLint passes with zero warnings in core/server
- ✅ /api/auth login w/ JWT round-trip
- ✅ Rate-limit 100rpm per-IP tested via artillery
- ✅ /status returns 200 with sane metrics
- ✅ Single prompt starvation test proves RunnerPool isolation (fail if >5s queue wait with 1 busy runner)
- ✅ Hello-world plugin cannot read '/etc/passwd'
- ✅ EventBus drains 5k messages batch-test (offline), ≤2× RTT baseline
- ✅ TaskEngine executes LLM→Plugin workflow in <5s median
- ✅ Artillery 250rpm 5-min run: no 5xx, ≤2% 429
- ✅ No `any` types introduced in `src/` stretch migration PRs

## Tactical Implementation Notes

1. **Lock CI immediately**: Fail on any `any` types or JS files in core/server
2. **Write throwaway PoC plugin first**: Get sandbox right before complexity
3. **Convert storage coupling after TypeScript**: Static types expose hidden leaks
4. **Ollama integration**: Stub → audit trail → only then enhance
5. **Storage sed script**: commit separately, easy revert

## Reality Check Gates

- [ ] No mixed TS/JS in core/server; src/ JS tolerated until 2b
- [ ] Single LLM prompt cannot block all model traffic
- [ ] Plugin crashes do not affect system stability
- [ ] Storage changes don't require business logic refactors
- [ ] System handles sustained load without memory leaks

## What Phase 2b Will Add (Week 5-8)

Once the **hardened spine** ships, Phase 2b will add:
- Multi-language plugin runtime
- DevShell command interface
- Vector Translation Core implementation
- Advanced workflow orchestration
- Real-time WebSocket features
- Constitutional enforcement layer

---

## Bottom Line

**Ship a hardened spine first, then hang organs on it.** This plan focuses on **infrastructure that won't break** rather than features that impress. Every week delivers working, tested, load-proven capabilities.

Week 1-4 creates the **foundation** that Phase 2b can safely build upon. No enterprise fantasies, no scope creep, just **survival and growth**.

For a glimpse into the long-term vision beyond Phase 2, see the [Future Vision](future-vision.md) document.

---

## Progress Log

**2025-09-22: Test Suite Hardening**
- **Status:** ✅ COMPLETE
- **Summary:** Fixed the project's test suite, which was suffering from mixed-environment issues (`node` vs. `jsdom`).
- **Details:**
    - Reconfigured `vitest.config.ts` to use `environmentMatchGlobs`, allowing for per-directory environment settings.
    - Resolved critical dependency installation failures by:
        1.  Switching to the project's specified Node.js version (`v20.11.1`).
        2.  Downgrading `vitest` and `jsdom` to compatible versions.
        3.  Performing a clean install to fix native addon loading errors.
    - Created missing test plugin files to ensure `PluginHost` tests could run.
- **Outcome:** The entire test suite now passes, unblocking further development and ensuring CI/CD integrity.


--- END OF docs/IMPLEMENTATION_PLAN.md ---

--- START OF docs/06.26.2025 architecture-diagram.md ---


# LogoMesh Framework Architecture

## Current System Overview

```mermaid
graph TB
    subgraph "Frontend Layer (React)"
        UI[User Interface]
        Canvas[Canvas Component<br/>Cytoscape.js]
        Sidebar[Sidebar Component]
        Modal[Add Thought Modal]
        DetailPanel[Thought Detail Panel]
        DevPanel[Dev Assistant Panel]
        DbConfig[Database Config]

        UI --> Canvas
        UI --> Sidebar
        UI --> Modal
        UI --> DetailPanel
        UI --> DevPanel
        UI --> DbConfig
    end

    subgraph "Frontend Services"
        AuthSvc[Auth Service]
        GraphSvc[Graph Service]
        ApiSvc[API Service]
        MockApi[Mock API Service]

        Canvas --> GraphSvc
        UI --> AuthSvc
        UI --> ApiSvc
        UI --> MockApi
    end

    subgraph "Backend API Server (Express)"
        Server[Express Server<br/>Port 3001]

        subgraph "API Routes"
            ThoughtRoutes[Thought Routes<br/>/api/v1/thoughts]
            UserRoutes[User Routes<br/>/api/v1/user]
            LLMRoutes[LLM Routes<br/>/api/v1/llm]
            AdminRoutes[Admin Routes<br/>/api/v1/admin]
            TaskRoutes[Task Routes<br/>/api/v1/tasks]
            OrchestratorRoutes[Orchestrator Routes<br/>/api/v1/orchestrator]
            PortabilityRoutes[Portability Routes<br/>/api/v1/portability]
            PluginRoutes[Plugin Routes<br/>/api/v1/plugins]
        end

        Server --> ThoughtRoutes
        Server --> UserRoutes
        Server --> LLMRoutes
        Server --> AdminRoutes
        Server --> TaskRoutes
        Server --> OrchestratorRoutes
        Server --> PortabilityRoutes
        Server --> PluginRoutes
    end

    subgraph "Core Services Layer"
        IdeaManager[Idea Manager<br/>Core Business Logic]
        EventBus[Event Bus<br/>Pub/Sub System]
        TaskEngine[Task Engine<br/>Background Processing]
        PluginHost[Plugin Host<br/>Plugin Runtime]
        PortabilityService[Portability Service<br/>Import/Export]
        MeshGraphEngine[Mesh Graph Engine<br/>Graph Operations]

        ThoughtRoutes --> IdeaManager
        TaskRoutes --> TaskEngine
        PluginRoutes --> PluginHost
        PortabilityRoutes --> PortabilityService
        OrchestratorRoutes --> MeshGraphEngine
    end

    subgraph "Storage Layer"
        StorageAdapter[Storage Adapter Interface]
        SQLiteAdapter[SQLite Storage Adapter<br/>Core Implementation]
        PostgresAdapter[Postgres Adapter<br/>Alternative DB]

        IdeaManager --> StorageAdapter
        StorageAdapter --> SQLiteAdapter
        StorageAdapter --> PostgresAdapter
    end

    subgraph "Database"
        SQLiteDB[(SQLite Database<br/>thoughts.db)]
        PostgresDB[(PostgreSQL<br/>Alternative)]

        SQLiteAdapter --> SQLiteDB
        PostgresAdapter --> PostgresDB
    end

    subgraph "LLM Layer"
        LLMOrchestrator[LLM Orchestrator<br/>Multi-Model Conversations]
        LLMRegistry[LLM Registry<br/>Model Management]
        LLMTaskRunner[LLM Task Runner<br/>Execution Engine]
        OllamaExecutor[Ollama Executor<br/>Local LLM Interface]
        MermaidAuditor[Mermaid Auditor<br/>Visual Documentation]

        LLMRoutes --> LLMOrchestrator
        LLMOrchestrator --> LLMRegistry
        LLMOrchestrator --> LLMTaskRunner
        LLMTaskRunner --> OllamaExecutor
        LLMOrchestrator --> MermaidAuditor
    end

    subgraph "Context & Cognitive Layer (Phase 2 Ready)"
        CCE[Cognitive Context Engine<br/>Semantic Analysis]
        ContextGen[Context Generation<br/>LLM Prompt Assembly]

        LLMOrchestrator -.-> CCE
        CCE -.-> ContextGen
    end

    subgraph "Plugin System"
        PluginAPI[Plugin API Interface]
        PluginManifest[Plugin Manifest Schema]
        DevAssistant[Dev Assistant Plugin<br/>Built-in Plugin]

        PluginHost --> PluginAPI
        PluginAPI --> PluginManifest
        PluginHost --> DevAssistant
    end

    subgraph "Automation Layer (Node-RED)"
        NodeRED[Node-RED Server<br/>Workflow Automation]
        AutoTagging[Auto-Tagging Flow]
        EmbeddingWorkflow[Embedding Workflow]

        NodeRED --> AutoTagging
        NodeRED --> EmbeddingWorkflow
    end

    subgraph "Utilities & Infrastructure"
        Logger[Logger System<br/>Centralized Logging]
        IDUtils[ID Generation<br/>Unique Identifiers]
        ErrorLogger[Error Logger<br/>Frontend Errors]
        VoiceInput[Voice Input Manager<br/>Speech Recognition]

        IdeaManager --> Logger
        IdeaManager --> IDUtils
        UI --> ErrorLogger
        UI --> VoiceInput
    end

    subgraph "Data Contracts & Interfaces"
        Entities[Entity Definitions<br/>Thought, Segment, Tag]
        StorageContract[Storage Adapter Contract]
        LLMContract[LLM Executor Contract]
        PluginContract[Plugin API Contract]
        EmbeddingContract[Embedding Interface Contract]

        SQLiteAdapter -.-> StorageContract
        StorageContract -.-> Entities
        OllamaExecutor -.-> LLMContract
        PluginAPI -.-> PluginContract
    end

    subgraph "Testing & Development"
        TestSuite[Test Suite<br/>Vitest + Jest]
        MockServices[Mock Services<br/>Development Stubs]
        TestRunner[Test Runner Scripts<br/>Automated Testing]

        UI -.-> TestSuite
        MockServices -.-> TestSuite
        TestRunner -.-> TestSuite
    end

    %% External Connections
    ApiSvc --> Server
    NodeRED -.-> Server
    DevAssistant -.-> Server

    %% Event Flow
    EventBus -.-> TaskEngine
    EventBus -.-> LLMOrchestrator
    EventBus -.-> PluginHost

    %% Styling
    classDef frontend fill:#e1f5fe
    classDef backend fill:#f3e5f5
    classDef core fill:#e8f5e8
    classDef storage fill:#fff3e0
    classDef llm fill:#fce4ec
    classDef plugin fill:#f1f8e9
    classDef automation fill:#e0f2f1
    classDef phase2 fill:#fff9c4,stroke:#ff9800,stroke-dasharray: 5 5

    class UI,Canvas,Sidebar,Modal,DetailPanel,DevPanel,DbConfig frontend
    class Server,ThoughtRoutes,UserRoutes,LLMRoutes,AdminRoutes,TaskRoutes,OrchestratorRoutes,PortabilityRoutes,PluginRoutes backend
    class IdeaManager,EventBus,TaskEngine,PluginHost,PortabilityService,MeshGraphEngine core
    class StorageAdapter,SQLiteAdapter,PostgresAdapter,SQLiteDB,PostgresDB storage
    class LLMOrchestrator,LLMRegistry,LLMTaskRunner,OllamaExecutor,MermaidAuditor llm
    class PluginAPI,PluginManifest,DevAssistant plugin
    class NodeRED,AutoTagging,EmbeddingWorkflow automation
    class CCE,ContextGen phase2
```

## Architecture Analysis

### Current State (Phase 1 Complete)
- ✅ **Frontend**: React-based UI with Cytoscape.js visualization
- ✅ **Backend**: Express.js API server with comprehensive routing
- ✅ **Storage**: SQLite implementation with normalized schema
- ✅ **LLM Infrastructure**: Multi-model orchestration framework
- ✅ **Plugin System**: Runtime interface with manifest-based loading
- ✅ **Automation**: Node-RED integration for workflow automation

### Phase 2 Ready Components
- 🟡 **Cognitive Context Engine**: Interfaces defined, implementation planned
- 🟡 **Embedding System**: Contracts established, adapters ready
- 🟡 **Advanced Graph Operations**: Foundation in place for mesh networking

### Key Design Patterns
- **Adapter Pattern**: Storage and LLM execution abstraction
- **Event-Driven Architecture**: EventBus for loose coupling
- **Plugin Architecture**: Extensible system for custom functionality
- **Contract-First Design**: Interface definitions drive implementation

### Data Flow Summary
1. **User Interaction** → Frontend Components
2. **API Calls** → Backend Routes → Core Services
3. **Business Logic** → IdeaManager → Storage Adapter
4. **Persistence** → SQLite Database
5. **LLM Operations** → Orchestrator → Execution Engines
6. **Automation** → Node-RED → API Integration


--- END OF docs/06.26.2025 architecture-diagram.md ---

--- START OF docs/Agentic Coding Debt Management Research.md ---



# **Architecting Resilience: A Framework for Managing Technical and Contextual Debt in Agentic Software Engineering**

## **Part I: Re-characterizing Debt in the Agentic Era**

The advent of agentic software engineering, characterized by the use of AI agents to autonomously or semi-autonomously generate code, represents a paradigm shift in software development. While this transformation promises unprecedented velocity, it simultaneously introduces new and amplified forms of liability that challenge traditional models of software quality and maintainability. This foundational part of the report establishes the theoretical groundwork for understanding these new challenges. It moves from the classical understanding of technical debt to a new, expanded model that accounts for the unique pressures and outputs of agentic coding systems. The central argument is that agentic systems do not merely create debt; they fundamentally change its nature and accelerate its accumulation at a machine-driven pace.

### **Section 1: The Evolution of Technical Debt: From Metaphor to Systemic Liability**

To comprehend the novel challenges posed by agentic systems, it is first necessary to establish a baseline understanding of technical debt as it has been understood in traditional software engineering. The concept, far from being a mere buzzword, is a critical management tool for reasoning about the long-term consequences of short-term decisions.

#### **1.1 Foundational Concepts**

The term "technical debt" was first introduced as a metaphor by software engineer Ward Cunningham to explain the trade-offs inherent in software development to non-technical stakeholders.1 He compared the act of shipping expedient but imperfect code to taking on financial debt. This initial debt allows for faster delivery, but it accrues "interest" over time in the form of increased future development costs, such as debugging, maintenance, and refactoring.1 The core premise is the deliberate or unintentional prioritization of delivery speed over optimal, high-quality code.5 If this debt is not "repaid" through subsequent refactoring, the accumulating interest can eventually slow development to a crawl, making the system difficult and costly to evolve.6

To add nuance to this metaphor, Martin Fowler developed the Technical Debt Quadrant, which classifies debt along two axes: the nature of the intent (deliberate or inadvertent) and the quality of the decision (prudent or reckless).1 This framework creates four categories:

* **Prudent and Deliberate:** A team makes a conscious, strategic decision to take a shortcut to meet a critical deadline, fully aware of the consequences and with a plan to address the debt later. This is often considered "good" or strategic debt.9
* **Reckless and Deliberate:** A team chooses a quick and dirty solution without regard for the long-term consequences, often ignoring established best practices.
* **Prudent and Inadvertent:** Debt is incurred unintentionally due to evolving knowledge. A team makes the best possible design decision with the information available, only to realize later that a better approach exists. This is the hardest type of debt to anticipate.9
* **Reckless and Inadvertent:** Debt arises from ignorance or incompetence. The team is unaware of fundamental design principles and produces low-quality work as a result.

This quadrant is crucial because it frames technical debt as a spectrum of choices and outcomes, not a monolithic evil. However, the introduction of non-human agents fundamentally challenges the assumptions of intent and prudence that underpin this model. An AI agent, lacking true business context or strategic foresight, cannot make a "prudent" decision to incur debt for a market advantage. All debt it generates is, by definition, inadvertent from a strategic standpoint. Current AI agents operate based on probabilistic pattern matching and immediate goal satisfaction (e.g., "implement this function"), not on an understanding of market pressures, competitive landscapes, or long-term product roadmaps.11 Therefore, when an agent generates suboptimal code, it is not making a strategic choice. This shifts the entire risk profile of agentic development towards unintentional and unmanaged liability accumulation, necessitating a far greater emphasis on human governance and architectural guardrails.

#### **1.2 The Economic Impact**

The consequences of unmanaged technical debt are not merely technical; they are profoundly economic. Research indicates that organizations can spend up to 40% of their IT budgets managing and controlling their technical debt, with the total cost in the U.S. alone estimated to be in the trillions of dollars.4 This debt manifests as increased maintenance overhead, reduced developer productivity, and delayed time-to-market for new features.15 Engineers, on average, spend one-third of their time addressing technical debt, a figure that rises with the age and complexity of the codebase.17 The cost of fixing a single line of legacy code can be substantial, and these costs are compounded by rising wages for software engineers.17 For business-critical systems, failures due to technical debt can result in catastrophic financial losses, sometimes costing millions of dollars per hour.17 This economic framing is critical to understanding that managing the new wave of agentic debt is not just a matter of code hygiene but a core business strategy for long-term viability.

#### **1.3 Traditional Debt Categories**

Technical debt is not a single entity but a collection of different types of liabilities. A comprehensive vocabulary is essential for identifying and managing these issues. The primary categories include:

* **Architectural Debt:** Flaws in the foundational design of a system, such as a monolithic architecture that lacks scalability or tightly coupled components that make changes difficult and risky.1
* **Code Debt:** Issues within the source code itself, resulting from inconsistent practices, unclear variable names, duplicated logic, or failure to follow industry standards.1 This is the most commonly recognized form of technical debt.
* **Infrastructure and DevOps Debt:** Inefficiencies in the continuous integration and delivery (CI/CD) pipeline, outdated deployment processes, or poorly planned cloud environments that hinder automation and scalability.1
* **Process Debt:** Poor collaboration, unclear workflows, and missing documentation that lead to delays, onboarding challenges, and an accumulation of unresolved issues in the backlog.1
* **Security Debt:** The accumulation of security vulnerabilities resulting from cutting corners on encryption, authentication, vulnerability patching, or a lack of automated security testing.1

These traditional categories provide a crucial bridge to understanding agentic debt. As the following sections will demonstrate, AI-driven development does not eliminate these problems; instead, it acts as a powerful amplifier, accelerating their accumulation and intertwining them in novel and complex ways.

### **Section 2: The Agentic Debt Amplifier: Velocity at the Cost of Stability**

The primary value proposition of agentic coding tools is a dramatic increase in development velocity. However, a growing body of evidence reveals a significant trade-off: this localized, individual productivity boost often comes at the expense of global, system-level quality and stability. Agentic systems act as powerful amplifiers, supercharging the rate at which traditional forms of technical debt are introduced into a codebase.

#### **2.1 The Productivity Paradox**

The core conflict in agentic development can be described as a productivity paradox. Individual developers, empowered by AI assistants, report feeling more productive and are measured to write code significantly faster—in some cases, producing three to four times more code than their non-AI-assisted counterparts.19 Surveys of developers using tools like GitHub Copilot show that a majority feel their productivity and code quality have improved.4

However, system-level metrics often tell a different story. Google's 2024 DORA (DevOps Research and Assessment) report found a troubling correlation: for every 25% increase in AI adoption within a team, there was a corresponding 7.2% decrease in delivery stability and a 1.5% decrease in throughput.13 This suggests that while code is being produced faster, the resulting system is more fragile and prone to failure, requiring more time for debugging and hotfixes, which ultimately negates some of the initial speed gains. This paradox highlights a dangerous decoupling between the perceived output of individuals and the actual health of the software system they are collectively building.

#### **2.2 The Proliferation of Code Duplication**

The most significant and well-documented symptom of the agentic debt amplifier is an explosion in code duplication. One of the foundational principles of sustainable software engineering is "Don't Repeat Yourself" (DRY), which advocates for abstracting common logic into reusable modules to improve maintainability and reduce the risk of bugs.13 Agentic coding tools systematically violate this principle.

A longitudinal analysis of 211 million lines of code by GitClear revealed a staggering 10x increase in duplicated code blocks in 2024, coinciding with the widespread adoption of AI coding assistants.13 The same study showed a sharp decline in refactoring activities, measured by the amount of "moved" code in version control, which dropped from 24.8% of changes in 2021 to just 9.5% in 2024\.20 This indicates that developers are increasingly prompting AI to generate new solutions from scratch rather than taking the time to find and reuse existing code.

This behavior stems from the operational model of current AI assistants. Lacking a persistent, holistic understanding of the entire codebase, an agent treats each prompt as a localized, isolated problem.11 When asked to perform a task, its path of least resistance is often to generate a new, self-contained block of code based on patterns in its training data, rather than to perform a complex search of the existing repository to find a suitable function to call. The immediate result is functional code delivered quickly. The long-term result is a bloated, inefficient codebase where a single bug may exist in dozens of slightly different, copy-pasted forms, making maintenance a nightmare.13

#### **2.3 The Surge in Hidden Vulnerabilities**

While AI assistants are effective at reducing simple syntax errors (a 76% reduction, according to one study), they simultaneously introduce a greater number of deeper, more complex, and more dangerous flaws.19 The same study that noted the drop in typos also found a 322% increase in privilege escalation issues and a 153% increase in fundamental design problems in AI-assisted code.19 This occurs because AI models are trained on vast amounts of public code, which often includes outdated practices, insecure patterns, and subtle vulnerabilities.12

The speed and volume of AI-generated code also overwhelm human review processes. Developers package AI-generated code into fewer, much larger pull requests, diluting the attention of reviewers and increasing the likelihood that these hidden flaws slip through undetected.19 This is compounded by other security-specific issues:

* **Credential Leakage:** AI-assisted developers were found to expose sensitive credentials, such as cloud access keys, nearly twice as often as their non-AI counterparts.19
* **Insecure Dependencies:** AI tools may suggest or inject dependencies that are outdated or have known vulnerabilities, as their knowledge is limited to their training data cutoff and they lack real-time awareness of the security landscape.12
* **Incomplete Logic:** AI often excels at generating the "happy path" but fails to account for edge cases or implement robust input validation and error handling, creating openings for exploitation.22

This evidence suggests that agentic systems are creating a new "debt structure." In this structure, the "principal" (the initial bad code) might seem smaller or more polished on the surface, but the "interest rate" (the cost of its proliferation and the severity of its hidden flaws) is exponentially higher. The speed of AI does not just add debt; it compounds it at a machine-driven pace. A single flawed pattern, once generated, can be replicated across the codebase in response to multiple prompts, transforming a localized liability into a systemic contagion that is far more costly to eradicate.

#### **2.4 The Financial and Operational Costs**

The amplification of technical debt has direct and measurable financial consequences. The code bloat resulting from rampant duplication leads to higher cloud storage costs and extends the duration of testing cycles, which in turn increases operational expenditures.3 Every redundant line of code adds to the cognitive load on developers, slowing down future development and increasing the time spent on debugging rather than on creating new value.13 This creates a "productivity illusion," where teams feel they are moving faster but are actually accumulating a massive, hidden liability that will inevitably drag down their future velocity.3 If developer productivity continues to be measured by simplistic metrics like lines of code or number of commits, organizations will inadvertently incentivize the rapid accumulation of this value-destroying debt.13

### **Section 3: Defining Contextual Debt: The Erosion of "Why"**

While agentic systems amplify traditional technical debt, they also introduce a novel and arguably more pernicious form of liability: **Contextual Debt**. This is the most significant and unique challenge of the agentic era. It represents a fundamental shift in the nature of software liabilities, moving from flaws in the implementation to a systemic erosion of the knowledge and intent behind the code.

#### **3.1 Beyond Technical Debt**

Contextual Debt is defined as the future cost incurred from a lack of discernible human intent, architectural rationale, and domain-specific knowledge within a codebase. While traditional technical debt is the cost of a suboptimal *implementation* (the "how"), contextual debt is the cost of a missing or opaque *intent* (the "why").11 It is the liability that accrues when code is syntactically correct and passes its immediate tests, but is semantically opaque, architecturally adrift, and lacks a clear, human-centric design philosophy.

This debt arises because AI coding assistants, despite their sophistication, lack true comprehension. They operate on statistical patterns in data, not on a deep, abstract understanding of the project's goals, constraints, or long-term vision.11 They generate code without a persistent "mental model" of the system as a whole, leading to solutions that may work in isolation but fail to cohere with the broader architecture.24 The result is an artifact detached from its reason for being—a solution without a well-understood problem.

#### **3.2 "Vibecoding": The Primary Source of Contextual Debt**

The primary practice that generates contextual debt is "vibecoding." This term describes the process of prompting an AI to generate code without a strong, pre-existing mental model of the desired outcome, architecture, or underlying logic.22 It is a development style driven by vague instructions and blind trust in the AI's output, prioritizing immediate results over intentional design—"vibes-first, architecture-maybe, test-later (if ever)".22

Vibecoding directly injects context-free, non-deterministic, and often fragile code into the system.22 Because the output of Large Language Models (LLMs) is probabilistic, the same prompt can yield wildly different results, including different architectural choices, on different runs.22 This unpredictability is acceptable for rapid prototyping but is disastrous for production systems, as it undermines reliability, control, and trust.22 The developer, acting as a mere curator of the AI's output, skips the crucial steps of deliberate design, such as choosing meaningful variable names, designing clean data flows, and making thoughtful architectural trade-offs. This leads to a system that is not just fragile, but fragile and mystifying.22

#### **3.3 Manifestations of Contextual Debt**

Contextual debt is not a theoretical concern; it has concrete, damaging manifestations that degrade the long-term health of a software project:

* **Inaccessible Codebases:** The most significant problem is a codebase that becomes nearly inaccessible to human developers.25 When code is generated without a clear, underlying human logic, engineers struggle to understand, debug, or modify it. The rationale behind the code exists only in the transient, probabilistic state of the LLM at the moment of generation, not in the collective knowledge of the team.24
* **Longer Onboarding and Knowledge Gaps:** New team members face a severe learning curve when the codebase lacks a coherent narrative or documented design decisions. There is no senior developer who can explain "why" a particular piece of code was written the way it was, because nobody on the team truly "wrote" it in the traditional sense.23
* **Fragility and Edge Case Failures:** Systems built on "vibes" are notoriously brittle. They are optimized for the common cases described in the prompt but often fail silently or catastrophically when faced with edge conditions or unexpected inputs that were never considered during the prompt engineering phase.22
* **Debugging as Detective Work:** Tracing bugs in a context-deficient codebase becomes exponentially harder. Without a clear logical flow to follow, debugging devolves from a systematic engineering task into a forensic investigation, requiring developers to reverse-engineer the AI's "thought process" with each issue.22

This accumulation of contextual debt represents a shift from manageable, code-level issues to unmanageable, system-level entropy. It is the software equivalent of building a city without zoning laws, a master plan, or architects. While individual buildings (functions) might be structurally sound, the overall system becomes an unnavigable, inefficient, and ultimately collapsing sprawl. Traditional refactoring (improving the "how") is insufficient to pay down this debt. Repayment requires a far more costly process of *archaeology and reconstruction*—reverse-engineering the lost intent and then re-implementing entire subsystems to be coherent. This makes contextual debt a far greater long-term liability than traditional technical debt.

### **Section 4: A Taxonomy of Agentic Debt Patterns**

To effectively manage the liabilities introduced by agentic development, a structured vocabulary is essential. This section synthesizes the preceding analysis into a comprehensive taxonomy of agentic debt patterns. This framework is designed to be a practical tool for human reviewers and a machine-readable specification for automated analysis bots, enabling a shared understanding for classifying, tracking, and prioritizing different forms of debt.

#### **4.1 A Unified Framework**

The following taxonomy categorizes agentic debt into distinct, measurable types. It integrates traditional debt categories that are amplified by AI with the new forms of contextual and systemic debt that are unique to this paradigm. This provides a holistic view, preventing teams from focusing only on superficial code smells while ignoring deeper architectural and knowledge-based issues.

#### **4.2 ML-Specific Debt Precursors**

The behavior of agentic coding systems is rooted in the underlying principles of machine learning. Therefore, understanding the known sources of technical debt in ML systems provides crucial insight into the root causes of agentic debt. Key concepts from ML systems research that are foundational to this taxonomy include:

* **Boundary Erosion:** An ML model can inadvertently create tight coupling between otherwise separate systems by, for example, using the output of one system as an input feature for another, without respecting abstraction boundaries.26 An agentic coder can do the same by chaining API calls or reusing data structures in ways that violate the intended modularity.
* **Entanglement (CACE Principle):** The "Changing Anything Changes Everything" problem, where improving an individual component (e.g., an agent refactoring one function for efficiency) can unexpectedly degrade the performance of the overall system because other components had implicitly relied on the old behavior's specific error patterns.26
* **Hidden Feedback Loops:** An agent might generate code for a system where the model's output indirectly influences its own future training data through the external world. For example, a recommendation engine's suggestions influence user behavior, which then generates the data used to retrain the engine, a cycle that can lead to unforeseen biases or instability.26
* **Data Dependencies:** Agentic systems can create fragile dependencies on unstable or underutilized data sources, leading to system failures when those sources change or are deprecated.26

These ML-specific issues are the underlying mechanics that give rise to the observable patterns of agentic debt detailed in the taxonomy below.

#### **4.3 The Taxonomy Table**

The following table serves as a central reference for identifying and classifying agentic debt. It links each debt category to its definition, its specific manifestation in agentic systems, and a set of key, measurable indicators that can be used for detection.

| Debt Category | Definition | Manifestation in Agentic Systems | Key Indicators / "Code Smells" |
| :---- | :---- | :---- | :---- |
| **Code Duplication Debt** | Redundant code blocks violating the DRY principle. | Massive increase in copy-pasted logic; AI recreating existing functions instead of reusing them.13 | High code similarity scores (e.g., from tools like CodeClone); low rates of "moved" code in version control history.20 |
| **Architectural Incoherence Debt** | Violations of established design patterns and architectural principles. | Inconsistent patterns across modules; lack of a unified architectural vision; "patchwork" solutions generated from isolated prompts.22 | High cyclomatic complexity; tight coupling between unrelated components; mixed and contradictory design patterns in the same feature. |
| **Contextual & Rationale Debt** | The absence of documented or discernible "why" behind code and design choices. | Syntactically correct but logically opaque code; difficulty in debugging and modification; code that its human author cannot explain.11 | Lack of meaningful PR descriptions; high "code churn" in specific files 30; high bug density in AI-heavy sections.23 |
| **Security & Compliance Debt** | Introduction of vulnerabilities and non-compliance with standards. | Hardcoded secrets; insecure dependencies; lack of input validation; biased outputs; generation of code violating OWASP guidelines.12 | Alerts from SAST/DAST tools; exposure of credentials in commits; use of libraries with known vulnerabilities (CVEs); non-adherence to compliance standards (GDPR, HIPAA).23 |
| **Testing & Verification Debt** | Inadequate or superficial testing of generated code. | Generation of "happy path" tests only; tests that replicate flaws in the generated code, creating a false sense of security.3 | Low test coverage for edge cases and error-handling paths; high rate of post-deployment bugs despite high unit test coverage. |
| **Dependency & Obsolescence Debt** | Use of outdated, insecure, or unnecessary dependencies. | AI suggesting libraries without considering the existing stack, long-term support, or security posture.12 | Proliferation of micro-dependencies; use of libraries with known vulnerabilities; inclusion of heavy libraries for simple tasks. |
| **Entanglement & Coupling Debt** | Unintentional and tight coupling between otherwise separate system components. | Chaining input signals or model outputs in ways that create hidden dependencies; a change in one module causing unexpected failures elsewhere.26 | Difficulty in isolating components for testing; cascading failures; system accuracy degrading when an individual component is improved. |

This taxonomy provides the necessary structure to move from abstract concepts to concrete action. By providing a shared vocabulary and a set of measurable indicators, it serves as a diagnostic tool for human teams and a foundational specification for the development of automated debt management agents. The "Key Indicators" column is specifically designed to be a checklist for such automated tools, allowing an agentic bot to scan for these signals and use this report as a direct input for its own refactoring and improvement tasks.

## **Part II: Frameworks for Identification and Assessment**

Having defined and categorized the new landscape of agentic debt, this part of the report transitions from theory to practice. It provides a systematic approach for detecting, measuring, and quantifying the debt patterns identified in Part I. A key focus is differentiating between methods for analyzing tangible code artifacts and techniques for uncovering the more elusive and dangerous contextual gaps.

### **Section 5: Automated and AI-Assisted Debt Detection**

The foundation of any effective debt management strategy is a robust, automated detection capability. The sheer volume and velocity of AI-generated code make manual inspection insufficient. Therefore, teams must leverage a combination of traditional and AI-powered tools to gain visibility into the health of their codebase.

#### **5.1 Static and Dynamic Analysis**

Established application security testing methodologies remain a critical first line of defense.

* **Static Application Security Testing (SAST):** These tools analyze source code without executing it, making them ideal for integration into the CI/CD pipeline. They are effective at identifying known security vulnerabilities, such as those in the OWASP Top Ten, and flagging insecure coding patterns that AI agents may have introduced.23
* **Dynamic Application Security Testing (DAST):** These tools test the application in its running state, simulating attacks to find vulnerabilities that only emerge at runtime. This is crucial for catching issues related to misconfigurations or flawed business logic in AI-generated code.23
* **Code Quality Scanners:** Tools like SonarQube, Code Climate, and Reshift provide a broader analysis beyond security. They can be configured to detect a wide range of "code smells," including duplicated code, overly complex methods (high cyclomatic complexity), and violations of coding standards, all of which are common in agent-generated code.32

#### **5.2 AI-Powered Code Analysis**

Ironically, AI itself is one of the most powerful tools for combating agentic debt. A new generation of AI-powered analysis tools can go beyond the rule-based checks of traditional scanners to provide more nuanced insights:

* **Intelligent Refactoring Suggestions:** Tools like Amazon CodeGuru and Refact.ai analyze code for "ugliness" or inefficiency and provide specific, actionable suggestions for improvement.32
* **Predictive Debt Analysis:** Some AI tools can analyze trends in code changes and repository history to predict which areas of the codebase are most likely to accumulate debt in the future, allowing teams to intervene proactively.32
* **Performance Anomaly Detection:** By integrating with application performance monitoring (APM) tools like Dynatrace and New Relic, AI can correlate code changes with performance degradation, helping to pinpoint technical debt that is impacting system stability and user experience.32

#### **5.3 Quantitative Metrics**

To move debt management from a subjective art to a data-driven science, teams must track a set of key quantitative metrics. These metrics provide an objective measure of codebase health and can be used to set goals and track progress over time.

* **Code Duplication/Similarity Score:** A direct measure of the primary symptom of agentic debt. Tools can provide a percentage of duplicated code, which should be monitored closely.28
* **Cyclomatic Complexity:** A measure of the number of independent paths through a piece of code. High complexity is a strong indicator of code that is difficult to understand, test, and maintain.8
* **Code Churn:** The frequency with which a file is modified in version control. A file with high churn is a "hotspot" that likely contains underlying design flaws or contextual debt, as developers are repeatedly forced to change it.8
* **Defect Density:** The number of bugs or defects found per thousand lines of code. This metric should be tracked specifically for code sections known to be heavily AI-generated to assess the quality of the agent's output.8
* **Refactoring Ratio:** A crucial metric for agentic workflows, calculated as the ratio of "moved" or refactored lines of code to new or duplicated lines. A low ratio is a strong warning sign of a codebase that is growing in size and complexity without corresponding improvements in quality and abstraction.20

The signals for agentic debt are often found not just in the static code itself, but in its evolutionary history as recorded in repository metadata. While traditional static analysis is necessary, it is insufficient on its own. A comprehensive detection strategy must therefore integrate traditional code scanners with tools that perform longitudinal analysis of the repository's history and developer interactions. An AI could be trained to use Natural Language Processing (NLP) on commit messages (flagging phrases like "quick fix" or "will refactor later") and pull request comments to quantify this "hidden" process debt.30

### **Section 6: Heuristics for Uncovering Contextual Debt**

Contextual debt, being a lack of "why," cannot be detected by static analysis tools alone. It requires human judgment and a set of heuristics designed to probe the comprehensibility and rationale of the code. Uncovering this debt requires shifting the focus of review from "Is the code correct?" to "Is the code *knowable*?". This represents a fundamental change in the philosophy of code quality.

#### **6.1 The Explainability Test**

The simplest and most powerful heuristic for detecting contextual debt is the "Explainability Test." During a code review, the developer who prompted the AI to generate the code must be able to clearly and concisely explain:

1. The logic of the generated code.
2. How it aligns with the broader system architecture.
3. The edge cases and failure modes it handles.

If the developer cannot provide a satisfactory explanation, the code is considered to have high contextual debt.21 It is an "unknowable artifact" whose logic is not owned by the team. Such code should be rejected and either manually rewritten or re-generated with a more specific prompt until it is fully understood by its human sponsor. This test directly addresses the knowledge vacuum created by agentic generation, ensuring that all code merged into the repository is fully "owned" by the human team.

#### **6.2 Tracing the Rationale Chain**

This heuristic involves a manual audit of the entire generation process for a given feature, from the initial business requirement to the final prompt submitted to the AI. The goal is to identify gaps or ambiguities at any stage of this "rationale chain." For example, if a user story was vague and the prompt was equally vague, the resulting code is almost certain to contain contextual debt. This requires a disciplined process of documenting not just the code, but the prompts that created it, linking them back to the original requirements.

#### **6.3 Bug Clustering Analysis**

A practical, data-driven method for locating hotspots of contextual debt is to analyze bug reports. If bugs are consistently recurring in specific components or modules, particularly those known to be heavily AI-generated, it is a strong signal of a deeper problem.30 This clustering suggests a fundamental misunderstanding of the requirements or a brittle, "vibecoded" implementation that was not designed to handle real-world complexity. These bug clusters should trigger a deeper architectural review of the affected components.

#### **6.4 The "AI-Generated Code" Tag**

A simple but highly effective process change is to mandate that all code generated or significantly modified by an AI be tagged as such in version control.23 This can be done using git notes, special comments in the code, or labels in the issue tracking system. This tagging creates an invaluable dataset for future analysis. It allows teams to:

* Perform targeted, more rigorous code reviews on AI-generated sections.
* Correlate AI usage with key metrics like defect density, code churn, and performance issues over time.
* Identify which types of tasks or prompts are most likely to generate high-quality vs. low-quality code, enabling the team to refine its AI usage policies.

### **Section 7: A Prioritization Matrix for Agentic Debt**

Once debt has been identified, it must be prioritized for remediation. The sheer volume of potential issues generated by AI systems can be overwhelming, and a naive "fix everything" approach is impractical. Traditional prioritization methods, such as focusing on the 20% of debt causing 80% of the problems, can be misleading in agentic systems because they underestimate the compounding and contagious nature of AI-generated flaws.7

#### **7.1 Limitations of Traditional Prioritization**

In an agentic environment, the most dangerous debt is not necessarily the one causing the most bugs *today*, but the one that is most likely to be learned and replicated by the AI *tomorrow*. AI agents, especially those using Retrieval-Augmented Generation (RAG) on the existing codebase, learn from the code they see.34 A flawed but functional pattern in the codebase will be treated as a valid example and is highly likely to be replicated in new features. This poisons the well for all future AI-generated code. This necessitates a shift from reactive prioritization to a predictive, preventative model.

#### **7.2 Adapting the PAID Framework with Proliferation Risk**

To address this, the PAID (Prioritize, Address, Investigate, Document) framework can be adapted for agentic debt.10 This involves assessing each piece of debt along two critical axes:

**Business Value Impact** and a new, forward-looking axis called **Proliferation Risk**.

* **Proliferation Risk:** This is defined as the likelihood that a piece of debt (e.g., a flawed pattern, a security vulnerability, an inefficient algorithm) will be copied and spread throughout the codebase by AI agents. Factors influencing this risk include the simplicity of the pattern, its applicability to common tasks, and its presence in a frequently modified part of the codebase.

#### **7.3 The Agentic Debt Prioritization Matrix**

This two-axis model yields a four-quadrant matrix for strategic decision-making:

* **Quadrant 1: Prioritize (High Business Impact, High Proliferation Risk):** This is critical debt that must be fixed immediately. It is both harming the business now and actively making the codebase worse for the future.
  * *Example:* A security flaw in a commonly used, AI-generated authentication function.
* **Quadrant 2: Contain & Address (Low Business Impact, High Proliferation Risk):** This is the most insidious type of agentic debt. While it may not be causing immediate, visible problems, it is a "contagion" that is poisoning the codebase. The first priority is containment: document it as an anti-pattern, create linting rules to detect it, and fine-tune prompts to avoid it. Once contained, it should be scheduled for systematic remediation.
  * *Example:* An inefficient but functional data processing pattern that agents are likely to copy for similar tasks.
* **Quadrant 3: Investigate (High Business Impact, Low Proliferation Risk):** This debt is causing problems but is located in specialized, non-reusable, or legacy code that the AI is unlikely to learn from. Its remediation should be scheduled based on business needs and product roadmaps.
  * *Example:* A performance bottleneck in a one-off data migration script.
* **Quadrant 4: Document (Low Business Impact, Low Proliferation Risk):** This is low-priority debt. Its existence should be documented in the backlog to prevent future developers from being confused by it, but it should only be addressed opportunistically, for example, when a developer is already working in that part of the code.
  * *Example:* A poorly named variable in a deprecated module.

This prioritization matrix provides a strategic framework for allocating limited resources effectively, focusing not just on fixing past mistakes but on safeguarding the future integrity of the codebase in an AI-driven environment.

## **Part III: Strategies for Remediation and Prevention**

Identifying and prioritizing debt are critical first steps, but value is only realized when that debt is actively remediated and, more importantly, prevented from accumulating in the first place. This part provides actionable, concrete strategies for both fixing existing debt and establishing a development culture and technical environment that fosters quality in agentic workflows. It emphasizes the crucial synergy between strategic human oversight and high-speed agentic execution.

### **Section 8: The Human-AI Collaborative Remediation Process**

The most effective model for paying down agentic debt involves a clear and deliberate division of labor that leverages the unique strengths of both human developers and AI agents. Conflating their roles leads to failure; separating their concerns enables efficient and effective remediation.

#### **8.1 Defining Roles: The Human as Architect, the AI as Refactoring Engine**

The remediation process must be bifurcated into two distinct activities:

1. **Architectural Re-alignment (Human-led):** Humans excel at contextual understanding, strategic thinking, and architectural design.36 Therefore, the first step in any significant remediation effort must be human-led. A senior developer or architect analyzes the debt hotspot (identified in Part II), reverse-engineers the missing context and intent, and defines a clear, unambiguous "target state" for the refactored code. This is a creative, context-driven activity that AI currently struggles with.13
2. **Code Transformation (AI-assisted):** Once the "why" and "what" have been defined by the human, the "how" can be largely delegated to an AI agent. The target architecture is broken down into a series of specific, pattern-based tasks that are fed to the AI as prompts.29 This leverages the AI's strength in high-speed, pattern-based code manipulation while being guided by human intelligence.

#### **8.2 AI-Powered Refactoring**

AI agents can execute a wide range of refactoring tasks with high efficiency when given clear instructions. Empirical studies have shown that AI can successfully resolve up to 90% of identified code quality issues when directed by a human.38 Common AI-driven refactoring tasks include:

* **Modularization:** Extracting duplicated code blocks into a single, reusable function or module.17
* **Improving Readability:** Renaming variables and functions for clarity, simplifying complex conditional logic, and reformatting code to adhere to style guides.
* **Optimizing Performance:** Identifying and rewriting inefficient algorithms or database queries.33
* **Modernizing Code:** Translating legacy code into a modern language or framework.

#### **8.3 Automated Test Generation for Safe Refactoring**

A significant barrier to refactoring, especially in legacy systems, is the fear of introducing regressions due to a lack of test coverage. AI agents can dramatically lower this barrier by automatically generating tests for previously untested code.3 By prompting an AI to "write comprehensive unit tests for this function, covering all edge cases," a developer can quickly create a safety net.8 This allows the subsequent refactoring (whether manual or AI-assisted) to proceed with much higher confidence, as the generated tests will immediately fail if the code's behavior changes unintentionally.

### **Section 9: Restoring Context and Repaying Documentation Debt**

Remediating contextual debt is not about changing code; it is about creating and restoring the missing knowledge surrounding it. Documentation in the agentic era is no longer a "nice-to-have" or a post-coding chore; it is an essential part of the "proof-of-work" for code acceptance. The burden of proof shifts from the code merely *working* to the code being *explainable*.

#### **9.1 AI-Assisted Documentation Generation**

AI agents are highly effective at alleviating documentation debt. They can be prompted to scan a codebase and automatically generate:

* **API Documentation:** Creating detailed documentation for public functions and classes, including parameter descriptions and return values, often in standard formats like OpenAPI.40
* **Function Docstrings:** Adding clear, concise explanations to individual functions, describing their purpose, inputs, and outputs.
* **Usage Examples:** Generating practical code snippets that demonstrate how to use a particular function or module correctly.33

#### **9.2 Prompting for Rationale**

A key preventative measure is to make the generation of rationale a mandatory part of the code generation process itself. Prompts should be structured to demand not just code, but also a clear, human-readable explanation of the code's logic, the assumptions it makes, and the trade-offs considered. This explanation should be captured and refined by the developer and placed directly in the pull request description.41 This practice makes the PR description a critical artifact of intent, as important as the code diff itself, and directly counteracts the creation of contextual debt at its source.

#### **9.3 Visualizing Architecture**

For codebases already suffering from high contextual debt, AI tools can aid in the "archaeology" process. By analyzing the code and its dependencies, AI can generate visualizations like dependency graphs, control flow diagrams, and architectural maps.32 These diagrams help human developers to reverse-engineer the de facto architecture of a context-deficient system, making it more understandable and providing a starting point for strategic refactoring.

### **Section 10: Preventative Governance: Architecting for AI**

The most effective long-term strategy for managing agentic debt is to create an environment where it is difficult for such debt to form. This involves architecting systems and processes specifically designed to guide AI agents toward producing high-quality, maintainable code. The quality of an agent's output is less a function of the agent's raw intelligence and more a function of the quality of the environment (the codebase and the standards) it operates in.

#### **10.1 Building "AI-Friendly" Codebases**

Research shows a dramatic velocity and quality gap between AI performance on low-debt versus high-debt codebases.36 Therefore, investing in architectural quality has a compounding return by directly increasing the productivity and reliability of all future agentic work. An "AI-friendly" codebase is characterized by:

* **High Modularity:** The system is broken down into small, interchangeable, and well-defined modules.6
* **Explicit Interfaces:** Modules interact through clear, stable, and well-documented APIs.
* **High Cohesion and Loose Coupling:** Each module has a single, well-defined responsibility (high cohesion) and minimal dependencies on other modules (loose coupling).

This type of architecture provides clear, consistent patterns for the AI to learn from and follow, reducing the likelihood of it generating incoherent or tightly coupled code. Architectural work is thus reframed from mere maintenance to "workforce enablement" for a team of AI collaborators.

#### **10.2 Establishing and Enforcing Standards with AI**

Teams must define clear, rigorous, and unambiguous coding standards, design patterns, and architectural principles. Crucially, AI tools should then be used to enforce these standards automatically.3 AI models can be trained or fine-tuned on a company's specific codebase and standards, allowing them to provide real-time corrections and suggestions that align with the established best practices. This creates a powerful, positive feedback loop where the AI helps maintain the very structure and quality it needs to perform effectively.

#### **10.3 The "Strangler Fig" Pattern for Legacy Systems**

When dealing with large, high-debt legacy systems, a "big bang" refactoring effort is often too risky and costly. The "strangler fig" pattern offers a more pragmatic approach.36 Instead of trying to fix the legacy monolith directly, the team builds new, clean, "AI-friendly" modules around the edges of the old system. New features are built in these modern modules, which gradually intercept and replace the functionality of the legacy core. This allows the team to immediately benefit from agentic development in the "greenfield" parts of the system while systematically and safely "strangling" the high-debt legacy code until it can be fully decommissioned.

### **Section 11: Advanced Prompt Engineering for Debt Mitigation**

In agentic development, the prompt is the primary specification document. A poorly written prompt is equivalent to a vague and incomplete user story, and the resulting technical and contextual debt is a direct consequence of that initial failure of specification. Therefore, the discipline and rigor once applied to requirements engineering must now be applied to the craft of prompt engineering.

#### **11.1 From Vague "Vibes" to Precise Specifications**

The core principle of debt-mitigating prompt engineering is to be as specific and context-rich as possible.43 The goal is to leave as little room for ambiguity and misinterpretation as possible, effectively guiding the AI toward the desired high-quality output.

#### **11.2 Key Prompting Techniques**

Effective prompts should incorporate several key techniques to constrain the AI's output and ensure it aligns with project standards:

* **Provide Persona and Context:** Begin the prompt by assigning the AI a role. For example: "You are a senior security engineer specializing in cloud infrastructure. Write a Terraform configuration..." This primes the model to access the relevant parts of its training data.43
* **Give Examples (Few-Shot Prompting):** Provide one or more examples of high-quality code that adheres to the project's style and architectural patterns. This is one of the most effective ways to guide the AI's output format and quality.43
* **Specify Constraints and Edge Cases:** Do not assume the AI will handle non-happy paths. Explicitly instruct it to include error handling, input validation, and logic for edge cases like null inputs or empty lists.21
* **Chain-of-Thought Prompting:** For complex tasks, instruct the model to "think step by step" before writing the code. This forces the AI to break down the problem and expose its reasoning process, which can then be reviewed and corrected by the human prompter.43
* **Demand Adherence to Standards:** Explicitly state the required standards in the prompt. For example: "Generate a Python class that follows SOLID principles. Ensure all public methods are documented with docstrings and have corresponding unit tests with 100% coverage of all logical branches".41
* **Use Negative Constraints Sparingly:** It is more effective to tell the AI what to do rather than what not to do. Instead of "Don't use technical jargon," use "Use clear and simple language accessible to a general audience".43

#### **11.3 Creating a Centralized Prompt Library**

To ensure consistency and disseminate best practices, teams should create a shared, version-controlled library of prompt templates for common tasks.29 This library becomes a living document where the team can collaboratively refine and improve the prompts that are proven to yield the best, lowest-debt results. This practice turns prompt engineering from an individual art into a collective engineering discipline.

### **Section 12: Reinventing Code Review for Agentic Workflows**

The code review process is the single most important governance checkpoint for preventing agentic debt from entering the main codebase. However, the traditional code review process is ill-equipped to handle the volume and unique failure modes of AI-generated code. The process must be reinvented to become a three-way validation of the alignment between human intent, AI interpretation, and system architecture.

#### **12.1 A Multi-Layered Approach**

An effective agentic code review process should be multi-layered, starting with full automation and escalating to nuanced human judgment.

* **Layer 1: Automated AI Review:** The first pass should be fully automated. AI-powered review tools can be integrated directly into the CI/CD pipeline to scan every pull request for common issues like syntax errors, style guide violations, potential bugs, and known security vulnerabilities.31 This provides immediate feedback and filters out low-level issues before they ever reach a human reviewer.

#### **12.2 The Human Reviewer's New Focus**

By automating the first layer of review, human reviewers are freed from tedious line-by-line checks and can concentrate on the high-level concerns where their contextual understanding provides unique value.31 The human review should focus on answering four key questions:

1. **Logical and Business Intent:** Does the code correctly solve the intended business problem? Does it align with the user story and acceptance criteria?.35
2. **Architectural Alignment:** Does the solution fit cleanly within the broader system architecture? Does it use the correct design patterns, and does it interact with other modules through the proper interfaces?.35
3. **Contextual Coherence (The Explainability Test):** Is the code understandable, maintainable, and "knowable"? Can the developer who prompted the code explain it satisfactorily?.
4. **Edge Cases and Failure Modes:** Has the AI adequately handled non-happy paths, potential failure states, and security edge cases that automated tools might miss?.35

#### **12.3 The Human-AI Pair Review**

The review process itself can be a collaborative human-AI activity. The human reviewer can use AI tools to accelerate their own analysis of a pull request.34 For example, a reviewer can prompt an AI assistant with questions about the code under review:

* "Explain the logic of this function in simple terms."
* "Are there any potential race conditions or security vulnerabilities in this block of code?"
* "Suggest alternative implementations that might be more efficient."

This turns the AI from just the subject of the review into an active participant, helping the human reviewer to understand complex code and identify potential issues more quickly.

## **Part IV: An Integrated Management Framework**

The preceding strategies, while powerful in isolation, are most effective when integrated into a single, cohesive, and cyclical framework. This final part of the report synthesizes the entire analysis into a holistic lifecycle for managing agentic debt. It moves beyond a reactive, "debt backlog" mentality to a proactive, "systemic hygiene" model designed for the high-velocity, high-risk environment of agentic software engineering.

### **Section 13: The Agentic Debt Management Lifecycle (ADML)**

The speed of agentic debt accumulation makes traditional backlog management untenable; by the time an issue is prioritized, the flawed pattern may have been replicated dozens of times.13 The Agentic Debt Management Lifecycle (ADML) addresses this by focusing on continuous improvement and upstream prevention. Inspired by quality management cycles like Plan-Do-Check-Act, the ADML consists of four iterative phases.

#### **13.1 A Cyclical Framework**

1. **Phase 1: Govern (Plan):** This is the primary preventative phase, focused on creating an environment that minimizes debt creation at its source. Activities in this phase include:
   * Establishing and documenting clear architectural principles, "AI-friendly" design patterns, and rigorous coding standards.
   * Curating and maintaining a centralized library of high-quality, debt-mitigating prompt templates.
   * Configuring and deploying automated quality gates (SAST, complexity scanners, etc.) in the CI/CD pipeline.
   * Training the development team on disciplined prompt engineering, the principles of contextual debt, and the reinvented code review process.
2. **Phase 2: Generate & Verify (Do):** This phase covers the active development process. The focus is on generating code in a way that preserves context and validates quality from the outset.
   * Developers use disciplined prompt engineering, leveraging the central prompt library.
   * The "Definition of Done" for any task must include not just functional code, but also comprehensive, AI-generated tests and a clear, human-vetted rationale in the pull request description.
   * Human-AI pair programming is encouraged to ensure human oversight during the creative process.29
3. **Phase 3: Detect & Assess (Check):** This is the continuous monitoring phase, designed to provide real-time visibility into the health of the system.
   * Automated tools continuously scan the codebase for technical debt indicators (from Section 5\) and analyze repository metadata for contextual debt signals (from Section 6).
   * A dashboard of key health metrics (Refactoring Ratio, Defect Density in AI-code, etc.) is maintained and reviewed regularly.
   * All pull requests undergo the multi-layered code review process, with a strong emphasis on the "Explainability Test."
4. **Phase 4: Prioritize & Remediate (Act):** This is the remediation phase, where identified debt is systematically addressed.
   * The Agentic Debt Prioritization Matrix (from Section 7\) is used to identify the most critical debt to tackle, with a focus on high Proliferation Risk items.
   * The human-AI collaborative refactoring process (from Section 8\) is used to efficiently pay down the debt.
   * Crucially, the lessons learned from remediation are fed back into the **Govern** phase. For example, if a recurring anti-pattern is found, the governance is updated to include a new linting rule to detect it and a new prompt template designed to avoid it.

#### **13.2 Integrating with Agile and DevOps**

The ADML is designed to be integrated directly into existing development methodologies:

* **Agile Integration:** A fixed percentage of each sprint's capacity (e.g., 15-20%) should be allocated to "Remediate" tasks from the ADML cycle.9 Sprint reviews should include a discussion of the key debt metrics and any changes to the "Govern" phase.
* **DevOps Integration:** The "Detect & Assess" phase should be implemented as a mandatory quality gate in the CI/CD pipeline.32 A build should fail if, for example, code duplication exceeds a certain threshold or a critical security vulnerability is detected. This provides a hard backstop against the accumulation of high-risk debt.

This cyclical, integrated approach transforms debt management from a discrete, reactive task ("fix this bug") into a continuous, proactive process ("improve the system's resistance to debt"). This is a more sustainable and scalable model for the agentic era.

### **Section 14: Recommendations for Agentic System Self-Improvement**

The ultimate solution to agentic debt is to make the agent itself "debt-aware." By equipping agentic systems with the same conceptual models and analytical tools that human experts use, it is possible to create a self-healing system where the agent not only writes code but also actively participates in maintaining the long-term health and integrity of the codebase. This final section reframes the report's findings as a set of direct, machine-actionable recommendations for the next generation of agentic coding systems.

#### **14.1 From Tool to Teammate**

The evolution from a simple code-generating tool to a responsible software engineering teammate requires the agent to internalize the principles of debt management.41 An advanced agent should be able to execute a self-correction and improvement loop based on the frameworks presented in this report.

#### **14.2 Heuristics for Self-Correction**

The following decision tree provides a blueprint for a debt-aware agent tasked with improving or refactoring a repository:

* **Step 1: Analyze Debt Profile.** Upon being given a task, the agent's first action is to perform a full-system analysis. It should ingest the codebase and its version control history to calculate the key metrics defined in Section 5 (e.g., duplication score, cyclomatic complexity, code churn, refactoring ratio). It should then use the Taxonomy of Agentic Debt Patterns (Section 4\) to classify potential debt hotspots.
* **Step 2: Identify Contextual Gaps.** The agent should scan for indicators of contextual debt. This includes identifying code sections with low test coverage, missing or boilerplate documentation, or anomalously high churn rates. It should flag these areas and, if possible, prompt its human collaborator for clarification using the principles of the "Explainability Test" (e.g., "The function process\_data in utils.py has been modified 27 times in the last 30 days and lacks documentation. Can you explain its intended purpose and constraints before I proceed?").
* **Step 3: Propose Targeted, Justified Refactoring.** Instead of making opaque "improvements," the agent must propose specific, pattern-based changes with a clear justification. For example: "I have identified 17 instances of a similar database query pattern. I propose refactoring them into a single parameterized function with the signature (session, user\_id). This will reduce 150 lines of duplicated code and centralize query logic, improving maintainability. Do you approve?".
* **Step 4: Prioritize Based on Proliferation Risk.** When analyzing multiple debt items, the agent should use the Agentic Debt Prioritization Matrix (Section 7\) to prioritize fixing patterns that are simple, common, and therefore most likely to be copied by other agents (or itself) in the future. It should be able to explain its prioritization: "I recommend fixing this inefficient sorting algorithm first, not because it is the biggest performance bottleneck, but because it is a highly reusable pattern with a high risk of proliferation."

#### **14.3 The Future of Agentic Software Engineering**

An agent that can execute this self-correction loop is no longer just an amplifier of debt; it becomes a key partner in its management. This represents the necessary evolution from a simple tool to a responsible, collaborating agent. This vision of "Software Engineering 3.0" is one where hybrid teams of human architects and debt-aware AI agents work together, with humans setting the strategic direction and agents both implementing features and actively participating in the continuous process of maintaining the system's health, quality, and resilience. The frameworks and principles outlined in this report provide the foundational blueprint for building these intelligent and trustworthy AI coding agents of the future.

#### **Works cited**

1. What is Technical Debt? \- IBM, accessed September 9, 2025, [https://www.ibm.com/think/topics/technical-debt](https://www.ibm.com/think/topics/technical-debt)
2. Technical Debt (Tech Debt): A Complete Guide \- Confluent, accessed September 9, 2025, [https://www.confluent.io/learn/tech-debt/](https://www.confluent.io/learn/tech-debt/)
3. What Is Technical Debt in AI Codes & How to Manage It \- GAP, accessed September 9, 2025, [https://www.growthaccelerationpartners.com/blog/what-is-technical-debt-in-ai-generated-codes-how-to-manage-it](https://www.growthaccelerationpartners.com/blog/what-is-technical-debt-in-ai-generated-codes-how-to-manage-it)
4. Generative A.I, technical debt is dead.. long live technical debt | by Wilfried Bessovi | Medium, accessed September 9, 2025, [https://medium.com/@wbessovi/generative-ai-technical-debt-is-dead-long-live-technical-debt-5593b9385f85](https://medium.com/@wbessovi/generative-ai-technical-debt-is-dead-long-live-technical-debt-5593b9385f85)
5. www.productplan.com, accessed September 9, 2025, [https://www.productplan.com/glossary/technical-debt/\#:\~:text=Technical%20debt%20(also%20known%20as,speedy%20delivery%20over%20perfect%20code.](https://www.productplan.com/glossary/technical-debt/#:~:text=Technical%20debt%20\(also%20known%20as,speedy%20delivery%20over%20perfect%20code.)
6. What is Technical Debt? \[+How to Manage It\] | Atlassian, accessed September 9, 2025, [https://www.atlassian.com/agile/software-development/technical-debt](https://www.atlassian.com/agile/software-development/technical-debt)
7. What is Technical Debt? Examples, Prevention & Best Practices, accessed September 9, 2025, [https://www.mendix.com/blog/what-is-technical-debt/](https://www.mendix.com/blog/what-is-technical-debt/)
8. What Is Technical Debt: Common Causes & How to Reduce It | DigitalOcean, accessed September 9, 2025, [https://www.digitalocean.com/resources/articles/what-is-technical-debt](https://www.digitalocean.com/resources/articles/what-is-technical-debt)
9. The 4 Types of Tech Debt: With Examples and Fixes \- Stepsize AI, accessed September 9, 2025, [https://www.stepsize.com/blog/types-of-tech-debt-with-examples-and-fixes](https://www.stepsize.com/blog/types-of-tech-debt-with-examples-and-fixes)
10. How to Manage Tech Debt in the AI Era, accessed September 9, 2025, [https://sloanreview.mit.edu/article/how-to-manage-tech-debt-in-the-ai-era/](https://sloanreview.mit.edu/article/how-to-manage-tech-debt-in-the-ai-era/)
11. Limitations of AI Coding Assistants: What You Need to Know, accessed September 9, 2025, [https://zencoder.ai/blog/limitations-of-ai-coding-assistants](https://zencoder.ai/blog/limitations-of-ai-coding-assistants)
12. 6 limitations of AI code assistants and why developers should be cautious \- All Things Open, accessed September 9, 2025, [https://allthingsopen.org/articles/ai-code-assistants-limitations](https://allthingsopen.org/articles/ai-code-assistants-limitations)
13. Why AI-generated code is creating a technical debt nightmare | Okoone, accessed September 9, 2025, [https://www.okoone.com/spark/technology-innovation/why-ai-generated-code-is-creating-a-technical-debt-nightmare/](https://www.okoone.com/spark/technology-innovation/why-ai-generated-code-is-creating-a-technical-debt-nightmare/)
14. The Pitfalls of Generative AI: How to Avoid Deepening Technical Debt \- RTInsights, accessed September 9, 2025, [https://www.rtinsights.com/the-pitfalls-of-generative-ai-how-to-avoid-deepening-technical-debt/](https://www.rtinsights.com/the-pitfalls-of-generative-ai-how-to-avoid-deepening-technical-debt/)
15. Analyzing the concept of technical debt in the context of agile software development: A systematic literature review \- arXiv, accessed September 9, 2025, [https://arxiv.org/abs/2401.14882](https://arxiv.org/abs/2401.14882)
16. Reducing Technical Debt with AI-powered Testing: A Smarter Approach to Agile Development | by Aseem Bakshi | Medium, accessed September 9, 2025, [https://medium.com/@WebomatesInc/reducing-technical-debt-with-ai-powered-testing-a-smarter-approach-to-agile-development-d1e1c2386723](https://medium.com/@WebomatesInc/reducing-technical-debt-with-ai-powered-testing-a-smarter-approach-to-agile-development-d1e1c2386723)
17. Can AI solve the rising costs of technical debt? \- AlixPartners, accessed September 9, 2025, [https://www.alixpartners.com/insights/102jlar/can-ai-solve-the-rising-costs-of-technical-debt/](https://www.alixpartners.com/insights/102jlar/can-ai-solve-the-rising-costs-of-technical-debt/)
18. How to Use AI to Reduce Technical Debt \- Semaphore CI, accessed September 9, 2025, [https://semaphore.io/blog/ai-technical-debt](https://semaphore.io/blog/ai-technical-debt)
19. AI can fix typos but create alarming hidden threats: New study sounds warning for techies relying on chatbots for coding, accessed September 9, 2025, [https://m.economictimes.com/magazines/panache/ai-can-fix-typos-but-create-alarming-hidden-threats-new-study-sounds-warning-for-techies-relying-on-chatbots-for-coding/articleshow/123783245.cms](https://m.economictimes.com/magazines/panache/ai-can-fix-typos-but-create-alarming-hidden-threats-new-study-sounds-warning-for-techies-relying-on-chatbots-for-coding/articleshow/123783245.cms)
20. Reducing AI code debt: A human-supervised PDCA framework for sustainable development, accessed September 9, 2025, [https://agilealliance.org/reducing-ai-code-debt/](https://agilealliance.org/reducing-ai-code-debt/)
21. How AI-Generated Code is messing with your Technical Debt \- Kodus, accessed September 9, 2025, [https://kodus.io/en/ai-generated-code-is-messing-with-your-technical-debt/](https://kodus.io/en/ai-generated-code-is-messing-with-your-technical-debt/)
22. Vibe coding: Because who doesn't love surprise technical debt\!?, accessed September 9, 2025, [https://www.coderabbit.ai/blog/vibe-coding-because-who-doesnt-love-surprise-technical-debt](https://www.coderabbit.ai/blog/vibe-coding-because-who-doesnt-love-surprise-technical-debt)
23. The Dark Side of Vibe-Coding: Debugging, Technical Debt & Security Risks, accessed September 9, 2025, [https://dev.to/arbisoftcompany/the-dark-side-of-vibe-coding-debugging-technical-debt-security-risks-9ef](https://dev.to/arbisoftcompany/the-dark-side-of-vibe-coding-debugging-technical-debt-security-risks-9ef)
24. The Rise of Vibe Coding and the Tech Debt Time Bomb | Montana Banana, accessed September 9, 2025, [https://montanab.com/2025/08/the-rise-of-vibe-coding-and-the-tech-debt-time-bomb/](https://montanab.com/2025/08/the-rise-of-vibe-coding-and-the-tech-debt-time-bomb/)
25. Vibe Coding: The Future of AI-Powered Development or a Recipe for Technical Debt?, accessed September 9, 2025, [https://blog.bitsrc.io/vibe-coding-the-future-of-ai-powered-development-or-a-recipe-for-technical-debt-2fd3a0a4e8b3](https://blog.bitsrc.io/vibe-coding-the-future-of-ai-powered-development-or-a-recipe-for-technical-debt-2fd3a0a4e8b3)
26. (PDF) Hidden Technical Debt in Machine Learning Systems \- ResearchGate, accessed September 9, 2025, [https://www.researchgate.net/publication/319769912\_Hidden\_Technical\_Debt\_in\_Machine\_Learning\_Systems](https://www.researchgate.net/publication/319769912_Hidden_Technical_Debt_in_Machine_Learning_Systems)
27. Investigating Issues that Lead to Code Technical Debt in Machine Learning Systems \- arXiv, accessed September 9, 2025, [https://arxiv.org/abs/2502.13011](https://arxiv.org/abs/2502.13011)
28. Effectively managing Technical Debt with Generative AI \- CrossML, accessed September 9, 2025, [https://www.crossml.com/effectively-managing-technical-debt-with-generative-ai/](https://www.crossml.com/effectively-managing-technical-debt-with-generative-ai/)
29. Maintaining Code Quality in the Age of Generative AI: 7 Essential ..., accessed September 9, 2025, [https://medium.com/@conneyk8/maintaining-code-quality-in-the-age-of-generative-ai-7-essential-strategies-b526532432e4](https://medium.com/@conneyk8/maintaining-code-quality-in-the-age-of-generative-ai-7-essential-strategies-b526532432e4)
30. Using AI to Predict Technical Debt Before It Accumulates \- CodeStringers, accessed September 9, 2025, [https://www.codestringers.com/insights/ai-to-predict-technical-debt/](https://www.codestringers.com/insights/ai-to-predict-technical-debt/)
31. AI Code Reviews · GitHub, accessed September 9, 2025, [https://github.com/resources/articles/ai/ai-code-reviews](https://github.com/resources/articles/ai/ai-code-reviews)
32. Managing Technical Debt with AI-Powered Productivity Tools: A Complete Guide \- Qodo, accessed September 9, 2025, [https://www.qodo.ai/blog/managing-technical-debt-ai-powered-productivity-tools-guide/](https://www.qodo.ai/blog/managing-technical-debt-ai-powered-productivity-tools-guide/)
33. Reduce Technical Debt with AI Software Development Solutions | Concord USA, accessed September 9, 2025, [https://www.concordusa.com/blog/reducing-technical-debt-with-ai](https://www.concordusa.com/blog/reducing-technical-debt-with-ai)
34. 20 Best AI Coding Assistant Tools \[Updated Aug 2025\] \- Qodo, accessed September 9, 2025, [https://www.qodo.ai/blog/best-ai-coding-assistant-tools/](https://www.qodo.ai/blog/best-ai-coding-assistant-tools/)
35. How to review code written by AI \- Graphite, accessed September 9, 2025, [https://graphite.dev/guides/how-to-review-code-written-by-ai](https://graphite.dev/guides/how-to-review-code-written-by-ai)
36. AI Makes Tech Debt More Expensive \- Gauge \- Solving the monolith/microservices dilemma, accessed September 9, 2025, [https://www.gauge.sh/blog/ai-makes-tech-debt-more-expensive](https://www.gauge.sh/blog/ai-makes-tech-debt-more-expensive)
37. How to Utilize Human-AI Collaboration for Enhancing Software Development \- testRigor AI-Based Automated Testing Tool, accessed September 9, 2025, [https://testrigor.com/blog/how-to-utilize-human-ai-collaboration-for-enhancing-software-development/](https://testrigor.com/blog/how-to-utilize-human-ai-collaboration-for-enhancing-software-development/)
38. Design and Evaluation of an AI-Driven Workflow for Technical Debt Remediation in Software Systems \- UTUPub, accessed September 9, 2025, [https://www.utupub.fi/bitstream/handle/10024/182685/Khalil\_Rehan\_Thesis.pdf?sequence=1\&isAllowed=y](https://www.utupub.fi/bitstream/handle/10024/182685/Khalil_Rehan_Thesis.pdf?sequence=1&isAllowed=y)
39. Use These AI Workflows To Reduce Your Technical Debt \- The New Stack, accessed September 9, 2025, [https://thenewstack.io/use-these-ai-workflows-to-reduce-your-technical-debt/](https://thenewstack.io/use-these-ai-workflows-to-reduce-your-technical-debt/)
40. Vibe Coding vs. Agentic Coding: Fundamentals and Practical Implications of Agentic AI, accessed September 9, 2025, [https://arxiv.org/html/2505.19443v1](https://arxiv.org/html/2505.19443v1)
41. Agentic Software Engineering: Foundational Pillars and a Research Roadmap \- arXiv, accessed September 9, 2025, [https://arxiv.org/html/2509.06216v1](https://arxiv.org/html/2509.06216v1)
42. Is AI Bloating Your Technical Debt? What You Need to Know \- Virtasant, accessed September 9, 2025, [https://www.virtasant.com/ai-today/is-ai-bloating-your-technical-debt-what-you-need-to-know](https://www.virtasant.com/ai-today/is-ai-bloating-your-technical-debt-what-you-need-to-know)
43. Prompt Engineering Best Practices: Tips, Tricks, and Tools | DigitalOcean, accessed September 9, 2025, [https://www.digitalocean.com/resources/articles/prompt-engineering-best-practices](https://www.digitalocean.com/resources/articles/prompt-engineering-best-practices)
44. General Tips for Designing Prompts | Prompt Engineering Guide, accessed September 9, 2025, [https://www.promptingguide.ai/introduction/tips](https://www.promptingguide.ai/introduction/tips)
45. 10 Prompt Engineering Best Practices | by Pieces \- Medium, accessed September 9, 2025, [https://pieces.medium.com/10-prompt-engineering-best-practices-a166fe2f101b](https://pieces.medium.com/10-prompt-engineering-best-practices-a166fe2f101b)
46. graphite.dev, accessed September 9, 2025, [https://graphite.dev/guides/how-to-review-code-written-by-ai\#:\~:text=Best%20practices%20for%20reviewing%20AI%2Dwritten%20code\&text=Look%20for%20logical%20inconsistencies%3A%20Since,extra%20attention%20to%20these%20areas.](https://graphite.dev/guides/how-to-review-code-written-by-ai#:~:text=Best%20practices%20for%20reviewing%20AI%2Dwritten%20code&text=Look%20for%20logical%20inconsistencies%3A%20Since,extra%20attention%20to%20these%20areas.)
47. AI Agentic Programming: A Survey of Techniques ... \- arXiv, accessed September 9, 2025, [https://arxiv.org/abs/2508.11126](https://arxiv.org/abs/2508.11126)

--- END OF docs/Agentic Coding Debt Management Research.md ---

--- START OF package.json ---

{
  "name": "logomesh",
  "version": "0.1.0",
  "private": true,
  "workspaces": [
    "server"
  ],
  "config-overrides-path": "config-overrides.cjs",
  "type": "module",
  "dependencies": {
    "@babel/preset-env": "^7.27.1",
    "@babel/preset-react": "^7.27.1",
    "@testing-library/dom": "^10.4.0",
    "@types/express-rate-limit": "^6.0.2",
    "@types/multer": "^1.4.12",
    "@types/pg": "^8.15.4",
    "@types/request-ip": "^0.0.41",
    "babel-plugin-module-resolver": "^5.0.2",
    "canvas": "^3.1.1",
    "cors": "^2.8.5",
    "cytoscape": "^3.32.0",
    "cytoscape-cose-bilkent": "^4.1.0",
    "cytoscape-fcose": "^2.2.0",
    "eslint": "^9.29.0",
    "eslint-config-prettier": "^10.1.5",
    "eslint-plugin-react": "^7.37.5",
    "express": "^5.1.0",
    "express-rate-limit": "^8.1.0",
    "express-validator": "^7.2.1",
    "http-proxy-middleware": "^3.0.5",
    "isolated-vm": "6.0.1",
    "jsonwebtoken": "^9.0.2",
    "multer": "^2.0.0",
    "neo4j-driver": "^5.28.1",
    "pg": "^8.16.2",
    "prettier": "^3.5.3",
    "react": "^18.2.0",
    "react-cytoscapejs": "^2.0.0",
    "react-dom": "^18.2.0",
    "react-scripts": "^5.0.1",
    "reactflow": "^11.11.4",
    "request-ip": "^3.3.0",
    "serve": "^14.2.4",
    "sqlite3": "^5.1.7",
    "ulid": "^3.0.0"
  },
  "scripts": {
    "start": "PORT=5000 react-app-rewired start",
    "build": "react-app-rewired build",
    "test": "vitest run --coverage",
    "test:e2e": "concurrently --kill-others --success first \"npm run server\" \"wait-on http://localhost:3001/api/v1/health && npm test\"",
    "test:export": "node scripts/test-with-error-export.js",
    "eject": "react-scripts eject",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src/ core/ contracts/ server/src/",
    "lint:strict": "eslint core/ server/src/ --max-warnings 0 --ignore-pattern \"**/*.test.ts\"",
    "lint:fix": "eslint src/ core/ contracts/ server/src/ --fix",
    "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,css,md}\" \"core/**/*.{js,jsx,ts,tsx,json,css,md}\" \"contracts/**/*.{js,jsx,ts,tsx,json,css,md}\" \"server/src/**/*.{js,jsx,ts,tsx,json,css,md}\"",
    "validate": "npm run lint:strict && npm run typecheck && npm run test",
    "dev": "concurrently \"npm run start\" \"npm run dev -w logomesh-server\"",
    "server": "npm run dev -w logomesh-server",
    "full-test": "npm run test:coverage && npm run lint && npm run typecheck",
    "test:capture": "node scripts/test-runner.js"
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "src/**/*.{js,jsx,ts,tsx,json,css,md}": [
      "prettier --write",
      "npm test -- --findRelatedTests",
      "git add"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "@babel/plugin-transform-modules-commonjs": "^7.27.1",
    "@eslint/eslintrc": "^3.3.1",
    "@eslint/js": "^9.29.0",
    "@jest-mock/express": "^3.0.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/cors": "^2.8.18",
    "@types/d3-dispatch": "3.0.6",
    "@types/express": "^5.0.2",
    "@types/jest": "^29.5.12",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/node": "^22.15.23",
    "@types/react": "^19.1.4",
    "@types/react-dom": "^19.1.5",
    "@types/sqlite3": "^3.1.11",
    "@types/supertest": "^6.0.3",
    "@types/uuid": "^10.0.0",
    "@typescript-eslint/eslint-plugin": "^8.41.0",
    "@typescript-eslint/parser": "^8.41.0",
    "@vitejs/plugin-react": "^5.0.2",
    "@vitest/coverage-v8": "0.34.6",
    "@vitest/ui": "0.34.6",
    "concurrently": "^9.2.1",
    "eslint-import-resolver-typescript": "^4.4.4",
    "eslint-plugin-import": "^2.32.0",
    "globals": "^16.2.0",
    "jsdom": "22.1.0",
    "nodemon": "^3.1.10",
    "react-app-rewired": "^2.2.1",
    "supertest": "^7.1.4",
    "tailwindcss": "^4.1.13",
    "ts-jest": "^29.3.2",
    "ts-node": "^10.9.2",
    "typescript": "^4.9.5",
    "uuid": "^13.0.0",
    "vitest": "0.34.6",
    "web-vitals": "^5.1.0",
    "wait-on": "^7.0.1"
  },
  "description": "LogoMesh - Advanced thought mapping and cognitive assistance platform",
  "main": "config-overrides.cjs",
  "directories": {
    "doc": "docs"
  },
  "keywords": [
    "thought-mapping",
    "cognitive-assistance",
    "knowledge-management",
    "ai-integration",
    "graph-visualization"
  ],
  "author": "LogoMesh Team",
  "license": "ISC"
}


--- END OF package.json ---

--- START OF core/IdeaManager.ts ---

// Placeholder IdeaManager
// TODO: Implement full IdeaManager functionality

import { logger } from './utils/logger'; // Assuming logger is in core/utils
import { PostgresAdapter } from '../server/src/db/postgresAdapter';
import { StorageAdapter, NewThoughtData, NewSegmentData } from '../contracts/storageAdapter'; // Import New... types
import { Thought, Segment } from '../contracts/entities'; // Assuming entities are in contracts


export class IdeaManager {
  private storageAdapter: StorageAdapter;
  constructor(storageAdapter: StorageAdapter = new PostgresAdapter()) {
    this.storageAdapter = storageAdapter;
    logger.info('[IdeaManager] Initialized (Placeholder)');
  }

  async getThoughtById(id: string, userId: string): Promise<Thought | null> {
    logger.info(`[IdeaManager] Getting thought by ID: ${id} for user: ${userId} (Placeholder)`);
    return this.storageAdapter.getThoughtById(id, userId); // Pass userId
  }

  async createThought(thoughtData: NewThoughtData, userId?: string): Promise<Thought> { // Corrected type, added optional userId
    logger.info(`[IdeaManager] Creating thought (Placeholder)`, thoughtData);
    return this.storageAdapter.createThought(thoughtData, userId);
  }

  async getThoughts(userId = 'anonymous'): Promise<Thought[]> {
    logger.info(`[IdeaManager] Getting all thoughts for user: ${userId} (Placeholder)`);
    return this.storageAdapter.getAllThoughts(userId);
  }

  async addThought(userId: string, thoughtData: NewThoughtData): Promise<Thought> {
    logger.info(`[IdeaManager] Adding thought (Placeholder)`, thoughtData);
    return this.storageAdapter.createThought(thoughtData, userId);
  }

  async updateThought(userId: string, id: string, updates: Partial<NewThoughtData>): Promise<Thought | null> {
    logger.info(`[IdeaManager] Updating thought ID: ${id} for user: ${userId} (Placeholder)`, updates);
    return this.storageAdapter.updateThought(id, updates, userId);
  }

  async deleteThought(userId: string, id: string): Promise<boolean> {
    logger.info(`[IdeaManager] deleting thought ID: ${id} for user: ${userId} (Placeholder)`);
    return this.storageAdapter.deleteThought(id, userId);
  }

  async addSegment(userId: string, thoughtId: string, segmentData: NewSegmentData): Promise<Segment | null> {
    logger.info(`[IdeaManager] Adding segment to thought ID: ${thoughtId} for user: ${userId} (Placeholder)`, segmentData);
    return this.storageAdapter.createSegment(thoughtId, segmentData, userId);
  }

  async updateSegment(thoughtId: string, segmentId: string, updates: Partial<NewSegmentData>, userId?: string): Promise<Segment | null> {
    logger.info(`[IdeaManager] Updating segment ID: ${segmentId} for thought ID: ${thoughtId} user: ${userId} (Placeholder)`, updates);
    return this.storageAdapter.updateSegment(thoughtId, segmentId, updates, userId);
  }

  async deleteSegment(thoughtId: string, segmentId: string, userId?: string): Promise<boolean> {
    logger.info(`[IdeaManager] Deleting segment ID: ${segmentId} for thought ID: ${thoughtId} user: ${userId} (Placeholder)`);
    return this.storageAdapter.deleteSegment(thoughtId, segmentId, userId);
  }
}

--- END OF core/IdeaManager.ts ---

--- START OF contracts/storageAdapter.ts ---

import { Thought, Segment } from './entities';

/**
 * Input type for creating a new thought (excludes generated fields)
 */
export interface NewThoughtData {
  id?: string;
  title: string;
  content?: string;
  description?: string;
  tags?: Array<{ name: string; color: string }>;
  position?: { x: number; y: number };
  color?: string;
  fields?: Record<string, unknown>; // Changed from any
  metadata?: Record<string, unknown>; // Changed from any
}

/**
 * Input type for creating a new segment (excludes generated fields)
 */
export interface NewSegmentData {
  id?: string;
  title?: string;
  content: string;
  content_type?: string;
  asset_path?: string;
  fields?: Record<string, unknown>; // Changed from any
  abstraction_level?: string;
  local_priority?: number;
  cluster_id?: string;
  thoughtId?: string;
  segmentType?: string;
  metadata?: Record<string, unknown>; // Changed from any
  positionX?: number;
  positionY?: number;
}

/**
 * Storage adapter interface for persistent data operations
 * Provides async CRUD methods for Thoughts and Segments
 */
export interface StorageAdapter {
  // Thought operations
  getAllThoughts(_userId?: string): Promise<Thought[]>;
  getThoughtById(_thoughtId: string, _userId?: string): Promise<Thought | null>;
  createThought(_thoughtData: NewThoughtData, _userId?: string): Promise<Thought>;
  updateThought(_thoughtId: string, _updates: Partial<NewThoughtData>, _userId?: string): Promise<Thought | null>;
  deleteThought(_thoughtId: string, _userId?: string): Promise<boolean>;

  // Segment operations
  getSegmentsForThought(_thoughtId: string, _userId?: string): Promise<Segment[]>;
  getSegmentById(_segmentId: string, _userId?: string): Promise<Segment | null>;
  createSegment(_thoughtId: string, _segmentData: NewSegmentData, _userId?: string): Promise<Segment>;
  updateSegment(_thoughtId: string, _segmentId: string, _updates: Partial<NewSegmentData>, _userId?: string): Promise<Segment | null>;
  deleteSegment(_thoughtId: string, _segmentId: string, _userId?: string): Promise<boolean>;

  // Utility operations
  initialize(): Promise<void>;
  close(): Promise<void>;
  healthCheck(): Promise<{ status: 'ok' | 'error'; message?: string }>;
}

--- END OF contracts/storageAdapter.ts ---

--- START OF server/src/server.ts ---

import app, { startServer } from './index';
import { logger } from '../../core/utils/logger';
import config from '../../core/config';

const PORT = config.server.port;
const apiBasePath = config.server.apiBasePath;

startServer().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Health check available at http://localhost:${PORT}${apiBasePath}/health`);
    logger.info(`API base URL: http://localhost:${PORT}${apiBasePath}`);
  });
}).catch(error => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

--- END OF server/src/server.ts ---

--- START OF src/App.tsx ---

import React, { useState, useEffect } from 'react';
import Canvas from './components/Canvas';
import AddThoughtModal from './components/AddThoughtModal';
import Sidebar from './components/Sidebar';
import ThoughtDetailPanel from './components/ThoughtDetailPanel';
import DevAssistantPanel from './components/DevAssistantPanel';
import * as apiService from './services/apiService';
import { authService, User } from './services/authService';
import './App.css';
import { Thought } from '../contracts/entities';
import { NewThoughtData } from '@contracts/storageAdapter';

function App() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [selectedThought, setSelectedThought] = useState<Thought | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDevAssistant, setShowDevAssistant] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<string[]>([]); // Add activeFilters state

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    setIsLoading(true);
    try {
      // Check authentication first
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);

      // Load thoughts if authenticated
      if (currentUser && currentUser.isAuthenticated) {
        await loadThoughts();
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadThoughts = async () => {
    try {
      const fetchedThoughts = await apiService.fetchThoughts();
      setThoughts(fetchedThoughts);
    } catch (error) {
      console.error("Failed to fetch thoughts:", error);
    }
  };

  const handleCreateThought = async (thoughtData: NewThoughtData): Promise<Thought> => {
    try {
      const newThought = await apiService.createThoughtApi(thoughtData);
      setThoughts([...thoughts, newThought]);
      setIsModalOpen(false);
      return newThought;
    } catch (error) {
      console.error("Failed to create thought:", error);
      throw error;
    }
  };

  const handleUpdateThought = async (id: string, updatedThought: Partial<NewThoughtData>) => {
    try {
      await apiService.updateThoughtApi(id, updatedThought);
      const updatedThoughts = thoughts.map(thought =>
        thought.id === id ? { ...thought, ...updatedThought } as Thought : thought
      );
      setThoughts(updatedThoughts);
      if (selectedThought && selectedThought.id === id) {
        setSelectedThought({ ...selectedThought, ...updatedThought } as Thought);
      }
    } catch (error) {
      console.error("Failed to update thought:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="app loading">
        <div className="loading-spinner">
          <p>Loading LogoMesh...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.isAuthenticated) {
    return (
      <div className="app auth-required">
        <div className="auth-container">
          <h1>Welcome to LogoMesh</h1>
          <p>Please log in with your Replit account to access your thoughts and ideas.</p>
          <div className="auth-button-container">
            <script
              data-authenticated="location.reload()"
              src="https://auth.util.repl.co/script.js"
            ></script>
          </div>
          <div style={{ marginTop: '20px' }}>
            <button
              onClick={() => {
                // For development - bypass auth
                setUser({ id: 'dev-user', name: 'Development User', isAuthenticated: true });
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Continue as Guest (Development Mode)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar
        thoughts={thoughts} // Pass thoughts to Sidebar
        setThoughts={setThoughts}
        setSelectedThought={setSelectedThought}
        setShowModal={setIsModalOpen}
        toggleDarkMode={() => {}}
        setActiveFilters={setActiveFilters} // Pass setActiveFilters
        onRefreshThoughts={loadThoughts}
      />
      <div className="main-content">
        <Canvas
          thoughts={thoughts}
          setSelectedThought={setSelectedThought}
          filteredThoughtIds={activeFilters} // Pass activeFilters to Canvas
          onUpdateThought={handleUpdateThought}
        />
        {selectedThought && (
          <ThoughtDetailPanel
            thought={selectedThought}
            onClose={() => setSelectedThought(null)}
          />
        )}
      </div>

      {isModalOpen && (
        <AddThoughtModal
          onClose={() => setIsModalOpen(false)}
          createThought={handleCreateThought}
          createSegment={apiService.createSegmentApi}
        />
      )}

      {showDevAssistant && (
        <DevAssistantPanel
        />
      )}
    </div>
  );
}

export default App;

--- END OF src/App.tsx ---
