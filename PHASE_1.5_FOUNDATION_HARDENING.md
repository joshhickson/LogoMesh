# Phase 1.5: Foundation Hardening

## 1. Preamble: The 'Hard Reset' Mandate

A thorough technical audit has revealed that the current LogoMesh codebase is a critical liability, suffering from a broken build pipeline, significant security vulnerabilities, architectural violations, and a profound disconnect from its own documentation. The project's core vision, however, remains sound and valuable.

This document outlines a 'hard reset' of the main branch. The goal is to build a new, stable technical foundation from the ground up, guided by the project's original vision and architectural principles, while systematically preventing the failures of the previous implementation.

**Note:** The strategic analysis document, `Analyzing LogoMesh for Breakthrough Potential.txt`, was not found in the repository at the time of this plan's creation and was therefore not included in the analysis.

## 2. File Triage: Blueprint vs. Old Foundation

The entire repository has been categorized into two groups: the valuable 'Blueprint' to be preserved and the compromised 'Old Foundation' to be archived.

### 2.1. Assets to Preserve (The Blueprint)

These files contain the project's strategic vision, architectural plans, and core intellectual property. They will serve as the definitive guide for the rebuild.

*   **`docs/IMPLEMENTATION_PLAN.md`**: Defines the non-negotiable architectural rules and the phased implementation strategy.
*   **`docs/future-vision.md`**: Outlines the long-term goals and principles for the project.
*   **`docs/Agentic Coding Debt Management Research.md`**: Provides the theoretical framework for building a resilient, maintainable system.
*   **`docs/06.26.2025 architecture-diagram.md`**: Contains the canonical system architecture, including Mermaid diagrams, which will guide the new implementation.

### 2.2. Liabilities to Archive (The Old Foundation)

The following files and directories constitute the compromised codebase. They are to be removed from the main branch and archived for historical reference only. They **must not** be used as a direct reference for the new implementation.

*   **Source Code:**
    *   `/contracts`
    *   `/core`
    *   `/server`
    *   `/src`
*   **Configuration Files:**
    *   `package.json`
    *   `package-lock.json`
    *   `tsconfig.json`
    *   `vitest.config.ts`
    *   `eslint.config.js`
    *   `.babelrc`
    *   `.prettierrc`
    *   `tailwind.config.js`
    *   `config-overrides.cjs`
*   **Scripts & Tooling:**
    *   `/scripts`
    *   `.husky`
*   **Other:**
    *   All other files and directories not explicitly listed in "Assets to Preserve."

---

## 3. The Blueprint: Core Requirements for the New Foundation

This section synthesizes the strategic and architectural mandates from the 'Assets to Preserve' into a clear set of requirements for the new foundation.

### 3.1. Core Value Proposition

LogoMesh is a local-first, AI-augmented cognitive framework designed to manage and navigate complex ideas. Its target niche is agentic software engineering, where it serves as a "recursive thought engine" to manage technical and contextual debt. The new foundation must enable this by prioritizing **automation, resilience, adaptability, and AI-augmentation**.

### 3.2. Architectural Preservation Rules (Non-Negotiable)

Derived from `IMPLEMENTATION_PLAN.md`, these rules are the bedrock of the new foundation. The CI/CD pipeline **must** be configured to enforce them automatically wherever possible.

*   **Strict Layer Boundary Enforcement:**
    *   The frontend (`src/`) **must not** have any direct `import` statements from the backend (`server/`) or shared logic (`core/`).
    *   Communication between frontend and backend will be exclusively through a well-defined REST API.
*   **Event-Driven Core:**
    *   Core services (`core/services/`) **must** communicate with each other via an EventBus or other asynchronous messaging patterns. Direct synchronous calls between major subsystems are forbidden.
*   **Plugin System Integrity:**
    *   All external or dynamic code execution **must** be routed through a secure `PluginHost` sandbox.
    *   Plugin capabilities **must** be explicitly declared in a manifest file.
*   **Storage Abstraction:**
    *   Business logic in `core/` **must not** directly access the database. All data access must go through a `StorageAdapter` interface, ensuring the underlying database (e.g., SQLite) is a replaceable implementation detail.

### 3.3. Minimal Viable Scaffolds (Based on Architecture Diagram)

The initial implementation will focus on creating the bare-bones scaffolds for the core user flow, adhering strictly to the architectural rules.

*   **Backend (Express/Node.js):**
    *   **API Server:** Set up a basic Express server.
    *   **Core Services:**
        *   `EventBus`: A simple in-memory pub/sub implementation.
        *   `IdeaManager`: A service to handle the core business logic for creating, updating, and retrieving "thoughts."
        *   `StorageAdapter`: An interface for data persistence, with an initial `SQLiteAdapter` implementation.
    *   **API Routes:**
        *   `GET /api/v1/thoughts`: Retrieve the thought graph.
        *   `POST /api/v1/thoughts`: Create a new thought.
        *   `PUT /api/v1/thoughts/:id`: Update an existing thought.
*   **Frontend (React):**
    *   **API Service:** A service to handle all communication with the backend API.
    *   **Core UI Components:**
        *   `Canvas`: A component to render the graph of thoughts (a simple placeholder will suffice initially).
        *   `Sidebar`: A component to list existing thoughts.
        *   `AddThoughtModal`: A modal to create a new thought.

---

## 4. Failure Prevention Checklist

This checklist is derived directly from the `technical-due-diligence-report.md`. Each item represents a critical failure in the old codebase. The new foundation's CI/CD pipeline and development process must be designed to ensure these criteria are met at all times. This checklist serves as a core part of the 'Definition of Done'.

| Failure Point (Old Codebase) | Success Criterion (New Foundation) | Verification Method |
| :--- | :--- | :--- |
| **Build & Test Integrity** | | |
| `npm install` fails | `npm install` completes successfully on a clean checkout. | CI Pipeline |
| `npm run build` fails | `npm run build` produces a production-ready artifact without errors. | CI Pipeline |
| `npm run test` fails | `npm run test` runs all unit and integration tests successfully. | CI Pipeline |
| **Code Quality & Discipline** | | |
| Widespread use of `any` | The build **must fail** if any `any` types are detected in the codebase (`core/`, `server/`, `src/`). | CI Pipeline (tsc, eslint) |
| Inconsistent TypeScript configs | A single, unified `tsconfig.json` at the root governs all TypeScript code, enforcing `strict: true`. | Manual Review & CI |
| Architectural violations (e.g., frontend importing from core) | The build **must fail** if any architectural boundary violations are detected. | CI Pipeline (eslint, custom scripts) |
| **Dependency Health** | | |
| High number of vulnerabilities | `npm audit` reports **zero critical or high** vulnerabilities. | CI Pipeline |
| **Documentation Mismatches** | | |
| Outdated or incorrect `README.md` | All documentation (`README.md`, etc.) is updated to reflect the new, simplified codebase and setup instructions. | Manual Review |
| Discrepancy in plugin sandbox (`vm2` vs. `isolated-vm`) | The chosen sandbox implementation is accurately documented. | Manual Review |
| **Feature Completeness** | | |
| Non-functional "scaffold" features | All implemented features, even if minimal, are fully functional and tested. Stubbed-out logic is explicitly marked and tracked as technical debt. | Code Review & Testing |

---

## 5. Sequence of Technical Tasks

This sequence of tasks provides an actionable, step-by-step guide for the developer to execute the 'hard reset'.

### Step 1: Repository Hard Reset

1.  **Create a `hard-reset` branch:** All work will be done on this new branch.
2.  **Archive the Old Foundation:**
    *   Delete all files and directories listed in section 2.2 from the repository.
    *   Commit this removal with the message: `chore: Archive compromised codebase`.
3.  **Preserve the Blueprint:**
    *   Ensure all files listed in section 2.1 remain.
    *   Commit any necessary clean-up with the message: `docs: Preserve project blueprint`.

### Step 2: Foundational Setup (Backend & Core)

1.  **Initialize a new Node.js project:**
    *   Run `npm init` to create a new `package.json`.
    *   Install essential dependencies: `typescript`, `express`, `sqlite3`, `vitest`.
2.  **Configure TypeScript:**
    *   Create a single, root-level `tsconfig.json` that enforces `strict: true`.
3.  **Set up the Monorepo Structure:**
    *   Create the `packages/` directory, which will contain `core` and `server`. This structure ensures clear separation and prepares the project for future scalability.
4.  **Implement Logging and Configuration:**
    *   Establish a simple, unified logging service.
    *   Implement a configuration service that loads from environment variables (`.env`).
5.  **Create Initial Scaffolds:**
    *   Implement the basic `EventBus`, `IdeaManager`, and `StorageAdapter` scaffolds as defined in section 3.3.
    *   Write placeholder unit tests for each service to ensure the testing framework is operational.

### Step 3: CI Pipeline and Quality Gates

1.  **Set up a basic CI pipeline** (e.g., using GitHub Actions).
2.  **Configure CI jobs to enforce the Failure Prevention Checklist:**
    *   **Job 1: Install & Build:** Runs `npm install` and `npm run build`. Fails if either step fails.
    *   **Job 2: Test:** Runs `npm run test`. Fails if any test fails.
    *   **Job 3: Lint & Type Check:** Runs `eslint` and `tsc --noEmit`. Fails on any `any` type or architectural violation.
    *   **Job 4: Security Audit:** Runs `npm audit --audit-level=high`. Fails on any critical or high vulnerabilities.

### Step 4: Minimal Feature Implementation

1.  **Backend API:**
    *   Implement the three API endpoints defined in section 3.3, connecting them to the core services.
    *   Write integration tests for each endpoint.
2.  **Frontend Scaffolding:**
    *   Initialize a new React application in `/src` using a modern toolchain (e.g., Vite).
    *   Implement the basic UI components (`Canvas`, `Sidebar`, `AddThoughtModal`) as placeholders.
    *   Implement the `ApiService` to connect the frontend to the backend, with mock data for initial development.
3.  **End-to-End Test:**
    *   Write a single end-to-end test that simulates the core user flow: creating a thought via the UI and verifying it appears in the canvas.

## 6. Definition of Done

This 'Phase 1.5: Foundation Hardening' will be considered complete when all of the following criteria are met:

1.  **All tasks in Section 5 are complete.**
2.  **The CI pipeline is fully operational and all checks are passing.**
3.  **All success criteria in the Failure Prevention Checklist (Section 4) are met.**
4.  The application's core user flow (creating and viewing a thought) is functional, albeit in a minimal state.
5.  The `README.md` file has been updated with new, accurate setup and development instructions.
6.  The `hard-reset` branch is ready to be merged into `main`, replacing the old codebase entirely.
