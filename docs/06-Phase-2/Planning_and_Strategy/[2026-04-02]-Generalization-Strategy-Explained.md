> **Status:** SUPERSEDED
> **Type:** Plan
> **Context:**
> *   [2026-04-02]: Narrative explanation of the optimal generalization path for the Purple Agent across Sprint 2 and Sprint 3. Companion to the Optimal Path Synthesis and Generalization Compatibility Matrix. Written for team readability — explains the "why" behind every decision.
> **Superseded By:** [[2026-04-02]-Generalization-Strategy-Explained-v2.md]([2026-04-02]-Generalization-Strategy-Explained-v2.md) — rebuilt from verified Phase 2 roster. Sprint 2 selections (MateFin, MIDS4LIFE) and Sprint 3 targets (ICU-Later, AgentSWE, LogoMesh-self) in this document are not in Phase 2.
> **See Also:**
> *   [Optimal Path Synthesis]([2026-04-02]-Optimal-Path-Synthesis.md)
> *   [Generalization Compatibility Matrix]([2026-04-02]-Generalization-Compatibility-Matrix.md)
> *   [Sprint 2 Task Input Formats]([2026-04-02]-Sprint2-Task-Input-Formats.md)
> *   [Sprint 3 First-Place Scoring Deep-Dive]([2026-04-02]-Sprint3-FirstPlace-Scoring-Deep-Dive.md)

# Generalization Strategy — Full Explanation

## What Problem Are We Solving?

Phase 2 of AgentBeats asks us to build a **Purple Agent** — the agent being evaluated — that can compete across multiple Green Agent benchmarks simultaneously. The competition runs in sprints. Sprint 3 is the main event.

The constraint structure is asymmetric and creates a genuine optimization problem:

- **Sprint 3:** We MUST target ALL first-place Green Agent repos. There is no choice in which repos we compete against — the leaderboard requires scoring against every track's first-place benchmark.
- **Sprint 2:** We must target AT LEAST ONE first-place repo. There is no upper limit. We can target as many as we want.
- **Objective:** Maximize total expected score across both sprint windows relative to implementation effort.

This means the Sprint 3 set is fixed, and the Sprint 2 question is purely about which additional repos give us the best score-per-implementation-unit by reusing the adapters we are already building for Sprint 3.

---

## The Core Insight: Adapter Clusters

When you look across all 11+ targeted repos, you realize that most of the variation is in the **output format** the Purple Agent must produce, not in the underlying reasoning capability. The A2A protocol is identical across every benchmark. What changes is: does the agent write a file? Return a JSON dict? Issue multi-turn tool calls? Write a structured plan?

We grouped repos by output type into **adapter clusters**:

| Cluster | What the agent produces | Repos covered |
|:--------|:------------------------|:-------------|
| **A — File Write** | Writes output files to a shared filesystem path | RCAbench, MateFin |
| **B — JSON Response** | Returns a structured JSON dict in the A2A response body | text-2-sql, LogoMesh (self), AgentSWE |
| **C — Multi-Turn Tool Calls** | Runs a detect→diagnose→act loop with serialized tool calls | AVER, CAR-bench |
| **E — Live Infrastructure** | Issues real commands to live K8s or FHIR infrastructure | NetArena, ICU-Later |
| **F — Text Plan / Policy Trace** | Produces a structured natural language output (plan, verdict, answer dict) | Pi-Bench, MIDS4LIFE |

The critical observation: **if you build the adapter for one repo in a cluster, you get the other repos in that cluster almost for free.** The marginal cost of adding the second repo in Cluster C (CAR-bench) after building for AVER is mostly just task-type detection logic — not a full new capability.

This transforms the problem from "which 11 repos do I build for?" into "which 5 adapters do I build, and in what order?"

---

## The Sprint 3 Mandatory Set

These five repos must be targeted regardless of cost:

### 1. LogoMesh (Software Testing — 1st Place)

This is our own benchmark. We know the scoring formula exactly:

```
CIS = (0.25×R + 0.25×A + 0.25×T + 0.25×L) × red_penalty × intent_penalty
```

The Purple Agent competing against our own Green Agent must write code that passes our own test suite, survives our own MCTS Red Agent, and satisfies our own AST constraints. We have internal knowledge no other team has. **Expected score: 85. Implementation cost: 1 unit (Cluster B).**

### 2. text-2-sql (Coding Agent — 2nd Place)

The Green Agent sends a JSON task `{question, schema, dialect}` and expects a SQL response. Scoring is a 7-dimension weighted formula with an AST hallucination check as a gate. The output format is identical to LogoMesh-self — a JSON dict in the A2A response body. Once Cluster B is built for LogoMesh-self, text-2-sql is covered by the same adapter with zero additional infrastructure cost. **Expected score: 85. Implementation cost: 0 additional units (same Cluster B).**

### 3. RCAbench (Cybersecurity — 1st Place)

The Green Agent sends a vulnerability report (`arvo:ID`), the Purple Agent must localize the root cause by writing a `loc.json` file to a shared workspace. Scoring is pure IoU — deterministic overlap between predicted and true file/function/line ranges. This is the only repo that requires the agent to write to the filesystem (Cluster A), but the reasoning capability (MCTS-based vulnerability analysis) already exists in LogoMesh's Red Agent. **Expected score: 70. Implementation cost: 2 units (new Cluster A adapter).**

### 4. Pi-Bench (Agent Safety — 1st Place)

The Green Agent sends a policy compliance scenario. The Purple Agent must produce a structured execution trace and verdict. Scoring measures violation rate across 9 policy columns — fully deterministic, no LLM judge. The key challenge here is building policy-reasoning capability that LogoMesh doesn't currently have. The output format is Cluster F (structured text). **Expected score: 55. Implementation cost: 2 units (new Cluster F adapter + policy reasoning).**

### 5. NetArena (Coding Agent — 1st Place) — Floor Attempt

The Green Agent is a live Kubernetes cluster running Google Online Boutique microservices. The Purple Agent must issue real `kubectl` commands to debug network policy misconfigurations. Scoring is binary — either all pod connectivity checks pass or they don't.

**This repo has the highest infrastructure barrier of the entire competition.** A live K8s cluster is required before any scoring is possible at all. The full implementation would require a dedicated cluster, 5 implementation units, and significant DevOps effort. The expected score at full implementation is only 40 — the lowest ceiling of any mandatory Sprint 3 repo.

**Decision: accept a floor score (~20–25 points) by submitting correct kubectl reasoning without a live cluster.** Pi-Bench's policy reasoning and MCTS diagnostics give us enough to produce plausible diagnostic output. The floor score from reasoning-quality credit is achievable without infrastructure. Full implementation costs more in effort than it returns in points.

---

## The Sprint 3 Additional Repos

Two more Sprint 3 repos are high-priority even though they aren't first-place mandatory:

### AVER (Agent Safety — 3rd Place)

AVER sends tasks where code has been deliberately corrupted (hallucination, tool misuse, adversarial injection). The Purple Agent must detect the error class, diagnose the root cause, and produce corrected output. Scoring is three-dimensional: Detection 40%, Diagnosis 20%, Recovery 40%, with a turn-order multiplier rewarding pre-execution detection.

AVER is the anchor for **Cluster C (multi-turn tool calls)**. Building AVER's detect→diagnose→act loop directly enables CAR-bench as a sprint 2 target. **Expected score: 80. Implementation cost: 2 units (new Cluster C adapter).**

### AgentSWE (Software Testing — 2nd Place)

Standard SWE-bench Verified tasks in three modes: bash (read-only exploration), debug (test hypotheses), patch (submit git diff). Scoring is pass@1 resolution rate plus token efficiency. This is adjacent to LogoMesh's core software testing capability and shares the Cluster B JSON response adapter. **Expected score: 65. Implementation cost: 0 additional units (same Cluster B).**

### ICU-Later (Healthcare — 1st Place) — Floor Attempt

The Green Agent is a FHIR server loaded with MIMIC-IV clinical data. The Purple Agent must answer 1,521 clinical questions using FHIR API calls, with LLM semantic scoring. Like NetArena, this requires specialized infrastructure (FHIR server + MIMIC-IV data license + FDA drug label API). Unlike NetArena, there is also a deep domain knowledge barrier — FHIR resource structure and clinical data formats are specialized.

**Decision: accept a floor score (~20 points) using FHIR reasoning without a live server.** The LLM semantic matching means that well-reasoned answers can score partial credit even without perfect API execution. Full implementation is not worth the combined infrastructure + domain cost. **Expected score: 20 (floor). Implementation cost: 2 units (floor attempt only).**

---

## The Sprint 2 Selection

With the Sprint 3 adapter set defined (B, A, C, F, E-floor), the Sprint 2 selection problem becomes: **which Sprint 2 first-place repos can reuse adapters we are already building, for the least additional cost?**

The answer is three repos, each costing approximately 1 unit delta on top of work already planned for Sprint 3:

---

### MateFin (Web Agent — 1st Tie)

**What it is:** A trade data benchmark where the Purple Agent must fetch paginated international trade records from a mock HTTP service, handle 429 rate limits and 500 errors gracefully, filter "totals trap" rows (`isTotal=true`), deduplicate records, and write three output files.

**Why it was selected:** MateFin uses Cluster A — it writes files to a shared filesystem path. RCAbench (mandatory Sprint 3) already requires building this file-write adapter. The only delta is that MateFin writes *three* files instead of one (data.jsonl, metadata.json, run.log) and adds HTTP client logic for pagination and retry.

**The adapter reuse logic:** Once the Cluster A adapter exists for RCAbench, MateFin adds:
- A 3-file output schema (instead of `loc.json`)
- An HTTP client with exponential backoff (1s/2s/4s, max 3 retries)
- Totals-trap row filter (`isTotal=true AND partner=WLD AND hs=TOTAL`)
- Deduplication by `[year, reporter, partner, flow, hs, record_id]`

None of these require new infrastructure. The mock HTTP service runs locally. Scoring is fully deterministic (6 axes: correctness, completeness, observability, efficiency, robustness, code quality). No LLM judge variance.

**Selection confidence: HIGH.** Deterministic scoring + adapter reuse + offline mock service = the most predictable ROI addition in the entire Sprint 2 set.

**Expected score: 70. Additional implementation cost: 1 unit.**

---

### CAR-bench (Computer Use — 1st Place)

**What it is:** An in-car AI assistant benchmark with 58 navigation tools, 48 cities, 130K POIs, and 1.7M routes. The Purple Agent must handle three task types: base (normal assistant requests), hallucination (requests for unsupported features → must acknowledge limitation, never fabricate), and disambiguation (underspecified requests → must ask for clarification, never act).

**Why it was selected:** CAR-bench uses Cluster C — multi-turn tool calls injected dynamically via DataPart. AVER (mandatory Sprint 3) already requires building this multi-turn tool-call adapter. The only delta is task-type detection logic for the three CAR-bench task types.

**The adapter reuse logic:** Once the Cluster C adapter exists for AVER (detect→diagnose→act loop with `<json>` tool call serialization), CAR-bench adds:
- Task-type detection from the initial system prompt
- Hallucination handler: acknowledge limitation, do NOT call any tool
- Disambiguation handler: produce a clarifying question DataPart, do NOT act
- Pass-through to tool execution for base tasks

The critical rule: CAR-bench scoring has a **binary cliff at reward ≥ 0.99**. There is no partial credit — either the agent passes (reward ≥ 0.99) or it fails (0). This means correctness on task-type detection is the entire score. Getting hallucination and disambiguation tasks right (the two "don't do anything" cases) is often easier than executing base tasks perfectly.

**Selection confidence: HIGH.** Adapter reuse is clean, task-type detection is learnable from the task description, and the binary scoring means a focused implementation is competitive.

**Expected score: 55. Additional implementation cost: 1 unit.**

---

### MIDS4LIFE (Research Agent — 1st Tie)

**What it is:** A computational reproducibility benchmark where the Purple Agent receives a CodeOcean capsule (research paper + code + data bundle) and must answer specific questions about the results. Tasks are at three difficulty levels — Easy, Medium, and Hard — with fundamentally different required behaviors at each level.

**Why it was selected:** MIDS4LIFE uses Cluster F — structured text output (an answer dict). Pi-Bench (mandatory Sprint 3) already requires building this text-plan adapter. MIDS4LIFE adds domain-mode detection for the three difficulty levels.

**The adapter reuse logic:** Once the Cluster F adapter exists for Pi-Bench (policy trace + verdict structure), MIDS4LIFE adds:
- Difficulty detection (Easy/Medium/Hard) from the capsule structure before any tool calls
- Easy mode: read existing `results/` files only — never execute scripts
- Medium mode: read documentation first (`inspect_file_as_text`), then execute scripts
- Hard mode: identify the correct entry point and execute — never read `results/` first
- Output: `{"question_key_1": value, "question_key_2": value, ...}` dict

The **difficulty-mode detection is the most critical rule in this entire benchmark.** Acting as Hard mode in Easy mode incurs a −0.7 penalty. The penalty is not for wrong answers — it is for using the wrong *process*. The difficulty level is determinable from the capsule structure before making any tool calls.

**Selection confidence: MEDIUM.** The task files are GPG-encrypted (discovery happens at runtime), and the actual question keys are not publicly available. However, the planning structure and tool set are documented in `planning_prompts.yaml` and the MCP server, giving enough to build a competitive implementation.

**Expected score: 45. Additional implementation cost: 1 unit.**

---

## Excluded Sprint 2 Repos

Three Sprint 2 first-place repos were analyzed and excluded:

**Webshop Plus (Web Agent):** Would require building Cluster D — stateful session management with full action history. This is net-new capability (no adapter reuse from Sprint 3 work). Implementation cost: 3 units for a ceiling of 55. ROI of 18 points/unit vs. CAR-bench at 55 points/unit.

**HEP-ExpAgents (Research Agent):** Requires ROOT framework, HEP physics domain knowledge, and analysis of particle physics observables. The hard gate in scoring (`gate=True` in `checks.py`) requires physically correct Z boson mass reconstruction before any other scoring is attempted. Domain barrier is prohibitively high. Expected score ceiling: 20.

**MAizeBargAIn (Multi-Agent):** Type IV game-theoretic scoring using Maximum Entropy Nash Equilibrium. The Purple Agent must participate in live multi-round bargaining against Nash-optimal baseline strategies. No existing bargaining or game-theoretic capability in LogoMesh. Implementation cost: 5 units. Expected ceiling: 25.

---

## The Build Sequence

Ordered by: sprint window first, then adapter reuse leverage, then score ROI.

| Step | What to build | Repos unblocked | Sprint window |
|:-----|:--------------|:----------------|:-------------|
| **1** | Adapter B — JSON response handler | text-2-sql, LogoMesh-self, AgentSWE | Sprint 2 launch (~Apr 12) |
| **2** | Adapter A delta — MateFin 3-file schema + HTTP client | MateFin | Sprint 2 |
| **3** | Adapter C — AVER multi-turn tool-call loop | AVER | Sprint 2/3 |
| **4** | Adapter C delta — CAR-bench task-type detection | CAR-bench | Sprint 2 |
| **5** | Adapter F — Pi-Bench policy trace + verdict | Pi-Bench | Sprint 3 |
| **6** | Adapter F delta — MIDS4LIFE domain-mode detection | MIDS4LIFE | Sprint 2 |
| **7** | Adapter E floor — NetArena kubectl reasoning | NetArena | Sprint 3 |
| **8** | Adapter E floor — ICU-Later FHIR reasoning | ICU-Later | Sprint 3 |

**Steps 1–4** are all Sprint 2 window work (opens ~April 12). The goal is to maximize Sprint 2 score before Sprint 3 opens.

**Steps 5–6** bridge Sprint 2 and Sprint 3. Pi-Bench and MIDS4LIFE share an adapter — building Pi-Bench's Cluster F immediately enables MIDS4LIFE with only a mode-detection layer.

**Steps 7–8** are floor attempts. If K8s or FHIR infrastructure becomes available before the Sprint 3 window closes, elevate from floor to full implementation. Otherwise, accept the floor score and move on.

---

## Expected Score Summary

| Repo | Sprint | Adapter | Expected score | Confidence |
|:-----|:-------|:--------|:--------------|:-----------|
| text-2-sql | 3 | B | 85 | High |
| LogoMesh (self) | 3 | B | 85 | High |
| AVER | 3 | C | 80 | High |
| RCAbench | 3 | A | 70 | High |
| MateFin | 2 | A delta | 70 | High |
| AgentSWE | 3 | B | 65 | Medium |
| CAR-bench | 2 | C delta | 55 | Medium |
| Pi-Bench | 3 | F | 55 | Medium |
| MIDS4LIFE | 2 | F delta | 45 | Medium |
| NetArena | 3 | E floor | 25 | Low |
| ICU-Later | 3 | E floor | 20 | Low |
| **Total** | | | **655** | |

The high-confidence repos (text-2-sql, LogoMesh, AVER, RCAbench, MateFin) represent ~390 points with a combined implementation cost of ~6 units — 65 points per unit. These are the foundation.

The medium-confidence repos (AgentSWE, CAR-bench, Pi-Bench, MIDS4LIFE) add ~220 points for ~5 implementation units — 44 points per unit.

The floor repos (NetArena, ICU-Later) contribute ~45 points for ~4 units — but these are mandatory Sprint 3 repos. The cost is unavoidable; the strategy is to minimize it by accepting a floor score rather than building full infrastructure.

---

## Why This Is the Dominant Strategy

Three alternative paths were simulated:

**Branch 1 — Build K8s + FHIR infrastructure fully:** Focuses 10 implementation units on NetArena and ICU-Later at full build. Expected score contribution from these two repos: 70 points. ROI: 7 points/unit. Opportunity cost: not building any of the other adapters.

**Branch 3 — Minimal viable (Sprint 3 mandatory only, skip Sprint 2):** Highest efficiency on a per-unit basis (90 points/unit) but leaves the entire Sprint 2 window empty. Forgoes roughly 170 points by not adding MateFin, CAR-bench, and MIDS4LIFE.

**Selected path (Branch 2 Extended):** ~47 points/unit across the full competition window. Balances Sprint 2 participation with Sprint 3 readiness. The three Sprint 2 additions (MateFin + CAR-bench + MIDS4LIFE) cost a combined 3 units and contribute ~170 expected points. All three reuse adapters being built for mandatory Sprint 3 repos.

The selected path is dominant because the adapter reuse leverage means each Sprint 2 addition is priced at marginal cost, not full build cost. MateFin is 1 unit *after* RCAbench. CAR-bench is 1 unit *after* AVER. MIDS4LIFE is 1 unit *after* Pi-Bench. Without the mandatory Sprint 3 build, these additions would cost 2–3 units each. With it, they cost 1.
