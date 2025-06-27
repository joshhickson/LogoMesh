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

## Week 1: Foundation Reality Check (Critical Path Only)

### Task 1: TypeScript Migration + CI Lock (Days 1-4)
**FOCUS**: 100% TypeScript with strict mode - nothing else matters if the codebase is brittle

**Core Goals (Essential Only):**
- Convert all remaining JS files to TS (focus on critical paths first)
- Enable TypeScript strict mode with CI gate that **fails on any `any`**
- Fix compilation errors systematically
- **CI LOCK**: Build fails if any JS files remain or strict mode violations exist

**Verification Gates:**
- ✅ `npx tsc --noEmit` passes with 0 errors
- ✅ CI fails immediately on any `any` type or JS file
- ✅ All imports resolve correctly

### Task 2: JWT + Rate Limit (Days 5-7)
**FOCUS**: Basic security spine - minimum viable auth

**Core Goals (Essential Only):**
- Implement JWT session handling in AuthService
- Add rate limiting middleware to API routes
- Basic request validation on critical endpoints
- **NO FANCY UI** - just working backend security

**Verification Gates:**
- ✅ JWT tokens work for session management
- ✅ Rate limiting prevents API abuse (basic 100req/min limit)
- ✅ Invalid requests get rejected properly

## Week 2: LLM Spine + Plugin Foundation

### Task 3: Slice LLM Monolith (Days 1-4)
**FOCUS**: Break LLMOrchestrator death grip - no fancy audit UI yet

**Core Goals (Essential Only):**
- Create `LLMGateway` (rate limit, basic auth)
- Split `ConversationOrchestrator` (state machine only)
- Create `RunnerPool` (per-model execution)
- **KEEP** existing audit logging - don't rebuild it

**Verification Gates:**
- ✅ Single prompt cannot block all model traffic
- ✅ LLM components can be tested independently
- ✅ Existing functionality preserved

### Task 4: Basic Plugin Sandbox (Days 5-7)
**FOCUS**: Node.js plugins only - secure the foundation

**Core Goals (Essential Only):**
- Implement secure plugin runtime with `vm2`
- Basic filesystem restrictions (read-only by default)
- Plugin permission manifest validation
- **Node.js ONLY** - no multi-language fantasies yet

**Verification Gates:**
- ✅ "Hello world" plugin executes safely
- ✅ Plugin crashes don't affect system
- ✅ Filesystem access properly restricted

## Week 3: EventBus Reliability + Storage Boundary

### Task 5: EventBus Back-pressure (Days 1-3)
**FOCUS**: Make EventBus production-ready

**Core Goals (Essential Only):**
- Implement back-pressure handling for message queues
- Add at-least-once delivery for critical workflows
- Basic message persistence for reliability
- **NO COMPLEX UI** - just working coordination

**Verification Gates:**
- ✅ EventBus handles message floods gracefully
- ✅ Critical messages don't get lost
- ✅ System stays responsive under load

### Task 6: Storage Service Boundary (Days 4-7)
**FOCUS**: Abstract storage coupling - no vector search yet

**Core Goals (Essential Only):**
- Create thin `DataAccessService` between IdeaManager ↔ StorageAdapter
- Remove direct StorageAdapter coupling from business logic
- **DEFER** vector operations to Phase 2b
- Keep existing SQLite functionality

**Verification Gates:**
- ✅ Business logic doesn't import StorageAdapter directly
- ✅ Existing functionality preserved
- ✅ Ready for future vector DB without business logic changes

## Week 4: Minimal TaskEngine + Load Testing

### Task 7: Basic TaskEngine (Days 1-4)
**FOCUS**: Prove LLM → Plugin chains work

**Core Goals (Essential Only):**
- Extend existing LLMTaskRunner for multi-executor support
- Build simple ExecutorRegistry (LLM + Plugin only)
- Create basic pipeline schema (JSON workflows)
- **3-step max**: LLM → Plugin → System response

**Verification Gates:**
- ✅ TaskEngine executes LLM → Plugin → System chain
- ✅ Uses existing LLMTaskRunner retry logic
- ✅ Basic pipeline JSON validation works

### Task 8: Load Test & Stabilize (Days 5-7)
**FOCUS**: Make it production-ready

**Core Goals (Essential Only):**
- Stress test EventBus + LLM under 1k req/min load
- Fix critical performance bottlenecks
- Basic observability with pino logging
- Write setup doc for new contributors

**Verification Gates:**
- ✅ System handles sustained load without crashing
- ✅ New developer can set up environment in <45 minutes
- ✅ All Week 1-3 functionality still works under load

## 🚫 Explicitly Deferred to Phase 2b (Week 5-8)

**Cut Without Mercy:**
- DevShell UI and natural language interface
- Multi-language plugin runtime (Python, Go, Rust)
- Vector similarity search and embeddings
- Node-RED decision (keep status quo)
- Advanced plugin marketplace features
- Semantic clustering and VTC implementation
- WebSocket real-time UIs
- Advanced security hardening
- Comprehensive audit dashboard
- Plugin hot-reload and development toolkit

## Success Criteria (Realistic)

**Week 1 Foundation:**
- [ ] 100% TypeScript with strict mode enforced by CI
- [ ] Basic JWT authentication working
- [ ] Rate limiting preventing abuse

**Week 2 Core Systems:**
- [ ] LLM components can be independently scaled
- [ ] Basic plugin sandbox executes Node.js safely
- [ ] Plugin crashes contained

**Week 3 Coordination:**
- [ ] EventBus handles back-pressure gracefully
- [ ] Storage layer abstracted behind service boundary
- [ ] System remains responsive under message load

**Week 4 Integration:**
- [ ] TaskEngine executes LLM → Plugin workflows
- [ ] Load test passes at 1k req/min sustained
- [ ] **70% test coverage on critical paths** (not 90%)
- [ ] New developer setup in <45 minutes

## Tactical Implementation Notes

1. **Lock CI immediately**: Fail on any `any` types or JS files
2. **Write throwaway PoC plugin first**: Get sandbox right before complexity
3. **Convert storage coupling after TypeScript**: Static types expose hidden leaks
4. **Ollama integration**: Stub → audit trail → only then enhance
5. **Observability**: Ship traces to local Jaeger, ugly dashboards are fine

## Reality Check Gates

- [ ] No mixed TS/JS compilation errors
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