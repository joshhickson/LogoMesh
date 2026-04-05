---
status: ACTIVE
type: Spec
---
> **Context:**
> * [2026-04-03]: Updated to reflect the official Phase 2 schedule and corrected competition targets based on rdi.berkeley.edu.
> * [2026-02-19]: Updated post-Phase 1 win. LogoMesh won 1st place in Software Testing Agent track.
> * [2025-12-21]: Original creation as master index.

# 00. Current Truth Source (Master Index)

## 1. Where We Are

- **Phase 1 (Green Agent):** Won 1st place, Software Testing Agent track, AgentBeats competition (UC Berkeley RDI). 1,300+ teams competed.
- **Phase 2 (Purple Agent):** Registered. The goal is to perform well on the benchmarks created by the community in Phase 1.

## 2. What LogoMesh Is

A multi-agent benchmark that evaluates AI-written code by actually running it, attacking it, and scoring it.

**Core thesis:** "We don't ask if code looks good. We run it, attack it, and learn from every battle."

**Scoring:** CIS = (0.25*R + 0.25*A + 0.25*T + 0.25*L) * red_penalty * intent_penalty. LLM bounded +/-0.10 from ground truth. seed=42, temp=0. Variance < 0.05.

## 3. Team

| Role | Name | Focus |
|:-----|:-----|:------|
| Technical Lead | Oleksander | Architecture, code, technical decisions |
| Project Lead | Josh | Outreach, recruiting, documentation |
| Research | Deepti | Competition logistics, research, competitive analysis |

## 4. Immediate Priorities

### Phase 2 Competition
- **Sprint 1 (Mar 2 – Mar 22):** Game, Finance, Business Process (Completed)
- **Sprint 2 (Mar 23 – Apr 12):** Research, Multi-agent, τ²-Bench, Computer Use & Web. Targets: CAR-bench (primary), τ²-Bench (secondary if time)
- **Sprint 3 (Apr 13 – May 3):** Agent Safety, Coding Agent, Cybersecurity (Tentative)
- **Sprint 4 (May 4 – May 24):** General Purpose Agents (Grand Finale)
- Purple Agent adapter build sequence: JSON Adapter -> Multi-turn Adapter -> File Write Adapter -> Policy Trace Adapter -> Diagnostic Reasoning.
- **Note:** The old internal targets (AVER, RCAbench, Pi-Bench, NetArena, text-2-sql, Terminal-Bench 2.0) are on hold/deprecated as they were not officially confirmed.

## 5. Key Documentation

| Document | What It Is |
|:---------|:-----------|
| [README.md](../README.md) | Project overview, quick start, architecture, scoring |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | How to contribute, PR expectations, code style |
| [Developer Guide](02-Engineering/Developer-Guide.md) | Full codebase walkthrough, onboarding guide |
| [CONTEXT_PROMPT.md](../CONTEXT_PROMPT.md) | Context handoff for new Claude Code sessions |
| [Judges Start Here](05-Competition/Judges-Start-Here.md) | Competition judge walkthrough |
| [Agent Architecture](05-Competition/Agent-Architecture.md) | Full technical architecture |
| [Phase 2 Team Brief](06-Phase-2/Planning_and_Strategy/Phase2-Team-Brief.md) | **CURRENT: Phase 2 Strategy and confirmed active targets** |

## 6. Key Technical Facts

- **Ground-truth scoring:** Test pass rates and AST constraint checks drive scores, not LLM vibes
- **MCTS Red Agent:** Monte Carlo Tree Search with UCB1 for vulnerability hunting
- **Docker sandbox:** 128MB RAM, 50% CPU, no network, pytest execution
- **Self-improving:** Battle Memory (SQLite), Strategy Evolver (UCB1 bandit), Task Intelligence (3-tier)
- **20 curated tasks** from email validator to MVCC transactions
- **A2A protocol:** Google's Agent-to-Agent JSON-RPC for inter-agent communication

## 7. Guidelines

- Don't change scoring weights/penalties without team discussion
- Don't push breaking changes to master
- Test changes locally before opening PRs

## 8. Deprecation Log

| What | Why | When |
|:-----|:----|:-----|
| Outdated Sprint 2/3 Docs | Strategy shifted to officially confirmed repos | 2026-04 |
| `PROJECT_PLAN.md` | Old commercial strategy, pre-competition | 2025-12 |
| Auth0 Sponsorship | Expired/irrelevant | 2025-12 |
| `docs/04-Operations/green-agent/`, `purple-agent/`, `agentbeats-lambda/` | Code migrated to `src/` | 2025-12 |
| Llama-3-70B, gpt-oss-20b | Replaced by Qwen2.5-Coder-32B-Instruct | 2026-01 |
| Old team workspaces (`docs/Archive/Intent-Log/[name]/`) | Phase 1 artifacts, team restructured | 2026-02 |
