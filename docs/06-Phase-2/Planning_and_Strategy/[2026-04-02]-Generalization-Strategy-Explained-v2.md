> **Status:** ACTIVE
> **Type:** Plan
> **Context:**
> *   [2026-04-02]: Corrected narrative strategy explanation based on the verified Phase 2 roster. Supersedes [2026-04-02]-Generalization-Strategy-Explained.md which was built from wrong Sprint 2 data (MateFin, MIDS4LIFE, Webshop Plus were not in Phase 2).
> **Supersedes:** [[2026-04-02]-Generalization-Strategy-Explained.md]([2026-04-02]-Generalization-Strategy-Explained.md)
> **See Also:**
> *   [Optimal Path Synthesis v2]([2026-04-02]-Optimal-Path-Synthesis-v2.md)
> *   [Generalization Compatibility Matrix v2]([2026-04-02]-Generalization-Compatibility-Matrix-v2.md)

# Generalization Strategy — Full Explanation v2

## What Changed From the Previous Version

The original analysis was built from a GitHub repo list collected before the official Phase 2 roster was finalized. When we checked rdi.berkeley.edu/agentx-agentbeats.html directly, the Sprint 2 roster had been updated. The repos we had targeted for Sprint 2 — MateFin, MIDS4LIFE, Webshop Plus, HEP-ExpAgents — are not in Phase 2. Similarly, the Software Testing track (LogoMesh, AgentSWE) and Healthcare track (ICU-Later) are not in Phase 2.

This reduced the expected score total from ~655 to ~365–480, depending on whether Terminal-Bench 2.0 is confirmed for Sprint 3 and whether we complete τ²-Bench before April 12.

**The adapter cluster methodology is unchanged.** The same five-adapter architecture applies — the difference is which repos fill each cluster slot. Everything below reflects the corrected roster.

---

## The Constraint Structure (Unchanged)

Sprint 3 is mandatory for ALL first-place repos in the three confirmed tracks (Agent Safety, Coding Agent, Cybersecurity). Sprint 2 requires at least one repo, no upper limit.

The MCTS framing still applies: build adapters in an order that maximizes expected score per implementation unit, using Sprint 3 mandatory work as the foundation for Sprint 2 additions wherever possible.

---

## Sprint 2: A Narrower Field

The corrected Sprint 2 roster contains six repos. Four are immediately excludable on infrastructure or domain grounds:

**MLE-Bench** requires a 24-hour evaluation run on 36 vCPUs + 440GB RAM + an A10 GPU. Agents must execute actual Kaggle ML training. This is categorically outside LogoMesh's execution environment — not a question of effort, just impossibility.

**OSWorld-Verified** requires agents to interact with a real desktop VM via screenshot input. The agent receives pictures of a screen and must produce mouse clicks and keyboard events. LogoMesh has no vision capability and no GUI interaction mechanism.

**FieldWorkArena** tests video analytics in factory, warehouse, and retail environments. The scoring formula is not public (requires HuggingFace dataset approval). LogoMesh has no video analysis capability.

**MAizeBargAIn** uses Maximum Entropy Nash Equilibrium scoring — a game-theoretic evaluation where the agent negotiates against Nash-optimal opponents across multi-round bargaining. Building this from scratch costs 5 implementation units for an expected 25 points.

That leaves **CAR-bench** and **τ²-Bench** as the only tractable Sprint 2 targets.

### CAR-bench (Primary Sprint 2 Target)

CAR-bench is an in-car AI assistant benchmark with 58 navigation tools, 130K POIs, and 1.7M routes. The scoring has a binary cliff at reward ≥ 0.99 — either the agent passes or it fails, no partial credit.

The three task types are the entire scoring structure:
- **Base tasks:** Execute the request correctly using tools
- **Hallucination tasks:** Acknowledge the limitation and decline to act — do NOT call any tool
- **Disambiguation tasks:** Ask a clarifying question and do NOT act yet

Task-type detection from the system prompt is the critical skill. The "don't do anything" tasks (hallucination + disambiguation) are often easier to get right than base tasks, because the correct response is explicitly one of: "I don't support that feature" or "Could you clarify X?"

CAR-bench uses Cluster C (multi-turn tool calls). Building AVER (mandatory Sprint 3) gives us this adapter. CAR-bench adds only task-type routing logic on top — 1 implementation unit delta.

### τ²-Bench (Secondary Sprint 2 Target, if time)

τ²-Bench is the Sierra AI customer service benchmark — airline, retail, and telecom domains where agents handle requests like flight changes, returns, and plan upgrades. It's the featured track for Sprint 2 with its own $2,500/$1,500/$1,000 cash prizes from Sierra.

The key structural difference from CAR-bench is **dual control**: both the agent AND a simulated customer can take actions in the shared backend system. If the customer calls a function before the agent does, the agent must track what's already been done. This adds meaningful complexity relative to CAR-bench's one-sided tool use.

τ²-Bench also uses Cluster C, so it reuses the same adapter as AVER and CAR-bench. The additional cost (2 units vs. 1 for CAR-bench) comes from implementing dual-control state tracking and loading domain-specific tool schemas for each of the three service domains.

**Sprint 2 recommendation:** CAR-bench is the primary target. Submit CAR-bench before April 12. Add τ²-Bench if Sprint 2 time permits after CAR-bench is submitted.

---

## Sprint 3: Five Mandatory Repos

### text-2-sql (Coding Agent — Start Here)

27+ SQL generation tasks across 4 difficulty levels. The scoring is 7-dimensional with an AST hallucination gate as the entry point: if the Purple Agent generates phantom tables or columns not in the provided schema, the task fails before any quality scoring occurs.

This is the highest-ROI repo in the entire competition. LogoMesh's AST analysis background maps directly to the hallucination detection requirement. The output is a JSON dict in the A2A response body — Cluster B, the simplest possible adapter. Building this first unlocks the cleanest path into Sprint 3 immediately when the window opens April 13.

**Expected score: 85. Cost: 1 unit.**

### AVER (Agent Safety — Build Second, Enables Three Repos)

AVER sends 47 tasks where code has been deliberately corrupted. The Purple Agent must detect the error class (one of five: hallucination, validation failure, tool misuse, context loss, adversarial injection), diagnose the root cause, and produce corrected output.

The critical scoring insight: AVER has a **turn-order multiplier**. Detecting the error type BEFORE attempting any tool execution scores higher than detecting it after a failed attempt. This means the agent's first response to a new task should always be error classification, not tool invocation.

AVER is the anchor for Cluster C (multi-turn tool calls). Building AVER's detect→diagnose→act loop directly enables CAR-bench (Sprint 2 submission, 1-unit delta) and τ²-Bench (Sprint 2, 2-unit delta). This is why AVER is the second build priority despite being Sprint 3 — its adapter immediately produces Sprint 2 value.

**Expected score: 80. Cost: 2 units.**

### RCAbench (Cybersecurity — High Confidence)

The Purple Agent receives a fuzzer crash report from the ARVO vulnerability dataset and must localize the root cause: the exact file, function, and line range where the bug lives. Scoring is pure IoU — deterministic overlap between the predicted and ground-truth location.

This is detective work, not code generation. LogoMesh's MCTS Red Agent already performs vulnerability reasoning — it searches code for exploitable patterns using Monte Carlo Tree Search with UCB1. That reasoning architecture transfers directly. The only new piece is the output adapter: instead of returning a structured text explanation, the agent writes a `loc.json` file to a shared workspace path (Cluster A).

**Expected score: 70. Cost: 2 units.**

### Pi-Bench (Agent Safety — New Capability)

Pi-Bench sends policy compliance scenarios. The Purple Agent must follow operational policies through tool execution while producing a structured trace documenting its reasoning and any policy citations. Scoring is pure deterministic — violation rate across 9 policy columns, no LLM judge.

The key rule: `AMBIGUOUS_POLICY` and `AMBIGUOUS_STATE` are valid outputs when the scenario is genuinely unclear. Forcing a binary decision when the policy doesn't clearly apply is penalized. This is different from most benchmarks where "I don't know" is not an option.

Pi-Bench builds Cluster F (text plan / policy trace) — a new adapter type we haven't needed before. The scoring is fully deterministic which makes optimization predictable, but the policy compliance domain is genuinely new for LogoMesh.

**Expected score: 55. Cost: 2 units.**

### NetArena (Coding Agent — Floor Attempt)

NetArena is a live Kubernetes network debugging benchmark. The Purple Agent must issue real kubectl commands against a live K8s cluster to diagnose and fix network policy misconfigurations. Scoring is binary: all pod connectivity checks pass or they fail.

Building a full K8s cluster costs 5 implementation units for a 40-point ceiling — worst ROI in the competition. The floor strategy accepts ~20 points by submitting well-reasoned diagnostic output (correct kubectl command sequences and network policy analysis from MCTS) without executing against a live cluster. This is actually a higher pts/unit ratio than the full build.

**Expected score: 20 (floor). Cost: 2 units.**

---

## The New Discovery: Terminal-Bench 2.0

After verifying the updated roster, the AgentBeats dashboard activity log revealed **Terminal-Bench 2.0** — a benchmark for real-world terminal tasks (compiling code, server setup, file manipulation). It has not been formally announced for Sprint 3, but it was active on the AgentBeats platform on April 2, 2026.

Terminal-Bench 2.0 scores via automated test scripts in Docker — the same environment LogoMesh already uses for code evaluation. Every task is binary pass/fail based on whether the final container state satisfies the test. No LLM judge. No infrastructure beyond Docker.

This is the highest LogoMesh overlap of any new repo found in this analysis cycle. If confirmed for Sprint 3, it extends Cluster B at 1 implementation unit for an expected 70 points — the second-best ROI in the matrix. **Watch for Sprint 3 roster announcement and do Pass 2+3 immediately.**

---

## Build Sequence (Corrected)

| Step | Adapter | Sprint window | Repos unlocked | Notes |
|:-----|:--------|:-------------|:--------------|:------|
| 1 | B — JSON | Before April 13 | text-2-sql, TB2.0 (conditional) | Highest ROI opening |
| 2 | C — Multi-turn | Before April 12 | AVER, CAR-bench | **CAR-bench must submit by April 12** |
| 3 | C delta 1 | Before April 12 | CAR-bench | Sprint 2 primary submission |
| 4 | C delta 2 | Before April 12 (if time) | τ²-Bench | Sprint 2 secondary |
| 5 | A — File write | Sprint 3 | RCAbench | |
| 6 | F — Policy trace | Sprint 3 | Pi-Bench | |
| 7 | E floor | Sprint 3 | NetArena | Accept floor score |

---

## Expected Score Summary (Corrected)

| Repo | Sprint | Adapter | Expected score | Confidence |
|:-----|:-------|:--------|:--------------|:-----------|
| text-2-sql | 3 | B | 85 | High |
| AVER | 3 | C | 80 | High |
| RCAbench | 3 | A | 70 | High |
| Terminal-Bench 2.0 | 3 (pending) | B | 70 | High IF confirmed |
| CAR-bench | 2 | C delta | 55 | Medium |
| Pi-Bench | 3 | F | 55 | Medium |
| τ²-Bench | 2 | C delta | 45 | Medium |
| NetArena | 3 | E floor | 20 | Low |
| **Total (conservative)** | | | **365** | CAR-bench confirmed |
| **Total (optimistic)** | | | **480** | + TB2.0 + τ²-Bench |

---

## Honest Comparison to Previous Synthesis

The corrected total (365–480) is significantly lower than the original synthesis (~655). This is not a strategic failure — it is accurate data replacing inaccurate data. The original synthesis included five repos that are not in Phase 2:

| Removed repo | Previous expected score | Why removed |
|:-------------|:------------------------|:------------|
| MateFin | 70 | Not in Phase 2 roster |
| AgentSWE | 65 | Software Testing not in Phase 2 |
| MIDS4LIFE | 45 | Not in Phase 2 roster |
| ICU-Later | 20 | Healthcare not in Sprint 3 |
| LogoMesh-self | 85 | Not in Phase 2 competition |
| **Total removed** | **285** | |

The corrected strategy adds:
- τ²-Bench: +45 (confirmed Sprint 2)
- Terminal-Bench 2.0: +70 (Sprint 3, pending confirmation)
- **Net new:** +115

Net change: −285 + 115 = −170 points. This is the cost of working from the correct roster.

The adapter architecture, MCTS simulation methodology, and build sequencing are all intact. The corrected numbers reflect real competition targets.
