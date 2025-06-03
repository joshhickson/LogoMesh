
# LogoMesh Phase 2 Development Plan - Infrastructure Foundations

**Version:** 2.2  
**Date:** June 2, 2025  
**Prerequisites:** Phase 1 complete with functional LM-Core, SQLite persistence, backend API, and basic AI integration stubs

## Executive Summary

Phase 2 focuses on building robust, testable infrastructure foundations for cognitive systems rather than activating full autonomy. This phase scaffolds the Vector Translation Core (VTC), prepares MeshGraphEngine interfaces, establishes comprehensive audit frameworks, and creates deterministic pipeline execution systems. All major systems will be implemented with local-first stubs and mock executors, creating the architectural foundation for Phase 3's real-time cognitive activation.

**Key Phase 2 Principle:** Build contracts, stubs, and local-test scaffolding. Phase 3 flips the switches (real LLM wiring, external agents, cloud fallback).

## Core Architectural Themes

### Theme 0: Security & Transparency Configuration Framework
*Establishing comprehensive safety controls and audit governance*

**Priority: Critical - Foundation**

#### Security & Transparency Settings Panel (v0.3)
Implement comprehensive security governance panel with Safety Mode enabled by default:

| Section | Key / Toggle | Default (Safety Mode = ON) | Implementation Notes |
|---------|--------------|---------------------------|---------------------|
| **A. Model Governance** | `modelRegistryMode` = `"signedOnly" \| "unsignedAllowed"` | **`signedOnly`** | Requires Sigstore-signed commits for any new `llm.config.json` entry |
| | `isolatedRunByDefault` (bool) | **true** | All new model revisions run in isolated container first |
| **B. Chain-of-Thought** | `cotMode` = `"full" \| "summary" \| "off"` | **`summary`** | Full for local preset, summary for cloud |
| | `cotMaxBytes` (int) | **20,000** | Hash-only fallback above this size |
| | `cotHotDays` (int) | **30** | Moves to cold archive after |
| **C. Audit & Logs** | `auditHotDays` (int) | **90** | Live searchable period |
| | `auditColdGB` (int) | **5** | Compressed, encrypted, FIFO deletion |
| | `incidentBroadcast` (bool) | **true** | Critical errors to DevShell + email webhook |
| **D. DevShell Permissions** | `devShellWriteMode` = `"proposal" \| "direct"` | **`proposal`** | All writes produce `.patch` awaiting approval |
| | `devShellSandboxPaths[]` | **[`/src`,`/docs`]** | Paths outside list are read-only |
| **E. Tool Executor Firewalls** | `toolCapabilityTokens` (string[]) | **empty** | Plugin tool execution requires user-granted tokens |
| | `maxToolCallsPerTask` (int) | **3** | Prevents runaway loops |
| **F. Mock / Test Harness** | `mockLatencyJitterMs` (range) | **100–600** | Forces retry logic during testing |
| | `mockErrorRatePct` (0-100) | **5** | Random timeouts/syntax errors for testing |
| **G. Migration Safety** | `preMigrationSnapshot` (bool) | **true** | Zip + hash stored in `snapshots/` |
| | `autoRollbackOnError` (bool) | **true** | Auto-restore DB if migration fails |

#### Implementation Steps
1. Create `user_settings.privacy_config` JSON schema with all security toggles
2. Implement `/api/settings/privacy` endpoint for configuration management
3. Build Security & Transparency settings UI panel with Safety Mode preset
4. Integrate security checks into all Phase 2 infrastructure components
5. Add security validation gates to all verification checkpoints

#### Database Schema Extensions
```sql
-- User privacy and security settings
CREATE TABLE user_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT,
  setting_type TEXT CHECK (setting_type IN ('json', 'string', 'number', 'boolean')),
  last_modified DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Security audit events
CREATE TABLE security_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  details TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved BOOLEAN DEFAULT FALSE
);
```

#### Phase 3 Activation Plan
- Extend model governance to cloud API keys and dynamic load balancing
- Implement advanced threat detection and automated response systems
- Add federated audit trail sharing for multi-user environments
- Enable AI-driven security policy optimization based on usage patterns

### Theme 1: Foundation Stabilization & TypeScript Migration
*Eliminating technical debt and establishing type safety*

**Priority: Critical**

#### Implementation Steps
- Complete TypeScript migration for all frontend components
- Fix remaining Express route handler type signatures  
- Implement comprehensive type checking pipeline
- Stabilize build process and eliminate compilation errors
- Create signed `models/llm.config.json` as single source of truth for all LLM configurations
- Implement `LLMExecutorRegistry` with signature validation (local & mock executors only)
- Plugin-proposed model additions require DevShell approval workflow (configurable in Security panel)
- Implement `LocalModelTestPanel.tsx` (prompt ↔ completion, tokens/sec display)

#### Phase 3 Activation Plan
- Populate LLM registry with real OpenAI/Anthropic IDs and dynamic load-balancing
- Expose LocalModelTestPanel to end-users for model hot-swap
- Enable real-time model switching and cloud fallback orchestration

### Theme 2: Vector Translation Core (VTC) - Infrastructure Scaffolding
*Building embedding pipeline foundations with local-first stubs*

**Priority: High**

#### VTC Foundation Implementation
- **EmbeddingService Scaffold**: Implement using local models (bge-small, e5-small) with mock fallbacks
- **UniversalLatentSpaceManager Stub**: Create interface with deterministic test translator for validation
- **Transparent Embedding Pipeline**: All segments get embeddings with full audit trail (mock LLM integration)
- **Self-Sovereign Latent Store**: Implement storage layer with embedding-first approach
- **Embedding Drift Detection**: Implement `EmbeddingComparator` + periodic cosine-drift log
- **Vector Visualization**: Create `UMAPViewer` (DevShell panel) for vector space inspection
- **Segment Provenance Chain**: Add `segment_version_log` table for version tracking

#### User Toggles & Configuration (Testing Framework)
- `[TOGGLE_STORE_RAW_FOR_EMBEDDING]`: Control raw text retention for testing
- `[TOGGLE_VTC_TRANSPARENCY_LOGGING]`: Enable vector translation audit logs  
- `[TOGGLE_LINK_EMBEDDINGS_TO_METADATA]`: Explicit embedding-metadata linkage
- `[TOGGLE_SEGMENT_TRANSPARENT_MODE]`: Vector-first vs. text-first storage modes

#### Database Schema Extensions (Production-Ready with Migration Safety)
**Migration Philosophy:** In-place updates with mandatory pre-migration snapshots and auto-rollback on failure (configurable in Security panel)
```sql
-- Add to segments table
ALTER TABLE segments ADD COLUMN embedding_vector TEXT;
ALTER TABLE segments ADD COLUMN embedding_model_id TEXT;
ALTER TABLE segments MODIFY COLUMN content TEXT NULL;

-- Audit table for vector operations
CREATE TABLE vector_translation_audit_log (
  translation_id TEXT PRIMARY KEY,
  segment_id TEXT,
  source_model_id TEXT,
  target_model_id TEXT,
  source_vector_preview TEXT,
  target_vector_preview TEXT,
  timestamp DATETIME,
  -- 🚧 Stub: Phase 3 will add real LLM decision metadata
  translation_quality_score REAL DEFAULT NULL,
  FOREIGN KEY (segment_id) REFERENCES segments(id)
);

-- Version tracking for segments
CREATE TABLE segment_version_log (
  version_id TEXT PRIMARY KEY,
  segment_id TEXT,
  previous_content TEXT,
  change_reason TEXT,
  timestamp DATETIME,
  FOREIGN KEY (segment_id) REFERENCES segments(id)
);
```

#### Phase 3 Activation Plan
- Replace mock embedding models with real-time multi-model orchestration
- Enable dynamic model selection based on content analysis
- Connect to cloud embedding APIs with transparent cost tracking
- Implement agent-driven vector space optimization
- Activate drift detection to trigger auto-re-embed pipelines when drift > threshold
- Enable agent-driven cluster reviews and auto-tagging via UMAPViewer

### Theme 3: MeshGraphEngine - Algorithmic Foundation Setup
*Preparing semantic traversal interfaces without cognitive decision-making*

**Priority: High**

#### Core Graph Operations (Deterministic Implementation)
- **Relationship Traversal**: Implement `getRelatedThoughts()`, `getPathBetween()` with configurable algorithms
- **Semantic Clustering**: Tag-based and embedding-similarity clustering with mock similarity scoring
- **Context Scoring**: Implement scoring framework with pluggable metrics (embedding similarity, link density, recency)
- **Summary Generation**: Auto-generated summary nodes with deterministic top-N relationships
- **Graph Debug & Cache**: Path traversal tests, `[TOGGLE_GRAPH_DEBUG]`, SQLite cache
- **Cognitive Context Engine (CCE)**: Build CCE request API, chunking, semantic compression → pass to `LLMTaskRunner`

#### Backend Integration (Service Layer)
- Inject `IdeaManager` and `EmbeddingService` dependencies with clear interfaces
- Implement caching layer in SQLite with performance monitoring
- Add comprehensive debug logging with `[TOGGLE_GRAPH_DEBUG]` configuration
- Create test harnesses for graph algorithm validation

#### Frontend Visualization (Cytoscape.js Migration)
- Implement score-based node sizing and cluster coloring with mock data
- Create interactive summary mode showing central node + neighbors
- Add visual path highlighting and relationship indicators
- Implement progressive disclosure for complex graphs with performance thresholds

#### Phase 3 Activation Plan
- Replace deterministic clustering with LLM-driven semantic analysis
- Enable real-time graph restructuring based on AI insights
- Implement agent-driven relationship discovery and validation
- Connect to collaborative graph editing with conflict resolution
- Activate CCE for dynamic context "onboarding" per agent with >100K token feeds
- Enable graph-based agent search and long-horizon planning

### Theme 4: TaskEngine & Pipeline Infrastructure
*Building execution framework with mock cognitive components*

**Priority: High**

#### Task & Pipeline Schema (Production Framework)
```typescript
interface Task {
  taskId: string;
  executorId: string;
  input: any;
  config?: TaskExecutionConfig;
  // 🚧 Stub: Phase 3 will add AI-generated task metadata
  aiGeneratedMetadata?: any;
}

interface Pipeline {
  pipelineId: string;
  tasks: Task[];
  meta?: PipelineMeta;
  // TODO: Replace with real LLM pipeline optimizer in Phase 3
  mockOptimizationHints?: string[];
}

interface ScaffoldedPipeline {
  goal: string;
  subgoals: string[];
  progressChecks: string[];
  // 🚧 Stub: Phase 3 agents will auto-generate & update scaffolds
  isAgentGenerated: boolean;
}
```

#### Execution Infrastructure (Mock-Enabled with Stochastic Testing)
**Mock Fidelity Strategy:** Implement stochastic mocks with 100-600ms latency jitter and 5% error rate to validate retry logic and error handling (configurable in Security panel)
- **ExecutorRegistry**: Dynamic registration with mock LLM, TTS, and plugin executors
- **TaskEngine**: Core execution loop with state management, retry logic, and deterministic routing
- **MetaExecutor Stub**: Implement cognitive load simulation (local vs. cloud decision mocking)
- **Event System**: Complete `taskStarted`, `taskCompleted`, `pipelineCompleted` event framework
- **FakeAgentRunner**: Deterministic scripted agent for pipeline load-tests
- **MetaExecutor Decision Log**: `meta_executor_log` table + reason strings for decision tracking

#### UI & API Integration (Testing-Ready)
- Pipeline submission form with drag-drop task builder (mock task validation)
- Real-time execution status display with mock progress simulation
- Pipeline history with comprehensive logging and replay capabilities
- API route: `POST /api/pipeline/submit` with full error handling
- **Pipeline Stack-Trace UI**: `PipelineDebugView` (per-task output, timings)

#### Phase 3 Activation Plan
- Replace mock executors with real-time LLM orchestration
- Enable AI-generated pipeline optimization and self-modification
- Implement dynamic task routing based on resource availability and context
- Connect to external services with intelligent fallback strategies
- Replace FakeAgentRunner with live LLM agents with Tool use
- Feed MetaExecutor logs to self-evaluation agent for optimization
- Enable self-healing pipelines (agents edit failing steps)

### Theme 5: Audit Trail & Transparency Infrastructure
*Building comprehensive logging without cognitive analysis*

**Priority: Medium-High**

#### Unified Audit Schema (Production-Grade with Retention Management)
**Retention Policy:** 90-day hot storage (live searchable), 5GB cold storage with FIFO deletion (configurable in Security panel)
```sql
CREATE TABLE llm_execution_log (
  id TEXT PRIMARY KEY,
  task_id TEXT,
  executor_id TEXT,
  input_prompt TEXT,
  model_used TEXT,
  output_text TEXT,
  timestamp DATETIME,
  linked_segment_id TEXT,
  -- 🚧 Stub: Phase 3 will add AI quality assessment
  ai_quality_score REAL DEFAULT NULL,
  -- Chain-of-Thought field with configurable storage policy
  chain_of_thought TEXT NULL,
  -- CoT storage metadata (configurable in Security panel)
  cot_mode TEXT DEFAULT 'summary' CHECK (cot_mode IN ('full', 'summary', 'off')),
  cot_size_bytes INTEGER DEFAULT 0
);

CREATE TABLE pipeline_execution_log (
  id TEXT PRIMARY KEY,
  pipeline_id TEXT,
  task_id TEXT,
  executor_id TEXT,
  input TEXT,
  output TEXT,
  error TEXT,
  timestamp DATETIME,
  -- TODO: Add AI-driven error categorization in Phase 3
  error_category TEXT DEFAULT 'uncategorized'
);

-- Memory snapshot tracking
CREATE TABLE memory_snapshots (
  snapshot_id TEXT PRIMARY KEY,
  snapshot_data TEXT,
  timestamp DATETIME,
  description TEXT
);
```

#### Self-Inspection APIs (Query Framework)
- `GET /api/audit/llm/recent?count=20` with comprehensive filtering
- `GET /api/audit/pipeline/:id` with full execution trace
- `GET /api/audit/segment/:id` (trace back to source actions)
- `GET /api/audit/errors` with pattern analysis framework
- `GET /api/snapshot/export` + snapshot browser for memory inspection

#### Debug UI & Timeline (Visualization Layer)
- Chronological event playback with advanced filtering and search
- Full prompt/output inspection views with export capabilities
- Traceability from any Thought/Segment to source chain with mock analysis
- Self-critique mode stub for future LLM response evaluation
- **Audit Summary Dashboard**: React dashboard showing top models, errors, latency
- **Memory Snapshot Tool**: Time-travel diffing for regression tests

#### LLM Self-Awareness Integration
- **SyntheticFeedbackRunner**: Store LLM self-critiques into new Segments
- **Meta-level Self-Critique Loop**: LLM prompts analyzing audit logs → "improvement Thoughts"

#### Phase 3 Activation Plan
- Implement AI-driven error pattern recognition and auto-resolution
- Enable predictive quality scoring for LLM outputs
- Add cognitive bias detection in decision chains
- Implement self-improving audit strategies based on usage patterns
- Activate agents to monitor and auto-tune configs via Audit Summary Dashboard
- Use SyntheticFeedbackRunner corpus for fine-tuning and RLHF
- Enable meta-level self-critique to auto-open DevShell PRs with suggested patches

### Theme 6: DevShell & Development Infrastructure
*Creating controlled development environment without autonomous code generation*

**Priority: Medium**

#### DevShell Plugin Foundation (Sandboxed Framework)
- Privileged plugin with developer-only access and permission system
- `CloudDevLLMExecutor` stub for high-context external model integration
- `CodeAnalysisLLMExecutor` mock for plugin manifest and code analysis
- Natural language pipeline builder with JSON output (template-based)
- **Plugin Crash Containment**: `PluginExecutionLimiter` with timeout & circuit-breaker
- **Plugin Live Inspector**: DevShell panel showing loaded plugins, permissions, memory usage

#### Tool Use & Execution Framework (Security-Controlled)
- **Tool Schema + Executor**: `contracts/tools/toolSchema.ts`; `ToolExecutor` with capability token validation
- **Tool Execution Firewall**: Requires user-granted `toolCapabilityTokens` for plugin tool access (configurable in Security panel)
- **Runaway Prevention**: `maxToolCallsPerTask = 3` by default to prevent infinite loops
- **Robust Ollama/LlamaCpp Executor**: Implement streaming, error handling, VRAM tuning with security boundaries

#### Filesystem Access & Controlled Mutation (Safety-First)
- **Read-only by default** with sandboxed path restrictions (configurable in Security panel)
- `PluginAPI.readFile()` for safe filesystem reading within sandbox paths
- `PluginAPI.proposeFileChange()` creates `.patch` files requiring human approval
- `devShellWriteMode = "proposal"` by default; `"direct"` mode available for advanced users
- `devShellSandboxPaths` restricts access to `/src` and `/docs` by default
- Full audit trail of all file operations with integrity verification

#### Developer Interface (Testing Environment)
- Embedded terminal UI (`DevShellTerminal.tsx`) with command simulation
- Self-debugging agent mode stub for pipeline failure analysis
- Integration with error logging for root cause analysis framework
- **Simulation CLI**: `logomesh simulate` for dry-run pipelines

#### Phase 3 Activation Plan
- Replace template-based builders with real-time AI code generation
- Enable autonomous debugging and self-repair capabilities
- Implement intelligent code review and suggestion systems
- Connect to external development tools with AI-driven workflows
- Activate agents to restart/patch crashing plugins via Plugin Crash Containment
- Enable real-time permission elevation requests via Plugin Live Inspector
- Add LLM function-calling with automatic tool selection to Tool Executor
- Add cloud fallback & multi-GPU sharding to Ollama/LlamaCpp Executor
- Replace simulation CLI with headless CI agent executing nightly self-tests

### Theme 7: Input Templates & Structured Data Transformation
*Building form systems without cognitive template generation*

**Priority: Medium**

#### Template System (Schema Framework)
```typescript
interface InputTemplate {
  templateId: string;
  name: string;
  description?: string;
  fields: TemplateField[];
  tags?: string[];
  // 🚧 Stub: Phase 3 will enable AI-generated templates
  onSubmitPipelineId?: string;
  aiGenerationHints?: string[];
}
```

#### Form Infrastructure (Production UI)
- Dynamic form rendering engine from templates (`TemplateFormRenderer.tsx`)
- Template discovery with tag-based filtering and search
- Save-and-reuse system for submitted values with version control
- Auto-pipeline triggers on template submission (mock validation)

#### LLM Integration Preparation
- Prompt-to-template conversion interface via DevShell (mock implementation)
- Template validation and preview system before saving
- Example generation framework for template testing

#### Phase 3 Activation Plan
- Implement real-time prompt-to-template conversion via LLM
- Enable AI-driven template optimization based on usage patterns
- Add intelligent field validation and auto-completion
- Connect templates to dynamic pipeline generation

### Theme 8: Text-to-Speech (TTS) Plugin Infrastructure
*Building voice output framework with platform-specific implementations*

**Priority: Low-Medium**

#### TTS Plugin Interface (Cross-Platform Foundation)
```typescript
interface TTSSpeaker {
  speakText(text: string, voiceId?: string): Promise<void>;
  getAvailableVoices(): Promise<string[]>;
  // 🚧 Stub: Phase 3 will add AI voice selection
  selectOptimalVoice(content: string): Promise<string>;
}
```

#### Event-Driven Voice Triggers (Testing Framework)
- Listen for `thoughtFocused` and `segmentSelected` events with mock responses
- `[TOGGLE_TTS_ON_FOCUS]` configuration with comprehensive testing
- Cross-platform support implementation (Windows SAPI, macOS say, Linux espeak)

#### Neural TTS Preparation (Interface Scaffolding)
- Stub plugin framework for future GPU/local model TTS
- API endpoint: `POST /api/tts/test` for voice testing and validation
- Plugin selection system during installation with preference management

#### UI Agent Presence (Minimal Implementation)
- **Minimal Agent HUD**: `AgentStatusWidget` listening on EventBus
- Basic SAPI/say/espeak plugin integration

#### Phase 3 Activation Plan
- Implement AI-driven voice selection based on content analysis
- Enable real-time speech adaptation for different content types
- Add emotional context awareness for voice modulation
- Connect to cloud TTS services with quality optimization
- Activate full avatar, voice, and live screen actions via Agent HUD
- Enable neural TTS with voice cloning and lip-sync

## Implementation Roadmap with Verification Checkpoints

### **MANDATORY PRE-PHASE VERIFICATION**
**🚨 GATE 0: Foundation Readiness Check**

#### Pre-Phase Cleanup
- [ ] **CLEANUP:** Remove outdated test result files: `jest-results.json`, `test-results.log`, `lint-*-errors*.txt`
- [ ] **CLEANUP:** Remove temporary development files: `test-backup.js`, outdated `docs/DevPlan_Phase0`, `docs/DevPlan_Phase1`
- [ ] **CLEANUP:** Archive or remove temporary files from `attached_assets/` (retain essential references)
- [ ] **CLEANUP:** Clean up empty/outdated error export directories
- [ ] **CLEANUP:** Remove duplicate documentation: consolidate `docs/Claude-Log.md` and `docs/Claude-log.md`

#### Foundation Verification
- [ ] **VERIFY:** All Phase 1 tests pass: `npm test`
- [ ] **VERIFY:** Backend starts without errors: `cd server && npm run dev`
- [ ] **VERIFY:** Frontend builds cleanly: `npm run build`
- [ ] **VERIFY:** API endpoints respond: `curl http://localhost:3001/api/v1/thoughts`
- [ ] **VERIFY:** Database migrations are clean: Check SQLite schema integrity
- [ ] **VERIFY:** Repository is clean after cleanup: no build artifacts or temporary files
- [ ] **FAIL-SAFE:** If any verification fails, STOP and resolve before proceeding

---

### **Weeks 1-2: Foundation & VTC Infrastructure**

#### Task 1.1: Complete TypeScript Migration
**Implementation Steps:**
1. Convert remaining .js/.jsx files to .ts/.tsx
2. Fix all type errors in build pipeline
3. Update imports and exports with proper typing
4. Create `llm.config.json` + `LLMExecutorRegistry` (local & mock executors only)

**🔒 VERIFICATION GATE 1.1:**
- [ ] **VERIFY:** Zero TypeScript compilation errors: `npx tsc --noEmit`
- [ ] **VERIFY:** ESLint passes: `npm run lint`
- [ ] **VERIFY:** All tests still pass: `npm test`
- [ ] **VERIFY:** Frontend builds successfully: `npm run build`
- [ ] **VERIFY:** Signed LLM config loads without errors: Test `LLMExecutorRegistry.loadConfig()`
- [ ] **VERIFY:** Security & Transparency panel renders and persists settings correctly
- [ ] **VERIFY:** Safety Mode preset applies all default security controls
- [ ] **FAIL-SAFE:** If security validation fails, disable affected features and continue

#### Task 1.2: Scaffold EmbeddingService with Mock Models
**Implementation Steps:**
1. Install and configure local embedding models (bge-small, e5-small) with fallback mocks
2. Create EmbeddingService interface with comprehensive error handling
3. Add model loading simulation and deterministic embedding generation for testing
4. Implement `EmbeddingComparator` + periodic cosine-drift log

**🔒 VERIFICATION GATE 1.2:**
- [ ] **VERIFY:** Mock models load without errors: Test `EmbeddingService.loadModel()`
- [ ] **VERIFY:** Deterministic embedding generation works: Test with sample text
- [ ] **VERIFY:** Error handling catches all failure modes gracefully
- [ ] **VERIFY:** Performance meets baseline: <500ms for mock operations
- [ ] **VERIFY:** Drift detection logs are created and queryable
- [ ] **FAIL-SAFE:** If model loading fails, implement full mock fallback

#### Task 1.3: Build UniversalLatentSpaceManager Interface
**Implementation Steps:**
1. Design translator interface and mock implementation
2. Create deterministic test translator for validation
3. Add comprehensive translation audit logging framework
4. Implement `UMAPViewer` (DevShell panel) for vector space inspection

**🔒 VERIFICATION GATE 1.3:**
- [ ] **VERIFY:** Mock translator produces consistent results
- [ ] **VERIFY:** Translation simulation preserves test vector relationships
- [ ] **VERIFY:** Audit logs capture all translation attempts with full metadata
- [ ] **VERIFY:** Interface supports future real translator integration
- [ ] **VERIFY:** UMAPViewer displays mock vector clusters correctly
- [ ] **FAIL-SAFE:** If interface design inadequate, revise before schema updates

#### Task 1.4: Update Database Schema for Embeddings
**Implementation Steps:**
1. Create production-ready migration scripts for embedding columns
2. Add comprehensive audit trail tables with proper indexing
3. Update storage adapter to handle new schema with backwards compatibility
4. Add `segment_version_log` table for provenance chain tracking

**🔒 VERIFICATION GATE 1.4:**
- [ ] **VERIFY:** Migration runs cleanly on fresh database
- [ ] **VERIFY:** Migration preserves all existing data integrity
- [ ] **VERIFY:** Schema supports both mock and real embedding workflows
- [ ] **VERIFY:** Rollback mechanism works for failed migrations
- [ ] **VERIFY:** Segment version tracking functions correctly
- [ ] **FAIL-SAFE:** If migration fails, implement automatic rollback

#### Task 1.5: Implement Transparency Toggles and Audit Framework
**Implementation Steps:**
1. Add configuration toggles to UI and backend with comprehensive validation
2. Implement conditional logging based on toggles with performance monitoring
3. Create audit data export and analysis tools
4. Implement `LocalModelTestPanel.tsx` (prompt ↔ completion, tokens/sec display)

**🔒 VERIFICATION GATE 1.5:**
- [ ] **VERIFY:** All toggles work correctly and affect appropriate backend behavior
- [ ] **VERIFY:** Logging framework captures all required data points
- [ ] **VERIFY:** Performance impact <5% when logging enabled
- [ ] **VERIFY:** Audit data is queryable and exportable
- [ ] **VERIFY:** LocalModelTestPanel displays model interactions correctly
- [ ] **FAIL-SAFE:** If performance impact >10%, implement async logging

**🚨 END-OF-WEEK-2 GATE:**
- [ ] **COMPREHENSIVE VERIFY:** All Week 1-2 verification gates passed
- [ ] **INFRASTRUCTURE TEST:** VTC interfaces work with mock data end-to-end
- [ ] **AUDIT VERIFICATION:** All VTC operations are fully traceable
- [ ] **FAIL-SAFE:** If infrastructure incomplete, delay Week 3 until resolved

---

### **Weeks 3-4: Graph Intelligence & Task Infrastructure**

#### Task 3.1: Implement MeshGraphEngine Algorithmic Foundation
**Implementation Steps:**
1. Build deterministic relationship traversal algorithms with configurable parameters
2. Add semantic clustering with mock similarity scoring and validation
3. Create context scoring framework with pluggable metrics
4. Implement path traversal tests, `[TOGGLE_GRAPH_DEBUG]`, SQLite cache
5. Build CCE request API, chunking, semantic compression → pass to `LLMTaskRunner`

**🔒 VERIFICATION GATE 3.1:**
- [ ] **VERIFY:** Graph traversal returns predictable paths for test datasets
- [ ] **VERIFY:** Clustering algorithms produce consistent groupings
- [ ] **VERIFY:** Context scoring framework supports multiple metrics
- [ ] **VERIFY:** Performance: <200ms for 100-node test graphs
- [ ] **VERIFY:** CCE can handle >10K token context windows without errors
- [ ] **FAIL-SAFE:** If algorithms unstable, implement simplified deterministic versions

#### Task 3.2: Build TaskEngine with Mock Executor Framework
**Implementation Steps:**
1. Create task execution infrastructure with comprehensive state management
2. Build executor registry system with mock implementations
3. Add robust error handling and configurable retry logic
4. Implement `FakeAgentRunner` for deterministic scripted agent load-tests
5. Add `meta_executor_log` table + reason strings for decision tracking

**🔒 VERIFICATION GATE 3.2:**
- [ ] **VERIFY:** Mock tasks execute with predictable results
- [ ] **VERIFY:** Complex pipelines with 5+ tasks complete reliably
- [ ] **VERIFY:** Error handling manages all failure scenarios gracefully
- [ ] **VERIFY:** Retry logic works correctly for simulated transient failures
- [ ] **VERIFY:** FakeAgentRunner executes test scenarios consistently
- [ ] **FAIL-SAFE:** If execution unreliable, implement simplified task runner

#### Task 3.3: Create Pipeline Schema and Mock Execution System
**Implementation Steps:**
1. Define production-ready pipeline data structures with validation
2. Implement pipeline execution engine with mock cognitive components
3. Add real-time status tracking and comprehensive logging
4. Create `PipelineDebugView` (per-task output, timings)
5. Implement `ScaffoldedPipeline` contract with goal/subgoal JSON stub

**🔒 VERIFICATION GATE 3.3:**
- [ ] **VERIFY:** Pipeline validation catches all schema errors
- [ ] **VERIFY:** Execution status updates accurately reflect mock progress
- [ ] **VERIFY:** Pipeline history preserves all execution metadata
- [ ] **VERIFY:** Concurrent pipelines execute without interference
- [ ] **VERIFY:** PipelineDebugView displays detailed execution traces
- [ ] **FAIL-SAFE:** If pipeline corruption occurs, implement atomic execution

#### Task 3.4: Begin Cytoscape.js Migration with Mock Data
**Implementation Steps:**
1. Install Cytoscape.js and configure required layouts for testing
2. Create graph visualization component with mock data integration
3. Migrate core visualization features from React Flow with performance testing

**🔒 VERIFICATION GATE 3.4:**
- [ ] **VERIFY:** Cytoscape renders mock graphs with >100 nodes smoothly
- [ ] **VERIFY:** All interaction features work reliably (zoom, pan, select)
- [ ] **VERIFY:** Performance exceeds React Flow baseline benchmarks
- [ ] **VERIFY:** Memory usage remains stable during extended testing
- [ ] **FAIL-SAFE:** If performance inadequate, optimize or revert to React Flow

#### Task 3.5: Add Mock Semantic Clustering and Scoring
**Implementation Steps:**
1. Implement clustering algorithms with mock embedding data
2. Add relevance scoring system with configurable parameters
3. Create visual indicators for clusters and scores with testing framework

**🔒 VERIFICATION GATE 3.5:**
- [ ] **VERIFY:** Clustering produces consistent groups for test datasets
- [ ] **VERIFY:** Scoring framework supports multiple relevance metrics
- [ ] **VERIFY:** Visual indicators clearly communicate cluster relationships
- [ ] **VERIFY:** Clustering performance: <1s for 1000 mock nodes
- [ ] **FAIL-SAFE:** If clustering inconsistent, implement rule-based grouping

**🚨 END-OF-WEEK-4 GATE:**
- [ ] **COMPREHENSIVE VERIFY:** All Week 3-4 verification gates passed
- [ ] **INTEGRATION TEST:** Graph + TaskEngine interfaces work together
- [ ] **MOCK VALIDATION:** All mock components produce predictable results
- [ ] **FAIL-SAFE:** If integration unreliable, isolate and stabilize components

---

### **Weeks 5-6: Audit Infrastructure & DevShell Framework**

#### Task 5.1: Implement Comprehensive Audit Trail System
**Implementation Steps:**
1. Create production-grade audit database schema with proper indexing
2. Implement audit event capture across all systems with batching
3. Add audit data retention, cleanup, and export capabilities
4. Create `memory_snapshots` table and snapshot browser
5. Implement Audit Summary Dashboard (React dashboard: top models, errors, latency)

**🔒 VERIFICATION GATE 5.1:**
- [ ] **VERIFY:** All system interactions are logged with complete metadata
- [ ] **VERIFY:** Audit trail maintains referential integrity
- [ ] **VERIFY:** Query performance on audit logs <100ms for typical queries
- [ ] **VERIFY:** Storage growth is predictable and manageable
- [ ] **VERIFY:** Memory snapshots can be created and browsed
- [ ] **FAIL-SAFE:** If audit logging impacts performance >10%, implement async batching

#### Task 5.2: Create Self-Inspection APIs and Debug Framework
**Implementation Steps:**
1. Build comprehensive self-inspection API endpoints with proper pagination
2. Create debug timeline UI component with advanced filtering
3. Add mock error pattern analysis framework for testing
4. Implement `SyntheticFeedbackRunner` to store LLM self-critiques
5. Create meta-level self-critique loop for improvement suggestions

**🔒 VERIFICATION GATE 5.2:**
- [ ] **VERIFY:** Debug UI loads and displays interaction history correctly
- [ ] **VERIFY:** Timeline navigation is responsive with large datasets
- [ ] **VERIFY:** Mock error pattern detection identifies test scenarios
- [ ] **VERIFY:** API responses handle large datasets without timeout
- [ ] **VERIFY:** SyntheticFeedbackRunner stores critiques as queryable Segments
- [ ] **FAIL-SAFE:** If UI performance poor, implement data virtualization

#### Task 5.3: Build DevShell Plugin Infrastructure
**Implementation Steps:**
1. Create DevShell plugin framework with security sandboxing
2. Implement mock CloudDevLLMExecutor with API integration simulation
3. Add natural language command interface with template-based parsing
4. Implement `PluginExecutionLimiter` with timeout & circuit-breaker
5. Create Plugin Live Inspector DevShell panel

**🔒 VERIFICATION GATE 5.3:**
- [ ] **VERIFY:** DevShell executes basic developer commands safely
- [ ] **VERIFY:** Mock cloud LLM integration handles all error scenarios
- [ ] **VERIFY:** Natural language parsing handles common development patterns
- [ ] **VERIFY:** Security sandbox prevents unauthorized system access
- [ ] **VERIFY:** Plugin crash containment works reliably
- [ ] **FAIL-SAFE:** If security compromised, disable privileged operations

#### Task 5.4: Add Controlled Filesystem Access Framework
**Implementation Steps:**
1. Implement safe filesystem access layer with comprehensive validation
2. Create mutation proposal and review system with rollback capability
3. Add complete audit trail for all file operations with integrity checking
4. Implement Tool Schema + Executor (`contracts/tools/toolSchema.ts`)
5. Build robust Ollama/LlamaCpp Executor with streaming and error handling

**🔒 VERIFICATION GATE 5.4:**
- [ ] **VERIFY:** All file operations require explicit user confirmation
- [ ] **VERIFY:** All file changes are reversible with full rollback capability
- [ ] **VERIFY:** Sandbox prevents access to system and sensitive files
- [ ] **VERIFY:** Audit trail captures all filesystem interactions with checksums
- [ ] **VERIFY:** Tool Executor can call plugin functions with JSON args
- [ ] **FAIL-SAFE:** If unauthorized access detected, disable filesystem features immediately

#### Task 5.5: Implement Mock Natural Language Pipeline Builder
**Implementation Steps:**
1. Create template-based NL-to-JSON pipeline converter
2. Add pipeline validation and preview with comprehensive error checking
3. Implement pipeline template library with versioning
4. Create `logomesh simulate` CLI for dry-run pipelines

**🔒 VERIFICATION GATE 5.5:**
- [ ] **VERIFY:** Template-based parsing creates valid pipeline JSON consistently
- [ ] **VERIFY:** Pipeline preview accurately shows execution flow
- [ ] **VERIFY:** Template library covers common development use cases
- [ ] **VERIFY:** Generated pipelines execute successfully with mock components
- [ ] **VERIFY:** Simulation CLI runs pipelines without side effects
- [ ] **FAIL-SAFE:** If parsing unreliable, provide structured form builder fallback

**🚨 END-OF-WEEK-6 GATE:**
- [ ] **COMPREHENSIVE VERIFY:** All Week 5-6 verification gates passed
- [ ] **SECURITY AUDIT:** DevShell operations remain properly sandboxed
- [ ] **AUDIT COMPLETENESS:** All system interactions captured in audit trail
- [ ] **FAIL-SAFE:** If security or audit gaps found, address before proceeding

---

### **Weeks 7-8: Templates, TTS & Integration Testing**

#### Task 7.1: Create Input Template Infrastructure
**Implementation Steps:**
1. Design production template schema with comprehensive validation
2. Build dynamic form rendering engine with error handling
3. Add template discovery and management with search capabilities

**🔒 VERIFICATION GATE 7.1:**
- [ ] **VERIFY:** Template forms render correctly for complex schemas
- [ ] **VERIFY:** Form validation catches all input error scenarios
- [ ] **VERIFY:** Template discovery finds relevant templates efficiently
- [ ] **VERIFY:** Template submission triggers correct mock pipelines
- [ ] **FAIL-SAFE:** If form rendering fails, provide basic HTML input fallback

#### Task 7.2: Add TTS Plugin Infrastructure
**Implementation Steps:**
1. Create cross-platform TTS plugin interface with fallback support
2. Implement platform-specific voice support with mock integration
3. Add voice selection and configuration with preference management
4. Implement Minimal Agent HUD (`AgentStatusWidget`) listening on EventBus

**🔒 VERIFICATION GATE 7.2:**
- [ ] **VERIFY:** TTS works on all target platforms (Windows, macOS, Linux)
- [ ] **VERIFY:** Voice output latency <1s from trigger event
- [ ] **VERIFY:** Audio quality meets basic clarity standards
- [ ] **VERIFY:** TTS toggles work without affecting other system features
- [ ] **VERIFY:** Agent HUD displays basic status information
- [ ] **FAIL-SAFE:** If TTS fails on any platform, gracefully disable for that platform

#### Task 7.3: Comprehensive Testing and Performance Optimization
**Implementation Steps:**
1. Achieve 90%+ test coverage across all new infrastructure modules
2. Optimize performance bottlenecks identified during development
3. Add performance monitoring and alerting for production readiness
4. Implement inference profiling suite (tokens/sec, VRAM, latency per model)

**🔒 VERIFICATION GATE 7.3:**
- [ ] **VERIFY:** Test coverage meets 90% target for all new code
- [ ] **VERIFY:** All performance metrics meet established success criteria
- [ ] **VERIFY:** No memory leaks detected in 4-hour stress testing
- [ ] **VERIFY:** Error rate <1% under simulated normal load conditions
- [ ] **VERIFY:** Inference profiling captures comprehensive model metrics
- [ ] **FAIL-SAFE:** If performance targets not met, identify and resolve critical bottlenecks

#### Task 7.4: Documentation and Developer Experience
**Implementation Steps:**
1. Create comprehensive API documentation with examples
2. Add inline code documentation explaining architectural decisions
3. Create developer onboarding guide for Phase 2 infrastructure

**🔒 VERIFICATION GATE 7.4:**
- [ ] **VERIFY:** New developer can set up environment in <30 minutes
- [ ] **VERIFY:** API documentation covers all endpoints with working examples
- [ ] **VERIFY:** Code documentation explains complex infrastructure patterns
- [ ] **VERIFY:** All configuration options and toggles are documented
- [ ] **FAIL-SAFE:** If onboarding takes >1 hour, simplify setup automation

#### Task 7.5: End-to-End Infrastructure Integration Testing
**Implementation Steps:**
1. Create comprehensive integration test suite for all systems
2. Test all infrastructure interactions under simulated load
3. Validate data consistency across all components with mock workflows
4. Perform context window stress tests (CCE at 32K/128K tokens)

**🔒 VERIFICATION GATE 7.5:**
- [ ] **VERIFY:** Full infrastructure integration test passes consistently
- [ ] **VERIFY:** Data integrity maintained under concurrent mock operations
- [ ] **VERIFY:** All user workflows complete successfully with mock components
- [ ] **VERIFY:** System recovers gracefully from simulated component failures
- [ ] **VERIFY:** CCE handles large context windows without degradation
- [ ] **FAIL-SAFE:** If integration tests fail, isolate and resolve component interactions

**🚨 FINAL PHASE 2 GATE:**
- [ ] **COMPREHENSIVE VERIFY:** All verification gates throughout Phase 2 passed
- [ ] **INFRASTRUCTURE READINESS:** All systems ready for Phase 3 cognitive activation
- [ ] **MOCK VALIDATION:** All mock components produce predictable, testable results with stochastic error injection
- [ ] **DOCUMENTATION COMPLETE:** All infrastructure and interfaces documented
- [ ] **SECURITY VALIDATION:** Comprehensive security audit passes with Safety Mode enabled
- [ ] **SECURITY CONTROLS:** All privilege escalation paths require explicit user approval
- [ ] **AUDIT COMPLETENESS:** All system operations captured with appropriate retention policies
- [ ] **FAIL-SAFE:** If any security gate fails, disable affected features and document risks

---

## Phase 2 Boundary: Preparation for Autonomy

### What Has Been Deliberately Left Unintegrated

**Cognitive Decision-Making Systems:**
- Real-time LLM orchestration and dynamic model selection
- AI-driven pipeline generation and self-modification
- Autonomous debugging and code generation capabilities
- Intelligent content analysis and contradiction detection
- LLM function-calling with automatic tool selection

**External Service Integration:**
- Cloud LLM API integration for production cognitive features
- Multi-user collaboration and real-time synchronization
- External vector database connections and scaling infrastructure
- Production deployment automation and monitoring
- Cloud fallback and multi-GPU sharding for local models

**Agent-Level Behaviors:**
- Self-improving algorithms and adaptive learning systems
- Cross-context synthesis and narrative coherence analysis
- Autonomous relationship discovery and graph restructuring
- Predictive user assistance and intent interpretation
- Agent-driven cluster reviews and auto-tagging
- Real-time permission elevation and privilege management

**All external wiring (cloud LLMs, autonomous agents, real tool calls) is explicitly deferred to Phase 3.**

### Phase 2 Success Criteria

**Robustness & Predictability:**
- Zero compilation errors and 90%+ test coverage across all infrastructure
- Deterministic behavior for all mock components and simulated workflows
- Comprehensive error handling and graceful degradation under all test scenarios
- Complete audit trail for every system interaction with queryable metadata

**Local-First Operations:**
- All core functionality works without external dependencies
- Mock implementations provide realistic simulation of cognitive features
- Configuration toggles allow testing of all operational modes
- Performance benchmarks met for all infrastructure components under load

**Interface Readiness:**
- Clean abstractions for all major systems ready for Phase 3 activation
- Plugin interfaces support dynamic loading and secure execution
- API endpoints handle all required operations with proper error responses
- Database schema supports both current mock data and future cognitive metadata

### Minimum Quality Bar for Phase 3 Ignition

**Technical Prerequisites:**
- Zero audit gaps: Every system operation must be traceable and debuggable
- Pipeline determinism: All task execution must be predictable and reproducible
- Executor availability: All mock executors must demonstrate interface compliance
- Security validation: All privileged operations must pass security audit

**Architectural Prerequisites:**
- Interface stability: All contracts between systems must be finalized and tested
- Performance baselines: All components must meet or exceed performance targets
- Error handling completeness: All failure modes must have tested recovery procedures
- Documentation currency: All infrastructure must have complete, accurate documentation

**Operational Prerequisites:**
- Environment stability: Development and testing environments must be reproducible
- Data integrity assurance: All database operations must maintain referential integrity
- Configuration management: All system toggles and settings must be validated
- Deployment readiness: All components must be prepared for production activation

---

## System-to-Phase 3 Activation Mapping

| System Component | Phase 2 Foundation | Phase 3 Activation Goal |
|------------------|-------------------|------------------------|
| **Vector Translation Core** | Mock embedding pipeline with audit + drift detection | Real-time multi-model orchestration with quality optimization |
| **MeshGraphEngine** | Deterministic traversal algorithms + CCE scaffold | AI-driven semantic analysis and autonomous restructuring |
| **TaskEngine** | Mock executor framework with logging + FakeAgentRunner | Real-time LLM orchestration with self-optimization |
| **Audit Trail System** | Comprehensive logging infrastructure + self-critique | AI-driven pattern recognition and predictive analysis |
| **DevShell** | Sandboxed development environment + tool execution | Autonomous code generation and intelligent debugging |
| **Input Templates** | Dynamic form system with validation | AI-generated templates with natural language conversion |
| **TTS Plugin** | Cross-platform voice infrastructure + agent HUD | AI-driven voice selection with emotional context awareness |
| **LLM Infrastructure** | Local model testing + mock executors | Cloud orchestration with dynamic load balancing |
| **Tool Framework** | JSON-based tool execution with mock responses | Real-time function calling with automatic tool selection |

## Success Metrics

### Technical Infrastructure Metrics
- Zero TypeScript compilation errors across entire codebase
- Sub-200ms response times for all graph operations with mock data
- Sub-500ms mock semantic search results with deterministic scoring
- 90%+ uptime for pipeline execution with mock components
- Complete audit trail for all system operations with zero gaps

### Functional Infrastructure Metrics
- Successful mock VTC translation between test model pairs
- Graph traversal supporting 10+ relationship hops with consistent results
- Pipeline execution with 5+ chained mock tasks completing reliably
- Template-to-mock-pipeline conversion with <2s latency
- DevShell can analyze and propose mock code improvements safely

### User Experience Infrastructure Metrics
- Graph visualization supports 100+ nodes smoothly with mock data
- Mock search returns predictable results within 500ms consistently
- Voice output activates within 1s of selection on all platforms
- Error rate below 1% for all critical infrastructure flows
- Mock self-debugging resolves 80% of simulated common issues

### Performance & Compute Metrics
- Inference profiling captures tokens/sec, VRAM, latency for all model types
- CCE handles 32K+ token contexts without performance degradation
- Memory snapshots create and restore within 5s for typical datasets
- Plugin crash containment prevents system-wide failures
- Agent status updates display in real-time without lag

## Risk Mitigation

### High-Risk Infrastructure Items
1. **Mock Component Fidelity**: Ensure mocks accurately simulate real behavior patterns
2. **Performance at Scale**: Implement caching and optimization for infrastructure load
3. **Interface Stability**: Lock down contracts between systems before Phase 3
4. **Security Validation**: Comprehensive testing of all privileged operations
5. **Cross-cutting Integration**: Ensure audit trail captures all system interactions

### Contingency Plans
1. **Mock Fallback Strategy**: Full offline mode if any component integration fails
2. **Performance Degradation**: Simplified operation modes for resource constraints
3. **Interface Evolution**: Versioned contracts with backward compatibility
4. **Security Breach Response**: Immediate privilege revocation and system isolation
5. **Database Consistency**: Automated rollback procedures for failed migrations

## Conclusion

Phase 2 establishes LogoMesh as a robust, testable infrastructure platform ready for cognitive activation. By focusing on deterministic foundations, comprehensive audit capabilities, and mock-enabled testing, this phase creates the architectural discipline necessary for Phase 3's autonomous cognitive features.

The emphasis on local-first operations, security sandboxing, and complete auditability ensures that when cognitive systems are activated in Phase 3, they operate within a trustworthy, debuggable, and controllable environment.

This phase transforms LogoMesh from a functional tool into a platform capable of supporting sophisticated AI-driven cognitive assistance while maintaining transparency, security, and user control over all system operations. All contracts, stubs, and local-test scaffolding are prepared for Phase 3's real LLM wiring, external agents, and cloud fallback systems.
