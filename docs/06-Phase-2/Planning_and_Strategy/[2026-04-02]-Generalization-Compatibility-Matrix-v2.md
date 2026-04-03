> **Status:** ACTIVE
> **Type:** Research
> **Context:**
> *   [2026-04-02]: Corrected compatibility matrix based on the verified Phase 2 roster. Supersedes [2026-04-02]-Generalization-Compatibility-Matrix.md which was built from the wrong Sprint 2 repo list.
> **Supersedes:** [[2026-04-02]-Generalization-Compatibility-Matrix.md]([2026-04-02]-Generalization-Compatibility-Matrix.md)
> **See Also:**
> *   [Sprint 2 New Repos Analysis]([2026-04-02]-Sprint2-New-Repos-Analysis.md)
> *   [Sprint 4 Initial Analysis]([2026-04-02]-Sprint4-Initial-Analysis.md)
> *   [Optimal Path Synthesis v2]([2026-04-02]-Optimal-Path-Synthesis-v2.md)

# Generalization Compatibility Matrix v2

## Scoring Axes

Each repo is scored 1–5 on eight axes:

| Axis | 1 | 5 |
|:-----|:--|:--|
| **Infra barrier** | None (Docker/text only) | Live cluster / GPU / VM required |
| **LogoMesh overlap** | No existing capability | Direct capability match |
| **Impl cost** | Trivial delta (reuses existing adapter) | New capability from scratch |
| **Score ceiling** | 0–20 | 80–100 |

---

## Per-Repo Analysis

### ACTIVE TARGETS

---

#### text-2-sql (Sprint 3 — Coding Agent, 2nd place)

| Axis | Score | Notes |
|:-----|:------|:------|
| Output adapter | **B — JSON response** | `{"sql": "...", "explanation": "..."}` in A2A body |
| Scoring type | Type II | AST hallucination gate → 7-dim weighted formula |
| Infra barrier | 1 | Mock SQL engine, no live DB |
| LogoMesh overlap | 5 | AST analysis background; SQL is structured output |
| Impl cost | 1 | Extend existing A2A response handler with SQL formatter |
| Score ceiling | 85 | High confidence |
| Adapter reuse | B covers AgentSWE (if confirmed for Sprint 4), LogoMesh-self (validation) |

**Verdict: BUILD FIRST.** Highest ceiling, lowest cost, no infra barrier.

---

#### AVER (Sprint 3 — Agent Safety, 3rd place)

| Axis | Score | Notes |
|:-----|:------|:------|
| Output adapter | **C — Multi-turn tool calls** | detect→diagnose→act with `<json>` tool call format |
| Scoring type | Type III | Detection 40% + Diagnosis 20% + Recovery 40%, turn-order multiplier |
| Infra barrier | 1 | Local code execution environment |
| LogoMesh overlap | 4 | Iterative refinement loop; new: error classification taxonomy |
| Impl cost | 2 | New multi-turn tool-call adapter; error detection prompting |
| Score ceiling | 80 | High confidence |
| Adapter reuse | **C covers CAR-bench and τ²-Bench** |

**Verdict: BUILD SECOND.** Anchor for Cluster C. Enables three repos once built (AVER, CAR-bench, τ²-Bench).

---

#### CAR-bench (Sprint 2 — Computer Use/Web Agent, 1st place)
*(Full Pass 1+2+3 analysis in [[2026-04-02]-Sprint2-Task-Input-Formats.md]([2026-04-02]-Sprint2-Task-Input-Formats.md))*

| Axis | Score | Notes |
|:-----|:------|:------|
| Output adapter | **C delta** | Task-type detection (base/hallucination/disambiguation) on top of Cluster C |
| Scoring type | Type I/II | Binary cliff at reward ≥ 0.99 |
| Infra barrier | 1 | Local mock car environment |
| LogoMesh overlap | 3 | Multi-turn exists; car assistant domain is new |
| Impl cost | 1 | Delta from AVER: task-type router only |
| Score ceiling | 55 | Medium confidence; binary cliff means focus on correctness |
| Adapter reuse | Cluster C (shared with AVER, τ²-Bench) |

**Verdict: SPRINT 2 PRIMARY.** After Adapter C (AVER) is built, this is a 1-unit add. Submit to Sprint 2 window (closes April 12).

---

#### RCAbench (Sprint 3 — Cybersecurity, 1st place)
*(Full Pass 1+2+3 analysis in [[2026-04-01]-Sprint3-Task-Input-Formats.md]([2026-04-01]-Sprint3-Task-Input-Formats.md))*

| Axis | Score | Notes |
|:-----|:------|:------|
| Output adapter | **A — File write** | Writes `loc.json` to shared workspace path |
| Scoring type | Type I | IoU at file/function/line granularity; pure deterministic |
| Infra barrier | 2 | Docker containers with vulnerable codebases |
| LogoMesh overlap | 4 | MCTS vulnerability reasoning directly applicable; new: file-write output |
| Impl cost | 2 | New Cluster A adapter; MCTS reasoning already exists |
| Score ceiling | 70 | High confidence |
| Adapter reuse | A also covers LogoMesh-self (internal validation output path) |

**Verdict: BUILD FOR SPRINT 3.** Clear output format, deterministic scoring, MCTS reasoning reuses.

---

#### Pi-Bench (Sprint 3 — Agent Safety, 1st place)

| Axis | Score | Notes |
|:-----|:------|:------|
| Output adapter | **F — Text plan / policy trace** | Execution trace + policy compliance verdict |
| Scoring type | Type I | Violation rate across 9 policy columns; pure deterministic |
| Infra barrier | 2 | Policy scenarios; no live infrastructure |
| LogoMesh overlap | 2 | Policy reasoning is new; no existing compliance trace capability |
| Impl cost | 2 | New Cluster F adapter + policy-following prompting |
| Score ceiling | 55 | Medium confidence; policy compliance domain is genuinely new |
| Adapter reuse | **F covers τ²-Bench policy following** (partial) |

**Verdict: BUILD FOR SPRINT 3.** Mandatory first-place Agent Safety target. New capability but manageable cost.

---

#### τ²-Bench (Sprint 2 — τ²-Bench track, featured)
*(Full Pass 1+2+3 analysis in [[2026-04-02]-Sprint2-New-Repos-Analysis.md]([2026-04-02]-Sprint2-New-Repos-Analysis.md))*

| Axis | Score | Notes |
|:-----|:------|:------|
| Output adapter | **C delta** | Multi-turn + domain-specific tool schemas (airline/retail/telecom) |
| Scoring type | Type I/II | Binary task pass/fail + LLM user simulator variance |
| Infra barrier | 2 | Simulated backend APIs; no live services |
| LogoMesh overlap | 3 | Multi-turn exists; customer service domain + dual-control is new |
| Impl cost | 2 | Delta from CAR-bench: dual-control tracking + 3 domain tool schemas |
| Score ceiling | 45 | Medium confidence; dual control adds complexity |
| Adapter reuse | Cluster C (shared with AVER, CAR-bench) |

**Verdict: SPRINT 2 SECONDARY.** Target if CAR-bench is delivered before April 12 with time remaining. 2-unit cost (larger than CAR-bench delta due to dual-control).

---

#### Terminal-Bench 2.0 (Sprint 3 potential — Coding Agent, unconfirmed)
*(Pass 1 analysis in [[2026-04-02]-Sprint4-Initial-Analysis.md]([2026-04-02]-Sprint4-Initial-Analysis.md))*

| Axis | Score | Notes |
|:-----|:------|:------|
| Output adapter | **B / hybrid** | Text commands in A2A response; executed in Docker container |
| Scoring type | Type I | Binary pass/fail per task via automated test scripts |
| Infra barrier | 1 | Docker only — same environment as LogoMesh |
| LogoMesh overlap | 5 | Terminal tasks directly adjacent to LogoMesh code sandbox |
| Impl cost | 1 | If Cluster B covers it: near-zero delta; if new command pattern: 1–2 units |
| Score ceiling | 70 | High confidence IF sprint assignment confirmed |
| Adapter reuse | Cluster B (shared with text-2-sql) |

**Verdict: PRIORITY ADD if Sprint 3 confirmed.** Highest LogoMesh overlap of any new discovery. Validate sprint assignment and do Pass 2+3 immediately when Sprint 3 roster is announced.

---

#### NetArena (Sprint 3 — Coding Agent, 1st place) — Floor attempt

| Axis | Score | Notes |
|:-----|:------|:------|
| Output adapter | **E floor — Live infra** | kubectl reasoning without live cluster |
| Scoring type | Type III | Binary all-match gate on K8s connectivity |
| Infra barrier | 5 | Live K8s cluster required for full score |
| LogoMesh overlap | 2 | Network reasoning exists; K8s specifics are new |
| Impl cost | 2 | Floor attempt: MCTS diagnostics without live cluster execution |
| Score ceiling | 20 | Floor only; full build would require K8s cluster for 40 ceiling |
| Adapter reuse | None — unique infra requirement |

**Verdict: FLOOR ATTEMPT.** Mandatory Sprint 3 target (Coding Agent 1st place). Accept ~20 points from reasoning quality without live infrastructure. Full K8s build is not worth the cost at 40 ceiling.

---

### EXCLUDED REPOS

| Repo | Sprint | Reason for exclusion |
|:-----|:-------|:--------------------|
| MAizeBargAIn | 2 | Type IV game-theoretic; no bargaining capability; 5-unit cost for 25 ceiling |
| FieldWorkArena | 2 | Video analytics domain; no video capability; scoring formula not public |
| MLE-Bench | 2 | Requires 36 vCPUs + 440GB RAM + A10 GPU; infra cost = EXTREME |
| OSWorld-Verified | 2 | Requires real VM + screenshot vision; no multimodal capability |
| ICU-Later | 3* | Healthcare NOT in Sprint 3 officially; FHIR infra barrier also high |
| NAAMSE | 3 | Pass 1 only; adversarial robustness testing; low fit vs. cost |
| AgentSWE | 3* | Software Testing not in Phase 2 |
| LogoMesh-self | Internal | Not in Phase 2; kept as development validation environment |

*Previously targeted based on wrong roster data.

---

## Adapter Cluster Summary

| Cluster | What it does | Repos covered | Build cost |
|:--------|:-------------|:--------------|:-----------|
| **B — JSON response** | Return structured dict in A2A body | text-2-sql, Terminal-Bench 2.0 (if B) | 1 unit |
| **C — Multi-turn tool calls** | detect→diagnose→act loop with tool call serialization | AVER, CAR-bench, τ²-Bench | 2 + 1 + 2 units |
| **A — File write** | Write output files to shared workspace path | RCAbench | 2 units |
| **F — Policy trace** | Structured natural language trace + verdict | Pi-Bench | 2 units |
| **E floor — Live infra** | Reasoning output without live cluster execution | NetArena | 2 units |

**Total implementation units: ~12**

---

## ROI Table (corrected roster)

| Cluster | Repos | Expected pts | Units | Pts/unit |
|:--------|:------|:------------|:------|:---------|
| B | text-2-sql + TB2.0 | 85 + 70 = 155 | 1 + 1 = 2 | **77.5** |
| C | AVER + CAR-bench | 80 + 55 = 135 | 2 + 1 = 3 | **45** |
| A | RCAbench | 70 | 2 | **35** |
| C delta 2 | τ²-Bench | 45 | 2 | **22.5** |
| F | Pi-Bench | 55 | 2 | **27.5** |
| E floor | NetArena | 20 | 2 | **10** |

**Cluster B remains the highest ROI.** text-2-sql + Terminal-Bench 2.0 for 2 implementation units is still the best opening move.
