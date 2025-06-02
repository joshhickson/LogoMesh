### **LogoMesh Phase 2 — Final “Missing-Foundation” Master List**

(Created by Gemini 2.5 Pro + Chat-GPT o3)
06.02.2025

---

## 0. Core Principle to Apply Everywhere

> **Phase 2 builds contracts, stubs, & local-test scaffolding.  
> Phase 3 flips the switches (real LLM wiring, external agents, cloud fallback).**

For every item below add:

- **Contract / Stub** now (deterministic, testable).
    
- **“Phase 3 Activation”** subsection that states how it will be wired.
    

---

## 1. LLM & Execution Layer

|Gap|Phase-2 Work|Phase-3 Activation|
|---|---|---|
|**LLM Config / Registry**|`llm.config.json` + `LLMExecutorRegistry` (local & mock executors only)|Populate with real OpenAI/Anthropic IDs, dynamic load-balance|
|**MetaExecutor Decision Log**|`meta_executor_log` table + reason strings|Feed logs to self-evaluation agent for optimisation|
|**Local LLM Test UI**|`LocalModelTestPanel.tsx` (prompt ↔ completion, tokens / sec display)|Expose to end-users for model hot-swap|
|**Robust Ollama/LlamaCpp Executor** (Gemini)|Implement streaming, error handling, VRAM tuning|Add cloud fallback & multi-GPU sharding|

---

## 2. Context & Memory (CCE + Embeddings)

|Gap|Phase-2 Work|Phase-3 Activation|
|---|---|---|
|**Full Cognitive Context Engine** (Gemini)|Build CCE: request API, chunking, semantic compression → pass to `LLMTaskRunner`|Dynamic context “onboarding” per agent; >100 K token feeds|
|**Embedding Drift Detection**|`EmbeddingComparator` + periodic cosine-drift log|Trigger auto-re-embed pipelines when drift > threshold|
|**Vector Visualization**|`UMAPViewer` (DevShell panel)|Agent-driven cluster reviews / auto-tagging|
|**Segment Provenance Chain**|`segment_version_log` table|Runtime memory pruning & delta summaries|

---

## 3. Graph & Pipeline Intelligence

|Gap|Phase-2 Work|Phase-3 Activation|
|---|---|---|
|**MeshGraphEngine Debug & Cache**|path traversal tests, `[TOGGLE_GRAPH_DEBUG]`, SQLite cache|Graph-based agent search & long-horizon planning|
|**FakeAgentRunner**|Deterministic scripted agent for pipeline load-tests|Replace with live LLM agents w/ Tool use|
|**Pipeline Stack-Trace UI**|`PipelineDebugView` (per-task output, timings)|Self-healing pipelines (agents edit failing steps)|

---

## 4. Tool Use & Unhobblings

|Gap|Phase-2 Work|Phase-3 Activation|
|---|---|---|
|**Tool Schema + Executor** (Gemini)|`contracts/tools/toolSchema.ts`; `ToolExecutor` that can call plugin functions with JSON args|LLM function-calling with automatic tool selection|
|**Chain-of-Thought Field**|Optional `segment.coT[]`, stored but hidden; audit toggle|Expose to models for self-reflection, memory distillation|
|**ScaffoldedPipeline Contract**|Goal / subgoal JSON stub; progress checker|Agents auto-generate & update scaffolds|
|**SyntheticFeedbackRunner**|Store LLM self-critiques into new Segments|Use as fine-tune / RLHF corpus|

---

## 5. Audit & Self-Awareness

|Gap|Phase-2 Work|Phase-3 Activation|
|---|---|---|
|**Audit Summary Dashboard**|React dashboard: top models, errors, latency|Agents monitor & auto-tune configs|
|**Memory Snapshot Tool**|`/api/snapshot/export` + snapshot browser|Time-travel diffing for regression tests|
|**Meta-level Self-Critique Loop**|LLM prompts analysing audit logs → “improvement Thoughts”|Auto-open DevShell PRs with suggested patches|

---

## 6. DevShell & Developer UX

|Gap|Phase-2 Work|Phase-3 Activation|
|---|---|---|
|**Plugin Crash Containment**|`PluginExecutionLimiter` w/ timeout & circuit-breaker|Agents restart / patch crashing plugins|
|**Plugin Live Inspector**|DevShell panel: loaded plugins, perms, mem usage|Real-time permission elevation requests|
|**Simulation CLI**|`logomesh simulate` for dry-run pipelines|Headless CI agent executing nightly self-tests|

---

## 7. Compute & Performance (from transcript)

|Gap|Phase-2 Work|Phase-3 Activation|
|---|---|---|
|**Inference Profiling Suite**|Collect tokens/sec, VRAM, latency per model|Auto-select fastest model per task|
|**Context Window Stress Tests**|Bench CCE at 32 K / 128 K tokens|Move to million-token windows & disk-paging|

---

## 8. UI Agent Presence (ShellNode / MatrixCore)

|Gap|Phase-2 Work|Phase-3 Activation|
|---|---|---|
|**Minimal Agent HUD**|`AgentStatusWidget` listening on EventBus|Full avatar, voice, live screen actions|
|**TTS Wiring (stub voices)**|Basic SAPI / say / espeak plugin|Neural TTS w/ voice cloning, lip-sync|

---

### 📋 Single-Line TODO Inserts for Claude

When Claude revises the Phase-2 doc, have it:

1. Append each table row’s **Phase-2 Work** bullet into the relevant theme’s _“Implementation Steps”_ list.
    
2. Add a **“Phase 3 Activation Plan”** subsection beneath the theme with the corresponding right-column bullets.
    
3. Insert the **Compute & Performance** items under the existing “Success Metrics / Risk” section.
    
4. Ensure every new contract/stub is listed in the **`@contracts/`** or **`@core/`** directories section.
    
5. Update the **Final Boundary** section to state:
    
    > “All external wiring (cloud LLMs, autonomous agents, real tool calls) is explicitly deferred to Phase 3.”
    

This merged checklist keeps Phase 2 purely foundational while making sure nothing critical is left undocumented before we jump to full AGI-ready wiring in Phase 3.