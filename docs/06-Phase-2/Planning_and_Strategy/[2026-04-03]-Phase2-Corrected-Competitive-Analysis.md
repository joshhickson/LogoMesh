---
status: ACTIVE
type: Research
---
> **Context:**
> *   [2026-04-03]: Corrected Phase 2 competitive analysis based on the verified official roster from rdi.berkeley.edu/agentx-agentbeats.html. Supersedes [2026-04-01]-Sprint2-Sprint3-Competitive-Analysis.md, which was built from an outdated repo list collected before the Phase 2 roster was finalized. Sprint 2 ends April 12; Sprint 3 opens April 13.

# Phase 2 Competitive Analysis — Corrected Roster

## 1. Overview

This document synthesizes findings from Pass 1–3 analysis of all confirmed Phase 2 Green Agent repos across AgentBeats Phase 2 Sprints 2 and 3. It replaces the original first-pass analysis ([2026-04-01]) which targeted repos not in the official Phase 2 roster. Findings are organized from emergent cross-repo patterns down to track-specific analysis and a prioritized action recommendation.

**What changed:** The official Phase 2 Sprint 2 roster was updated before our original analysis was collected. MateFin, MIDS4LIFE, Webshop Plus, HEP-ExpAgents, NetHeal, and Reviewer Two are not in Phase 2. The Software Testing track (LogoMesh-self, AgentSWE) and Healthcare track (ICU-Later) are not in Phase 2. The corrected Sprint 2 roster introduced three new repos we had not analyzed: τ²-Bench, MLE-Bench, OSWorld-Verified. A fourth new candidate, Terminal-Bench 2.0, was discovered via the AgentBeats dashboard activity log.

**Primary question:** Given the corrected roster, which repos give LogoMesh's Purple Agent the best score-per-implementation-unit, and in what order should adapters be built?

**Coverage:** 12 confirmed Phase 2 repos analyzed (6 Sprint 2, 5 Sprint 3, 1 Sprint 3 potential). 4 repos excluded on infrastructure or domain grounds.

---

## 2. Universal Cross-Repo Patterns

These patterns appear in 80%+ of repos and define the structural landscape of Phase 2.

### P1 — A2A Protocol is 100% Consistent
Every repo uses the A2A (Agent-to-Agent) JSON-RPC protocol. Green sends `message/send` to Purple; Purple returns structured output. The `/.well-known/agent-card.json` endpoint is standard for platform registration. **Implication:** A single robust A2A wrapper is sufficient for all tracks — no custom protocol per benchmark.

### P2 — `uv` + AgentBeats SDK is the Standard Stack
Nearly every repo uses:
- `uv sync` for dependency management
- `uv run agentbeats-run scenarios/xxx/scenario.toml` as the runner
- Docker on port 9009 for the Green Agent

**Implication:** LogoMesh already conforms to this stack. No tooling changes needed.

### P3 — Scoring Architecture Falls Into 4 Types

| Type | Pattern | Confirmed Repos |
|:-----|:--------|:----------------|
| **I — Pure Deterministic** | No LLM in scoring loop; test scripts or IoU checks only | Pi-Bench, RCAbench, CAR-bench, Terminal-Bench 2.0 |
| **II — Deterministic Gates + LLM Quality** | Binary gate first; LLM scores the remainder | text-2-sql, MIDS4LIFE (not in Phase 2) |
| **III — Multi-Dimensional Weighted** | 3–7 explicitly weighted axes, mix of LLM + deterministic | AVER, NetArena, ICU-Later (not in Phase 2) |
| **IV — Game-Theoretic / Emergent** | Nash equilibrium or LLM judge as primary signal | MAizeBargAIn, τ²-Bench (pass rate + LLM user) |

**Implication:** Type I is most predictable and highest ROI. Type IV has highest variance. The corrected Sprint 2 roster is skewed toward Type IV and infrastructure-heavy repos, making CAR-bench and τ²-Bench the only tractable Sprint 2 targets.

### P4 — Anti-Gaming Gates in ~40% of Repos
- **text-2-sql:** AST hallucination detection before SQL execution; phantom tables/columns fail before quality scoring
- **CAR-bench:** Binary cliff at reward ≥ 0.99 — no partial credit below threshold
- **RCAbench:** IoU scoring penalizes imprecise localization at each granularity level

**Implication:** Schema-valid, syntactically correct output clears gate stages automatically. Output formatting errors are penalized multiplicatively.

### P5 — "Reasoning Quality" Boosts Score in Type II/III Repos
Every repo with an LLM quality layer rewards structured, well-explained outputs:
- AVER: Recovery dimension (40%) rewards corrected output with explanation
- text-2-sql: Plan quality (5%) and best practices (5%) reward annotated reasoning
- τ²-Bench: Policy-following trace is evaluated alongside task completion

**Implication:** Generating verbose, well-structured chain-of-thought alongside primary output costs nothing and boosts score across all Type II/III benchmarks.

### P6 — Infrastructure Barrier Is the Primary Exclusion Factor
The corrected Sprint 2 roster introduced three repos with prohibitive infrastructure requirements:
- **MLE-Bench:** 36 vCPUs, 440GB RAM, A10 GPU, 24h runtime — impossible without dedicated ML compute
- **OSWorld-Verified:** Real VM (VMware/VirtualBox/AWS) + screenshot vision required — no text protocol
- **FieldWorkArena:** Video analytics + HuggingFace dataset approval + proprietary scoring binary

**Implication:** Infrastructure barrier scoring (1–5) is the first filter applied to any new repo. Repos scoring 4–5 on infrastructure are immediate EXCLUDEs unless LogoMesh gains specific capability.

### P7 — Dual-Control Is a New Pattern in Sprint 2
τ²-Bench introduces **dual-control environments** where both the agent AND a simulated user can take actions in the shared backend. This is architecturally distinct from single-agent tool use (CAR-bench, AVER) and requires the Purple Agent to track what the user has already done before issuing its own tool calls.

**Implication:** Dual-control is more complex than single-control multi-turn. CAR-bench (single-control) should be built before τ²-Bench to establish the Cluster C adapter before adding dual-control complexity.

---

## 3. Sprint 3 Track Analysis

Sprint 3 opens April 13, 2026. Tracks are tentative: **Agent Safety, Coding Agent, Cybersecurity Agent.** Healthcare is NOT listed.

### 3.1 Cybersecurity Agent Track

| Repo | Place | Scoring Type | Output Format | Infrastructure | LogoMesh fit |
|:-----|:------|:-------------|:--------------|:--------------|:-------------|
| RCAbench | 1st | Type I (IoU) | `loc.json` file write | Docker (vulnerable code containers) | HIGH |

**RCAbench Deep Dive:**
- Purple Agent receives: ARVO vulnerability ID + fuzzer crash report
- Purple Agent must produce: `loc.json` with `{file_path, function_name, line_numbers}` written to shared workspace
- Scoring: Pure IoU at file-level, function-level, line-level — deterministic, no LLM judge
- Key constraint: Detective work, not code generation. Agent must localize WHERE the bug is, not fix it
- **LogoMesh advantage:** MCTS Red Agent already reasons over code for vulnerability hunting using UCB1. The reasoning architecture transfers directly; only the file-write output format (Cluster A) is new.
- **Expected score: 70. Implementation cost: 2 units.**

### 3.2 Agent Safety Track

| Repo | Place | Scoring Type | Output Format | Infrastructure | LogoMesh fit |
|:-----|:------|:-------------|:--------------|:--------------|:-------------|
| Pi-Bench | 1st | Type I (violation rate) | Execution trace + policy verdict | Local Docker | MEDIUM |
| NAAMSE | 2nd | Type II (adversarial robustness) | Pass/fail on adversarial prompts | Local | LOW |
| AVER | 3rd | Type III (Detection/Diagnosis/Recovery) | Multi-turn tool calls | Local code execution | HIGH |

**Pi-Bench Deep Dive:**
- Purple Agent receives: Policy compliance scenario requiring tool execution
- Purple Agent must produce: Structured execution trace with policy citations; `AMBIGUOUS_POLICY`/`AMBIGUOUS_STATE` are valid verdicts
- Scoring: Violation rate across 9 columns (Compliance, Understanding, Robustness, Process, Restraint, Conflict Resolution, Detection, Explainability, Adaptation) — fully deterministic
- **Key rule:** `AMBIGUOUS_POLICY` is a valid output when the policy is genuinely unclear. Forcing binary when policy doesn't apply is penalized.
- **LogoMesh gap:** Policy compliance reasoning is genuinely new. No existing compliance trace capability.
- **Expected score: 55. Implementation cost: 2 units (Cluster F — new adapter).**

**AVER Deep Dive:**
- Purple Agent receives: Code with a deliberate error (hallucination, validation failure, tool misuse, context loss, or adversarial injection)
- Purple Agent must produce: Error class detection → root cause diagnosis → corrected output (multi-turn)
- Scoring: Detection 40% + Diagnosis 20% + Recovery 40%; turn-order multiplier rewards pre-execution detection
- **Critical insight:** Detecting error type BEFORE attempting any tool execution scores higher than detecting it after failure. First response should always be error classification.
- **LogoMesh advantage:** Iterative refinement loop (iterative feedback + re-evaluation) maps directly to AVER's Recovery dimension (40%). Error detection and classification are new but learnable.
- **Cluster C anchor:** Building AVER's detect→diagnose→act loop directly enables CAR-bench (Sprint 2) and τ²-Bench (Sprint 2) via the same adapter.
- **Expected score: 80. Implementation cost: 2 units (Cluster C — anchor).**

### 3.3 Coding Agent Track

| Repo | Place | Scoring Type | Output Format | Infrastructure | LogoMesh fit |
|:-----|:------|:-------------|:--------------|:--------------|:-------------|
| NetArena | 1st | Type III (binary K8s connectivity) | kubectl commands | Live K8s cluster required | LOW (floor) |
| text-2-sql | 2nd | Type II (7-dimension weighted) | JSON SQL response | Mock SQL engine | HIGH |
| Terminal-Bench 2.0 | Unknown | Type I (binary test scripts) | Text commands in Docker | Docker only | HIGH (unconfirmed) |

**NetArena Deep Dive:**
- Purple Agent receives: K8s network topology with misconfigured NetworkPolicy objects
- Purple Agent must produce: kubectl commands to fix connectivity across 3 sub-apps (k8s/malt/route)
- Scoring: Binary all-match gate — either all pod connectivity checks pass or they fail
- Infrastructure barrier: LIVE K8s cluster required for any real score. Published at ICLR 2026.
- **Floor strategy:** Full K8s build costs 5 units for 40-point ceiling (8 pts/unit). Floor attempt (MCTS diagnostic reasoning + correct kubectl sequences without execution) costs 2 units for ~20 points (10 pts/unit). Accept the floor.
- **Expected score: 20 (floor). Implementation cost: 2 units.**

**text-2-sql Deep Dive:**
- Purple Agent receives: `{task_id, question, schema, dialect}` via A2A
- Purple Agent must produce: `{"sql": "...", "explanation": "..."}` in A2A response body
- Scoring: 7 dimensions — Correctness 35% + Safety 20% (no phantom tables) + Efficiency 15% + Completeness 10% + Semantic Accuracy 10% + Best Practices 5% + Plan Quality 5%
- **Critical gate:** AST hallucination check runs BEFORE any quality scoring. Phantom tables/columns cause immediate failure.
- **LogoMesh advantage:** AST static analysis background maps directly to the safety/hallucination axis. SQL is structured output — highly predictable scoring.
- **Highest ROI in the competition:** 85 expected points for 1 implementation unit (Cluster B — JSON response).
- **Expected score: 85. Implementation cost: 1 unit.**

**Terminal-Bench 2.0 Deep Dive (Pass 1 — sprint assignment unconfirmed):**
- Purple Agent receives: English instruction describing a terminal task
- Purple Agent must produce: Shell commands executed in a Docker container; test script validates final state
- Scoring: Binary pass/fail per task (~100 tasks in v0.1.1) — no LLM judge
- Infrastructure: Docker only (`tb` CLI harness). Same environment as LogoMesh's code sandbox.
- **LogoMesh advantage:** Highest overlap of any new discovery. Docker execution, code generation, filesystem interaction — all existing capabilities.
- **Action required:** Confirm sprint assignment when Sprint 3 roster is announced. Do Pass 2+3 immediately.
- **Expected score: 70 (if confirmed). Implementation cost: 1–2 units (Cluster B extension).**

---

## 4. Sprint 2 Analysis

Sprint 2 runs March 23 – April 12, 2026. Six confirmed repos across four tracks.

### 4.1 Computer Use / Web Agent Track

| Repo | Scoring Type | Output Format | Infrastructure | LogoMesh fit | Verdict |
|:-----|:-------------|:--------------|:--------------|:-------------|:--------|
| CAR-bench | Type I (binary, ≥0.99) | Multi-turn tool calls | Local mock | MEDIUM-HIGH | **INCLUDE** |
| OSWorld-Verified | Type I (success rate) | GUI actions from screenshots | Live VM required | VERY LOW | EXCLUDE |

**CAR-bench:** In-car AI assistant with 58 navigation tools, 130K POIs, 1.7M routes. Three task types: base (execute), hallucination (acknowledge limitation, do NOT act), disambiguation (ask clarifying question, do NOT act). Binary cliff at reward ≥ 0.99. Task type is determinable from system prompt before any tool call — getting the "do nothing" task types right (hallucination + disambiguation) is often the key to scoring. **Expected score: 55. Cost: 1 unit (Cluster C delta from AVER).**

**OSWorld-Verified:** 369 GUI tasks across Ubuntu/Windows/macOS. Requires real VM + screenshot input. LogoMesh has no vision capability. **EXCLUDE.**

### 4.2 Multi-Agent Evaluation Track

| Repo | Scoring Type | Output Format | Infrastructure | LogoMesh fit | Verdict |
|:-----|:-------------|:--------------|:--------------|:-------------|:--------|
| MAizeBargAIn | Type IV (MENE regret + welfare) | Bargaining moves | Local | VERY LOW | EXCLUDE |

**MAizeBargAIn:** Multi-round bargaining with Nash-optimal opponents. Scoring uses Maximum Entropy Nash Equilibrium (MENE) regret plus welfare metrics. 5 implementation units for ~25 point ceiling. **EXCLUDE.**

### 4.3 τ²-Bench Track (Featured — Sierra AI Partnership)

| Repo | Scoring Type | Output Format | Infrastructure | LogoMesh fit | Verdict |
|:-----|:-------------|:--------------|:--------------|:-------------|:--------|
| τ²-Bench | Type I/II (pass rate + LLM user) | Multi-turn tool calls | Simulated APIs | MEDIUM | **INCLUDE (secondary)** |

**τ²-Bench:** Customer service benchmark across airline, retail, and telecom domains with simulated user. Dual-control: both agent AND user can take actions in shared backend. Policy following is mandatory — violations cause task failure, not a score penalty. Cash prizes: $2,500/$1,500/$1,000 from Sierra AI. Same Cluster C adapter as AVER and CAR-bench. **Expected score: 45. Cost: 2 units (Cluster C delta from CAR-bench, dual-control tracking required).**

### 4.4 Research Agent Track

| Repo | Scoring Type | Output Format | Infrastructure | LogoMesh fit | Verdict |
|:-----|:-------------|:--------------|:--------------|:-------------|:--------|
| FieldWorkArena | Unknown | Unknown | Video + HuggingFace approval | VERY LOW | EXCLUDE |
| MLE-Bench | Type I (medal %) | CSV prediction files | 36 vCPU + 440GB RAM + A10 GPU | VERY LOW | EXCLUDE |

**FieldWorkArena:** Video analytics in industrial environments. Scoring formula not public (requires HuggingFace dataset approval). No video capability in LogoMesh. **EXCLUDE.**

**MLE-Bench:** 75 Kaggle ML competitions. Requires 24-hour evaluation runs on server-grade hardware including an A10 GPU. Agents must execute actual ML training. **EXCLUDE** — infrastructure impossibility, not a difficulty barrier.

---

## 5. Track Priority Ranking

Ranked by: LogoMesh architectural alignment × scoring predictability × infrastructure barrier inverse × ROI (pts/unit).

| Priority | Track | Repo | Sprint | Rationale |
|:---------|:------|:-----|:-------|:----------|
| **1 — Highest** | Coding Agent | text-2-sql | 3 | 85 pts / 1 unit; Cluster B; AST analysis reuses; highest ROI |
| **2 — Very High** | Agent Safety | AVER | 3 | 80 pts / 2 units; Cluster C anchor; enables 2 Sprint 2 repos |
| **3 — High** | Cybersecurity | RCAbench | 3 | 70 pts / 2 units; MCTS reasoning reuses; deterministic scoring |
| **4 — High** | Coding Agent | Terminal-Bench 2.0 | 3 (TBD) | 70 pts / 1–2 units; Docker sandbox overlap; confirm sprint first |
| **5 — High** | Computer Use | CAR-bench | 2 | 55 pts / 1 unit; Cluster C delta from AVER; **must submit by April 12** |
| **6 — Medium** | Agent Safety | Pi-Bench | 3 | 55 pts / 2 units; Cluster F; deterministic but new domain |
| **7 — Medium** | τ²-Bench | τ²-Bench | 2 | 45 pts / 2 units; Cluster C delta; dual-control adds complexity |
| **8 — Low** | Coding Agent | NetArena | 3 | 20 pts / 2 units (floor); K8s barrier; mandatory first-place target |
| **—** | Multi-Agent | MAizeBargAIn | 2 | EXCLUDE: game-theoretic; 5 units / 25 pts |
| **—** | Research | MLE-Bench | 2 | EXCLUDE: GPU cluster required |
| **—** | Computer Use | OSWorld-Verified | 2 | EXCLUDE: VM + vision required |
| **—** | Research | FieldWorkArena | 2 | EXCLUDE: video analytics + unknown scoring |

---

## 6. Generalization Strategy Recommendations

### R1 — Build Adapters by Cluster, Not by Repo
The A2A protocol is identical across every benchmark. What varies is the output schema. Build five output adapters that cover all targeted repos:
- **Cluster B** (JSON response): text-2-sql, Terminal-Bench 2.0
- **Cluster C** (multi-turn tool calls): AVER, CAR-bench, τ²-Bench
- **Cluster A** (file write): RCAbench
- **Cluster F** (policy trace): Pi-Bench
- **Cluster E floor** (reasoning without live infra): NetArena

Each cluster built once covers all repos in that cluster. Sprint 2 additions (CAR-bench, τ²-Bench) are marginal-cost additions to mandatory Sprint 3 adapter work.

### R2 — Build Sequence: Cluster B First, Cluster C Second
text-2-sql (Cluster B) has the highest ROI in the competition (85 pts / 1 unit). Build it first. Building AVER (Cluster C) second immediately enables CAR-bench — which must be submitted before April 12. Sequencing Cluster C before April 12 is time-critical.

**Build order:** B → C (AVER) → C-delta (CAR-bench) → A (RCAbench) → F (Pi-Bench) → E floor (NetArena) → C-delta (τ²-Bench, if time)

### R3 — Verbose Reasoning Is Universally Additive
AVER's Recovery dimension (40% of score), text-2-sql's plan quality (5%), and τ²-Bench's policy trace all reward structured chain-of-thought alongside the primary output. Adding verbose reasoning to every response is a zero-cost optimization that lifts all Type II/III scores.

### R4 — Schema-First Output Generation
Repos with AST/schema validation gates (text-2-sql, RCAbench) penalize outputs that violate the schema BEFORE any quality scoring occurs. Validate output structure against the provided schema before every submission. A phantom table name in SQL causes total failure before the 7-dimension scoring even runs.

### R5 — Task-Type Detection Before Any Tool Call
CAR-bench (task types: base/hallucination/disambiguation) and τ²-Bench (policy modes per domain) both require knowing the task type before issuing any tool call. The task type is determinable from the initial system prompt or task description. Making a wrong tool call because the agent didn't classify the task type first is the most common failure mode on Type I benchmarks with task routing.

---

## 7. Data Gaps and Next Steps

### Known Gaps

- **Sprint 3 roster is tentative.** Agent Safety, Coding Agent, Cybersecurity tracks confirmed; specific repos are based on Phase 1 first-place results. Roster may be updated before April 13.
- **Terminal-Bench 2.0 sprint assignment unconfirmed.** Found via AgentBeats dashboard activity log. Pass 2+3 not yet completed. Do not build until sprint assignment is verified.
- **AgentProbe** (`ymiled/agentprobe`) appeared in AgentBeats activity log with unknown sprint and track assignment. Could be Cybersecurity or Agent Safety.
- **τ²-Bench Pass 3 incomplete.** Task input schema for the three domain tool APIs (airline/retail/telecom) was not fully extracted. Required before starting dual-control implementation.
- **NetArena KinD assessment pending.** If a Kubernetes-in-Docker cluster is feasible within LogoMesh's existing infrastructure, the floor strategy for NetArena should be elevated to a full build (ceiling: 40 vs. 20 for floor).

### Recommended Next Passes

1. **Immediate (before April 12):** Build Cluster B adapter → submit to text-2-sql baseline. Build Cluster C adapter → submit CAR-bench to Sprint 2 leaderboard.
2. **Sprint 3 roster announcement (~mid-April):** Confirm Terminal-Bench 2.0 and do Pass 2+3. Confirm whether NAAMSE or AgentProbe are in scope.
3. **Sprint 3 window (April 13 – May 3):** Complete Cluster A (RCAbench), Cluster F (Pi-Bench), Cluster E floor (NetArena).
4. **τ²-Bench:** Complete Pass 3 (tool schemas for all three domains) before starting dual-control implementation.

---

## 8. Repo Inventory

| Sprint | Track | Repo | GitHub | Analysis | Phase 2 status |
|:-------|:------|:-----|:-------|:---------|:---------------|
| S3 | Cybersecurity | RCAbench | JianhongTu/RCAbench (branch: simplify-mini-swe-agent-setup) | Pass 1+2+3 ✅ | ✅ Active target |
| S3 | Agent Safety | Pi-Bench | Jyoti-Ranjan-Das845/pi-bench | Pass 1+2 ✅ | ✅ Active target |
| S3 | Agent Safety | NAAMSE | HASHIRU-AI/NAAMSE | Pass 1 ✅ | Possible |
| S3 | Agent Safety | AVER | weelzo/aver-green-agent | Pass 1+2+3 ✅ | ✅ Active target |
| S3 | Coding Agent | NetArena | Froot-NetSys/NetPress (branch: a2a-agentx) | Pass 1+2 ✅ | ✅ Active target (floor) |
| S3 | Coding Agent | text-2-sql | ashcastelinocs124/text-2-sql-agent | Pass 1+2+3 ✅ | ✅ Active target |
| S3 | Coding Agent | Terminal-Bench 2.0 | jngan00/terminal-bench-2-0-green-agent | Pass 1 ⚠️ | ⚠️ Confirm sprint first |
| S3 | Coding Agent | AgentProbe | ymiled/agentprobe | Not analyzed | ⚠️ Track unknown |
| S2 | Computer Use / Web | CAR-bench | CAR-bench/car-bench-agentbeats | Pass 1+2+3 ✅ | ✅ Active target |
| S2 | Computer Use / Web | OSWorld-Verified | RDI-Foundation/osworld-green | Pass 1 ✅ | ❌ Excluded (VM + vision) |
| S2 | τ²-Bench | τ²-Bench | RDI-Foundation/tau2-agentbeats | Pass 1+2 ✅ | ✅ Active target (secondary) |
| S2 | Multi-Agent | MAizeBargAIn | gsmithline/tutorial-agent-beats-comp | Pass 1+2 ✅ | ❌ Excluded (game-theoretic) |
| S2 | Research Agent | MLE-Bench | RDI-Foundation/mle-bench-green | Pass 1 ✅ | ❌ Excluded (GPU required) |
| S2 | Research Agent | FieldWorkArena | ast-fri/FieldWorkArena-GreenAgent | Pass 1+2 ✅ | ❌ Excluded (video domain) |

**Phase 1 repos NOT in Phase 2 (previously targeted in error):**

| Repo | Why not in Phase 2 |
|:-----|:------------------|
| LogoMesh-self | Software Testing track not in Phase 2 |
| AgentSWE | Software Testing track not in Phase 2 |
| ICU-Later | Healthcare track not in Sprint 3 |
| MateFin | Not in official Sprint 2 roster |
| MIDS4LIFE | Not in official Sprint 2 roster |
| Webshop Plus | Not in official Sprint 2 roster |
| HEP-ExpAgents | Not in official Sprint 2 roster |
| NetHeal | Not in official Sprint 2 roster |
| Reviewer Two | Not in official Sprint 2 roster |
