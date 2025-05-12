   # LogoMesh Development Plan: A Modular Framework for Thought Organization

---

## Tiered Approach to LogoMesh Development

This development plan is structured around two distinct tiers, reflecting LogoMesh's commitment to a local-first philosophy while ensuring future extensibility and scalability via cloud services. The goal is to provide a robust core accessible to all users, with optional advanced features that leverage cloud resources if desired.

### Tier #1: Local-First Full Immersion
This tier prioritizes minimal internet connectivity and aims for all core LogoMesh functionalities, including AI features, to run efficiently on local user hardware (e.g., Mac Mini). Development in early phases will primarily focus on achieving a stable and performant experience within this tier.

### Tier #2: Cloud-Enhanced Extensions (Optional/Future)
This tier outlines paths for leveraging cloud services (e.g., managed databases, powerful LLM APIs, specialized AI models) for enhanced features, scalability, or as alternatives for users without powerful local hardware. Development for this tier will focus on designing robust abstraction layers in early phases to allow seamless integration without major refactoring, with active implementation in later phases.

---

   # Developer Instructions for the Demo React Implementation of the LogoMesh Framework

This document provides instructions for organizing the demo React application that consumes the LogoMesh framework.  LogoMesh itself is a modular framework for building applications that structure and connect thoughts.

 * Add Section: "Framework/Core Usage"
   ## Framework/Core Usage

To use the LogoMesh framework in your own JavaScript or TypeScript project:

1.  (Installation instructions, e.g., `npm install logomesh-core` if you publish a core package, or instructions to link to the /core directory)
2.  Import the necessary modules from the LogoMesh core:

    ```typescript
    import { Thought, Segment, IdeaManager } from 'logomesh-core'; // Example
    ```

3.  Implement the required interface contracts (Thought, Segment, etc.) in your application.
4.  Choose or create adapters for your specific needs (e.g., a StorageAdapter for your chosen database).

Refer to the interface contracts in the `/contracts` directory for detailed schema definitions and the `/core` directory for the core logic.

   ## Demo React Implementation Setup

The following instructions are for setting up the demo React application. You can skip this section if you are implementing your own UI or CLI.

   **Disclaimer:** LogoMesh is designed as a modular framework. This demo UI is one of several possible front-ends and is provided as an example.



This document outlines the development plan for LogoMesh, a modular framework designed to facilitate the creation of applications for organizing, visualizing, and connecting thoughts in a structured manner.

 * Revise Phase Titles/Subtitles

 * Add Bullet Points:
   For each phase, add:
    **Framework Outcome:** (Describe the core logic deliverables)
	**Demo Implementation Outcome:** (Describe the React-specific deliverables)
**Demo Implementation Outcome:**
* Set up React Flow or ReGraph for initial graph visualization
* Create basic UI components for displaying and editing thoughts

   ### Phase 0: Framework-First Architecture Setup & Core Logic Decoupling [05.12.2025 WE ARE HERE]

**Goal:** Transition the existing React application towards a modular structure by separating core data management logic from the UI. This phase establishes the foundational directories (`/core`, `/contracts`), defines clear interfaces and responsibilities, implements basic data integrity checks and utilities, and scaffolds unit testing. This makes the codebase more maintainable and robustly prepares it for more advanced backend features in Phase 1. This revised structure is designed to be implemented with the assistance of an AI coding agent like Claude within a Replit environment.

**Key Outcomes for Phase 0:**
*   A new `/core` directory containing the application's business logic and data management abstractions, initially operating on in-memory data.
*   A new `/contracts` directory containing TypeScript interface definitions for all primary data entities.
*   The React application in `src/` refactored to consume logic and types from `/core` and `/contracts`, no longer managing primary data state or using `localStorage` directly for thoughts (beyond an initial load).
*   Core utilities for ID generation and logging established within `/core`.
*   Basic unit test stubs created for core logic in `/core`.
*   Clearer separation of concerns, making the system easier to reason about and extend.
*   Placeholders for future DevOps, UX, and data migration considerations noted.

**Tasks:**

1.  **Establish Foundational Directory Structure & Configure Path Aliases:**
    *   **Framework Outcome:** Project structure prepared for modular development with convenient import paths.
    *   **Demo Implementation Outcome:** The React application can resolve imports from new core directories using both relative paths and configured aliases.
    *   **Detailed Action (for AI Agent - Claude):**
        1.  **Create Directories:**
            *   In the root directory of the current Replit project, create a new directory named `contracts`.
                *   *Purpose:* This directory will store TypeScript files (`.ts`) defining the data structure interfaces.
            *   In the root directory of the current Replit project, create a new directory named `core`.
                *   *Purpose:* This directory will house the JavaScript/TypeScript modules containing the decoupled core application logic.
            *   *Verification:* Confirm these directories exist at the project root.

        2.  **Configure Path Aliases (Optional but Recommended for Cleaner Imports):**
            *   Create or modify the `jsconfig.json` file in the project's root directory.
            *   Ensure it contains the following configuration to allow imports relative to the `src` directory using `~/` and to alias `/core` and `/contracts` for easier access from `src/`:
                ```json
                {
                  "compilerOptions": {
                    "baseUrl": ".",
                    "paths": {
                      "~/*": ["src/*"],
                      "@core/*": ["core/*"],
                      "@contracts/*": ["contracts/*"]
                    }
                  },
                  "include": ["src", "core", "contracts"]
                }
                ```
            *   *Purpose:* This setup will allow cleaner import statements from within the `src/` directory, such as `import { Thought } from '@contracts/interfaces';` or `import { IdeaManager } from '@core/IdeaManager';`.
            *   *Verification:* After this change, a test import in a temporary file within `src/` (e.g., `src/App.jsx`) like `import Test from '@core/someFile';` (assuming `someFile.js` exists in `core`) should ideally be resolvable by Replit's tooling without errors.

        3.  **Note on Import Path Usage (for AI Agent - Claude):**
            *   **Priority:** When refactoring code in subsequent steps to import modules from `/core` or `/contracts` into files within `src/`, **first attempt to use the configured path aliases**:
                *   `import ... from '@contracts/your-interface-file';`
                *   `import ... from '@core/your-module-file';`
            *   **Fallback to Relative Paths:** If, for any reason, the path aliases do not work or cause issues during refactoring within the Replit environment, revert to using standard **relative paths** as a reliable fallback.

2.  **Define Core Data Structure Interface Contracts:**
    *   **Framework Outcome:** Clear, typed definitions for all primary data entities, promoting consistency and enabling type-safe development within the `/core` framework and for UI consumption. These interfaces will represent Data Transfer Objects (DTOs) suitable for application-layer logic.
    *   **Demo Implementation Outcome:** React components can be refactored to expect props and manage state conforming to these well-defined interfaces.
    *   **Detailed Actions (for AI Agent - Claude):**

        a.  **Initial Interface Extraction & Creation:**
            *   Analyze current data structures in `src/App.jsx` (`createThought` function), `src/utils/exportHandler.js` (`exportPayload.thoughts`), and `src/services/graphService.js`.
            *   Create `/contracts/entities.ts`.
            *   In `/contracts/entities.ts`, generate initial TypeScript `interface` definitions for `Tag`, `Segment`, and `Thought` based on the analysis.
            *   Export these interfaces.

        b.  **Refine Interfaces with Planned Schema Enhancements (DTO Focus):**
            *   Update interfaces in `/contracts/entities.ts` referencing Phase 1 SQLite schema plans.
            *   **Define base types for extensibility at the top of `/contracts/entities.ts`:**
                ```typescript
                export type PredefinedContentType = 'text' | 'image' | 'audio' | 'video' | 'link';
                export type CustomContentType = string & { _brand?: 'CustomContentType' };
                export type ContentType = PredefinedContentType | CustomContentType;

                export type PredefinedAbstractionLevel = 'Fact' | 'Idea' | 'Theme' | 'Goal';
                export type CustomAbstractionLevel = string & { _brand?: 'CustomAbstractionLevel' };
                export type AbstractionLevel = PredefinedAbstractionLevel | CustomAbstractionLevel;

                export type FieldValue = string | number | boolean | Date | string[] | number[]; // Expand as needed
                ```
            *   **Refine `Segment` interface:**
                ```typescript
                export interface Segment {
                  segment_id: string;
                  thought_bubble_id: string;
                  title: string;
                  content: string;
                  content_type: ContentType; // Default 'text'
                  asset_path?: string;
                  fields: Record<string, FieldValue>; // DTO representation
                  embedding_vector?: number[];
                  created_at: string; // ISO date string
                  updated_at: string; // ISO date string
                  abstraction_level: AbstractionLevel; // Default 'Fact'
                  local_priority: number; // Default 0.5
                  cluster_id: string; // Default 'uncategorized_cluster'
                }
                ```
            *   **Refine `Thought` interface:**
                ```typescript
                export interface Thought {
                  thought_bubble_id: string;
                  title: string;
                  description?: string;
                  created_at: string; // ISO date string
                  updated_at: string; // ISO date string
                  color?: string;
                  position?: { x: number; y: number };
                  tags?: Tag[]; // Optional DTO convenience
                  segments?: Segment[]; // Optional DTO convenience
                }
                ```
            *   *(Note for AI Agent): Other interfaces like `SegmentNeighbor` can be defined later if needed as DTOs.*
        b2. **Define LLMExecutor Interface for Future Multi-LLM Support:**
            * Add a new file: `/contracts/llmExecutor.ts`.
            * This interface defines a common structure for executing prompts via different LLM providers.
            * It will be used in Phase 1+ to plug in Claude, Gemini, Qwen, InternVL, or custom Ollama models without altering business logic.

                  ```typescript
                  // contracts/llmExecutor.ts
                  
                  export interface LLMExecutor {
                    name: string;
                    supportsStreaming: boolean;
                    executePrompt(prompt: string): Promise<string>;
                    streamPrompt?(prompt: string): AsyncGenerator<string>;
                    generateMermaid?(context: any): Promise<string>;
                  }
                  ```
        c.  **Add JSDoc Comments:**
            *   Add brief JSDoc comments to each interface and its properties explaining their purpose.

        *   **Verification Step (for AI Agent - Claude):**
            *   Confirm `/contracts/entities.ts` exists with exported `Thought`, `Segment`, `Tag`, `ContentType`, `AbstractionLevel`.
            *   Confirm `Segment` and `Thought` interfaces include all specified fields with correct typings.
            *   Confirm JSDoc comments are present.

3.  **Scaffold Core Logic Abstraction (`IdeaManager`) and Begin UI Decoupling:**
    *   **Framework Outcome:** A foundational `IdeaManager` class/module in `/core` that encapsulates data management logic (initially in-memory) and uses the defined `/contracts` interfaces.
    *   **Demo Implementation Outcome:** Key React components (`App.jsx`, `AddThoughtModal.jsx`, `ThoughtDetailPanel.jsx`) begin to delegate data operations to the `IdeaManager` instead of handling state and `localStorage` directly. The application remains functional using in-memory data management via `IdeaManager`.
    *   **Detailed Actions (for AI Agent - Claude):**

        a.  **Create Initial `IdeaManager` in `/core`:**
            *   Create `@core/IdeaManager.ts`.
            *   Define and export class `IdeaManager`.
            *   Import interfaces from `@contracts/entities.ts`.
            *   Internally manage `private thoughts: Thought[] = [];`.
            *   Constructor attempts one-time load from `localStorage` (key 'thought-web-data') into `this.thoughts`, similar to `App.jsx`'s original `useState` logic for `thoughts`. Log errors, default to empty array on failure.

        b.  **Implement Basic In-Memory CRUD Methods in `IdeaManager`:**
            *   Add public methods: `getThoughts(): Thought[]`, `getThoughtById(id: string): Thought | undefined`, `addThought(thoughtData: ...): Thought`, `updateThought(thoughtId: string, updates: ...): Thought | undefined`, `deleteThought(thoughtId: string): boolean`, `addSegment(thoughtId: string, segmentData: ...): Segment | undefined`, `updateSegment(thoughtId: string, segmentId: string, updates: ...): Segment | undefined`, `deleteSegment(thoughtId: string, segmentId: string): boolean`.
            *   Import and use ID generation utilities from `@core/utils/idUtils.ts` (to be created in Task 5a) for `addThought` and `addSegment`.
            *   These methods operate on the internal `this.thoughts` array.
            *   Ensure returned objects conform to interfaces.

        c.  **Refactor `src/App.jsx` to Use `IdeaManager` (Incremental Steps):**

            *   **3c-i: Instantiate `IdeaManager` and Load Initial `thoughts` State:**
                *   In `src/App.jsx`, import `IdeaManager`. Create an instance.
                *   Initialize `thoughts` state: `useState(() => ideaManager.getThoughts());`.
                *   Remove old `useEffect` that loaded from `localStorage`.
                *   *Verification:* App loads existing `localStorage` data via `IdeaManager`.

            *   **3c-ii: Refactor `createThought` (and `addThought` if distinct) in `src/App.jsx`:**
                *   Modify `createThought` to call `ideaManager.addThought(...)`.
                *   After adding, update React `thoughts` state: `setThoughts([...ideaManager.getThoughts()]);`.
                *   Remove direct `localStorage.setItem` calls from this function.
                *   *Verification:* New thoughts are added to `IdeaManager`'s store; UI updates. No direct `localStorage` writes from `App.jsx`.

            *   **3c-iii: Remove `localStorage` Persistence Logic from `src/App.jsx`:**
                *   Remove the `useEffect` hook that saved `thoughts` to `localStorage`.
                *   *(Developer Decision from previous discussion: `thought-web-dark-mode` `localStorage` handling remains in `App.jsx` for now).*
                *   *Verification:* App functions, but thought changes don't persist across refresh (expected for Phase 0).

        d.  **Refactor Data-Mutating Components to Use `IdeaManager` via Props:**
            *   Pass `ideaManager` instance and a refresh callback (e.g., `refreshThoughts = () => setThoughts([...ideaManager.getThoughts()]);`) from `App.jsx` as props to components like `src/components/ThoughtDetailPanel.jsx`, `src/components/Canvas.jsx` (for position updates), `src/components/Sidebar.jsx` (for batch edits).
            *   Modify these components to call methods on `props.ideaManager` and then `props.refreshThoughts()`.
            *   Remove direct `localStorage.setItem` calls from these components.
            *   *(Note for AI Agent): Refactor one component at a time.*
            *   *Verification:* Components use `ideaManager` prop and refresh callback. UI updates correctly. No direct `localStorage` writes from these components.

4.  **Define Abstraction Taxonomy & Initial Metadata Handling:**
    *   **Framework Outcome:** Core data structures (`Segment` interface) include fields for `abstraction_level` and `cluster_id`, enabling foundational semantic categorization.
    *   **Demo Implementation Outcome:** The UI for creating/editing segments can capture these new metadata fields.
    *   **Detailed Actions (for AI Agent - Claude):**
        a.  **Update `Segment` Interface (Confirm in `@contracts/entities.ts`):**
            *   Ensure `abstraction_level: AbstractionLevel;` and `cluster_id: string;` are present with JSDoc.
        b.  **Update `IdeaManager` Methods for Metadata:**
            *   Modify `IdeaManager.addSegment` and `IdeaManager.updateSegment` to accept and store `abstraction_level` and `cluster_id`. Apply defaults in `addSegment`.
        c.  **Update UI for Metadata (Basic Input):**
            *   In `src/components/AddThoughtModal.jsx` and `src/components/ThoughtDetailPanel.jsx`, enable input/display for `abstraction_level` and `cluster_id`.
        *   **Verification:** Segments can have `abstraction_level` and `cluster_id` managed.

5.  **Implement Core Data Integrity & Utility Foundations:**
    *   **Framework Outcome:** `IdeaManager` includes basic data validation. Core utilities for ID generation and logging are established.
    *   **Demo Implementation Outcome:** Increased robustness; foundational support for debugging.
    *   **Detailed Actions (for AI Agent - Claude):**
        a.  **ID Generation and Uniqueness:**
            *   **Relocate ID Utilities:** Create `@core/utils/idUtils.ts`. Move `newBubbleId` and `newSegmentId` functions from `src/utils/eventBus.js` into it. Export them. Update `IdeaManager` to use these.
            *   **In-Memory ID Uniqueness Check:** In `IdeaManager.addThought/addSegment`, before adding, check if the generated ID already exists in its internal store. If so, log an error/regenerate (simple console log for Phase 0 is fine).
        b.  **Basic Reference Validation:**
            *   In `IdeaManager.addSegment`, ensure the `thoughtId` exists before adding. Log error if not.
        c.  **Establish Basic Logging Utility:**
            *   Create `@core/utils/logger.ts`. Implement a simple `logger` object with `log`, `warn`, `error` methods (initially wrapping `console` methods with a prefix like `[LOGOMESH-CORE]`).
            *   Import and use this `logger` in `IdeaManager` for key operations.
        *   **Verification:** ID utils are in `@core/utils/`. `IdeaManager` uses logger. Basic validation checks are performed.
        d. **Scaffold LLM Audit Logger Stub:**
            * Create a new file: `/core/logger/llmAuditLogger.ts`.
            * This utility logs all prompt/response cycles with an LLM agent and will be extended in Phase 2 to store data in a structured format (e.g., SQLite or Postgres).
            * For now, it wraps `console.log()` with a consistent format for auditability.

            ```typescript
            // core/logger/llmAuditLogger.ts
            
            export function logLLMInteraction(
              agent: string,
              prompt: string,
              output: string,
              metadata?: Record<string, any>
            ): void {
              console.log(`[LLM ${agent}]`, {
                prompt,
                output,
                metadata,
                timestamp: new Date().toISOString(),
              });
            }
            ```

6.  **Scaffold Unit Testing for Core Logic:**
    *   **Framework Outcome:** Basic testing infrastructure set up for `/core` modules.
    *   **Detailed Actions (for AI Agent - Claude):**
        a.  **Confirm Jest Configuration for `/core`:**
            *   Ensure Jest (from `react-scripts`) can find and run tests in `/core` (e.g., `core/**/*.test.ts`).
        b.  **Create Initial Test Stubs for `IdeaManager`:**
            *   Create `@core/IdeaManager.test.ts`.
            *   Add basic test stubs (as previously discussed examples) for `addThought`, `getThoughtById`, `addSegment`, and ideally `updateThought` and `deleteThought`. Ensure tests clear `localStorage` in `beforeEach` for isolation if `IdeaManager` constructor reads from it.
        *   **Verification:** Test files can be created. Example tests pass against the in-memory `IdeaManager`.

7.  **Establish Initial DevOps & UX Documentation Stubs:**
	*   **Framework Outcome:** Basic project structure supports future, more formal DevOps and UX processes.
	*   **Detailed Actions (for AI Agent - Claude or Developer):**
    	a.  **DevOps - Documentation Stubs:**
        	*   Create `/docs/BUILD_PROCESS.md` (Note: "Phase 0: Core logic part of React app build. Phase 1 will introduce Docker for backend API and explore separate build/test for `/core` if it becomes a distinct package.")
        	*   Create `/docs/DATA_MIGRATION.md`. Add the following content:
            	```markdown
            	# Data Migration Strategy

            	## Phase 0 to Phase 1 (localStorage to SQLite)

            	The `IdeaManager` in Phase 0 loads initial data from `localStorage` (key: 'thought-web-data') into its in-memory store. Phase 1 will introduce SQLite as the primary persistent storage.

            	A data migration strategy will be required at the beginning of Phase 1 to ensure any data present in `localStorage` (from prior application use or data entered during Phase 0 development sessions if not persisted elsewhere) is correctly transferred to the new SQLite database structure.

            	**Potential Approaches for Phase 1 Migration:**
            	1.  **One-time Script:** A script (Node.js or directly within the application startup) that reads from `localStorage`, transforms the data to align with the new normalized SQLite schema, and inserts it into the SQLite database.
            	2.  **Enhanced `IdeaManager` (SQLite Adapter):** The SQLite storage adapter for the `IdeaManager` (to be built in Phase 1) could include logic on its first run to check for `localStorage` data and import it.

            	This migration will need to handle mapping from the potentially less structured `localStorage` format to the normalized tables defined for SQLite (e.g., `thoughts`, `segments`, `segment_fields`, `tags`, etc.).

            	## Future Consideration: SQLite to Postgres (Tier 2 / Advanced Scaling)

            	For future scalability, multi-user/multi-agent scenarios, and advanced features (as outlined in Tier 2 of the development plan), a transition from the local SQLite datastore to a more robust, server-based PostgreSQL database (potentially with `pgvector`) is envisioned.

            	This migration would involve:
            	*   Schema mapping from SQLite to PostgreSQL (largely similar but with RDBMS-specific optimizations).
            	*   Data transfer mechanisms.
            	*   Updating the backend API and `/core` persistence layer to target PostgreSQL.

            	This consideration is for long-term architectural evolution and will be addressed in later phases.
            	```
    	b.  **UX - Documentation Stubs:**
        	*   Create `/docs/STYLE_GUIDE.md` (Note: "Basic styling inherited... Formal guide in Phase 1...").
        	*   Create `/docs/ONBOARDING_TOUR.md` (Note: "Concept to be designed later...").
    	*   **Verification:** Markdown files are created with the specified content. The `DATA_MIGRATION.md` file should contain both subsections as described.

8.  **Phase 0 Final Cleanup & Summary:**
    *   **Framework Outcome:** Core logic significantly decoupled, project structured for Phase 1.
    *   **Demo Implementation Outcome:** React app functional with `IdeaManager`.
    *   **Detailed Actions (for AI Agent - Claude and/or Developer):**
        a.  **Review and Refactor Utility Usage:**
            *   Identify remaining utilities in `src/utils/`. Move any general-purpose, non-DOM-specific data logic utilities (if any beyond ID gen) to `@core/utils/`. Update imports.
        b.  **Code Cleanup and Linting:**
            *   Run linters (ESLint, Prettier) across `src/`, `/core/`, `/contracts/`. Fix issues. Remove dead code.
        c.  **Update Phase 0 Summary in Development Plan (This Document):**
            *   (Developer action after AI completes tasks) Replace this task with the "Phase 0 Outcome" statement below.

9.  **Integrate LLM Readiness & Document Hybrid Architecture Approach:**
	*   **Framework Outcome:** Core contracts include an abstraction for LLM execution. Logging for LLM interactions is scaffolded. The overall architecture acknowledges preparation for future hybrid data/agent systems.
	*   **Demo Implementation Outcome:** Foundational elements are in place for future AI feature integration without requiring immediate LLM functionality in the demo.
	*   **Detailed Actions (for AI Agent - Claude):**

    	a.  **Define LLMExecutor Interface:**
        	*   Create the file `/contracts/llmExecutor.ts`.
        	*   Add the `LLMExecutor` interface definition as specified in the `Schema Extension for Phase 0 (more context).txt` document (including `name`, `supportsStreaming`, `executePrompt`, optional `streamPrompt`, and optional `generateMermaid`).
        	*   Add JSDoc comments explaining the interface and its methods.
        	*   *Purpose:* This defines a shared contract for any future LLM provider, enabling modularity.
        	*   *Verification:* The file `/contracts/llmExecutor.ts` exists and correctly defines and exports the `LLMExecutor` interface with JSDoc.

    	b.  **Scaffold LLM Audit Logger:**
        	*   Create the file `/core/logger/llmAuditLogger.ts`.
        	*   Implement the `logLLMInteraction` function as specified in the `Schema Extension for Phase 0 (more context).txt` document, which currently logs to `console.log` with a structured format.
        	*   Add JSDoc comments explaining its purpose and future extension to persistent logging.
        	*   *Purpose:* Establishes a centralized point for logging all LLM prompt/response cycles for future audit and debugging.
        	*   *Verification:* The file `/core/logger/llmAuditLogger.ts` exists and correctly defines and exports the `logLLMInteraction` function.

    	c.  **Document Hybrid LLM Readiness & Future Agent Architecture:**
        	*   *(Developer Action or AI-assisted):* In a relevant section of the main project `README-dev.md` (e.g., a new subsection under "Core Architecture" or as an addendum to Phase 0's description), or in a dedicated `/docs/ARCHITECTURE_VISION.md` file, add a summary explaining these Phase 0 additions for LLM readiness.
        	*   This summary should include:
            	*   The purpose of the `LLMExecutor` interface (pluggable LLMs).
            	*   The role of the `llmAuditLogger.ts` stub (traceability).
            	*   A note that this scaffolding prepares for advanced features like AI-assisted diagramming/reasoning and future external agents (potentially Rust-based, interacting with a more complex backend like Postgres, as inspired by recent discussions).

```mermaid
%% Mermaid: LogoMesh LLM Agent Execution Flow (Future Vision)
sequenceDiagram
    participant UI as LogoMesh UI (React)
    participant IdeaMgr as IdeaManager (/core)
    participant LLMExec as LLMExecutor Interface
    participant Agent as External Agent (Rust/Node)
    participant LLM as LLM Provider (Claude/Gemini/Qwen)
    participant Logger as LLM Audit Logger (core/logger)

    UI->>IdeaMgr: requestLLMTask(prompt)
    IdeaMgr->>LLMExec: executePrompt(prompt)
    LLMExec->>LLM: Call API or local model
    LLM-->>LLMExec: return output
    LLMExec-->>IdeaMgr: return output
    LLMExec->>Logger: logLLMInteraction()
    IdeaMgr-->>UI: return result
```
        	*   *Purpose:* To clearly document the architectural intent behind these Phase 0 additions for future developers and AI agents.
        	*   *Verification:* The chosen documentation file contains a clear explanation of the LLM readiness features added in Phase 0 and their forward-looking implications.

These additions future-proof LogoMesh to become LLM-agnostic, introspective, and flexible.
> **Phase 0 Outcome:**
> The LogoMesh React application's core data management logic has been successfully decoupled from its UI components. A new `/core` directory houses an `IdeaManager` that manages application data (initially in-memory, with a one-time load from `localStorage` for data continuity) using well-defined TypeScript interfaces from `/contracts`. Core utilities for ID generation and application logging, basic data integrity checks, and unit test stubs are established within `/core`. **Furthermore, foundational contracts and stubs for future LLM integration (`LLMExecutor` interface, `llmAuditLogger`) have been created, preparing the architecture for LLM-agnostic operations and advanced AI agent interactions.** The React UI (`src/`) now interacts with the `IdeaManager` for all thought and segment data operations, removing direct `localStorage` persistence for these entities from the UI layer. The project structure is now robustly prepared for Phase 1, which will introduce a dedicated backend API, SQLite persistence, and further integrations. Documentation stubs, including notes on data migration and the hybrid architecture vision, have been established.

---
(End of Revised Phase 0 Section)
---

This completes the revision for Phase 0. It's now significantly more detailed, chunked for AI prompting, and incorporates the excellent feedback you provided.

Are you ready to move on to revising Phase 1 in a similar manner?





## PHASE 1: Core Functionality and Demo React Implementation, Scaffold & Realignment (Weeks 1–2)
**Framework Outcome:**
*(Pure LogoMesh core — no AI yet, with MLOps & UX foundations)*
* Define core schema (Thought, Segment, etc.) in `/contracts`
* Implement basic graph manipulation logic in `/core`
* Implement SQLite integration in `/core`
* Implement JSON import/export in `/core`

### Tier #1: Local-First Full Immersion

-   **Start Using docs/Claude-log.md**
    -   Purpose: Manual running log of Claude’s outputs, bugs, and resolutions.
    -   Action: After each successful Claude task, append:
        -   Task name
        -   Prompt summary
        -   Summary of changes
        -   Observed outcome / test result
        -   Any error messages, hallucinations, or edge-case discoveries

-   **Create state_snapshots/ folder in root**
    -   Purpose: Stores .json exports of full graph state at milestone checkpoints.
    -   Action: At the end of each major phase (e.g. post-Cytoscape, post-filter layer), export graph data using the current JSON schema and save to:
        -   state_snapshots/v0.1_init.json
        -   state_snapshots/v0.2_with_filters.json
        -   state_snapshots/v1.0_ai_ready.json

-   **Create todo/Claude_Feedback.md**
    -   Purpose: Running scratchpad for user observations about Claude’s behavior.
    -   Action: After every 2–3 Claude sessions, document:
        -   Repeated inefficiencies
        -   Things Claude misunderstood or mis-executed
        -   Any suggested prompts that increased precision
        -   Promising follow-ups or forked ideas to revisit

-   **Graph Visualization & Data**
    -   Replace visual canvas with **Cytoscape.js** (open-source alternative).
    -   Create React wrapper using `ref` integration pattern.
    -   **Action: Implement Cytoscape.js Graph Model & Integrate `cytoscape.js-fcose` Layout.**
        -   Configure Cytoscape.js to correctly model **Thought Bubbles as compound parent nodes** and **Segments as their child nodes**. This is crucial for leveraging fCoSE's strengths.
        -   Integrate the `cytoscape.js-fcose` extension into the Cytoscape.js instance.
        -   Implement **automatic layout using `cytoscape.js-fcose`** for the graph.
        -   **Action:** Configure initial `cytoscape.js-fcose` parameters to prioritize:
            -   Clear visual separation of segments within their parent bubbles.
            -   Visually grouping connected bubbles.
            -   Minimizing edge crossings for a clean view.
            -   Aim for a balanced layout that hints at the graph's structure.
        -   **Note for Developers & LLM Agents:** `cytoscape.js-fcose` is a force-directed layout optimized for compound graphs. Its parameters (consult `cytoscape.js-fcose` documentation) can be tuned to influence node spacing, edge lengths, and clustering. Effective configuration is key to a clear visual representation of the thought structure. This lays the foundation for visually leveraging future schema metadata like `cluster_id` and `graph_neighbors` for more semantically informed layouts (in later phases).
    -   Migrate bubbles/segments from initial state (e.g., old JSON or dummy data) to the Cytoscape.js graph model.
    -   Implement full React ↔ Cytoscape.js sync for visual updates based on data changes.


-   **Local Persistence (SQLite - Foundation for Cluster Runtime & Universal Extensibility)**
    -   Set up **SQLite** DB instance (primary local database).
    -   **Action: Design and Implement Core SQLite Schema.** This schema must be robust, normalized, and incorporate foundational elements necessary for future "Cluster Runtime", efficient AI processing of large graphs, and Universal Extensibility for multiple data formats.
    -   Migrate JSON bubbles/segments into SQLite, ensuring data is correctly mapped to the new normalized schema.
    -   Implement full React ↔ SQLite load/save cycle via API or in-browser WebAssembly (e.g., sql.js), ensuring data is correctly read from and written to the new normalized table structure.
        -   Define core tables:
            -   `thoughts`: Stores thought bubble metadata (UUID PK `thought_bubble_id`, title, description, created_at, color, position_x REAL, position_y REAL, etc.).
            -   `segments`: Stores segment metadata and content.
                -   `segment_id` (`TEXT` / UUID - Primary Key)
                -   `thought_bubble_id` (`TEXT` / UUID - Foreign Key referencing `thoughts.thought_bubble_id`)
                -   `title` (`TEXT`)
                -   `content` (`TEXT`) - Stores text content OR a text placeholder for non-text types.
                -   `content_type` (`TEXT`) - **[Universal Extensibility]** Stores the modality type ('text', 'image', 'audio', 'video', etc.). Non-nullable, defaults to 'text'.
                -   `asset_path` (`TEXT`, Nullable) - **[Universal Extensibility]** Stores the local file path to the media asset for non-text segment types. NULL for text segments.
                -   `embedding_vector` (`BLOB` or `REAL` array serialized to TEXT) - Placeholder for segment embedding. Type TBD based on `sqlite3_vector` specifics, but allocate space/field.
                -   `created_at` (`INTEGER` or `TEXT`)
                -   `updated_at` (`INTEGER` or `TEXT`)
                -   `abstraction_level` (`TEXT`) - ('Fact', 'Idea', 'Theme', 'Goal'). Non-nullable, defaults to 'Fact'.
                -   **[AI Metadata / Attention Scaffolding Fields - Foundation for Cluster Runtime]**
                    -   `local_priority` (`REAL`) - Importance for LLM chunking. Non-nullable, defaults to 0.5.
                    -   `cluster_id` (`TEXT`) - Grouping by theme/narrative. **Non-nullable**, requires a value (implement a default 'uncategorized' cluster concept).

-   **Automation Foundations (Local - Node-RED Implementation)**
    -   Set up a self-hosted **Node-RED** instance for local-centric automation workflows.
        -   **Action: Install and Configure Node-RED.** Install Node-RED on the local development environment (e.g., via npm or Docker). Configure its settings for a local instance.
        -   **Action: Install Essential Node-RED Nodes.** Install necessary nodes for interacting with the local system and webhooks (e.g., `node-red-node-http` for webhooks, `node-red-node-function` for custom logic, `node-red-node-filepath` for file system access). Consider `node-red-node-sqlite` if direct DB interaction from Node-RED is deemed necessary *for specific workflows*, but prioritize API interaction with LogoMesh backend if possible.
        -   **Note for Developers & LLM Agents:** Node-RED workflows run as a separate local service. Interaction with LogoMesh will primarily be asynchronous, triggered by events.
    -   Define webhook triggers and potentially local API endpoints for Node-RED integration.

        -   Define linking/metadata tables (Normalized Approach):
            -   `thought_tags`: Links thoughts to tags.
                -   `thought_bubble_id` (`TEXT` / UUID - FK to `thoughts`)
                -   `tag_name` (`TEXT`)
                -   Primary Key (`thought_bubble_id`, `tag_name`)
            -   `segment_tags`: Links segments to tags.
                -   `segment_id` (`TEXT` / UUID - FK to `segments`)
                -   `tag_name` (`TEXT`)
                -   Primary Key (`segment_id`, `tag_name`)
            -   `tags`: Stores unique tag names and metadata (e.g., color).
                -   `tag_name` (`TEXT` - Primary Key)
                -   `color` (`TEXT`)
            -   `segment_fields`: **[Normalized Fields]** Stores key-value field data for segments.
                -   `segment_id` (`TEXT` / UUID - FK to `segments`)
                -   `field_name` (`TEXT`)
                -   `field_value` (`TEXT`)
                -   `field_type` (`TEXT`) - ('text', 'number', 'date', 'concept', etc.)
                -   Primary Key (`segment_id`, `field_name`) - (Assuming field names are unique per segment)
            -   `segment_neighbors`: **[Normalized Graph Neighbors]** Stores neighbor relationships between segments.
                -   `source_segment_id` (`TEXT` / UUID - FK to `segments`)
                -   `target_segment_id` (`TEXT` / UUID - FK to `segments`)
                -   `relationship_type` (`TEXT`, Nullable) - Type of link (e.g., 'semantic_similarity', 'manual', 'ai_suggested', 'potential_analogy', 'supports_claim'). Allows for 'fuzzy links' and theory representation.
                -   Primary Key (`source_segment_id`, `target_segment_id`, `relationship_type`) - if multiple relationship types between same two segments are possible. If only one type per pair, Primary Key (`source_segment_id`, `target_segment_id`). **Decision:** Assume Primary Key (`source_segment_id`, `target_segment_id`, `relationship_type`) for max flexibility.
            -   `segment_related_context`: **[Normalized Related Context]** Stores arbitrary context links for segments.
                -   `segment_id` (`TEXT` / UUID - FK to `segments`)
                -   `context_key` (`TEXT`) - Label for the context (e.g., 'source_document', 'external_url', 'related_concept_string').
                -   `context_value` (`TEXT`) - The actual context value (e.g., '/path/to/doc.pdf', 'https://...', 'Predictive Maintenance', a segment ID).
                -   `context_type` (`TEXT`, Nullable) - Type of value (e.g., 'filepath', 'url', 'string', 'segment_id').
                -   Primary Key (`segment_id`, `context_key`, `context_value`) - Assuming a unique key+value pair per segment.
            -   `segment_llm_history`: **[Structured LLM History]** Stores audit trail of AI processing.
                -   `history_id` (`TEXT` / UUID - Primary Key)
                -   `segment_id` (`TEXT` / UUID - FK to `segments`)
                -   `pass_timestamp` (`INTEGER`) - Unix timestamp.
                -   `llm_model` (`TEXT`)
                -   `prompt_summary` (`TEXT`)
                -   `output_summary` (`TEXT`)
                -   `context_chunk_ids` (`TEXT`) - JSON string array of `segment_id`s in the input chunk.
                -   `actions_taken` (`TEXT`) - JSON string array of actions/suggestions.
                -   `temperature` (`REAL`, Nullable)
                -   `top_p` (`REAL`, Nullable)
                -   `random_seed` (`INTEGER`, Nullable)
                -   `version` (`TEXT`, Nullable) - Version of processing logic.

        -   **Note for Future Developers:** This normalized schema, including dedicated tables for fields, relationships, context, and LLM history, aligns with best practices for relational databases and is designed to support efficient querying and complex data relationships critical for "Cluster Runtime" scalability and advanced AI features. The AI metadata fields (`local_priority`, `cluster_id`, etc.) are foundational for the Context Window Allocator and intelligent AI processing. The `content_type` and `asset_path` fields enable Universal Extensibility for multimodal data, allowing future AI pipelines to process and link various media types.


        -   **Action: Define LogoMesh Event Webhooks.** Determine key events in the LogoMesh application (e.g., "segment created", "segment updated", "graph saved") that Node-RED workflows should react to. Implement webhook endpoints within the LogoMesh backend (API) that Node-RED's "HTTP In" nodes can listen to.
        -   **Action: Design Local LogoMesh API Endpoints for Node-RED.** Design basic REST API endpoints in the LogoMesh backend that Node-RED workflows can call to perform actions (e.g., "get segment data by ID", "update segment tag", "trigger local backup"). These endpoints should interact with the SQLite database.
        -   **Note for Developers & LLM Agents:** Designing clear API contracts for LogoMesh events and actions facilitates decoupled integration with Node-RED, aligning with the principles of Universal Extensibility and making workflows more robust.
    -   Scaffold core logic flows for initial local automation tasks.

        -   **Action:** Design and implement appropriate SQLite Indexes for efficient querying, focusing on Foreign Keys (`thought_bubble_id`, `segment_id`), AI metadata fields (`local_priority`, `cluster_id`), and fields/tags (`field_name`, `field_value`, `tag_name`).
    -   Migrate JSON bubbles/segments into SQLite, ensuring data is correctly mapped to the new normalized schema. This will involve parsing the JSON `fields` array and inserting rows into the `segment_fields` table, etc.
    -   Implement full React ↔ SQLite load/save cycle via API or in-browser WebAssembly (e.g., sql.js), ensuring data is correctly read from and written to the new normalized table structure.

-   **Abstraction Taxonomy Definition**
    -   Co-design **concept hierarchy**:
        1.  **Fact** (atomic data)
        2.  **Idea** (interpretation)
        3.  **Theme** (clusters of ideas)
        4.  **Goal** (outcomes)
    -   Tag each bubble with its level + **memory cue** (anchor/trigger)

-   **Automation Foundations (Local)**
    -   Set up self-hosted **n8n** instance for local-centric automation.
    -   Define webhook triggers for local bubble/segment sync events.
    -   Scaffold logic flows for local auto-tagging, backup to local storage, and initial embedding prep, evaluating if simpler in-app mechanisms are sufficient for initial needs.

-   **DevOps Foundations**
    -   Containerize front-end + SQLite (**Docker Compose**) for easy local deployment.
    -   DB migration scripts (Knex/Flyway) in CI - **Action:** Ensure migration scripts correctly handle creating the new normalized tables and fields.
    -   Unit tests for React–SQLite sync - **Action:** Update unit tests to verify data is correctly written to and read from the new normalized schema.
    -   GitHub Actions for lint/build/test on PR

-   **UX Foundations**
    -   Style guide: node shapes, WCAG palette, typography scale
    -   Basic interactions: click-select, hover-preview, drag-pan/zoom
    -   Onboarding tour stub with progressive-disclosure
 
        -   **Action: Scaffold Workflow: Basic Auto-Tagging Prep.** Create a simple Node-RED flow triggered by a "segment created/updated" webhook. This flow might initially just log segment data or prepare it for future auto-tagging logic (e.g., sending text to a local text processing node if available later).
        -   **Action: Scaffold Workflow: Local Backup Trigger.** Create a Node-RED flow triggered by a "graph saved" webhook or a timer. This flow should call a LogoMesh API endpoint (if designed) to trigger a local database backup, or directly copy the SQLite DB file to a safe location using Node-RED file nodes.
        -   **Action: Scaffold Workflow: Embedding Prep Trigger.** Create a Node-RED flow triggered by a "segment created/updated" webhook. This flow should call a LogoMesh API endpoint to retrieve the segment content and potentially send it to the local Embedding Micro-service (once implemented in Phase 2) via its API.
        -   **Note for Developers & LLM Agents:** These initial workflows establish the pattern for Node-RED reacting to LogoMesh events and interacting with its data and microservices via APIs and webhooks. Use "Function" nodes in Node-RED for custom logic within workflows.

> **Goal:** A solid, repeatable dev environment with clear hierarchy, automation readiness, and consistent UI patterns, underpinned by a robust, normalized SQLite schema designed for future AI processing needs, multimodal flexibility, and foundational "Cluster Runtime" considerations.

### Tier #2: Cloud-Enhanced Extensions (Optional/Future)

-   **API Abstraction Layer Design (Foundation for Cloud Integration & Universal Extensibility)**
    -   Design clear API contracts and interfaces for **Embedding Services** and **Vector Databases** that allow for swapping out local implementations (e.g., `sqlite3_vector`) with cloud-based alternatives (e.g., Pinecone, Weaviate) in later phases without major refactoring.
    -   Define base classes/interfaces for AI model interactions that support various LLM APIs (local via `llama.cpp`/Ollama, or cloud like OpenAI/GPT) for future extensibility.
    -   **Action:** Explicitly design these abstraction layers to handle different data modalities, allowing future integration of multimodal AI services (e.g., image captioning APIs, audio transcription models) through the same generalized interfaces.
-   **Automation Foundations (Cloud Readiness)**
    -   Consider architecture patterns for extending n8n workflows to potentially interact with cloud services for backups or integrations as complexity warrants.

### Should you implement fCoSE at the same time as SQLite?

Yes, absolutely. Implementing the Cytoscape.js / `cytoscape.js-fcose` integration **concurrently** with the SQLite implementation (specifically the data *reading* and loading part) is highly recommended and beneficial for several reasons:

1.  **Integrated Testing:** You need data to test your visual canvas and layout. Loading this data from the new SQLite database provides an immediate way to see if your data migration and database reading logic are working correctly *and* if the visual layer is interpreting that data as expected.
2.  **Visual Feedback:** Seeing the graph rendered and automatically laid out based on data pulled from SQLite gives you instant visual feedback on both systems. You can quickly spot if data is missing, relationships are incorrect, or if the layout isn't behaving as anticipated with real (or realistic dummy) data from the database.
3.  **Identifying Bottlenecks:** Implementing the data loading from SQLite to the Cytoscape.js graph model and then applying the fCoSE layout allows you to identify potential performance bottlenecks early in the data pipeline or the rendering process.
4.  **Ensuring Compatibility:** It ensures that the data structure you're pulling from SQLite is correctly formatted and structured for the Cytoscape.js graph model, which is necessary for fCoSE (especially for compound nodes).

You can break this down into smaller, testable steps:

* Implement basic SQLite schema and data insertion.
* Implement a function to *read* data from SQLite.
* Implement the React wrapper for Cytoscape.js.
* Implement the logic to convert data read from SQLite into the Cytoscape.js graph model format (nodes and edges, including parent-child relationships for compound nodes).
* Integrate `cytoscape.js-fcose` and apply the layout to the graph model loaded from SQLite.
* Incrementally refine both the SQLite reading logic and the Cytoscape.js/fCoSE implementation based on testing.

By tackling these together, you ensure that your new data backend (SQLite) is correctly hooked up to your new data visualization frontend (Cytoscape.js + fCoSE), building a solid functional core for Phase 1.





---

## PHASE 2: Interaction, Filters & Embedding Infrastructure (Weeks 2–4)
*(Wiring in real embeddings + filters + cognitive prompts)*

### Tier #1: Local-First Full Immersion

-   **UI & Filters**
    -   **Tag/Color/Abstraction Filters**
        -   Sliders/dropdowns for levels; **drill-down** from Themes → Ideas → Facts
        -   **Progressive disclosure** (top-3 by default, “More…” expand)
    -   **Theme Clusters**
        -   Auto-cluster view, **Merge/Unmerge** controls
    -   **Memory Prompts**
        -   After 5 new bubbles: “What pattern do you observe?”
        -   After linking 3 clusters: “What higher-level theme emerges?”
    -   **Fuzzy Links**
        -   Dashed lines + tooltips (“Similarity: 0.xx”)
        -   Toggle to show/hide low-confidence links
    -   **Structured Entry Form**
        -   Placeholder hints (“Enter idea, date, reference…”)
        -   Inline validation + contextual microcopy

-   **Embedding & Vector Store (Local-First Implementation - Leveraging Phase 1 Foundations)**
    -   **Embed Micro-service** (FastAPI/Flask)
        -   `POST /v1/embed` (versioned) → float32[]
        -   Powered by highly optimized local models (e.g., Sentence Transformers via `llama.cpp` or Ollama).
        -   Health check `GET /healthz` + `/metrics` (Prometheus)
        -   In-memory LRU cache or Redis caching (for local performance)
    -   **Client Integration**
        -   Async embed on `addSegment()`/`updateSegment()` with loading state
        -   Timeout (200 ms) + retry logic. **Action:** Benchmark local embedding generation times (e.g., for typical segment lengths on a Mac Mini) with chosen models. Adjust timeout to a realistic, configurable value if 200ms is not consistently achievable. Implement robust progress indicators in UI during embedding.
    -   **Vector DB (Local)**
        -   Implement **SQLite + sqlite3_vector** as the primary local vector store, utilizing the schema designed in Phase 1 (including metadata fields for future AI processing).
        -   CI rebuild scripts + integration tests (insert→query→verify)
        -   Nightly snapshots & DB backups for local data safety.
        -   **Action:** Benchmark vector similarity search performance in SQLite with typical dataset sizes, focusing on efficient querying of embeddings and related metadata fields. Ensure proper indexing is configured for `sqlite3_vector` to achieve the 50ms target. Optimize query patterns if necessary.
    -   **Pathways for Multimodal Embedding (Universal Extensibility Follow-up):**
        -   **Action: Research & Design Pathways for Multimodal Processing Integration.** Based on the schema flexibility designed in Phase 1, research potential technical pathways for integrating future multimodal embedding models (image, audio, video) and their processing pipelines. This phase focuses on design, not implementation, preparing for later phases.

> **Checkpoint:** Segments hold real embeddings (primarily text initially), are filterable by concept level, with cognitive prompts to surface reflection, all running efficiently on local hardware, with foundational schema and design patterns for future extensibility and scalability.

### Tier #2: Cloud-Enhanced Extensions (Optional/Future)

-   **Vector DB (Cloud Readiness & Scalability - Leveraging Phase 1 Foundations)**
    -   Explore integrating with **PostgreSQL + pgvector** as a local scaling option that can also serve as a foundation for cloud-managed PostgreSQL instances, building on the schema design from Phase 1.
    -   Refine the API Abstraction Layer (from Phase 1) to easily swap the local vector DB with cloud-based services like **Pinecone** or **Weaviate** (e.g., for larger datasets or distributed access), ensuring the schema metadata is compatible or can be mapped.
    -   Implement automated indexing workflows to cloud vector DBs when new thought segments are created or edited, via n8n or direct service calls through the abstraction layer.
-   **Cloud-Based Embedding Alternatives:**
    -   Ensure the Embedding Service abstraction supports integration with cloud-based embedding APIs (e.g., OpenAI Embeddings) as an alternative if local performance is a bottleneck for some users or for specific use cases.

---

## PHASE 3: Proto-LCM & AI Hooks (Month 2–3)
*(Static NN + local LLM + UX & cognitive dialogues - Integrating Context Management)*

### Tier #1: Local-First Full Immersion

1.  **Related Thoughts**
    -   “Show Related” → top-5 by cosine(sim) under 50 ms (leveraging Phase 2 vector store).
    -   **Inline preview card** on hover (snippet + source tag)
    -   **Why this link?** CTA: AI explains connection in 1–2 sentences (powered by local LLM).

2.  **Metacognitive Dialogue**
    -   After suggestions: “Does this align with your goals?” (Yes/No + comment)
    -   Prompt “How does this change your current Theme?” on accept

3.  **Mock Diffusion & Blend**
    -   Blend two embeddings (e.g., via simple averaging or weighted interpolation) → decode via a small, quantized local LLM (e.g., ~1B parameter GGUF model) or specialized text generation model to produce a new segment text. This simulates a conceptual blend.
    -   Show in side panel with **Accept/Refine/Dismiss** actions.

4.  **LLM Micro-service (Local-First - Implementing Context Management)**
    -   Containerize highly optimized and quantized 7B–8B LLMs (e.g., 4-bit GGML/GGUF models run via `llama.cpp` or a similar engine) for local deployment using Torch-Serve/BentoML.
    -   `POST /v1/complete` { context[], plan } → new segment text
    -   Async queue (Celery + Redis), rate-limiting, circuit breaker for local performance.
    -   `/metrics`: request rate, errors, GPU memory (for local monitoring).
    -   **Action: Design and Implement Context Window Allocator / Chunking Strategy Middleware.** Create a component that utilizes the schema metadata from Phase 1 (`local_priority`, `graph_neighbors`, `cluster_id`, etc.) to intelligently select, rank, and chunk data from the local vector store and database for LLM calls. This middleware is critical for managing LLaMA 3's context window limits for large graphs.
        -   Design logic for prioritizing segments based on `local_priority` and `graph_neighbors`.
        -   Implement chunking based on token count limits (e.g., keeping chunks below 16k or 32k tokens).
        -   Incorporate the use of `cluster_id` for scoped queries.
        -   Design how `llm_pass_history` will be updated/utilized.
    -   **Action: Implement LLM-Powered Document Parsing (Text-Only Initial Focus).** Integrate the LLaMA 3 parsing pipeline (Text extraction → LLaMA 3 segmentation → LogoMesh JSON formatting → DB Injection) leveraging the new Context Window Allocator and the flexible schema. Initial focus is on text documents (PDF, Markdown, TXT).

5.  **AI UI Stubs & Co-Writing**
    -   Buttons: “What patterns repeat?”, “Any contradictions?” → overlay modal streaming suggestions (from local LLM).
    -   Co-writing pane stub: AI proposes bubbles/edits; **Accept/Refine/Dismiss**
    -   Explanatory footer: “Powered by LogoMesh AI—suggestions may vary.”
    -   **Action:** Design UI feedback mechanisms to inform the user when the AI is processing a large graph using the chunking strategy (e.g., "Analyzing cluster 'X'", "Processing neighborhood around 'Y'").

6.  **Auto-reflective Loop**
    -   Store AI proposals with `abstraction_level = ai_suggestion` + glow badge
    -   On accept: animate insertion, auto-link via NN query (using local embeddings/vector DB), ensuring new segments incorporate the necessary metadata (`local_priority`, `graph_neighbors`, `cluster_id`) based on context.

> **Checkpoint:** LogoMesh offers AI-driven ideas framed as reflective questions and transparent suggestions, primarily leveraging local LLM and embedding capabilities, supported by an intelligent context management layer.

### Tier #2: Cloud-Enhanced Extensions (Optional/Future)

-   **LLM Micro-service (Cloud Alternatives - Leveraging Abstraction)**
    -   Leverage the designed API abstraction layer to allow users to optionally integrate with cloud LLM APIs (e.g., OpenAI GPT models, Anthropic Claude) via their own API keys. This provides an alternative for users without powerful local hardware or who desire access to larger, more capable models, integrating these cloud models with the Context Window Allocator middleware.
-   **Cloud-Based RAG Integration:**
    -   For users leveraging cloud vector DBs (e.g., Pinecone), ensure the `Query Agent Workflow` in n8n (or directly in the application) can utilize these cloud services for retrieval, integrating with the Context Window Allocator for query context.

---

## PHASE 4: Emergence Engine & Concept-Diffusion (Month 3+)
*(Deep reasoning: GPU-powered diffusion + iterative reflection + UX polish + MLOps metrics - Advancing Cluster Runtime & Extensibility)*

### Tier #1: Local-First Full Immersion

-   **Heatmap & Timelines**
    -   Heatmap layer (hotness = access/timestamp) with legend + time-slider
    -   Timeline playback animating graph growth; snapshot prompts: “What changed today?”

-   **Recursive Queries (Local-First - Utilizing Chunking & Metadata)**
    -   `POST /v1/query`: vector → LLM → vector; log DAGs for audit (all leveraging local LLM and vector DB).
    -   UI: collapsible query-tree sidebar for backtracking & tweak. **Action:** Design control mechanisms for recursive queries (e.g., user-configurable recursion depth limit, a 'stop' button). Implement UI feedback for query progress and emergent insights, potentially visualizing the query DAG, underpinned by the Context Window Allocator's intelligent data selection. Focus on initial single-step or two-step recursive queries before deeper recursion. Explore implementing Recursive Attention Stitching (RAS) techniques facilitated by the schema metadata (`graph_neighbors`, `llm_pass_history`).

-   **Concept-Diffusion Endpoints (Local GPU)**
    -   Containerize one-tower/two-tower diffusion (HF Diffusers) **on local GPU**.
    -   `POST /v1/diffuse` { contextEmbeds[], params } → sample embeddings
    -   GPU via Docker NVIDIA runtime or K8s device plugin (for local orchestration).
    -   Benchmark throughput & latency; CI smoke tests.
    -   **Action:** Clearly communicate hardware requirements to users.

-   **Advanced Contradiction Analysis**
    -   Debate view: side-by-side bubble pairs + AI-generated pros/cons (powered by local LLM, leveraging chunking strategy for relevant context).
    -   Prompt “Which stance resonates most, and why?”

-   **Goal-Oriented Planning**
    -   Multi-step Plan nodes outlining steps to Goals
    -   Drag-and-drop reordering; journaling prompts at each step: “What’s your next action?”

-   **Weekly Knowledge Consolidation**
    -   Auto-summaries of Themes with bullet prompts: “How would you teach this?” (from local LLM, leveraging chunking strategy for relevant Theme context).

-   **Multimodal Processing (Pathway Implementation - Building on Phase 2 Design)**
    -   **Action: Begin Implementation of Multimodal Embedding Pathways.** Based on the research and design from Phase 2, start implementing the technical pathways for processing and embedding at least one additional modality (e.g., images via OCR/CLIP embeddings), integrating with the flexible schema and abstraction layers. This does not require full AI interpretation yet, but establishes the data pipeline.

> **Checkpoint:** Full emergence engine with MLOps observability, UX metaphors, and cognitive reflection baked in, leveraging local GPU capabilities for advanced AI and recursive processing, with initial pathways for multimodal data established.

### Tier #2: Cloud-Enhanced Extensions (Optional/Future)

-   **Concept-Diffusion (Cloud Alternatives)**
    -   Explore integrating with cloud-based diffusion services or larger, pre-trained diffusion models via API for users without local GPUs or for specialized, high-fidelity diffusion tasks, integrating via abstraction layers.
-   **Recursive Queries (Cloud Scaling)**
    -   Ensure the abstraction layer supports running recursive queries against cloud-based LLM APIs or vector databases for improved performance or scalability if chosen by the user, ensuring compatibility with the schema metadata and Context Window Allocator logic.

---

## PHASE 5: Full LCM Integration & Beyond (Month 4+)
*(Production-quality, collaborative, metacognitive partner - Advanced Cluster Runtime & Full Extensibility)*

### Tier #1: Local-First Full Immersion

-   **Unified Concept-Model Service (Local Orchestration)**
    -   Merge embed + diffusion + LLM into a single container for efficient local deployment, orchestrated by Docker Compose.
    -   `POST /v1/predict_sequence` & `/v1/coauthor`
    -   **Clarification:** This unified service focuses on efficient orchestration of models on a single machine, building on the Context Window Allocator and schema metadata for processing.

-   **Beam Search & Hybrid Ranking**
    -   Implement beam search; score by cosine + LLM log-prob (using local models).
    -   Present ranked paths as flowchart; hover-preview before insert.

-   **Multimodal & Multilingual (Full Implementation - Leveraging Pathways)**
    -   `/v1/embed_audio`, `/v1/generate_speech` (SONAR), `/v1/embed_image`, `/v1/process_video`.
    -   **Action:** Fully implement processing, embedding, and AI interpretation pipelines for multiple modalities based on pathways established in Phase 4, integrating with the flexible schema and using the Context Window Allocator to manage multimodal context for AI models. Prioritize highly optimized local models where feasible.
    -   Drag-drop images/audio → embed → thumbnails + language flags
    -   Language selector for SONAR decode target.

-   **User-AI Collaborative Authoring**
    -   **Split-view pane**: left draft, right AI suggestions in context (from local models, leveraging chunking strategy).
    -   **Change-tracking**: highlight AI edits, inline comments, version history.

-   **Socratic AI Dialogues**
    -   AI poses: “Why is this Theme significant?”; user replies refine graph (from local LLM, leveraging chunking strategy and schema metadata).

-   **Adaptive Learning Paths**
    -   Suggest micro-lessons (articles/videos) tied to active Themes.

-   **Narrative Coherence Checker**
    -   Analyze cluster/story flow; prompt “Where are the logical gaps?”

-   **Spaced Repetition & Recall**
    -   Interval triggers surface old bubbles: “Do you still agree? Add a note.”

-   **Accessibility & Usability**
    -   Keyboard nav, screen-reader labels, color-blind safe palette
    -   Usability test scripts for every major feature

> **Ultimate Vision (Local-First Focus):**
> A **local, inspectable, production-quality hybrid-consciousness engine**—a true cognitive partner that suggests, challenges, guides, and reinforces insights over time, all within a rich, navigable LogoMesh, requiring minimal external dependencies, built on a foundation of universal extensibility and designed with "Cluster Runtime" principles for future growth.

### Tier #2: Cloud-Enhanced Extensions (Optional/Future)

-   **Unified Concept-Model Service (Cloud Orchestration - Full Cluster Runtime)**
    -   Implement deployment using a K8s cluster for a distinct, self-hostable server version or cloud deployment option. This enables true "Cluster Runtime" for large-scale or multi-user scenarios, building on the schema, abstraction layers, and context management logic developed in Tier #1.
-   **Multimodal & Multilingual (Cloud Alternatives)**
    -   Explore cloud-based APIs for more extensive multimodal capabilities or higher-fidelity speech generation if local models prove insufficient, integrating via abstraction layers.
-   **Collaborative Workspaces (Cloud-Based Scaling - Full Cluster Runtime)**
    -   Implement Real-time multi-user graphs; shared Themes; role-based prompts (e.g. Devil’s Advocate).
    -   Develop Conflict resolution tests; merge strategies in CI.
    -   **Action:** This is a significant engineering effort often requiring cloud infrastructure for robust real-time sync and conflict resolution, leveraging the "Cluster Runtime" foundation. Prioritize making the single-user experience robust first.
-   **Deployment & Versioning (Cloud/Server-Side)**
    -   Helm/Terraform for infra-as-code (for cloud/server deployment, not for the default local user application).
    -   Docker images versioned semantically; model checkpoints tracked via MLflow/W&B.
    -   Canary strategy: shadow mode → incremental rollout.
    -   Security sandboxing, resource quotas, audit logs.

---
