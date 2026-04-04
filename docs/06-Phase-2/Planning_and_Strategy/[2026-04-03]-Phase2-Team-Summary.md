# LogoMesh Phase 2 — Team Summary
**Date:** April 3, 2026 | **Prepared by:** Josh (Project Lead)

---

## What Phase 2 Requires

Phase 2 of AgentBeats asks us to build a **Purple Agent** — a generalized AI agent adapter that can compete across multiple benchmark repos simultaneously. Unlike Phase 1 (where we optimized LogoMesh for a single Software Testing track), Phase 2 rewards teams that can score across the most repos in the least time.

The competition runs in two sprints. We must submit to each sprint window independently.

---

## Sprint 2 Targets — Ends April 12

| Repo | What it is | Our target score | Priority |
|:-----|:-----------|:----------------|:---------|
| **CAR-bench** | In-car AI assistant (navigation tools, POI lookup) | 55 | **Primary** |
| **τ²-Bench** | Customer service agent (airline, retail, telecom) | 45 | Secondary (if time) |

Four other Sprint 2 repos are excluded: MLE-Bench requires 440GB RAM + GPU, OSWorld-Verified requires desktop GUI vision, FieldWorkArena requires video analytics, and MAizeBargAIn uses game-theoretic scoring we don't support.

---

## Sprint 3 Targets — Opens April 13 (tentative)

Tracks confirmed: **Agent Safety**, **Coding Agent**, **Cybersecurity**. Healthcare is not in Sprint 3.

| Repo | Track | What it tests | Expected score | Build order |
|:-----|:------|:-------------|:--------------|:------------|
| **text-2-sql** | Coding Agent | SQL generation with AST validation | 85 | 1st |
| **AVER** | Agent Safety | Error detection & recovery in corrupted code | 80 | 2nd |
| **RCAbench** | Cybersecurity | Vulnerability root cause localization | 70 | 3rd |
| **Terminal-Bench 2.0** | Coding Agent | Real-world terminal tasks in Docker | 70 | 3rd (if confirmed) |
| **Pi-Bench** | Agent Safety | Policy compliance tracing | 55 | 4th |
| **NetArena** | Coding Agent | Kubernetes network debugging | 20 (floor) | 5th |

---

## Build Sequence

The Purple Agent uses five output adapter types. We build them in ROI order — each adapter unlocks multiple repos:

```
Step 1: Adapter B (JSON output)       → text-2-sql + Terminal-Bench 2.0
Step 2: Adapter C (multi-turn)        → AVER (Sprint 3) + CAR-bench (Sprint 2)
Step 3: Adapter C delta               → τ²-Bench (Sprint 2, if time)
Step 4: Adapter A (file write)        → RCAbench
Step 5: Adapter F (policy trace)      → Pi-Bench
Step 6: Adapter E floor (no live K8s) → NetArena
```

Each step reuses work from previous steps — this is why build order matters.

---

## Score Projection

| Scenario | Repos | Total |
|:---------|:------|:------|
| Sprint 3 mandatory only | text-2-sql + AVER + RCAbench + Pi-Bench + NetArena | 310 |
| **+ Sprint 2 primary** | **+ CAR-bench** | **365** |
| + Terminal-Bench 2.0 confirmed | + TB2.0 | 435 |
| + Sprint 2 secondary (if time) | + τ²-Bench | **480** |

**Conservative: ~365 points. Optimistic: ~480 points across 7–8 repos.**

> Note: These scores are on each benchmark's own internal scale (0–100 per repo), used as a relative comparison tool. They are not official competition point values.

---

## Key Risks

- **Sprint 2 deadline is April 12** — CAR-bench must be submitted first; τ²-Bench only if time permits
- **Sprint 3 roster is tentative** — monitor rdi.berkeley.edu/agentx-agentbeats.html for confirmation
- **Terminal-Bench 2.0 sprint assignment unconfirmed** — high-priority target once roster is announced
- **NetArena requires live Kubernetes** for full score — we are targeting a floor attempt (~20 pts) unless a local K8s solution is feasible
