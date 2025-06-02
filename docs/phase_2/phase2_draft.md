
# LogoMesh Phase 2 Development Plan - Unified Draft

**Version:** 2.0  
**Date:** June 2, 2025  
**Prerequisites:** Phase 1 complete with functional LM-Core, SQLite persistence, backend API, and basic AI integration stubs

## Executive Summary

Phase 2 transforms LogoMesh from a functional framework into an intelligent, self-aware cognitive system. This phase introduces the Vector Translation Core (VTC), activates the MeshGraphEngine for semantic operations, implements comprehensive audit trails, and establishes the foundation for cognitive autonomy through TaskEngine and DevShell integration.

## Core Architectural Themes

### Theme 1: Foundation Stabilization & TypeScript Migration
*Addressing technical debt and compilation issues*

**Priority: Critical**
- Complete TypeScript migration for all frontend components
- Fix remaining Express route handler type signatures  
- Implement comprehensive type checking pipeline
- Stabilize build process and eliminate compilation errors

### Theme 2: Vector Translation Core (VTC) & Semantic Intelligence
*Enabling cross-model semantic operations and transparent AI pipelines*

**Priority: High**

#### VTC Foundation Implementation
- **EmbeddingService Enhancement**: Complete implementation using local models (bge-small, e5-small)
- **UniversalLatentSpaceManager**: Implement with PoC translator for one model pair
- **Transparent Embedding Pipeline**: All segments get embeddings with full audit trail
- **Self-Sovereign Latent Store**: Optional content storage with embedding-first approach

#### User Toggles & Configuration
- `[TOGGLE_STORE_RAW_FOR_EMBEDDING]`: Control raw text retention
- `[TOGGLE_VTC_TRANSPARENCY_LOGGING]`: Enable vector translation audit logs  
- `[TOGGLE_LINK_EMBEDDINGS_TO_METADATA]`: Explicit embedding-metadata linkage
- `[TOGGLE_SEGMENT_TRANSPARENT_MODE]`: Vector-first vs. text-first storage

#### Database Schema Extensions
```sql
-- Add to segments table
ALTER TABLE segments ADD COLUMN embedding_vector TEXT;
ALTER TABLE segments ADD COLUMN embedding_model_id TEXT;
ALTER TABLE segments MODIFY COLUMN content TEXT NULL;

-- New audit table
CREATE TABLE vector_translation_audit_log (
  translation_id TEXT PRIMARY KEY,
  segment_id TEXT,
  source_model_id TEXT,
  target_model_id TEXT,
  source_vector_preview TEXT,
  target_vector_preview TEXT,
  timestamp DATETIME,
  FOREIGN KEY (segment_id) REFERENCES segments(id)
);
```

### Theme 3: MeshGraphEngine - Semantic Traversal & Clustering
*Activating the cognitive nervous system*

**Priority: High**

#### Core Graph Operations
- **Relationship Traversal**: `getRelatedThoughts()`, `getPathBetween()`
- **Semantic Clustering**: Tag-based and embedding-similarity clustering
- **Context Scoring**: Relevance scoring with embedding similarity, link density, recency
- **Summary Generation**: Auto-generated summary nodes with top-N relationships

#### Backend Integration
- Inject `IdeaManager` and `EmbeddingService` dependencies
- Cache results in SQLite or memory for performance
- Debug logging with `[TOGGLE_GRAPH_DEBUG]` configuration

#### Frontend Visualization (Cytoscape.js Migration)
- Score-based node sizing and cluster coloring
- Interactive summary mode showing central node + neighbors
- Visual path highlighting and relationship indicators
- Progressive disclosure for complex graphs

### Theme 4: TaskEngine & Cognitive Execution Core
*Enabling structured pipeline execution and AI orchestration*

**Priority: High**

#### Task & Pipeline Schema
```typescript
interface Task {
  taskId: string;
  executorId: string;
  input: any;
  config?: TaskExecutionConfig;
}

interface Pipeline {
  pipelineId: string;
  tasks: Task[];
  meta?: PipelineMeta;
}
```

#### Execution Infrastructure
- **ExecutorRegistry**: Dynamic registration of LLM, TTS, and plugin executors
- **TaskEngine**: Core execution loop with state management and retry logic
- **MetaExecutor**: Cognitive load-aware routing (local vs. cloud decisions)
- **Event System**: `taskStarted`, `taskCompleted`, `pipelineCompleted` events

#### UI & API Integration
- Pipeline submission form with drag-drop task builder
- Real-time execution status display
- Pipeline history and per-task logging
- API route: `POST /api/pipeline/submit`

### Theme 5: Self-Awareness & Audit Trail Framework
*Building transparent, queryable self-audit infrastructure*

**Priority: Medium-High**

#### Unified Audit Schema
```sql
CREATE TABLE llm_execution_log (
  id TEXT PRIMARY KEY,
  task_id TEXT,
  executor_id TEXT,
  input_prompt TEXT,
  model_used TEXT,
  output_text TEXT,
  timestamp DATETIME,
  linked_segment_id TEXT
);

CREATE TABLE pipeline_execution_log (
  id TEXT PRIMARY KEY,
  pipeline_id TEXT,
  task_id TEXT,
  executor_id TEXT,
  input TEXT,
  output TEXT,
  error TEXT,
  timestamp DATETIME
);
```

#### Self-Inspection APIs
- `GET /api/audit/llm/recent?count=20`
- `GET /api/audit/pipeline/:id`
- `GET /api/audit/segment/:id` (trace back to source actions)
- `GET /api/audit/errors`

#### Debug UI & Timeline
- Chronological event playback with filtering
- Full prompt/output inspection views
- Traceability from any Thought/Segment to source chain
- Optional self-critique mode for LLM responses

### Theme 6: DevShell & Cognitive Development Mode
*Enabling self-directed expansion and intelligent debugging*

**Priority: Medium**

#### DevShell Plugin Foundation
- Privileged plugin with developer-only access
- `CloudDevLLMExecutor` for high-context external model integration
- `CodeAnalysisLLMExecutor` for plugin manifest and code analysis
- Natural language pipeline builder with JSON output

#### Filesystem Access & Controlled Mutation
- Plugin-safe read/write with review mechanism
- `PluginAPI.readFile()` and `PluginAPI.proposeFileChange()`
- UI confirmation for all proposed changes
- Full audit trail of all file operations

#### Developer Interface
- Embedded terminal UI (`DevShellTerminal.tsx`)
- Self-debugging agent mode for pipeline failure analysis
- Integration with error logging for root cause analysis

### Theme 7: Input Templates & ThoughtNode Fabricator
*Structured input transformation system*

**Priority: Medium**

#### Template System
```typescript
interface InputTemplate {
  templateId: string;
  name: string;
  description?: string;
  fields: TemplateField[];
  tags?: string[];
  onSubmitPipelineId?: string;
}
```

#### Form Infrastructure
- Dynamic form rendering from templates (`TemplateFormRenderer.tsx`)
- Template discovery with tag-based filtering
- Save-and-reuse for submitted values
- Auto-pipeline triggers on template submission

#### LLM Integration
- Prompt-to-template conversion via DevShell
- Example: "Make me a template for logging weird dreams" → structured template
- Template validation and preview before saving

### Theme 8: Text-to-Speech (TTS) Plugin Integration
*Voice output as extensible plugin system*

**Priority: Low-Medium**

#### TTS Plugin Interface
```typescript
interface TTSSpeaker {
  speakText(text: string, voiceId?: string): Promise<void>;
  getAvailableVoices(): Promise<string[]>;
}
```

#### Event-Driven Voice Triggers
- Listen for `thoughtFocused` and `segmentSelected` events
- `[TOGGLE_TTS_ON_FOCUS]` configuration
- Cross-platform support (Windows SAPI, macOS say, Linux espeak)

#### Neural TTS Preparation
- Stub plugin for future GPU/local model TTS
- API endpoint: `POST /api/tts/test` for voice testing
- Plugin selection during installation

## Implementation Roadmap

### Weeks 1-2: Foundation & VTC
1. Complete TypeScript migration and fix all compilation errors
2. Implement EmbeddingService with local model integration
3. Create UniversalLatentSpaceManager with PoC translator
4. Update database schema for embeddings and audit logs
5. Implement transparency toggles and logging

### Weeks 3-4: Graph Intelligence & TaskEngine
1. Activate MeshGraphEngine with core traversal functions
2. Implement TaskEngine with ExecutorRegistry
3. Create Pipeline schema and execution system
4. Begin Cytoscape.js migration for graph visualization
5. Add semantic clustering and scoring algorithms

### Weeks 5-6: Audit Trail & DevShell
1. Implement unified audit trail system
2. Create self-inspection APIs and debug UI
3. Build DevShell plugin with CloudDevLLMExecutor
4. Add filesystem access with controlled mutation
5. Implement natural language pipeline builder

### Weeks 7-8: Templates & Polish
1. Create Input Template system with form rendering
2. Add TTS plugin foundation with basic voice output
3. Comprehensive testing and performance optimization
4. Documentation and developer experience improvements
5. Integration testing across all new systems

## Success Metrics

### Technical Metrics
- Zero TypeScript compilation errors
- Sub-200ms response times for graph operations
- Sub-500ms semantic search results
- 90%+ uptime for pipeline execution
- Complete audit trail for all AI operations

### Functional Metrics
- Successful VTC translation between model pairs
- Graph traversal supporting 10+ relationship hops
- Pipeline execution with 5+ chained tasks
- Template-to-Thought conversion with <2s latency
- DevShell can analyze and propose code improvements

### User Experience Metrics
- Graph visualization supports 100+ nodes smoothly
- Search returns relevant results within 500ms
- Voice output activates within 1s of selection
- Error rate below 1% for critical user flows
- Self-debugging resolves 80% of common issues automatically

## Architectural Decisions

### 1. LLM Strategy
- **Decision**: Local-first with cloud fallback via MetaExecutor
- **Rationale**: Privacy, cost control, but flexibility for high-context tasks

### 2. Embedding Storage
- **Decision**: SQLite with JSON vectors, future migration path to vector DB
- **Rationale**: Simplicity for MVP, clear upgrade path for scale

### 3. Plugin Security
- **Decision**: Capability-based permissions with explicit user consent
- **Rationale**: Balance between functionality and security

### 4. Graph Performance
- **Decision**: Cytoscape.js with SQLite backend, memory caching
- **Rationale**: Better performance than React Flow, proven scalability

### 5. Audit Transparency
- **Decision**: Comprehensive logging with user-controlled retention
- **Rationale**: Essential for debugging, trust, and self-improvement

## Risk Mitigation

### High-Risk Items
1. **VTC Translation Quality**: Start with simple linear projection, iterate
2. **Performance at Scale**: Implement caching early, plan for optimization
3. **LLM Costs**: Strict local-first policy with usage monitoring
4. **Complexity Management**: Phased rollout with feature flags

### Contingency Plans
1. **VTC Fallback**: Return original vectors if translation fails
2. **Graph Performance**: Implement lazy loading and result pagination
3. **LLM Failures**: Graceful degradation to non-AI functionality
4. **Data Corruption**: Comprehensive backup and recovery procedures

## Conclusion

Phase 2 represents a significant evolution from a basic thought management tool to an intelligent, self-aware cognitive system. The integration of VTC, MeshGraphEngine, TaskEngine, and comprehensive audit trails creates a foundation for truly autonomous cognitive assistance.

The modular design ensures that individual components can be developed and tested independently, while the comprehensive audit system provides the transparency needed for debugging and continuous improvement.

This phase establishes LogoMesh as not just a tool that helps users think, but as a system that can understand, explain, and improve its own cognitive processes.
