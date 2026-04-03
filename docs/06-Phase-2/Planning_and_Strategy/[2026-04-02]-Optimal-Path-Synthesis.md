> **Status:** SUPERSEDED
> **Type:** Plan
> **Context:**
> *   [2026-04-02]: Optimal path selection for Sprint 2 + Sprint 3 generalization. Synthesizes Pass 1–3 analysis across all first-place repos. Analogous to MCTS tree selection — simulates expected outcomes across repo combinations and selects the path maximizing total score relative to implementation cost. Sprint 1 ends April 12; Sprint 2 is the next active window.
> **Superseded By:** [[2026-04-02]-Optimal-Path-Synthesis-v2.md]([2026-04-02]-Optimal-Path-Synthesis-v2.md) — rebuilt from verified Phase 2 roster. Sprint 2 selections (MateFin, MIDS4LIFE) and Sprint 3 targets (ICU-Later, AgentSWE, LogoMesh-self) in this document are not in Phase 2.
> **See Also:**
> *   [Compatibility Matrix]([2026-04-02]-Generalization-Compatibility-Matrix.md)
> *   [Sprint 3 First-Place Deep-Dive]([2026-04-02]-Sprint3-FirstPlace-Scoring-Deep-Dive.md)
> *   [Sprint 2 Scoring Deep-Dive]([2026-04-02]-Sprint2-Scoring-Deep-Dive.md)

# Optimal Path Synthesis

## The Decision Problem

**Constraints:**
- Must target ALL Sprint 3 first-place Green Agents (Pi-Bench, NetArena, ICU-Later, RCAbench, LogoMesh-self)
- Must target AT LEAST ONE Sprint 2 first-place Green Agent (no upper limit)
- Objective: maximize total expected score across the full competition window relative to implementation cost

**The optimization is not "which repos to include" (Sprint 3 is fixed) — it is:**
1. Which Sprint 2 repos to add alongside the mandatory Sprint 3 set
2. In what order to build adapters so early sprint performance is maximized
3. Which mandatory Sprint 3 repos justify infrastructure investment vs. accepting a floor score

---

## Simulation Results — Decision Tree

### Branch 1: All-in on infrastructure (NetArena + ICU-Later full implementation)

Build K8s cluster + FHIR server for full Sprint 3 coverage.

| Scenario | Expected score | Cost |
|:---------|:--------------|:-----|
| NetArena (K8s fully working) | 40 | 5 units |
| ICU-Later (FHIR fully working) | 30 | 5 units |
| **Subtotal** | 70 | 10 units |

**Verdict:** 7 points per implementation unit. Lowest ROI path. Infrastructure may not be ready before Sprint 3 window closes.

### Branch 2: Focus on tractable clusters, accept floor on infra repos

Build Clusters B+C+A (JSON, tool-call, file-write) fully. Accept partial/floor score on NetArena and ICU-Later using best-effort attempts.

| Cluster | Repos covered | Expected score | Cost |
|:--------|:-------------|:--------------|:-----|
| B (JSON) | text-2-sql, LogoMesh-self, AgentSWE | 250 | 2 units |
| A (file-write) | RCAbench (done), MateFin | +80 | 1 unit |
| C (tool-call) | AVER (done), CAR-bench | +65 | 1 unit |
| F (text plan) | Pi-Bench, MIDS4LIFE | +130 | 4 units |
| E (infra) | NetArena (floor), ICU-Later (floor) | +40 | 2 units (floor attempt) |
| **Subtotal** | 9 repos | **565** | **10 units** |

**Verdict:** 56.5 points per implementation unit. Dominant strategy.

### Branch 3: Minimal viable (only mandatory Sprint 3)

Skip Sprint 2 entirely, build minimum to compete in Sprint 3.

| Cluster | Repos | Expected score | Cost |
|:--------|:------|:--------------|:-----|
| B | text-2-sql, LogoMesh-self | 180 | 1 unit |
| A | RCAbench | 75 | 0 (done) |
| C | AVER | 85 | 0 (done) |
| F | Pi-Bench | 70 | 2 units |
| E | NetArena + ICU-Later (floor) | 40 | 2 units |
| **Subtotal** | 5 repos | **450** | **5 units** |

**Verdict:** 90 points per unit — highest efficiency, but foregoes Sprint 2 entirely. Misses competition window.

---

## Selected Path: Branch 2 Extended

**Sprint 2 targets selected:** MateFin, CAR-bench, MIDS4LIFE

**Reasoning:**

**MateFin** (Web Agent, 1st tie) — Highest ROI Sprint 2 addition.
- Adapter A (file-write) is a minor delta from RCAbench work — add 3-file schema
- Fully deterministic scoring, no LLM judge variance, offline mock service
- Score ceiling: 80. Implementation cost: 1 unit after RCAbench adapter exists
- Selection confidence: HIGH

**CAR-bench** (Computer Use, 1st) — Adapter C reuse from AVER
- Once AVER multi-turn tool-call adapter is built, CAR-bench adds task-type detection (hallucination=refuse, disambiguation=clarify)
- LLM user simulator is unpredictable but base/hallucination/disambiguation pattern is learnable
- Score ceiling: 65. Implementation cost: 1 unit after AVER adapter exists
- Selection confidence: HIGH

**MIDS4LIFE** (Research Agent, 1st tie) — Best fit in Cluster F
- Shares text-plan output pattern with Pi-Bench (mandatory Sprint 3 target)
- Building Pi-Bench F-adapter immediately enables MIDS4LIFE with domain-mode detection layer
- Encrypted task files are a gap — but planning prompts + metrics source gives enough to build
- Score ceiling: 60. Implementation cost: 1 unit after Pi-Bench adapter exists
- Selection confidence: MEDIUM (encrypted tasks = some uncertainty)

**Excluded Sprint 2 repos:**

| Repo | Reason excluded |
|:-----|:----------------|
| Webshop Plus | Adapter D (stateful session) is net-new capability; Pi-Bench/MIDS4LIFE cover Cluster F with less cost |
| HEP-ExpAgents | Domain barrier (ROOT/HEP physics) = prohibitive; infra cost ≥ NetArena |
| MAizeBargAIn | Type IV (game-theoretic); no existing bargaining capability; highest implementation risk |

---

## Recommended Adapter Architecture

### Minimum viable Purple Agent adapter set

Five adapters cover all selected repos:

**Adapter B — JSON Response** (priority 1, builds first)
- Covers: text-2-sql, LogoMesh-self, AgentSWE
- Implementation: extend existing A2A response handler to route by task type → return structured JSON dict
- Reuses: existing `GenericDefenderExecutor` + OpenAI client

**Adapter A — File Write** (priority 2)
- Covers: RCAbench (partially done), MateFin
- Implementation: agent writes to a designated shared path; path injected from task context
- Delta from B: add filesystem write capability to Purple Agent container

**Adapter C — Multi-Turn Tool Calls** (priority 3)
- Covers: AVER, CAR-bench
- Implementation: 3-turn detect→diagnose→act loop with `<json>` tool call serialization
- Key logic: turn-order tracking (pre-execution detection multiplier), task-type routing (negative control → skip detection)
- Reuses: existing multi-turn conversation history in `GenericDefenderExecutor`

**Adapter F — Text Plan / Policy Trace** (priority 4)
- Covers: Pi-Bench, MIDS4LIFE
- Implementation: structured output with policy verdict + trace (Pi-Bench) or answer dict (MIDS4LIFE)
- Key logic: domain-mode detection for MIDS4LIFE (Easy/Medium/Hard); policy compliance reasoning for Pi-Bench

**Adapter E — Live Infrastructure (floor attempt)** (priority 5)
- Covers: NetArena, ICU-Later
- Implementation: best-effort kubectl / FHIR reasoning without live cluster
- Accept: floor score (~20–30) from correct reasoning even if infrastructure isn't live
- If infrastructure IS available: elevate to full implementation

---

## Implementation Sequence

Ordered by: sprint window → adapter reuse leverage → score ROI

| Step | Adapter | Repos unblocked | Target sprint |
|:-----|:--------|:----------------|:-------------|
| 1 | B (JSON) | text-2-sql, LogoMesh-self, AgentSWE | Sprint 2 launch (Apr 12+) |
| 2 | A delta (MateFin 3-file) | MateFin | Sprint 2 |
| 3 | C (AVER multi-turn) | AVER | Sprint 2/3 |
| 4 | C delta (CAR-bench task-type detection) | CAR-bench | Sprint 2 |
| 5 | F (Pi-Bench policy trace) | Pi-Bench | Sprint 3 |
| 6 | F delta (MIDS4LIFE domain-mode) | MIDS4LIFE | Sprint 2 |
| 7 | E floor (NetArena kubectl reasoning) | NetArena | Sprint 3 |
| 8 | E floor (ICU-Later FHIR reasoning) | ICU-Later | Sprint 3 |

**Sequence logic:**
- Steps 1–4 are all Sprint 2 window (opens ~April 12) — maximize Sprint 2 score before Sprint 3 opens
- Steps 5–6 bridge Sprint 2 and Sprint 3 — Pi-Bench and MIDS4LIFE share an adapter
- Steps 7–8 are floor attempts — if K8s/FHIR infrastructure becomes available, elevate; otherwise accept floor

---

## Risk Register

| Risk | Repos affected | Severity | Mitigation |
|:-----|:--------------|:---------|:-----------|
| NetArena K8s cluster unavailable | NetArena | High | Accept floor score from reasoning; note in submission |
| ICU-Later FHIR data licensing / server | ICU-Later | High | Accept floor; FHIR reasoning without live server gives partial credit on retrieval-type answers |
| MIDS4LIFE task files GPG-encrypted | MIDS4LIFE | Medium | Planning prompts + metrics source give enough structure to build; actual task discovery happens at runtime |
| CAR-bench LLM user simulator variance | CAR-bench | Medium | Binary cliff at 0.99 means partial scores don't count; focus on task-type detection correctness |
| Pi-Bench policy domain breadth | Pi-Bench | Medium | 9 columns weighted equally; broad coverage > specialized depth; avoid over-refusing (Restraint column) |
| Sprint timeline compression | All | Low | Sprint 1 extended once already; Sprint 2 and 3 windows may also shift |

---

## Decision Log (MCTS simulation trace)

```
Root: Maximize total competition score across Sprint 2+3

Node 1 — Mandatory Sprint 3 repos (fixed)
  ├── RCAbench: Adapter A, infra=2, ceiling=75 → INCLUDE (done)
  ├── Pi-Bench: Adapter F, infra=1, ceiling=70 → INCLUDE (Step 5)
  ├── NetArena: Adapter E, infra=5, ceiling=40 → INCLUDE floor attempt (Step 7)
  ├── ICU-Later: Adapter E, infra=4, ceiling=30 → INCLUDE floor attempt (Step 8)
  └── LogoMesh: Adapter B, infra=1, ceiling=90 → INCLUDE self (Step 1)

Node 2 — Sprint 2 selection (optimization problem)
  ├── MateFin: Adapter A delta, ceiling=80, cost=1 → INCLUDE (adapter reuse from RCAbench)
  ├── CAR-bench: Adapter C delta, ceiling=65, cost=1 → INCLUDE (adapter reuse from AVER)
  ├── MIDS4LIFE: Adapter F delta, ceiling=60, cost=1 → INCLUDE (adapter reuse from Pi-Bench)
  ├── Webshop Plus: Adapter D, ceiling=55, cost=3 → EXCLUDE (net-new capability, lower ceiling)
  ├── HEP-ExpAgents: Adapter F, ceiling=20, infra=5 → EXCLUDE (domain barrier prohibitive)
  └── MAizeBargAIn: Type IV, ceiling=25, cost=5 → EXCLUDE (game-theoretic, no capability)

Node 3 — Additional high-value Sprint 3 repos (not first-place but already analyzed)
  ├── text-2-sql: Adapter B, ceiling=90, cost=1 → INCLUDE (same adapter as LogoMesh-self)
  ├── AVER: Adapter C, ceiling=85, cost=2 → INCLUDE (builds C adapter for CAR-bench)
  └── AgentSWE: Adapter B, ceiling=70, cost=1 → INCLUDE (free reuse of B adapter)

Selected path: B(1) → A-delta(1) → C(2) → C-delta(1) → F(2) → F-delta(1) → E-floor(2) → E-floor(2)
Total estimated score: ~565 across 9 repos
Total implementation cost: ~12 units
Effective ROI: ~47 points per unit
```

---

## Expected Score Summary

| Repo | Sprint | Adapter | Expected score | Confidence |
|:-----|:-------|:--------|:--------------|:-----------|
| text-2-sql | 3 | B | 85 | High |
| LogoMesh-self | 3 | B | 85 | High |
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
