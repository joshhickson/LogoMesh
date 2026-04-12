---
status: ACTIVE
type: Guide
---
> **Context:**
> * [2026-04-12]: Team brief for Phase 2. Covers big-picture mission, competition structure, adapter architecture, and score projections.
> * **Note:** Sprint windows below are tentative — the official competition schedule has not been confirmed. Do not treat sprint dates or status labels as authoritative.

# LogoMesh — Phase 2 Team Brief

## In a Nutshell

LogoMesh is an AI evaluation platform that judges AI-written code by actually running it, attacking it, and scoring it — not by asking an LLM if it looks good. In Phase 1, we built the benchmark itself (the "Green Agent") and won 1st place in the Software Testing Agent track at Berkeley RDI AgentBeats, competing against 1,300+ teams.

In Phase 2, we flip sides. We are now building the **Purple Agent** — an AI that competes *inside* external benchmarks we didn't design. The goal is to make LogoMesh's Purple Agent general enough to score well across 7–8 different benchmark repos using a single codebase and five reusable output adapters.

**The core insight:** Every Phase 2 benchmark uses the same A2A (Agent-to-Agent) JSON-RPC protocol. What differs is only the output schema. Build five adapters, cover eight repos.

---

## Resources

| Resource | Link |
|----------|------|
| **GitHub** (active branch) | [LogoMesh/LogoMesh — main-generalized-phase2-submodules](https://github.com/LogoMesh/LogoMesh/tree/main-generalized-phase2-submodules) |
| **Linear** (issues + project) | [LogoMesh AgentBeats Phase 2 — Generalized Purple Agent](https://linear.app/logomesh-agentbeats-phase-2/project/logomesh-agentbeats-phase-2-generalized-purple-agent-fb38e059a700) |
| **Foundational paper** | *Contextual Debt: A Protocol for Measurable Contextual Integrity* (v2.3) — `docs/00-Strategy/IP/02-22-2025-Contextual-Debt-Paper-Revised-2.3-Jules.pdf` |

---

## Competition Context

**AgentBeats Phase 2** — Berkeley RDI AgentX (rdi.berkeley.edu/agentx-agentbeats.html)

The competition runs in sprints. Each sprint opens a set of external benchmark repos ("Green Agent repos"). Teams submit a Purple Agent that the Green Agent evaluates. Points accumulate across sprints.

| Sprint | Window | Our status |
|--------|--------|------------|
| Sprint 2 | TBD (tentative) | TBD |
| Sprint 3 | TBD (tentative) | TBD |
| Sprint 4 | May 4+ | TBD |

Sprint 3 tracks: **Agent Safety · Coding Agent · Cybersecurity Agent**

---

## What We're Building

Five output adapters wired into a single Purple Agent. The A2A protocol layer is shared; adapters handle the output format each benchmark expects.

| Adapter | Output type | Benchmarks covered |
|---------|-------------|-------------------|
| **B** | JSON response dict | text-2-sql, Terminal-Bench 2.0 |
| **C** | Multi-turn tool calls | AVER, CAR-bench, τ²-Bench |
| **A** | File write (`loc.json`) | RCAbench |
| **F** | Policy trace + verdict | Pi-Bench |
| **E floor** | Reasoned output, no live infra | NetArena |

**Build sequence:** B → C → C-delta (CAR-bench) → A → F → E floor

---

## Score Projections

| Scenario | Repos | Expected score |
|----------|-------|---------------|
| Sprint 3 mandatory | text-2-sql + AVER + RCAbench + Pi-Bench + NetArena | 310 |
| + CAR-bench (Sprint 2) | + CAR-bench | **365** (conservative) |
| + Terminal-Bench 2.0 confirmed | + TB2.0 | 435 |
| + τ²-Bench completed | + τ²-Bench | **480** (optimistic) |

---

## Priority Issues (Linear)

All issues are unassigned. Pick them up in order — each adapter is a dependency for the ones below it.

| Issue | What | Priority |
|-------|------|----------|
| [LOG-47](https://linear.app/logomesh-agentbeats-phase-2/issue/LOG-47) | A2A endpoint registration + task-type router | Urgent |
| [LOG-48](https://linear.app/logomesh-agentbeats-phase-2/issue/LOG-48) | Confirm Sprint 3 roster when it opens April 13 | Urgent |
| [LOG-49](https://linear.app/logomesh-agentbeats-phase-2/issue/LOG-49) | Adapter B — text-2-sql JSON handler | Urgent |
| [LOG-50](https://linear.app/logomesh-agentbeats-phase-2/issue/LOG-50) | CAR-bench — Sprint 2 submission (due end of April) | Urgent |
| [LOG-51](https://linear.app/logomesh-agentbeats-phase-2/issue/LOG-51) | Adapter C — AVER multi-turn anchor | Urgent |
| [LOG-52](https://linear.app/logomesh-agentbeats-phase-2/issue/LOG-52) | Adapter A — RCAbench MCTS localization | High |
| [LOG-53](https://linear.app/logomesh-agentbeats-phase-2/issue/LOG-53) | Adapter F — Pi-Bench policy trace | High |
| [LOG-54](https://linear.app/logomesh-agentbeats-phase-2/issue/LOG-54) | Adapter E floor — NetArena kubectl reasoning | Normal |
| [LOG-55](https://linear.app/logomesh-agentbeats-phase-2/issue/LOG-55) | τ²-Bench Pass 3 + dual-control delta | Normal |
| [LOG-56](https://linear.app/logomesh-agentbeats-phase-2/issue/LOG-56) | KinD cluster feasibility check for NetArena | Low |

---

## What Already Exists

The Purple Agent is not being built from scratch. LogoMesh already has:

- **A2A server** running on port 9010 — conforms to AgentBeats spec
- **Multi-turn conversation handler** (`GenericDefenderExecutor`) — foundation for Adapter C
- **MCTS Red Agent** (`src/red_logic/orchestrator.py`) — UCB1 vulnerability hunting transfers directly to RCAbench (Adapter A)
- **Docker sandbox** — same environment as Terminal-Bench 2.0; no new infra needed
- **`uv` + AgentBeats SDK** — already the standard stack used by all Phase 2 benchmarks

The adapters extend what exists. No rebuild from scratch.

---

*For full implementation details, see the [Optimal Path Synthesis v2](./[2026-04-02]-Optimal-Path-Synthesis-v2.md) and the [Corrected Competitive Analysis](./%5B2026-04-03%5D-Phase2-Corrected-Competitive-Analysis.md) in this folder.*
