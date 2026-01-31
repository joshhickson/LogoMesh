---
status: DEFERRED
type: Plan
---
> **Context:**
> *   [2026-01-14 01:40 UTC]: Detailed debugging plan for A2A streaming token-by-token emission. Deferred pending completion of primary Yin-Yang evaluation campaign.
> **Parent:** A2A-Streaming-Prototype-Plan.md
> **Priority:** Low (optional enhancement after main campaign complete)

---

# A2A Streaming Debug Plan (Option A)

## Problem Statement

**Current Behavior:**
- Purple Agent receives vLLM token stream correctly (`stream=True` working)
- Purple Agent calls `updater.update_status(TaskState.working, token)` for each token
- But client receives **one single event** after full generation completes (36s)
- No real-time token-by-token visibility

**Goal:**
Debug why A2A `EventQueue` / `TaskUpdater` isn't emitting incremental SSE events and fix to achieve true token-level streaming.

---

## Hypothesis & Investigation Steps

### Hypothesis 1: TaskUpdater Batching Behavior
**Theory:** `TaskUpdater.update_status()` may batch updates or only emit on state transitions (not on repeated `working` states).

**Investigation:**
1. Read source: `a2a.server.tasks.TaskUpdater` implementation
2. Check: Does `update_status()` emit event immediately or queue for batch?
3. Test: Call `update_status()` with different states per token (e.g., alternate between custom states)

**Files to Examine:**
- `.venv/lib/python3.12/site-packages/a2a/server/tasks.py`
- `.venv/lib/python3.12/site-packages/a2a/server/events.py`

---

### Hypothesis 2: Need TaskArtifactUpdateEvent Instead
**Theory:** Token streaming should use `TaskArtifactUpdateEvent` with `append=True` rather than status updates.

**Investigation:**
1. Review A2A spec: `TaskArtifactUpdateEvent` documentation in external/A2A-main
2. Check: Does artifact streaming support incremental text append?
3. Test: Create artifact, emit updates with `append=True, lastChunk=False`

**Example Code to Test:**
```python
from a2a.types import TaskArtifactUpdateEvent, Artifact, TextPart

# Create artifact once
artifact_id = str(uuid.uuid4())
artifact = Artifact(
    id=artifact_id,
    name="generated_code",
    parts=[TextPart(text="")]
)

# Emit incremental updates
async for chunk in stream:
    token = chunk.choices[0].delta.content
    artifact_update = TaskArtifactUpdateEvent(
        artifact_id=artifact_id,
        parts=[TextPart(text=token)],
        append=True,
        lastChunk=False
    )
    await event_queue.enqueue_event((task, artifact_update))

# Final chunk
await event_queue.enqueue_event((task, TaskArtifactUpdateEvent(
    artifact_id=artifact_id,
    lastChunk=True
)))
```

---

### Hypothesis 3: EventQueue Flush Behavior
**Theory:** `EventQueue` may buffer events and only flush on specific conditions.

**Investigation:**
1. Check: Does `EventQueue` have manual flush method?
2. Test: Call flush after each token enqueue
3. Review: A2AStarletteApplication event loop implementation

**Files to Examine:**
- `.venv/lib/python3.12/site-packages/a2a/server/events.py`
- `.venv/lib/python3.12/site-packages/a2a/server/apps.py`

---

### Hypothesis 4: DefaultRequestHandler Buffering
**Theory:** `DefaultRequestHandler` may wait for task completion before streaming results.

**Investigation:**
1. Check: Does handler stream events as they arrive or buffer?
2. Test: Replace with custom handler that logs event emission timing
3. Review: Handler's `handle()` method implementation

**Files to Examine:**
- `.venv/lib/python3.12/site-packages/a2a/server/request_handlers.py`

---

## Implementation Steps (If Debugging Succeeds)

### Step 1: Diagnose Root Cause (1 hour)
- [ ] Add debug logging to Purple Agent executor
- [ ] Log timestamp of each `update_status()` call
- [ ] Log timestamp of each event received by client
- [ ] Examine A2A library source to understand event emission

### Step 2: Fix Event Emission (1-2 hours)
Based on diagnosis, implement one of:
- **Option A:** Use `TaskArtifactUpdateEvent` with `append=True`
- **Option B:** Manually flush `EventQueue` after each token
- **Option C:** Replace `DefaultRequestHandler` with custom streaming handler
- **Option D:** Emit status with unique message per token to force new events

### Step 3: Validate Real-Time Streaming (30 min)
- [ ] Run `scripts/test_streaming.py` 
- [ ] Confirm multiple events arrive during generation (not just at end)
- [ ] Measure: Time between first and last event should match generation time
- [ ] Success: See events arriving every 0.1-0.5s (token-level granularity)

### Step 4: Integrate with Campaign Runner (30 min)
- [ ] Update Green Agent to use streaming client
- [ ] Add stall detection (30s no-event = hung)
- [ ] Test with short campaign (target=3)

---

## Expected Outcomes

### Success Criteria:
✅ Client receives 50+ events during 30-second generation  
✅ Events arrive incrementally (measured timestamps show 0.1-1s intervals)  
✅ First token arrives within 5s of request start  
✅ Stall detection works (can detect 30s silence)  

### Failure Exit Conditions:
❌ A2A library fundamentally doesn't support incremental status updates  
❌ Requires modifying library internals (out of scope)  
❌ Time investment exceeds 3 hours with no progress  

---

## Fallback Strategy

If debugging fails after 3 hours:
1. Document findings in intent log
2. Revert to intelligent timeout system (already working)
3. Note in competition materials: "Attempted real-time streaming; A2A library limitations led to pragmatic timeout approach"

---

## References

- **A2A Streaming Spec:** `external/A2A-main/A2A-main/docs/topics/streaming-and-async.md`
- **Current Implementation:** `scenarios/security_arena/agents/generic_defender.py` (lines 95-125)
- **Test Script:** `scripts/test_streaming.py`
- **A2A SDK Source:** `.venv/lib/python3.12/site-packages/a2a/`

---

## Time Estimates

| Phase | Optimistic | Realistic | Pessimistic |
|-------|-----------|-----------|-------------|
| Diagnosis | 30 min | 1 hour | 2 hours |
| Fix Implementation | 1 hour | 2 hours | 4 hours |
| Validation | 15 min | 30 min | 1 hour |
| Integration | 15 min | 30 min | 1 hour |
| **Total** | **2 hours** | **4 hours** | **8 hours** |

**Decision Threshold:** Abort after 3 hours if no clear path to solution emerges.

---

**Status:** DEFERRED - Prioritize main Yin-Yang campaign first  
**Created:** 2026-01-14 01:45 UTC  
**Trigger Condition:** Resume only if main campaign completes with time remaining
