# Phase 2 Implementation Plan - Actionable Tasks

**Status**: ⏳ IN PROGRESS - Week 1, Task 1  
**Goal**: Build working infrastructure that Phase 3 can activate  
**Duration**: 4 weeks  
**Prerequisites**: Phase 1 completed (SQLite backend, React frontend, basic plugin scaffolding)

> **📍 Current Focus**: Week 1, Task 1 - Multi-Language Plugin Runtime (enhanced with specification goals)

## Week 1: Plugin System Foundation

### Task 1: Multi-Language Plugin Runtime
**Framework Outcome**: Plugin system loads and executes Node.js and Python plugins safely

**Core Goals (Essential):**
a. **Extend Plugin Manifest Schema**:
   - Update `contracts/plugins/pluginManifest.schema.json`
   - Add `runtime` field (values: "nodejs", "python", "shell")
   - Add `security_level` field (values: "sandbox", "trusted", "dev-only")
   - Add `resource_limits` object with memory/cpu constraints

b. **Implement Plugin Runtime Manager**:
   - Create `core/plugins/runtimeManager.ts`
   - Implement `NodeJSRuntime`, `PythonRuntime` classes
   - Each runtime spawns child processes with resource limits
   - Implement IPC communication via JSON over stdin/stdout

c. **Update PluginHost Service**:
   - Modify `core/services/pluginHost.ts` to use RuntimeManager
   - Implement plugin lifecycle: load → init → execute → cleanup
   - Add plugin state tracking and health monitoring

**Enhanced Goals (From Specifications):**
d. **Plugin Discovery System** *(from architecture_day_15_plugin_system_revision.md)*:
   - Implement plugin directory scanning
   - Plugin versioning and dependency resolution
   - Hot-reloading capabilities for development

e. **Security Sandboxing** *(from architecture_day_18_comprehensive_security_model.md)*:
   - Implement constitutional enforcement for plugin execution
   - Resource quota enforcement and monitoring
   - Plugin permission model with granular controls

f. **Multi-Language Coordination** *(from phase2_core_specifications.md)*:
   - Cross-language plugin communication protocols
   - Shared data structures between runtimes
   - Event bus integration for plugin coordination

**Stretch Goals (Time Permitting):**
g. **Advanced Plugin Features**:
   - Plugin hot-swapping without system restart
   - Plugin marketplace preparation (metadata, ratings)
   - Plugin development toolkit and CLI

**Verification**: 
- Load sample Node.js plugin, Python plugin, execute basic commands, verify resource isolation
- Test plugin discovery and hot-reload functionality
- Verify security sandbox prevents unauthorized operations
- Test cross-language plugin communication

### Task 2: TypeScript Migration Core Systems
**Framework Outcome**: All core/ and contracts/ directories fully TypeScript with zero compilation errors

**Detailed Actions (for AI Agent):**
a. **Update Core Services**:
   - Convert `core/services/eventBus.js` → `eventBus.ts`
   - Convert `core/services/meshGraphEngine.js` → `meshGraphEngine.ts`  
   - Add proper type definitions for all method signatures

b. **Fix Frontend TypeScript Issues**:
   - Convert `src/components/Canvas.jsx` → `Canvas.tsx`
   - Convert `src/services/apiService.js` → `apiService.ts`
   - Update all imports to use TypeScript extensions

c. **Configure Strict TypeScript**:
   - Update `tsconfig.json` with `"strict": true`
   - Fix all type errors in existing code
   - Ensure 100% type coverage

**Verification**: `npm run build` completes with zero TypeScript errors, all tests pass

## Week 2: LLM Infrastructure & Storage

### Task 3: Local LLM Integration (Ollama)
**Framework Outcome**: Backend can communicate with local Ollama models with full audit logging

**Detailed Actions (for AI Agent):**
a. **Enhance LLM Executor**:
   - Update `core/llm/OllamaExecutor.ts` with real Ollama HTTP client
   - Implement model selection, context management
   - Add streaming response support

b. **Implement LLM Registry**:
   - Create `core/llm/LLMRegistry.ts` 
   - Support multiple LLM providers (Ollama, OpenAI stub, Claude stub)
   - Dynamic model switching via configuration

c. **Enhanced Audit System**:
   - Expand `core/logger/llmAuditLogger.ts`
   - Log all prompts, responses, model metadata, execution time
   - Create audit query interface for debugging

**Verification**: Send prompt to local Ollama, receive response, verify complete audit trail

### Task 4: Enhanced SQLite with Embeddings Support  
**Framework Outcome**: Database supports vector operations and semantic search

**Detailed Actions (for AI Agent):**
a. **Add Vector Extension**:
   - Install sqlite-vss extension for vector similarity
   - Update `core/db/schema.sql` with embedding tables
   - Create indexes for vector similarity search

b. **Implement Vector Storage Adapter**:
   - Create `core/storage/vectorAdapter.ts`
   - Methods for storing/retrieving embeddings
   - Similarity search with configurable thresholds

c. **Update IdeaManager**:
   - Add semantic search capabilities to thought/segment queries
   - Implement clustering based on embedding similarity
   - Background embedding generation for new content

**Verification**: Store embeddings, perform similarity search, verify performance

## Week 3: Task Engine & DevShell

### Task 5: Task Engine Workflow System
**Framework Outcome**: Backend can execute multi-step workflows with error handling

**Detailed Actions (for AI Agent):**
a. **Create Task Engine Core**:
   - Create `core/services/taskEngine.ts`
   - Implement workflow definition schema (YAML/JSON)
   - Support sequential, parallel, conditional steps

b. **Implement Task Executors**:
   - LLM task executor (prompt → response)
   - Plugin task executor (call plugin methods)
   - System task executor (file operations, API calls)

c. **Add Workflow API**:
   - Create `server/src/routes/workflowRoutes.ts`
   - Endpoints: create, execute, monitor, cancel workflows
   - WebSocket support for real-time progress updates

**Verification**: Create workflow with LLM + plugin steps, execute successfully, monitor progress

### Task 6: DevShell Command Interface
**Framework Outcome**: Secure command interface for development and plugin testing

**Detailed Actions (for AI Agent):**
a. **Implement Command Sanitizer**:
   - Create `core/devshell/commandSanitizer.ts`
   - Whitelist safe commands, block dangerous operations
   - Sandboxed execution environment

b. **Create DevShell Service**:
   - Create `core/devshell/devshellService.ts`
   - Execute commands with output capture
   - Integration with plugin system for testing

c. **Add DevShell API**:
   - Create `server/src/routes/devshellRoutes.ts`
   - WebSocket-based command interface
   - Real-time output streaming

**Verification**: Execute safe commands via DevShell, verify output, confirm dangerous commands blocked

## Week 4: Integration & Testing

### Task 7: Complete Test Coverage
**Framework Outcome**: 90%+ test coverage across all new infrastructure

**Detailed Actions (for AI Agent):**
a. **Core System Tests**:
   - Unit tests for Plugin Runtime Manager
   - Integration tests for LLM workflows
   - Performance tests for vector operations

b. **API Integration Tests**:
   - End-to-end workflow execution tests
   - Plugin loading and execution tests
   - DevShell security validation tests

c. **Frontend Integration**:
   - Update React app to use new backend features
   - Add UI for workflow management
   - Plugin management interface

**Verification**: All tests pass, coverage reports show 90%+, new features accessible via UI

### Task 8: Documentation & Developer Experience
**Framework Outcome**: New developer setup takes <30 minutes

**Detailed Actions (for AI Agent):**
a. **Update Setup Documentation**:
   - Revise README.md with Phase 2 features
   - Create plugin development guide
   - Workflow creation tutorial

b. **Create Sample Plugins**:
   - Simple Node.js plugin (text processing)
   - Simple Python plugin (data analysis)
   - Sample workflows using both plugins

c. **Performance Optimization**:
   - Profile and optimize critical paths
   - Implement caching where appropriate
   - Monitor resource usage under load

**Verification**: Fresh developer can set up environment in <30 minutes, create and test plugin successfully

## Success Criteria

- [ ] Plugin system loads Node.js and Python plugins
- [ ] Zero TypeScript compilation errors
- [ ] Local LLM integration working with audit trails
- [ ] Vector similarity search operational
- [ ] Task engine executes multi-step workflows
- [ ] DevShell provides secure command interface
- [ ] 90%+ test coverage maintained
- [ ] New developer setup <30 minutes

## What's Explicitly Deferred to Phase 3

- Real-time AI decision making
- Advanced semantic analysis
- Multi-agent coordination
- Complex reasoning chains
- External API integrations
- Production security hardening