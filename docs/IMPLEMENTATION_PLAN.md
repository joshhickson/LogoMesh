# Phase 2 Implementation Plan - Actionable Tasks

**Status**: ⏳ IN PROGRESS - Week 1, Task 1  
**Goal**: Build working infrastructure that Phase 3 can activate  
**Duration**: 4 weeks  
**Prerequisites**: Phase 1 completed (SQLite backend, React frontend, basic plugin scaffolding)

> **📍 Current Focus**: Week 1, Task 1 - Multi-Language Plugin Runtime (enhanced with specification goals)

## 🚨 Critical Reality Checks (Must Address Before Phase 2)

Based on architectural analysis, these issues will become major blockers if not resolved:

### Priority 0: Foundation Stability
- **56% TS / 42% JS = Maintenance Nightmare**: Complete TypeScript migration to 100% or define explicit JS sunset plan
- **LLM Layer Monolith**: Break down LLMOrchestrator into micro-actors to prevent single-point-of-failure
- **Security Gaps**: No JWT/session flow, no rate limiting, plugins can access filesystem - critical for any external deployment
- **Storage Abstraction Leak**: IdeaManager directly coupled to StorageAdapter - will break when adding vector DB

### Priority 1: Architectural Debt
- **Node-RED Scope Creep**: Decide if it's core automation or remove before it becomes unkillable
- **Testing Imbalance**: Backend needs load/fuzz tests, not just frontend mocks
- **Observability Blind Spots**: Need tracing before cognitive engines flood the system

## Week 1: Foundation Stability (Critical Path)

### Task 1: Complete TypeScript Migration + Security Foundation
**Framework Outcome**: 100% TypeScript codebase with basic security framework
**Reality Check**: Address 56% TS / 42% JS maintenance nightmare before building new features

**CRITICAL: Must complete before any new development**

**Core Goals (Essential):**
a. **Complete TypeScript Migration**:
   - Convert all remaining JS files to TS
   - Enable TypeScript strict mode with CI gate
   - Fix all compilation errors and `any` types
   - Eliminate mixed language maintenance nightmare

b. **Implement Basic Security Framework**:
   - Add JWT/session handling to AuthService
   - Implement rate limiting on API routes
   - Create plugin permission system (filesystem access controls)
   - Add basic request validation middleware

c. **Slice LLM Monolith** (Critical Architecture Fix):
   - Break LLMOrchestrator into micro-actors:
     - `LLMGateway` (rate limit, auth)
     - `ConversationOrchestrator` (state machine)
     - `RunnerPool` (per-model execution)
     - `AuditService` (off-loaded, stateless)
   - Prevent single prompt from blocking all model traffic

**Enhanced Goals (From Specifications):**
d. **Add Observability Foundation**:
   - Integrate OpenTelemetry tracing
   - Add pino logger with structured logging
   - Create performance monitoring for critical paths
   - Enable visibility before cognitive engines flood system

e. **Data Access Service Layer** (Fix Storage Abstraction Leak):
   - Create thin `DataAccessService` between IdeaManager ↔ StorageAdapter
   - Prevent business logic refactors when switching to vector DB
   - Abstract database knowledge from business layer

f. **Node-RED Decision**:
   - Evaluate current Node-RED usage patterns
   - Either: formalize as first-class automation core with contracts
   - Or: remove and migrate critical flows to TaskEngine
   - Prevent scope creep from killing the architecture

**Stretch Goals (Time Permitting):**
g. **Advanced Security Features**:
   - Sandboxed VM for plugins (vm2 or Deno)
   - Signed plugins only
   - Comprehensive audit logging

**Verification**: 
- ✅ **GATE 1.1**: `npx tsc --noEmit` passes with 0 errors (100% TypeScript)
- ✅ **GATE 1.2**: Basic auth flow works with JWT/session validation
- ✅ **GATE 1.3**: Rate limiting prevents API abuse
- ✅ **GATE 1.4**: Plugin filesystem access is restricted
- ✅ **GATE 1.5**: LLM components can be independently tested/scaled

#### **Week 1 Task 2: Secure Plugin System Foundation** 
**Timeline:** Days 4-6 (3 days)
**Priority:** Critical (After TypeScript completion)

**Core Goals (Essential):**
- **Implement Secure Plugin Runtime Manager**:
  - Create `core/plugins/runtimeManager.ts` with sandboxed execution
  - Support Node.js and Python plugins with resource limits
  - Implement IPC communication via JSON over stdin/stdout
  - Add plugin permission system with filesystem restrictions

- **Plugin Security Framework**:
  - Create plugin manifest schema with security levels
  - Implement resource quotas and monitoring
  - Add plugin state tracking and health monitoring
  - Prevent unauthorized system access

- **Plugin Discovery System**:
  - Implement plugin directory scanning
  - Plugin versioning and dependency resolution
  - Hot-reloading capabilities for development

**Enhanced Goals (From Specifications):**
- **Sandboxed Execution Environment**: Use vm2 or similar for JavaScript plugins
- **Signed Plugin System**: Only allow verified plugins to execute
- **Cross-Language Coordination**: Enable plugins to communicate safely
- **Plugin Development Toolkit**: CLI and testing utilities

**Stretch Goals (Time Permitting):**
- Plugin marketplace preparation (metadata, ratings)
- Advanced plugin debugging tools
- Plugin performance profiling

**Implementation Steps:**
1. **Pre-Phase Audit:** Audit remaining JS to accurately estimate migration effort (from Phase 2 analysis)
2. **Prioritize Critical Paths:** Focus on core modules impacting other Phase 2 features first
3. **Incremental Migration:** Convert and merge incrementally where feasible
4. **LLM Configuration:** Create signed LLM config with local/mock executor registry
5. **Route Handler Types:** Complete Express route handler type signatures
6. **Build Stabilization:** Ensure build process stability across all environments

**Success Criteria:**
- ✅ **VERIFICATION GATE 1.2:** Secure plugin execution with resource limits
- ✅ Plugin filesystem access properly sandboxed
- ✅ Plugin crash containment prevents system-wide failures
- ✅ Plugin discovery and hot-reload working
- ✅ Multi-language plugin communication functional
- ✅ **FAIL-SAFE:** If security cannot be guaranteed, disable plugin execution

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

#### **Week 1 Task 4: Basic Task Engine**
**Timeline:** Days 8-9 (2 days)
**Priority:** Critical

**Reality Check:** Build TaskEngine by extending existing `LLMTaskRunner` (~40% functionality) and `LLMOrchestrator` (~30% functionality) rather than starting from scratch. Focus on the missing 30% integration layer.

**Core Goals (Essential):**
- **Extend LLMTaskRunner:** Add multi-executor support (LLM, Plugin, System) using existing retry/audit infrastructure
- **Enhance LLMOrchestrator:** Add Pipeline execution support beyond just conversation workflows  
- **Create ExecutorRegistry:** Simple registry mapping executor IDs to existing LLMTaskRunner, PluginHost instances
- **Build Pipeline Schema:** JSON workflow definitions using existing Task/Pipeline interfaces from specifications
- **Integrate EventBus:** Connect existing EventBus to pipeline execution events

**Enhanced Goals (From Core Specifications):**
- **MetaExecutor Stub:** Simple routing logic using existing `LLMOrchestrator` model selection patterns
- **Task State Management:** Extend existing audit logging with pipeline execution tracking
- **API Integration:** Add `/api/tasks/` endpoints using existing route patterns from `thoughtRoutes.ts`
- **Cross-Executor Coordination:** Enable LLM → Plugin → System task chains using existing interfaces
- **Audit Trail Extension:** Expand `llmAuditLogger` to track full pipeline provenance

**Stretch Goals (Time Permitting):**
- **Visual Pipeline Builder:** Simple JSON editor component using existing modal patterns
- **Dependency Resolution:** Basic DAG validation for task ordering
- **Resource Monitoring:** Extend existing `LLMTaskRunner.getStatus()` for pipeline health
- **Workflow Templates:** Common development patterns (lint → test → build) as JSON configs
- **Real-time Monitoring:** WebSocket integration using existing `LLMOrchestrator` event patterns

**Implementation Steps:**
1. **Audit Existing Components:** Confirm LLMTaskRunner execution/retry and LLMOrchestrator coordination patterns
2. **Create TaskEngine Core:** Build bridge class that orchestrates existing LLMTaskRunner and PluginHost
3. **Extend ExecutorRegistry:** Simple registry wrapping existing executor instances  
4. **Pipeline Execution:** Add multi-step workflow support to existing LLMOrchestrator patterns
5. **State Integration:** Extend existing SQLite audit tables for pipeline tracking
6. **API Routes:** Add task endpoints following existing `thoughtRoutes.ts` patterns

**Success Criteria:**
- ✅ **VERIFICATION GATE 1.4:** TaskEngine executes 3-step pipeline (LLM → Plugin → System) successfully
- ✅ **Reality Check:** Uses existing LLMTaskRunner retry logic without reimplementation
- ✅ **Reality Check:** Leverages existing LLMOrchestrator event system for progress updates
- ✅ **Reality Check:** Extends existing audit logging rather than creating new system
- ✅ **Reality Check:** Integrates with existing PluginHost without breaking plugin execution
- ✅ **FAIL-SAFE:** If integration proves unstable, fall back to individual executor testing

## 🎯 Quick Wins This Week (High ROI, Low Effort)

**Complete these immediately to prevent architectural debt:**

| Task | Effort | Payoff | Priority |
|------|--------|--------|----------|
| Add TypeScript strict mode and CI gate | 1 day | Stops future "works on my machine" JS leaks | P0 |
| Wire up pino + OpenTelemetry exporter | ½ day | Immediate visibility on route/LLM lag | P0 |
| Build tiny "hello-world" sandboxed plugin | 1 day | Proof that PluginHost isn't a security hole | P0 |
| Write stress test hitting EventBus + LLM 1k req/min | 1 day | Reveals back-pressure gaps before users do | P1 |
| Abstract StorageAdapter behind service boundary | 1 day | Prevents business logic refactors when adding vector DB | P1 |

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

## 🔧 Hard, Unsexy Refactors (Schedule or Suffer)

**These architectural debts will compound if not addressed:**

### Critical Refactors (Week 3-4)
1. **Abstract StorageAdapter behind service boundary** - Prevents business logic coupling to specific databases
2. **Introduce Domain Event schema** - Enables micro-services to communicate with consistent language
3. **Replace ad-hoc Context Generation** - Use Prompt-Template registry (file-backed, version-controlled)
4. **Data Model Versioning** - Support schema migrations (Thought v1 → v2) without breaking user graphs
5. **Formal Plugin Security Contract** - Sandboxed VM, permissions manifest, signed plugins only

### Observability Requirements
- Drop in OpenTelemetry tracing now for cross-layer latency visibility
- Structured logging with pino for debugging complex interactions
- Performance monitoring for cognitive context engine readiness

## Success Criteria

**Foundation Stability (Week 1):**
- [ ] 100% TypeScript codebase with strict mode enabled
- [ ] Basic JWT/session authentication working
- [ ] Rate limiting preventing API abuse
- [ ] Plugin system executes securely with filesystem restrictions
- [ ] LLM components can be independently tested/scaled

**Feature Development (Week 2-4):**
- [ ] Local LLM integration working with audit trails
- [ ] Vector similarity search operational
- [ ] Task engine executes multi-step workflows
- [ ] DevShell provides secure command interface
- [ ] 90%+ test coverage maintained
- [ ] New developer setup <30 minutes

**Reality Check Gates:**
- [ ] No mixed TS/JS compilation errors
- [ ] Single LLM prompt cannot block all model traffic
- [ ] Plugin crashes do not affect system stability
- [ ] Storage layer changes don't require business logic refactors
- [ ] Security audit shows no critical vulnerabilities

## What's Explicitly Deferred to Phase 3

- Real-time AI decision making
- Advanced semantic analysis
- Multi-agent coordination
- Complex reasoning chains
- External API integrations
- Production security hardening

---

## Phase 2 End Vision Alignment

### Implementation Plan vs. Complete Phase 2 Architecture

This **4-week implementation plan** builds the **foundational infrastructure** that enables the **complete Phase 2 end vision**. The relationship is structured as follows:

#### **Week 1-4: Foundation Building** (This Plan)
- **Multi-Language Plugin Runtime** → Enables advanced plugin ecosystem
- **TypeScript Migration** → Provides type safety for complex systems  
- **DevShell Implementation** → Creates development and control interface
- **Basic Task Engine** → Establishes workflow coordination foundation

#### **Post-Implementation: Advanced Feature Activation**
The foundation enables these Phase 2 end vision capabilities:

**Constitutional & Sovereignty Layer:**
- Constitutional Enforcement Engine (builds on DevShell security framework)
- Digital Sovereignty Manager (extends plugin permission system)
- Consent Beacon System (integrates with audit infrastructure)

**Advanced Plugin Ecosystem:**
- Hot-reload and resource management (extends runtime manager)
- Cross-language coordination (builds on multi-runtime foundation)
- Plugin marketplace preparation (uses registry framework)

**Vector Translation Core (VTC):**
- Semantic search and embedding pipelines (integrates with Task Engine)
- Latent space manipulation (extends storage adapter)
- Conceptual blending engine (coordinates via EventBus)

**Enhanced AI Infrastructure:**
- LLM orchestration and model registry (builds on existing LLM framework)
- Ethics engine and safety systems (integrates with constitutional layer)
- Meta-cognitive reflection (extends Task Engine capabilities)

**Real-Time Processing:**
- Sub-500ms deadline enforcement (enhances Task Engine scheduling)
- Cross-device synchronization (builds on EventBus architecture)
- Stream processing pipeline (extends workflow system)

**Enterprise Security & Audit:**
- Zero-trust architecture (builds on DevShell security model)
- Comprehensive audit engine (extends existing audit logging)
- Hardware security integration (enhances constitutional enforcement)

### **Phase 2 Complete Vision Capabilities**

After **this implementation plan** + **advanced feature activation**, LogoMesh will provide:

#### **Core Infrastructure Capabilities**
- **Multi-Language Plugin Ecosystem**: Execute plugins in Node.js, Python, Go, Rust, C# with secure sandboxing, hot-reload, and marketplace integration
- **Advanced Task Engine**: Complex multi-step workflows with LLM → Plugin → System chains, real-time deadline scheduling, and visual pipeline builder
- **Vector Translation Core**: Local embedding generation, universal latent space translation, semantic search, and conceptual blending
- **Enhanced Graph Intelligence**: AI-driven relationship discovery, dynamic clustering, context scoring, and interactive visualization

#### **Development & Security Infrastructure**  
- **DevShell Command Environment**: Secure natural language pipeline builder, plugin development toolkit, and file system controls
- **Constitutional Enforcement**: User-defined governance rules, zero-trust architecture, and hardware security integration
- **Comprehensive Audit System**: Complete operation trails, self-inspection APIs, debug timeline UI, and LLM self-critique loops

#### **User Experience & Interface**
- **Enhanced React Frontend**: TypeScript-native, Cytoscape.js visualization, real-time WebSocket updates, and cross-device synchronization
- **Voice & Multimodal Integration**: Text-to-speech, voice input, cross-platform support, and agent status widgets
- **Template & Form System**: Dynamic JSON schema rendering, workflow integration, and automated processing

#### **Data & Storage Capabilities**
- **Enhanced SQLite with Vector Support**: Vector similarity search, embedding storage, audit tables, and automatic backup
- **Advanced Import/Export**: JSON portability, bulk operations, data validation, and version control

### **Implementation Timeline Relationship**

```
Week 1-4 (This Plan)     →     Advanced Features     →     Phase 2 Complete
├─ Plugin Runtime              ├─ Hot-reload System         ├─ Full Plugin Ecosystem
├─ TypeScript Migration        ├─ Constitutional Layer      ├─ Digital Sovereignty  
├─ DevShell Foundation         ├─ VTC Implementation        ├─ Semantic Intelligence
└─ Task Engine Core            └─ Security Hardening        └─ Enterprise Platform
```

### **Architecture Continuity**

The **implementation plan maintains architectural continuity** with the end vision by:

1. **Interface Consistency**: All foundation components implement interfaces that support advanced features
2. **Extensibility Design**: Core systems designed for plugin-based enhancement and feature activation  
3. **Security Foundation**: DevShell and audit systems provide security framework for constitutional enforcement
4. **Event-Driven Architecture**: EventBus enables real-time coordination and cross-system communication
5. **Storage Abstraction**: SQLite adapter designed to support vector operations and advanced queries

### **Success Criteria Alignment**

**Implementation Plan Success** → **End Vision Readiness**:
- ✅ Plugin system loads Node.js/Python → Ready for Go/Rust/C# extension
- ✅ TypeScript compilation clean → Ready for complex type system features  
- ✅ DevShell executes safe commands → Ready for constitutional enforcement
- ✅ Task Engine handles workflows → Ready for real-time deadline scheduling
- ✅ LLM integration functional → Ready for multi-model orchestration
- ✅ Audit trails complete → Ready for comprehensive transparency systems

This implementation plan is **Phase 2 foundation**, not complete Phase 2. The end vision represents the **full Phase 2 architectural completion** that this foundation enables.
```