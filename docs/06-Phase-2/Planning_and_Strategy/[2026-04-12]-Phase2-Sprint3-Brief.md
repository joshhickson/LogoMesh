---
status: ACTIVE
type: Guide
---
> **Context:**
> * [2026-04-12]: Full revalidation rewrite of Sprint 3 briefing against checked-out Phase 2 planning docs.
> * [2026-04-12]: This brief is planning guidance, not an official competition announcement. Confidence labels below separate confirmed vs pending items.
> * [2026-04-14]: Authority-reset rewrite aligned to the official team brief distributed to contributors. Phase instructions now use explicit verification gates (schedule, roster, submission eligibility) and avoid hard-date execution assumptions.

# LogoMesh - Phase 2 Sprint 3 Brief (Revalidated)

## 1. Executive Summary

LogoMesh is building one generalized Purple Agent that competes across Phase 2 Green Agent repos by reusing a common A2A protocol layer and switching only output adapters.

Current operating stance:
- Sprint windows are treated as tentative until verified in official competition channels.
- Sprint 2 carry-over focus remains CAR-bench primary; tau2-bench stays secondary only after CAR-bench completion and capacity confirmation.
- Core Sprint 3 target set remains text-2-sql, AVER, RCAbench, Pi-Bench, and NetArena (floor strategy), with Terminal-Bench 2.0 explicitly conditional and speculative pending official listing.

## 2. Competition Windows and Verification Gates

| Sprint | Window | Status | Planning implication |
|:-------|:-------|:-------|:---------------------|
| Sprint 2 | TBD (tentative) | Pending official verification | Run schedule and submission eligibility gates before Sprint 2 carry-over actions |
| Sprint 3 | TBD (tentative) | Pending official verification | Run schedule and roster verification gates before committing conditional work |
| Sprint 4 | May 4+ (tentative) | Planning-only | Not execution priority for this brief |

Sprint 3 tracks currently listed as tentative: Agent Safety, Coding Agent, Cybersecurity.

Verification gates:
- Schedule verification gate: verify active sprint windows from official competition channels before phase sequencing.
- Roster verification gate: verify current repo roster before conditional adapter investment.
- Submission eligibility gate: verify CAR-bench/tau2-bench submission eligibility before Sprint 2 carry-over execution.

## 3. Target Portfolio (with Confidence)

### Sprint 2 carry-over priorities

| Repo | Adapter path | Expected score | Confidence | Notes |
|:-----|:-------------|:---------------|:-----------|:------|
| CAR-bench | C delta (after AVER anchor) | 55 | Medium-High | Binary cliff at reward >= 0.99; primary Sprint 2 target |
| tau2-bench | C delta 2 (after CAR-bench) | 45 | Medium | Dual-control complexity; secondary only if CAR-bench is done and schedule buffer remains |

### Sprint 3 target set

| Repo | Track | Adapter | Expected score | Confidence | Status |
|:-----|:------|:--------|:---------------|:-----------|:-------|
| text-2-sql | Coding Agent | B (JSON) | 85 | High | Phase 1 2nd place; treated as likely Sprint 3 inclusion pending final roster post |
| AVER | Agent Safety | C (multi-turn) | 80 | High | Phase 1 3rd place; treated as likely Sprint 3 inclusion pending final roster post |
| RCAbench | Cybersecurity | A (file write) | 70 | High | Phase 1 1st place; treated as likely Sprint 3 inclusion pending final roster post |
| Pi-Bench | Agent Safety | F (policy trace) | 55 | Medium | Phase 1 1st place; likely inclusion pending final roster post |
| NetArena | Coding Agent | E floor | 20 | Medium | Phase 1 1st place, mandatory coding target; execute floor strategy unless live K8s becomes available |
| Terminal-Bench 2.0 | Coding Agent (pending) | B/hybrid | 70 | Low / Speculative | Not listed in official website snapshot; do not build until roster verification confirms assignment |

## 4. Adapter Strategy, Cost, and ROI

Build order is adapter-dependency first, then ROI, while enforcing verification gates.

| Step | Adapter increment | Repos unlocked | Units | Expected points | ROI (pts/unit) |
|:-----|:------------------|:---------------|:------|:----------------|:---------------|
| 1 | B core | text-2-sql | 1 | 85 | 85.0 |
| 2 | C anchor | AVER | 2 | 80 | 40.0 |
| 3 | C delta 1 (CAR-bench) | CAR-bench | 1 | 55 | 55.0 |
| 4 | A | RCAbench | 2 | 70 | 35.0 |
| 5 | F | Pi-Bench | 2 | 55 | 27.5 |
| 6 | E floor | NetArena (floor) | 2 | 20 | 10.0 |
| 7 | C delta 2 (tau2-bench) | tau2-bench | 2 | 45 | 22.5 |
| 8 (conditional) | B extension (Terminal-Bench 2.0) | Terminal-Bench 2.0 | 1 (B-type) or 2 (hybrid wrapper) | 70 | 35.0-70.0 |

Implementation sequence:
1. B core
2. C anchor
3. C delta 1 (CAR-bench only after submission eligibility gate passes)
4. A
5. F
6. E floor
7. C delta 2 (tau2-bench only after CAR-bench completion and capacity check)
8. B extension for Terminal-Bench 2.0 only after roster confirmation (1 unit if B-type, 2 if hybrid wrapper is required)

## 5. Score Scenarios (Planning Estimates)

These are internal planning estimates for prioritization, not official competition scoring projections.

| Scenario | Included repos | Expected total | Confidence |
|:---------|:---------------|:---------------|:-----------|
| Sprint 3 mandatory baseline | text-2-sql + AVER + RCAbench + Pi-Bench + NetArena floor | 310 | High |
| + Sprint 2 primary carry-over | + CAR-bench | 365 | High |
| + Terminal-Bench 2.0 (if confirmed) | + TB2.0 | 435 | Medium |
| + Sprint 2 secondary carry-over | + tau2-bench | 480 | Medium-Low |

Baseline confidence is high because three anchor repos in the 310 scenario (text-2-sql, AVER, RCAbench) remain high-confidence targets under current source docs.

## 6. Repo Scoring Cliffs and Tactics

| Repo | Main scoring cliff | Tactical rule |
|:-----|:-------------------|:--------------|
| text-2-sql | Hallucination severity cliff (phantom table worst) | Apply schema-first generation: phantom tables can cost about 9 points, phantom columns about 7.2, phantom functions about 5.4; never reference undefined schema entities |
| AVER | Temporal multiplier cliff on detection | Classify error type (hallucination/validation/tool misuse/context loss/adversarial) before the first run/execute call; pre-execution detection scores 2x vs post-execution (1.0x vs 0.5x). Recovery is deterministic 40% and not multiplier-adjusted |
| RCAbench | Wrong output location can collapse score | Always write ranked results to /workspace/shared/loc.json |
| CAR-bench | Binary cliff at reward >= 0.99 | Determine task type from the system prompt in the first reasoning turn before any tool call; only base tasks should invoke tools |
| tau2-bench | Dual-control state drift causes failures | Track both agent and simulated-user actions before each tool call |
| Pi-Bench | Policy-scope ambiguity can be mishandled | When policy scope is unclear, output AMBIGUOUS_POLICY or AMBIGUOUS_STATE; forced binary verdicts in ambiguous cases can be penalized |
| NetArena | Full score needs live K8s connectivity | Treat as mandatory first-place coding target, but execute floor strategy unless KinD/live cluster is available |

## 7. Task Input/Output Quick Reference

| Repo | Task input signature | Required output shape |
|:-----|:---------------------|:----------------------|
| RCAbench | Message includes arvo:<id>; workspace contains error.txt + vulnerable repo | Write ranked localization list to /workspace/shared/loc.json. Function names must exact-match if provided; leave function empty when uncertain |
| text-2-sql | JSON with task_id, question, schema, dialect | Return JSON with sql field |
| AVER | Error-injected coding task with detection and recovery criteria | Multi-turn detect->diagnose->recover; code via JSON run_python tool call |
| CAR-bench | Multi-turn car assistant tasks with system prompt type cues | Determine base/hallucination/disambiguation before any tool call; only base tasks should perform tool execution |
| tau2-bench | Multi-turn customer service tasks across airline/retail/telecom | Policy-following multi-turn tool calls with dual-control awareness |
| Pi-Bench | Policy compliance scenario | Structured policy trace and compliance verdict, including ambiguity labels when policy scope is genuinely unclear |
| NetArena | Network diagnosis and remediation prompts | Floor: reasoned kubectl plan; full: live cluster remediation |

## 8. Priority Issues (Linear, Team Order)

All issues are unassigned. Pick them up in order.

| Issue | What | Priority |
|:------|:-----|:---------|
| LOG-47 | A2A endpoint registration + task-type router | Urgent |
| LOG-48 | Confirm Sprint 3 roster at open (verification gate) | Urgent |
| LOG-49 | Adapter B - text-2-sql JSON handler | Urgent |
| LOG-50 | CAR-bench Sprint 2 carry-over submission (if eligible) | Urgent |
| LOG-51 | Adapter C - AVER multi-turn anchor | Urgent |
| LOG-52 | Adapter A - RCAbench MCTS localization | High |
| LOG-53 | Adapter F - Pi-Bench policy trace | High |
| LOG-54 | Adapter E floor - NetArena kubectl reasoning | Normal |
| LOG-55 | tau2-bench pass 3 + dual-control delta | Normal |
| LOG-56 | KinD cluster feasibility check for NetArena | Low |

## 9. Priority Execution Queue (Gate-Based)

1. Complete B core (LOG-49) and C anchor (LOG-51) as shared foundations.
2. Execute CAR-bench (LOG-50) only after submission eligibility is verified.
3. Execute tau2-bench (LOG-55) only after CAR-bench completion and capacity check.
4. Start Sprint 3 first wave with text-2-sql, AVER, and RCAbench after roster verification.
5. Keep Terminal-Bench 2.0 conditional until official listing is verified.
6. Treat NetArena as floor until KinD/live cluster feasibility changes.

## 10. Risk Watchlist

| Risk | Impact | Mitigation |
|:-----|:-------|:-----------|
| Sprint 3 roster remains tentative until open | Can invalidate repo assumptions | Re-verify roster at sprint open before conditional work |
| Terminal-Bench 2.0 not assigned to Sprint 3 | Removes a projected +70 scenario | Keep as conditional line item only; do not build until confirmed |
| tau2-bench dual-control complexity underestimated | Sprint 2 overrun risk | Keep secondary to CAR-bench; defer if time expires |
| NetArena floor scores below expected partial credit | Lower than 20-point estimate | Early KinD feasibility check for possible full implementation |
| Sprint windows not yet confirmed | Can invalidate phase sequencing | Do not treat any date as a hard deadline; run schedule verification gate first |
| Terminal-Bench 2.0 not listed on official website snapshot | +70 projection may be invalid | Keep confidence low/speculative until official roster evidence appears |

## 11. Source Documents Used for This Brief

- [Phase 2 Team Brief](../../Archive/06-Phase-2/Planning_and_Strategy/Phase2-Team-Brief.md)
- [Competitive Analysis Briefing (Passes 1 and 2)](../../Archive/06-Phase-2/Planning_and_Strategy/%5B2026-04-01%5D-Competitive-Analysis-Briefing.md)
- [Sprint 2 + Sprint 3 Competitive Analysis](../../Archive/06-Phase-2/Planning_and_Strategy/%5B2026-04-01%5D-Sprint2-Sprint3-Competitive-Analysis.md)
- [Sprint 3 Scoring Deep-Dive](./%5B2026-04-01%5D-Sprint3-Scoring-Deep-Dive.md)
- [Sprint 3 Task Input Formats](./%5B2026-04-01%5D-Sprint3-Task-Input-Formats.md)
- [Generalization Compatibility Matrix v2](../../Archive/06-Phase-2/Planning_and_Strategy/%5B2026-04-02%5D-Generalization-Compatibility-Matrix-v2.md)
- [Generalization Strategy Explained v2](../../Archive/06-Phase-2/Planning_and_Strategy/%5B2026-04-02%5D-Generalization-Strategy-Explained-v2.md)
- [Optimal Path Synthesis v2](../../Archive/06-Phase-2/Planning_and_Strategy/%5B2026-04-02%5D-Optimal-Path-Synthesis-v2.md)
- [Sprint 2 New Repos Analysis](../../Archive/06-Phase-2/Planning_and_Strategy/%5B2026-04-02%5D-Sprint2-New-Repos-Analysis.md)
- [Sprint 3 First-Place Scoring Deep-Dive](./%5B2026-04-02%5D-Sprint3-FirstPlace-Scoring-Deep-Dive.md)
- [Sprint 3 Roster Verification](../../Archive/06-Phase-2/Planning_and_Strategy/%5B2026-04-02%5D-Sprint3-Roster-Verification.md)
- [Phase 2 Corrected Competitive Analysis](../../Archive/06-Phase-2/Planning_and_Strategy/%5B2026-04-03%5D-Phase2-Corrected-Competitive-Analysis.md)
