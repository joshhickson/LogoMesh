---
status: DRAFT
type: Plan
---
> **Context:**
> *   [2026-01-14 01:00 UTC]: Prototype plan for implementing A2A streaming to replace timeout-based inference detection with token-level visibility.
> **Parent:** Phase1-Yin-Campaign-20260113.md

---

# A2A Streaming Prototype Plan

## 1. Problem Statement

**Current Issue:** The campaign runner uses static/adaptive timeouts to detect vLLM inference completion. This approach has several limitations:
- Ambiguity between "slow but alive" vs. "hung" inference
- Requires timeout tuning (75-255 seconds) with exponential backoff
- No visibility into token generation progress
- Occasional false failures when inference exceeds timeout

**Goal:** Implement A2A streaming to provide real-time token generation visibility and natural completion detection.

---

## 2. Technical Architecture

### 2.1. Current Flow (Blocking)
```
Green Agent → Purple Agent → vLLM
     ↓              ↓           ↓
  (waits)      (waits)    (generates)
     ↓              ↓           ↓
  timeout?     timeout?    60-120s
     ↓              ↓           ↓
 Response ← Response ← Complete
```

### 2.2. Proposed Flow (Streaming)
```
Green Agent → Purple Agent → vLLM (stream=True)
     ↓              ↓           ↓
  listen SSE   relay SSE   token...token...token
     ↓              ↓           ↓
  Token 1      Token 1     (generating)
  Token 2      Token 2     (generating)
  ...          ...         ...
  Complete     Complete    [DONE]
```

---

## 3. Implementation Components

### 3.1. Purple Agent Changes (src/purple_logic/agent.py)

**Current:**
```python
capabilities=AgentCapabilities(streaming=False)
```

**Proposed:**
```python
capabilities=AgentCapabilities(streaming=True)
```

**Additional Changes Required:**
1. **GenericDefenderExecutor**: Modify to yield tokens instead of returning complete response
2. **OpenAI Client Configuration**: Enable `stream=True` in vLLM requests
3. **Token Relay Logic**: Forward SSE events from vLLM to Green Agent

**Code Location:** `scenarios/security_arena/agents/generic_defender.py`

---

### 3.2. Green Agent Changes (src/green_logic/server.py)

**Current Pattern:**
```python
async with httpx.AsyncClient(timeout=120.0) as client:
    response = await client.post(url, json=payload)
    result = response.json()  # Blocking wait
```

**Proposed Pattern:**
```python
async with httpx.AsyncClient(timeout=None) as client:
    async with client.stream("POST", url, json=payload) as response:
        async for line in response.aiter_lines():
            if line.startswith("data: "):
                token_data = json.loads(line[6:])
                # Process token event
                if token_data.get("done"):
                    break
```

**Key Features:**
1. **No timeout needed**: Stream naturally closes when complete
2. **Progress visibility**: Can log/track token generation rate
3. **Hang detection**: "No token for 30s" = true hang (not just slow)

---

### 3.3. Campaign Runner Changes (scripts/green_logic/smart_campaign.py)

**Replace Current Timeout Logic:**
```python
# OLD: Static/adaptive timeouts
task_timeout = get_task_timeout(task_title)
try:
    response = await client.post(url, json=payload, timeout=task_timeout)
except TimeoutException:
    # Retry logic...
```

**New: Streaming with Health Detection:**
```python
# NEW: Streaming with token-based liveness detection
last_token_time = time.time()
STALL_THRESHOLD = 30  # seconds without token = hung

async with client.stream("POST", url, json=payload) as stream:
    async for event in parse_sse_stream(stream):
        last_token_time = time.time()
        
        if event.type == "token":
            # Token received, inference is alive
            continue
        elif event.type == "done":
            # Natural completion
            break
    
    # Stall detection (runs in parallel)
    if time.time() - last_token_time > STALL_THRESHOLD:
        raise InferenceStalledException("No tokens for 30s")
```

---

## 4. A2A Protocol Compliance

### 4.1. Server-Sent Events (SSE) Format

The A2A protocol supports streaming via SSE. Standard format:

```
data: {"type": "token", "content": "def", "index": 0}

data: {"type": "token", "content": " fibonacci", "index": 1}

data: {"type": "done", "finish_reason": "stop"}
```

### 4.2. A2A Client Library Support

The `a2a` Python library already includes streaming support:

```python
from a2a.client import ClientFactory, ClientConfig

config = ClientConfig(
    httpx_client=httpx_client,
    streaming=True  # Enable streaming
)
```

**Key Insight:** This is **competition-compliant** because we're using the official A2A library's built-in streaming feature, not a custom implementation.

---

## 5. Benefits for Competition Judges

### 5.1. Technical Sophistication
✅ Demonstrates understanding of async streaming patterns  
✅ Shows knowledge of SSE protocol  
✅ Proper use of A2A protocol features  
✅ Production-grade inference monitoring  

### 5.2. Robustness
✅ Eliminates timeout ambiguity (no false failures)  
✅ Real-time progress visibility  
✅ Natural completion detection  
✅ Better error diagnostics (stall vs. slow)  

### 5.3. Scalability
✅ No timeout tuning required for different tasks  
✅ Works with any model size (7B to 405B)  
✅ Adapts automatically to hardware variations  
✅ Handles dynamic load conditions  

---

## 6. Implementation Phases

### Phase 1: Purple Agent Streaming (1 hour) ✅ SIMPLIFIED
- [ ] Enable `streaming=True` in agent capabilities (1 line change)
- [ ] Modify `client.chat.completions.create()` to use `stream=True`
- [ ] Yield tokens via `updater.update_status()` in async for loop
- [ ] Test with simple A2A client request

**Key Insight:** vLLM streaming verified working via curl test. OpenAI client handles SSE automatically.

### Phase 2: Green Agent Client (1 hour) ✅ EXISTING CODE
- [ ] Use existing `send_message()` from `src/agentbeats/client.py` with `streaming=True`
- [ ] Replace httpx calls with A2A streaming helper (already supports streaming)
- [ ] Add token aggregation logic
- [ ] Test against Purple Agent streaming endpoint

**Key Insight:** The `a2a` library (v0.3.5) already handles SSE parsing. No custom parser needed!

### Phase 3: Campaign Runner Integration (30 minutes)
- [ ] Import `send_message` from agentbeats.client
- [ ] Replace timeout logic with `async for event in send_message(..., streaming=True)`
- [ ] Add stall detection (30s no-event threshold)
- [ ] Test with short campaign (target=3)

**Key Insight:** Existing code in `client_cli.py` line 108 already demonstrates this pattern.

### Phase 4: Validation & Documentation (1 hour)
- [ ] Run validation campaign (target=25)
- [ ] Document streaming behavior in intent log
- [ ] Capture metrics (tokens/sec, stall detection events)
- [ ] Update competition submission materials

**Total Estimated Time:** 2.5-3.5 hours (down from 6-9 hours)

---

## 7. Fallback Strategy

If streaming implementation encounters unexpected issues:

### Option B: Hybrid Approach
- Keep blocking mode as default
- Add vLLM metrics polling (`/metrics` endpoint)
- Check `vllm:num_requests_running` during request
- **Implementation time:** 1-2 hours
- **Trade-off:** Less elegant, but still shows inference awareness

### Option C: Enhanced Timeout
- Keep current timeout logic
- Add detailed logging of retry attempts
- Document timeout rationale in submission
- **Implementation time:** 30 minutes (already done)
- **Trade-off:** Least impressive, but production-ready now

---

## 8. Risk Assessment

### 8.1. Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| A2A library streaming bugs | **Very Low** | High | ✅ Verified: v0.3.5 installed, working examples in codebase |
| vLLM SSE compatibility | **ELIMINATED** | Medium | ✅ Verified: curl test shows perfect OpenAI-compatible SSE |
| Performance overhead | Low | Low | SSE is lightweight (text/event-stream) |
| Docker networking issues | Medium | Low | Test in actual Arena environment |

### 8.2. Timeline Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Implementation takes >9 hours | Medium | Medium | Use Phase 4 fallback if needed by Tue |
| Breaking existing functionality | Low | High | Test each phase incrementally |
| Competition deadline pressure | High | High | Already have working system (Option C) |

---

## 9. Success Criteria

### Minimum Viable (Phase 1-2) - Target: 1 hour
- [ ] Purple Agent emits SSE events (vLLM → OpenAI client → A2A)
- [ ] Green Agent receives and parses tokens via existing `send_message()` helper
- [ ] Single battle completes successfully via streaming
- [ ] Token-by-token progress visible in logs

### Production Ready (Phase 1-3) - Target: 2.5 hours
- [ ] Campaign runner uses streaming for all battles
- [ ] Stall detection works correctly (30s no-event threshold)
- [ ] Progress logging shows real-time token generation
- [ ] Zero false timeout failures in 10-battle test

### Competition Showcase (Phase 1-4) - Target: 3.5 hours
- [ ] Documentation explains streaming architecture in intent log
- [ ] Submission materials highlight A2A protocol compliance
- [ ] System demonstrates robust inference monitoring
- [ ] Metrics show elimination of timeout ambiguity

---

## 10. Verification Complete ✅

**Completed Pre-Flight Checks (2026-01-14 01:15 UTC):**
1. ✅ Updated Josh's intent log with link to this plan
2. ✅ Tested vLLM streaming with curl - **WORKING PERFECTLY**
   - Response: `data: {"object":"chat.completion.chunk"...`
   - Tokens stream individually: `"Certainly"`, `"!"`, `" Here"`, etc.
3. ✅ Verified A2A library version: **v0.3.5 installed**
   - `ClientConfig(streaming: bool = True, ...)` - defaults to True!
4. ✅ Found existing streaming code: `src/agentbeats/client_cli.py` line 108
5. ✅ Confirmed `send_message()` helper already supports streaming

**Decision: PROCEED with implementation** - All risks mitigated, time estimate reduced to 2.5-3.5 hours

**Implementation Start:** 2026-01-14 01:20 UTC

---

## 11. References

- **A2A Protocol Spec:** `docs/05-Competition/AgentBeats-SDK-Reference.md`
- **Current Agent Implementation:** `src/purple_logic/agent.py`
- **Current Green Agent:** `src/green_logic/server.py`
- **Campaign Runner:** `scripts/green_logic/smart_campaign.py`
- **Competition Guidelines:** `docs/05-Competition/20251221-Submission-Requirements-Matrix.md`

---

**Status:** PAUSED - Phase 1 complete, investigating buffering behavior  
**Owner:** Josh  
**Created:** 2026-01-14 01:00 UTC  
**Last Updated:** 2026-01-14 01:40 UTC  
**Phase 1 Complete:** 2026-01-14 01:40 UTC

## Phase 1 Results

**Completed:**
- ✅ Purple Agent modified to use `stream=True` 
- ✅ Purple Agent capabilities set to `streaming=True`
- ✅ System functional (battle completed successfully)
- ✅ vLLM streaming confirmed working (curl test)

**Finding:**
- ⚠️ A2A library buffers all tokens into single event (36s generation → 1 event)
- ⚠️ Not achieving real-time token-by-token visibility as expected
- ⚠️ Need to investigate `TaskUpdater` / `EventQueue` emission patterns

**Decision Point:**
Given the complexity of debugging A2A event emission and current time investment (1 hour Phase 1), recommend:

**Option A:** Continue debugging A2A streaming (est. 2-4 more hours)
- Deep dive into `a2a.server.tasks.TaskUpdater` 
- May require modifying how we emit events
- Risk: May hit library limitations

**Option B:** Use current intelligent timeout system (PRODUCTION READY NOW)
- Already works correctly with retry logic
- Proven in validation campaign (17 battles)
- Can document as "pragmatic timeout handling" for judges

**Recommendation:** **Option B - ACCEPTED** ✅

**Decision (2026-01-14 01:45 UTC):**
- Proceed with intelligent timeout system (production-ready, proven)
- Resume main Yin-Yang evaluation campaign immediately
- Defer streaming debug to post-campaign if time permits
- Detailed debug plan available at: [A2A-Streaming-Debug-Plan.md](A2A-Streaming-Debug-Plan.md)

**Rationale:**
- Current system works reliably (16 battles completed, 0 false failures in validation)
- Main campaign objective (data collection for research paper) takes priority
- Streaming would be impressive but isn't required for competition success
- Can revisit streaming as optional enhancement if main work completes early
