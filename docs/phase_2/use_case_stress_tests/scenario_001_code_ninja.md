
# Scenario 001: "The Over-Eager Code Ninja"

**Date:** 2025-01-27  
**Complexity:** High  
**Focus Areas:** Plugin isolation, race conditions, graceful degradation

## Scenario Description

Maya, a CodeNinjas student, runs LogoMesh on a Windows laptop with:
- Stock SQL persistence plugin
- Qwen-based local LLM through VTC
- Jules' React-UI helper plugin (fresh TypeScript build)

### Critical Event Timeline
- **09:03**: Bulk import 500 JSON notes → VTC starts embedding generation + UI plugin pre-renders edges
- **09:04**: UI plugin requests vector data before SQL write commits (RACE CONDITION)
- **09:04:05**: Core detects dangling promise, issues crash flag for UI plugin only, returns 409
- **09:04:10**: Scheduler queues UI plugin restart only, keeps SQL+VTC alive
- **09:04:22**: UI plugin re-hydrates from audit log, finds completed vectors, redraws
- **09:05**: Maya sees brief "UI recovering" toast, no data loss

## Technical Requirements

### Plugin Isolation Architecture
- **Per-plugin crash detection hooks**
- **Selective plugin restart without core system disruption**
- **Plugin state recovery from audit trails**

### Data Flow Requirements
- **Input:** 500 JSON notes via bulk import
- **Processing:** Concurrent SQL writes + VTC embedding generation + UI pre-rendering
- **Output:** Rendered graph with embedded vectors
- **Storage:** Atomic SQL→VectorStore pipeline, audit log for recovery

## Gap Analysis

### Discovered Gaps

**GAP-ARCH-001: Plugin Isolation Framework Missing**
- Current PluginHost ([PluginHost.ts](rag://rag_source_0)) lacks crash detection hooks
- No selective restart capability - failure affects entire system
- Missing plugin sandbox/boundary enforcement

**GAP-ARCH-002: Race Condition Prevention**
- No coordination between SQL writes and VTC embedding generation
- UI plugins can request incomplete data without proper "Resource Not Ready" responses
- Missing atomic transaction visibility across plugin boundaries

**GAP-ARCH-003: Recovery Orchestration System**
- No audit log recovery mechanism for plugin state
- Missing "smart crash flag" system for partial failures
- No scheduler for fine-grained restart operations

**GAP-PERF-001: Bulk Import Pipeline**
- Current PortabilityService doesn't handle VTC integration during import
- No progress tracking or resource throttling for large datasets
- Missing coordination between storage and embedding generation

**GAP-UI-001: Graceful Degradation UX**
- No "UI recovering" toast or degraded state indicators
- Missing progress feedback during bulk operations
- No user communication during plugin recovery

### Missing Capabilities
- Plugin process isolation and monitoring
- Atomic multi-system transaction coordination
- State recovery from audit trails
- Resource readiness signaling between systems
- Partial system restart orchestration

### Integration Issues
- PluginHost doesn't communicate with VTC about embedding status
- No coordination mechanism between SQLiteAdapter and embedding generation
- EventBus lacks priority/dependency-aware message routing
- Missing "system readiness" state management

## Phase 2 vs Reality Check

### What Works in Phase 2
- Basic PluginHost interface ([PluginHost.ts](rag://rag_source_0))
- EventBus for plugin communication ([EventBus.ts](rag://rag_source_3))
- SQLiteAdapter for persistence ([SQLiteAdapter.ts](rag://rag_source_4))
- Foundation contracts for VTC integration

### What's Missing/Mocked
- Plugin crash detection and isolation (would need Phase 3 activation)
- VTC embedding coordination (currently just interface stubs)
- Audit trail recovery system (Phase 3 feature)
- Smart restart orchestration (requires full plugin management)

### Recommended Phase 2 Enhancements

**Priority 1: Plugin Boundary Safety**
- Add plugin health monitoring to PluginHost
- Implement basic crash detection hooks
- Create plugin status tracking system

**Priority 2: Transaction Coordination**
- Add "resource readiness" signaling to PluginAPI
- Implement coordination between SQL and VTC operations
- Create atomic operation visibility for plugins

**Priority 3: Recovery Infrastructure**
- Design audit log format for plugin state recovery
- Add basic restart capability to PluginHost
- Implement degraded operation modes

## Validation Plan

### Test Scenarios
- [ ] Bulk import 100+ items with concurrent plugin access
- [ ] Simulate plugin crash during vector generation
- [ ] Test UI plugin restart without losing SQL/VTC state
- [ ] Verify 409 "Resource Not Ready" responses

### Success Criteria
- [ ] Plugin failures don't crash entire system
- [ ] UI recovery completes within 30 seconds
- [ ] No data corruption during partial failures
- [ ] User sees informative status messages

### Failure Modes
- Complete system freeze (CRITICAL FAILURE)
- Data corruption in SQL or vector store
- Plugin restart loop/thrashing
- Silent failures without user notification

## Implementation Notes

### Jargon Translation
- "Vector Translation Core (VTC)" → contracts/embeddings/ interfaces + core/embeddings/ stubs
- "SQL persistence plugin" → SQLiteStorageAdapter with plugin interface wrapper
- "React-UI helper plugin" → Future plugin implementing PluginRuntimeInterface
- "Core's scheduler" → Enhanced PluginHost with restart orchestration
- "Audit log" → Enhanced logging system with state recovery capabilities

### Architecture Assumptions
- Plugins run in same process but with isolation boundaries
- VTC operations are asynchronous and trackable
- EventBus can handle priority and dependency routing
- PluginHost can monitor and restart individual plugins
- Audit logging captures sufficient state for recovery
