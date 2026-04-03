> **Status:** ACTIVE
> **Type:** Research
> **Context:**
> *   [2026-04-02]: Pass 1+2+3 for the four Sprint 2 repos not covered in the original analysis: τ²-Bench, MLE-Bench, OSWorld-Verified (all new), and FieldWorkArena (Pass 1 only previously). Written after the official roster was confirmed on rdi.berkeley.edu/agentx-agentbeats.html. These replace the previous Sprint 2 analysis which targeted the wrong repos (MateFin, MIDS4LIFE, Webshop Plus, HEP-ExpAgents).
> **See Also:**
> *   [Sprint 2 Corrected Scoring Deep-Dive](../[2026-04-02]-Sprint2-Scoring-Deep-Dive.md) — original doc (SUPERSEDED)
> *   [Generalization Compatibility Matrix v2]([2026-04-02]-Generalization-Compatibility-Matrix-v2.md)

# Sprint 2 — New Repos Analysis (Pass 1+2+3)

## Confirmed Sprint 2 Official Roster (3/23–4/12)

| Repo | Track | Previous coverage | This doc |
|:-----|:------|:-----------------|:---------|
| CAR-bench | Computer Use / Web Agent | ✅ Pass 1+2+3 | See [Sprint 2 Task Input Formats](../[2026-04-02]-Sprint2-Task-Input-Formats.md) |
| OSWorld-Verified | Computer Use / Web Agent | ❌ None | ✅ Below |
| MAizeBargAIn | Multi-Agent | ✅ Pass 1+2 | See [Sprint 3 First-Place Deep-Dive](../[2026-04-02]-Sprint3-FirstPlace-Scoring-Deep-Dive.md) addendum |
| FieldWorkArena | Research Agent | ✅ Pass 1 | ✅ Below (Pass 2+3) |
| MLE-Bench | Research Agent | ❌ None | ✅ Below |
| τ²-Bench | τ²-Bench (own track) | ❌ None | ✅ Below |

---

## 1. τ²-Bench (Sierra AI / RDI-Foundation — own track)

**Repo:** `RDI-Foundation/tau2-agentbeats` (AgentBeats green agent)
**Based on:** `sierra-research/tau2-bench` (original benchmark)
**Competition page:** agentbeats.dev/agentbeater/tau2-bench
**Note:** τ²-Bench has its own dedicated track and cash prizes ($2,500/$1,500/$1,000 from Sierra AI). This is a featured partnership benchmark.

### What it is

A customer service conversational agent benchmark operating in a **dual-control environment** — both the agent and a simulated user can take actions in the shared backend system. The agent must coordinate with the user, use backend tools to execute service requests, and follow domain-specific policies.

Three service domains:
- **Airline**: flight changes, seat upgrades, refunds, baggage claims
- **Retail**: returns, order status, product questions, promotions
- **Telecom**: plan changes, billing disputes, device troubleshooting, account management

### Task structure

For each task, the green agent:
1. Instantiates a simulated customer (LLM user simulator, default: `gpt-4o-mini`)
2. Sends the Purple Agent a task description via A2A
3. Orchestrates multi-turn conversation between simulated customer, Purple Agent, and backend tools
4. Evaluates whether the Purple Agent completed the task correctly per policy

**Configuration parameters (from green agent README):**
```python
config = {
    "domain": "airline" | "retail" | "telecom" | "mock",
    "num_tasks": int,           # How many tasks to run (default: all, typically 50)
    "task_ids": [str, ...],     # Specific task IDs (optional)
    "max_steps": 200,           # Max orchestrator steps per task
    "user_llm": "openai/gpt-4o-mini",  # User simulator model
}
```

### Scoring

**Metric:** Pass Rate — `passed_tasks / total_tasks` reported as X/50

**Task success:** Binary. The task either passes or fails based on:
- Did the agent complete the customer's request?
- Did the agent follow domain policy throughout?
- Were the correct tool calls made in the correct sequence?

**Policy following is MANDATORY.** Unlike CAR-bench where policy errors add a penalty, τ²-Bench failures from policy violations count as task failures directly in the pass rate.

**Scoring type: Type I/II** — deterministic task completion check (did agent execute the right tools per policy?) with a stochastic user simulator (LLM-based, so some variance across runs).

### Infrastructure

**Barrier: LOW (2).** The benchmark runs as a text + API tool environment. No VM, no K8s, no specialized hardware. The agent calls backend tool APIs (flight booking, retail order management, telecom account APIs — these are simulated services, not live).

### Output adapter: Cluster C — Multi-Turn Tool Calls

The Purple Agent must:
1. Receive customer service task description via A2A text message
2. Issue tool calls to the backend environment (booking APIs, account management, etc.)
3. Produce text responses to the simulated user (coordination, clarifying questions, confirmations)
4. Continue the conversation until task resolution or max_steps

This is the same Cluster C adapter pattern as AVER and CAR-bench. The domain is different (customer service vs. car assistant vs. code error detection), but the structural adapter is identical: multi-turn text + tool call loop.

**Delta from CAR-bench:** Primarily domain-specific policy knowledge and tool schema for airline/retail/telecom APIs. The dual-control aspect (user can also take actions in the shared environment) requires the agent to track what the user has done — this is a new capability beyond CAR-bench.

### LogoMesh fit assessment

| Axis | Score | Notes |
|:-----|:------|:------|
| Output adapter | Cluster C | Same as AVER + CAR-bench |
| Infrastructure barrier | 2 | Text + simulated APIs |
| LogoMesh overlap | 3 | Multi-turn tool calling exists; customer service domain is new |
| Implementation cost | 2 | Delta from CAR-bench: domain policies + dual-control tracking |
| Score ceiling | 45 | MEDIUM confidence — dual control adds complexity vs. CAR-bench |
| Scoring type | Type I/II | Deterministic pass/fail + LLM user variance |

**Selection confidence: MEDIUM.** Worth targeting as a secondary Sprint 2 repo after CAR-bench. Implementation cost is low given Cluster C is shared, but the dual-control aspect (user actions in shared environment) is new capability relative to CAR-bench.

---

## 2. MLE-Bench (OpenAI — Research Agent track)

**Repo:** `RDI-Foundation/mle-bench-green` (AgentBeats green agent)
**Based on:** `openai/mle-bench` (original benchmark)
**Competition page:** agentbeats.dev/agentbeater/mle-bench

### What it is

A machine learning engineering benchmark across **75 Kaggle competitions** spanning image classification, tabular prediction, NLP, audio, and sequence-to-sequence tasks. Agents must perform end-to-end ML problem solving: data exploration, model selection, training, hyperparameter tuning, and submission.

### Infrastructure requirements

**Barrier: EXTREME (5+).**

```
Runtime:      24 hours per full evaluation
CPU:          36 vCPUs
RAM:          440 GB
GPU:          1× NVIDIA A10 (24GB)
Storage:      3.3 TB total (Lite: 158 GB)
```

This is not a benchmark that can be run in a Docker container with 128MB RAM. The agent must execute actual ML training against real competition datasets. This infrastructure requirement is categorically beyond LogoMesh's existing execution environment.

### Scoring

Medal-based: **Any Medal %** — fraction of competitions where the agent achieves Gold, Silver, or Bronze relative to human leaderboard baselines. No partial credit below Bronze.

Agents must produce CSV prediction files for each competition via a JSONL interface:
```json
{"competition_id": "dog-breed-identification", "submission_path": "/path/to/predictions.csv"}
```

**Scoring type: Type I** — deterministic evaluation against competition ground truth (exact comparison of predictions vs. held-out labels by Kaggle's original metric per competition).

### LogoMesh fit assessment

| Axis | Score | Notes |
|:-----|:------|:------|
| Output adapter | New (CSV + JSONL) | No existing adapter |
| Infrastructure barrier | 5+ | 36 vCPUs, 440GB RAM, A10 GPU required |
| LogoMesh overlap | 1 | No ML engineering capability |
| Implementation cost | 5 | New domain + extreme infra |
| Score ceiling | 5 | Cannot execute ML training in existing environment |
| Scoring type | Type I | Deterministic medal evaluation |

**Verdict: EXCLUDE.** Infrastructure cost is prohibitive and independent of adapter development — the benchmark simply cannot run without an A10 GPU and 440GB RAM. Even a floor attempt requires compute that isn't available.

---

## 3. OSWorld-Verified (XLANG Lab — Computer Use / Web Agent track)

**Repo:** `RDI-Foundation/osworld-green` (AgentBeats green agent)
**Based on:** `boyugou/OSWorld-Verified` (corrected benchmark)
**Competition page:** agentbeats.dev/agentbeater/osworld-verified

### What it is

A computer use benchmark testing agents on **369 open-ended GUI tasks** across web browsers and desktop applications on Ubuntu, Windows, and macOS. Tasks involve realistic cross-app workflows: "Open a Google Doc from email, summarize it, and share it with a contact in your calendar."

### Infrastructure requirements

**Barrier: HIGH (5).**

Real virtual machine execution is mandatory. Supported environments:
- VMware Workstation Pro / Fusion
- VirtualBox
- Docker with KVM support (requires kernel virtualization)
- AWS (enables parallelization)

The agent receives **screenshot observations** (visual desktop state) and must produce **executable GUI actions** (clicks, keyboard input, scrolling) that are executed in the live VM.

### Scoring

**Success rate:** Binary per task. Either the task completed correctly or it didn't.

```python
success_rate = ROUND(results[1].success_rate * 100, 1)
```

**Scoring type: Type I** — deterministic evaluation of whether the final application state matches the goal state.

### Purple agent interface

The agent receives screenshot input and must produce action output. This is fundamentally a **multimodal (vision) + GUI interaction** problem — not a text/JSON protocol problem. The A2A wrapper exists but the underlying evaluation is screenshot-in, GUI-action-out.

**LogoMesh has no vision capability and no GUI interaction capability.**

### LogoMesh fit assessment

| Axis | Score | Notes |
|:-----|:------|:------|
| Output adapter | New (GUI actions) | Screenshot input requires vision |
| Infrastructure barrier | 5 | Real VM required |
| LogoMesh overlap | 1 | No vision, no GUI interaction |
| Implementation cost | 5 | Requires multimodal LLM + VM environment |
| Score ceiling | 3 | Minimal credit possible without vision/GUI |
| Scoring type | Type I | Deterministic final state check |

**Verdict: EXCLUDE.** Requires vision input (screenshot → actions) which LogoMesh has no capability for. Infrastructure barrier is high (VM required). Even a floor attempt would require adding a multimodal LLM to the Purple Agent's input pipeline.

---

## 4. FieldWorkArena (ECAI / AST-FRI — Research Agent track)

**Repo:** `ast-fri/FieldWorkArena-GreenAgent`
**Competition page:** (no agentbeats.dev page found)

### What it is

A video analytics benchmark for AI agents operating in industrial field environments. Three operational domains:
- **Factory** — 79 tasks (176 total available)
- **Warehouse** — 155 tasks (264 total available)
- **Retail** — 5 tasks (446 total available)

Agents analyze video footage and answer questions or take actions based on what they observe in the industrial setting.

### Infrastructure requirements

**Barrier: MEDIUM-HIGH (3-4).**
- Requires HuggingFace dataset access (approval form submission required — not public)
- Video processing capability (not documented whether agent receives frames or video files)
- Docker deployment, standard Python environment
- `GPT-4o` required for evaluation (OpenAI API key needed)

### Scoring

**Formula: UNKNOWN.** The scoring source is internal to the `fwa-server` binary and no scoring formula was extractable from public files. The green agent README states "quantitatively evaluate how effectively AI agents work" but provides no numerical breakdown.

The `scenario.toml` specifies `target = "all"` with no scoring parameters — scoring is entirely internal to the green agent runtime.

### Purple agent interface

The purple agent lives at `scenarios/fwa/purple_agent/purple_agent.py`. The interaction structure appears to be:
- Purple Agent receives a task via A2A (likely text description + video reference)
- Purple Agent produces an answer or action

The specific message format is not public (dataset requires HuggingFace approval to access).

### LogoMesh fit assessment

| Axis | Score | Notes |
|:-----|:------|:------|
| Output adapter | Unknown | No public format specification |
| Infrastructure barrier | 3-4 | HuggingFace approval + video processing |
| LogoMesh overlap | 1 | No video analysis capability |
| Implementation cost | 5 | Domain barrier + unknown scoring + video required |
| Score ceiling | 5 | Minimal without video capability |
| Scoring type | Unknown | Formula not public |

**Verdict: EXCLUDE.** Video analytics domain with no existing LogoMesh capability. Scoring formula is not public (requires HuggingFace dataset approval). Infrastructure barrier and domain gap are both prohibitive.

---

## Sprint 2 Selection Summary

With the corrected roster, only two repos are tractable targets:

| Repo | Adapter | Fit | Sprint 2 ceiling | Cost | Verdict |
|:-----|:--------|:----|:----------------|:-----|:--------|
| **CAR-bench** | C (multi-turn) | MEDIUM-HIGH | 55 | 0 (done) | **INCLUDE** |
| **τ²-Bench** | C delta | MEDIUM | 45 | 1 unit | **INCLUDE if time permits** |
| MAizeBargAIn | New (bargaining) | LOW | 25 | 5 | EXCLUDE |
| FieldWorkArena | Unknown | VERY LOW | 5 | 5 | EXCLUDE |
| MLE-Bench | New (CSV) | VERY LOW | 5 | 5+ | EXCLUDE (no infra) |
| OSWorld-Verified | New (GUI) | VERY LOW | 3 | 5 | EXCLUDE (no vision) |

The revised Sprint 2 selection is materially narrower than what was previously planned. CAR-bench remains the primary Sprint 2 target. τ²-Bench is a viable secondary given its Cluster C adapter overlap, but the dual-control requirement adds complexity. All other Sprint 2 repos are excluded due to infrastructure or domain barriers.
