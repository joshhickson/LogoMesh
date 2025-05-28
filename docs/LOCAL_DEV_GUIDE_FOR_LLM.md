
# Local Development Guide for LLM (Devstral)

## Overview

This document serves as the primary communication channel from Claude (Replit agent) to Devstral (local VS Code LLM) for LogoMesh Phase 1 v3.0 development. It provides essential information for local development, testing, and seamless transitions between Replit and local environments.

## Project Root & Structure Overview

**Project Root:** `.` (current directory)

**Top-Level Directories:**
- `src/` - React frontend application
- `core/` - **ROOT LEVEL** business logic and data management (NOT within src/)
- `contracts/` - **ROOT LEVEL** TypeScript interface definitions (NOT within src/)
- `server/` - Node.js/Express.js backend API (to be created in Phase 1)
- `docs/` - Documentation and guides
- `scripts/` - Build and utility scripts
- `state_snapshots/` - Exported data snapshots for testing/backup

**Critical Note:** `core/` and `contracts/` are at the project root, not nested within `src/`. This is fundamental to the Phase 1 v3.0 architecture.

## Local Environment Configuration Guide

### Goal
Make the project compilable and runnable locally with proper path resolution and environment setup.

### Path Aliases Configuration
The project uses path aliases defined in `tsconfig.json` at the root:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@core/*": ["core/*"],
      "@contracts/*": ["contracts/*"],
      "@server/*": ["server/*"],
      "~/src/*": ["src/*"]
    }
  }
}
```

**IMPORTANT:** Always respect these aliases when importing modules. Examples:
- `import { IdeaManager } from '@core/IdeaManager'`
- `import { Thought } from '@contracts/entities'`
- `import { LLMExecutor } from '@contracts/llmExecutor'`

### Environment Setup Steps

1. **Install Dependencies:**
   ```bash
   npm install
   # OR
   pnpm install
   ```

2. **Environment Variables:**
   - Copy `.env.example` to `.env`
   - Configure local paths and settings:
     ```
     PORT=3001
     API_BASE_PATH=/api/v1
     DB_PATH=./server/data/logomesh.sqlite3
     PLUGIN_DIR=./plugins
     LOG_LEVEL=info
     DEFAULT_LLM_EXECUTOR=MockLLMExecutor
     ULS_DIMENSION=768
     REACT_APP_API_URL=http://localhost:3001/api/v1
     ```

3. **Local Development Commands:**
   ```bash
   # Frontend (React)
   npm start
   # OR for monorepo setup
   pnpm --filter ./src start
   
   # Backend (when implemented in Phase 1)
   cd server && npm start
   # OR
   pnpm --filter ./server start
   ```

### Required Local Dependencies
- Node.js (v18+ recommended)
- sqlite3 CLI (for database inspection)
- npm or pnpm package manager

## Local Testing Procedures

### Goal
Ensure comprehensive testing capabilities for all components, especially the new SQLite persistence layer.

### Testing Framework
- **Primary:** Jest
- **Coverage:** Unit tests and integration tests
- **Structure:** Tests located alongside source files with `.test.ts` or `.test.js` extensions

### Test Commands
```bash
# Run all tests
npm test
# OR
pnpm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Test Structure & Locations
```
core/**/*.test.ts              # Core business logic tests
server/src/routes/tests/*.test.ts  # API endpoint tests (Phase 1)
src/components/__tests__/*.test.jsx # React component tests
```

### SQLite Testing Strategy
- **Isolation:** Use temporary database files for each test suite
- **Setup/Teardown:** Create fresh DB instances per test
- **Example pattern:**
  ```typescript
  // In SQLiteStorageAdapter tests
  beforeEach(async () => {
    testDbPath = `./test_${Date.now()}_${Math.random()}.sqlite3`;
    adapter = new SQLiteStorageAdapter(testDbPath);
    await adapter.initialize();
  });
  
  afterEach(async () => {
    await adapter.close();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });
  ```

### Testing Priorities (Phase 1 v3.0 Task 10.c)
1. **SQLiteStorageAdapter:** Comprehensive CRUD operation tests
2. **IdeaManager:** Mock StorageAdapter integration tests
3. **API Endpoints:** Supertest + Jest for HTTP testing
4. **PortabilityService:** Import/export functionality
5. **VTC Interfaces:** Verify stub implementations behave correctly

## Key Architectural Concepts for Local LLM

### Decoupling Architecture
- **Frontend:** React app in `src/` communicates with backend via HTTP API
- **Backend:** Node.js/Express server in `server/` handles all data operations
- **Storage:** SQLite database accessed through IdeaManager → SQLiteStorageAdapter pattern

### Data Persistence Flow
```
React UI → HTTP API → Express Routes → IdeaManager → SQLiteStorageAdapter → SQLite DB
```

### AI Foundation Components (Phase 1 Scaffolding)

#### Vector Translation Core (VTC)
- **Location:** `contracts/embeddings/` and `core/embeddings/`
- **Status:** Interface stubs only in Phase 1
- **Key Interface:** `EmbeddingInterface` for model-agnostic embedding handling
- **Critical:** Implement ephemeral embedding policy - NO persistent storage of raw embeddings

#### Cognitive Context Engine (CCE)
- **Location:** `core/context/`
- **Status:** Conceptual placeholder in Phase 1
- **Purpose:** Future semantic lens for context generation
- **Dependencies:** Will leverage ThoughtExportProvider and VTC in Phase 2+

#### Plugin System
- **Runtime Interface:** `core/plugins/pluginRuntimeInterface.ts`
- **Manifest Schema:** `contracts/plugins/pluginManifest.schema.json` (extended)
- **Features:** Context-aware loading, translation capabilities, dynamic runtime plugins

### Environment Variable Handling
Always use `process.env.VARIABLE_NAME || 'defaultValue'` pattern for robust configuration across environments.

## LLM-to-LLM Communication Protocol

### Purpose
This document establishes the communication channel from Claude (Replit) to Devstral (local).

### Communication Format
When Devstral needs to communicate back to Claude or document status:

1. **Create Status Reports:** Commit markdown files to `docs/` directory
2. **Naming Convention:** `docs/DEVSTRAL_STATUS_REPORT_<timestamp>.md`
3. **Content Structure:**
   ```markdown
   # Devstral Status Report - [Date]
   
   ## Current Task
   [What you're working on]
   
   ## Questions/Clarifications
   [Any uncertainties about architecture/implementation]
   
   ## Proposed Changes
   [Changes you plan to make or have made]
   
   ## Environment Issues
   [Any local setup problems encountered]
   
   ## Next Steps
   [Your planned next actions]
   ```

### Communication Guidelines
- Keep reports concise and structured
- Focus on technical specifics
- Highlight any deviations from planned architecture
- Document environment-specific configurations

## Architectural Insights & Best Practices

### For Devstral Development
1. **Environment Variables:** Always handle path differences between Replit (`/tmp/`, persistent storage) and local (`./data/`, relative paths)

2. **Interface Compliance:** Use `@contracts/` interfaces as the source of truth for all type definitions and interactions

3. **VTC/CCE Awareness:** Respect the ephemeral embedding policy and interface contracts even in stub implementations

4. **Cross-Environment Compatibility:** Code should work on:
   - Local development machines
   - Replit environment
   - Low-compute devices (future Raspberry Pi deployment)

5. **Port Configuration:** Use `0.0.0.0` instead of `localhost` for Replit compatibility when binding ports

### Code Quality Standards
- Maintain TypeScript strict mode compliance
- Implement comprehensive error handling
- Use parameterized queries for all SQLite operations
- Follow existing logging patterns (`@core/utils/logger.ts`)

## Phase 1 v3.0 Context

### Current State (Pre-Phase 1)
- React app with in-memory IdeaManager
- Data loaded from localStorage on startup
- Basic interfaces defined in `contracts/`
- Core utilities in `core/utils/`

### Phase 1 Goals
- Transition to SQLite persistence
- Build Node.js/Express backend API
- Refactor React to consume HTTP API
- Implement VTC/CCE interface scaffolding
- Set up Node-RED automation
- Container support with Docker

### Development Workflow
```
Local Development (Devstral) → Replit Integration (Claude) → Local Testing → Repeat
```

This cycle ensures robust development with proper Replit demo functionality throughout Phase 1.

---

**Last Updated:** January 2025  
**Document Version:** 1.0  
**Target LLM:** Devstral (VS Code + Roo Code)  
**Source:** Claude (Replit Agent)
