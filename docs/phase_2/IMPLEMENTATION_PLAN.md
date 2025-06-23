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

#### **Week 1 Task 2: TypeScript Migration** 
**Timeline:** Days 3-5 (3 days)
**Priority:** Critical

**Core Goals (Essential):**
- Complete TypeScript migration for remaining frontend components
- Fix all TypeScript compilation errors in build pipeline
- Update Express route handler type signatures (from Core Specifications)
- Ensure zero compilation errors: `npx tsc --noEmit` passes
- Stabilize build process and eliminate compilation errors

**Enhanced Goals (From Core Specifications):**
- Create signed `models/llm.config.json` as single source of truth for LLM configurations
- Implement `LLMExecutorRegistry` with signature validation (local & mock executors only)
- Plugin-proposed model additions require DevShell approval workflow (configurable in Security panel)
- Implement comprehensive type checking pipeline with CI integration
- Add TypeScript path aliases properly configured for `/core/`, `/contracts/`, `/src/`

**Stretch Goals (Time Permitting):**
- Implement `LocalModelTestPanel.tsx` (prompt ↔ completion, tokens/sec display) 
- Add TypeScript strict mode configuration with gradual enforcement
- Create TypeScript utility types for improved developer experience
- Add automated TypeScript migration tools for future JavaScript files
- Implement TypeScript decorators for plugin system foundation

**Implementation Steps:**
1. **Pre-Phase Audit:** Audit remaining JS to accurately estimate migration effort (from Phase 2 analysis)
2. **Prioritize Critical Paths:** Focus on core modules impacting other Phase 2 features first
3. **Incremental Migration:** Convert and merge incrementally where feasible
4. **LLM Configuration:** Create signed LLM config with local/mock executor registry
5. **Route Handler Types:** Complete Express route handler type signatures
6. **Build Stabilization:** Ensure build process stability across all environments

**Success Criteria:**
- ✅ **VERIFICATION GATE 1.2:** Zero TypeScript compilation errors: `npx tsc --noEmit`
- ✅ ESLint passes: `npm run lint`
- ✅ All tests still pass: `npm test`  
- ✅ Frontend builds successfully: `npm run build`
- ✅ Signed LLM config loads without errors: Test `LLMExecutorRegistry.loadConfig()`
- ✅ **FAIL-SAFE:** If migration effort exceeds timeline, prioritize core modules and defer non-critical files

#### **Week 1 Task 3: DevShell Implementation**
**Timeline:** Days 6-7 (2 days)
**Priority:** Critical

**Core Goals (Essential):**
- Create privileged plugin with developer-only access and permission system
- Implement `CloudDevLLMExecutor` stub for high-context external model integration
- Build natural language pipeline builder with JSON output (template-based)
- Implement safe filesystem access with sandboxed path restrictions
- Create embedded terminal UI (`DevShellTerminal.tsx`) with command simulation

**Enhanced Goals (From Core Specifications):**
- Implement `PluginExecutionLimiter` with timeout & circuit-breaker for crash containment
- Build Plugin Live Inspector DevShell panel showing loaded plugins, permissions, memory usage
- Create `PluginAPI.readFile()` for safe filesystem reading within sandbox paths
- Implement `PluginAPI.proposeFileChange()` creating `.patch` files requiring human approval
- Add `devShellWriteMode = "proposal"` by default with `"direct"` mode for advanced users
- Implement `devShellSandboxPaths` restricting access to `/src` and `/docs` by default

**Stretch Goals (Time Permitting):**
- Create `CodeAnalysisLLMExecutor` mock for plugin manifest and code analysis
- Implement self-debugging agent mode stub for pipeline failure analysis
- Build integration with error logging for root cause analysis framework
- Add `logomesh simulate` CLI for dry-run pipelines
- Create comprehensive audit trail of all file operations with integrity verification

**Implementation Steps:**
1. **DevShell Plugin Foundation:** Create privileged plugin framework with security sandboxing
2. **Mock Cloud Integration:** Implement CloudDevLLMExecutor with API integration simulation
3. **Natural Language Interface:** Add template-based command parsing with JSON output
4. **Filesystem Controls:** Implement read-only by default with proposal-based mutations
5. **Terminal UI:** Build embedded terminal component with command simulation
6. **Plugin Safety:** Add execution limits, crash containment, and live monitoring

**Success Criteria:**
- ✅ **VERIFICATION GATE 1.3:** DevShell executes basic developer commands safely
- ✅ Mock cloud LLM integration handles all error scenarios gracefully
- ✅ Natural language parsing handles common development patterns
- ✅ Security sandbox prevents unauthorized system access consistently
- ✅ Plugin crash containment prevents system-wide failures
- ✅ All file operations require explicit user confirmation
- ✅ **FAIL-SAFE:** If security compromised, disable privileged operations immediately

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
```