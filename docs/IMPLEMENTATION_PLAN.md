
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

## Week 1: Foundation Reality Check (4 working days, slip allowed to Day 5 ONLY if TS strict breaks >20% tests)

### Task 1: TypeScript Migration (Days 1-2)
**FOCUS**: Convert only `core/` and `server/` to TS strict - leave `src/` JS until Week 2 stretch

**Core Goals:**
- Convert `core/` and `server/` directories to TypeScript strict mode
- Enable TypeScript strict mode with CI gate that **fails on any `any`**
- Fix compilation errors systematically
- Integrate `eslint-plugin-import` + `@typescript-eslint/recommended` rules; CI fails on lint
- **CI LOCK**: Build fails if any JS files remain in core/server or strict mode violations exist

**Verification Gates:**
- ✅ `npx tsc --noEmit` passes with 0 errors for core/ and server/
- ✅ CI fails immediately on any `any` type or JS file in core/server
- ✅ All imports resolve correctly

### Task 2: Secrets Management Stub (Day 3)
**FOCUS**: Basic security spine - prevent credential leaks

**Core Goals:**
- Create `.env.example` + `config.ts` wrapper
- CI fails if repo contains literal "sk-", "jwtSecret=changeme", "OPENAI_API_KEY=", or `AWS_(ACCESS|SECRET)_KEY=`
- Basic JWT session handling in AuthService
- **NO FANCY UI** - just working backend security

**Verification Gates:**
- ✅ CI blocks any hardcoded secrets
- ✅ JWT tokens work for session management
- ✅ `.env.example` template exists

### Task 3: Rate Limit + Health Check (Day 4)
**FOCUS**: Basic monitoring and protection

**Core Goals:**
- Add rate limiting middleware (100 req/min per IP, whitelist `/status`)
- `GET /status` returns `{queueLag, dbConn, pluginSandboxAlive, heapUsedMB}`
- Basic request validation on critical endpoints

**Verification Gates:**
- ✅ Rate limiting blocks abuse at 100rpm/IP
- ✅ `/status` endpoint returns 200 with metrics
- ✅ Invalid requests get rejected properly

## Week 2: LLM Spine + Plugin Foundation (includes half-day "bug pit" buffer)

Half-day bug-pit = Week 2 Day 6 AM, no feature work.

### Task 4: Slice LLM Monolith (Days 1-3)
**FOCUS**: Break LLMOrchestrator death grip - no fancy audit UI yet

**Core Goals:**
- Create `LLMGateway` (rate limit, basic auth)
- Split `ConversationOrchestrator` (state machine only)
- Create `RunnerPool` (per-model execution)
- **KEEP** existing audit logging - don't rebuild it

**Verification Gates:**
- ✅ `/api/thoughts` smoke test passes
- ✅ `/api/plugins/list` smoke test passes  
- ✅ `/api/auth/login` smoke test passes
- ✅ Single prompt starvation test proves RunnerPool isolation
- ✅ Queue wait >5s **with 1 busy runner** fails gate
- ✅ LLM components can be tested independently

### Task 5: Basic Plugin Sandbox (Days 4-5)
**FOCUS**: Node.js plugins only - secure the foundation

**Core Goals:**
- Implement secure plugin runtime with `vm2`
- Basic filesystem restrictions (read-only by default)
- Plugin permission manifest validation
- **Node.js ONLY** - no multi-language fantasies yet

**Verification Gates:**
- ✅ "Hello world" plugin executes safely
- ✅ Hello-world plugin cannot read '/etc/passwd'
- ✅ Plugin crashes don't affect system

## Week 3: EventBus Reliability + Storage Boundary

### Task 6: EventBus Back-pressure (Days 1-3)
**FOCUS**: Make EventBus production-ready

**Core Goals:**
- Use in-memory queue + exponential backoff
- Add at-least-once delivery for critical workflows
- Implement message `deliveryId` + dedupe table in memory
- **SCOPE CUT**: Persistence deferred to Phase 2b
- **NO COMPLEX UI** - just working coordination

**Verification Gates:**
- ✅ EventBus drains 5k messages batch-test (offline), ≤2× RTT baseline
- ✅ Critical messages don't get lost
- ✅ System stays responsive under load

### Task 7: Storage Service Boundary (Days 4-5)
**FOCUS**: Abstract storage coupling - no vector search yet

**Core Goals:**
- Create thin `DataAccessService` between IdeaManager ↔ StorageAdapter
- Remove direct StorageAdapter coupling from business logic
- **DEFER** vector operations to Phase 2b
- Prep sed script to update IdeaManager test imports

**Verification Gates:**
- ✅ Business logic doesn't import StorageAdapter directly
- ✅ Existing functionality preserved
- ✅ Ready for future vector DB without business logic changes

## Week 4: Minimal TaskEngine + Load Testing (Day 7 = scope cut or lock branch, no new code after noon)

### Task 8: Basic TaskEngine (Days 1-4)
**FOCUS**: Prove LLM → Plugin chains work

**Core Goals:**
- Extend existing LLMTaskRunner for multi-executor support
- Build simple ExecutorRegistry (LLM + Plugin only)
- Create basic pipeline schema (JSON workflows)
- Include `schemaVersion` field; reject unknown versions
- **3-step max**: LLM → Plugin → System response

**Verification Gates:**
- ✅ TaskEngine executes LLM→Plugin workflow in <5s median
- ✅ Uses existing LLMTaskRunner retry logic
- ✅ Basic pipeline JSON validation works

### Task 9: Load Test & Stabilize (Days 5-6)
**FOCUS**: Make it production-ready

**Core Goals:**
- Stress test EventBus + LLM under 250 req/min sustained, spike 500
- Fix critical performance bottlenecks
- Basic observability with pino logging
- Profile heap with `clinic flame` during load; leak <5 MB/min
- **Note**: Run on local Docker or paid VM for realistic load testing

**Verification Gates:**
- ✅ Artillery 250rpm 5-min run: no 5xx, ≤2% 429
- ✅ p50 API latency ≤250ms, p95 ≤600ms under 250rpm run
- ✅ System handles sustained load without crashing
- ✅ All Week 1-3 functionality still works under load

## 🚫 Explicitly Deferred to Phase 2b (Week 5-8)

**Cut Without Mercy:**
- DevShell UI and natural language interface
- Multi-language plugin runtime (Python, Go, Rust)
- Vector similarity search and embeddings
- Advanced plugin marketplace features
- Semantic clustering and VTC implementation
- WebSocket real-time UIs
- Advanced security hardening
- Comprehensive audit dashboard
- Plugin hot-reload and development toolkit

## Success Criteria (Binary Pass/Fail)

**Essential Gates:**
- ✅ TS strict passes (core, server)
- ✅ ESLint passes with zero warnings in core/server
- ✅ /api/auth login w/ JWT round-trip
- ✅ Rate-limit 100rpm per-IP tested via artillery
- ✅ /status returns 200 with sane metrics
- ✅ Single prompt starvation test proves RunnerPool isolation (fail if >5s queue wait with 1 busy runner)
- ✅ Hello-world plugin cannot read '/etc/passwd'
- ✅ EventBus drains 5k messages batch-test (offline), ≤2× RTT baseline
- ✅ TaskEngine executes LLM→Plugin workflow in <5s median
- ✅ Artillery 250rpm 5-min run: no 5xx, ≤2% 429
- ✅ No `any` types introduced in `src/` stretch migration PRs

## Tactical Implementation Notes

1. **Lock CI immediately**: Fail on any `any` types or JS files in core/server
2. **Write throwaway PoC plugin first**: Get sandbox right before complexity
3. **Convert storage coupling after TypeScript**: Static types expose hidden leaks
4. **Ollama integration**: Stub → audit trail → only then enhance
5. **Storage sed script**: commit separately, easy revert

## Reality Check Gates

- [ ] No mixed TS/JS in core/server; src/ JS tolerated until 2b
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

For a glimpse into the long-term vision beyond Phase 2, see the [Future Vision](future-vision.md) document.
