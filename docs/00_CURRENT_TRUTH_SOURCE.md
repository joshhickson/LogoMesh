---
status: ACTIVE
type: Spec
---
> **Context:**
> * [2026-02-19]: Updated post-Phase 1 win. LogoMesh won 1st place in Software Testing Agent track.
> * [2025-12-21]: Original creation as master index.

# 00. Current Truth Source (Master Index)

## 1. Where We Are

- **Phase 1 (Green Agent):** Won 1st place, Software Testing Agent track, AgentBeats competition (UC Berkeley RDI). 1,300+ teams competed.
- **Phase 2 (Purple Agent):** Registered. Focus is now on the Coding & Cybersecurity Agents track (Sprint 3). The Lambda Security Arena track is deprecated.

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
- **Sprint 1** active, ends April 12, 2026
- **Sprint 2** opens ~April 12 — target: MateFin, CAR-bench, MIDS4LIFE (selected via optimal path analysis)
- **Sprint 3** opens ~May 2026 — must target ALL first-place repos: Pi-Bench, NetArena, ICU-Later, RCAbench, LogoMesh-self
- Purple Agent adapter build sequence: B (JSON) → A-delta (MateFin) → C (AVER/CAR-bench) → F (Pi-Bench/MIDS4LIFE) → E floor (NetArena/ICU-Later)
- See [Optimal Path Synthesis](06-Phase-2/Planning_and_Strategy/[2026-04-02]-Optimal-Path-Synthesis.md) for full implementation plan

## 5. Key Documentation

| Document | What It Is |
|:---------|:-----------|
| [README.md](../README.md) | Project overview, quick start, architecture, scoring |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | How to contribute, PR expectations, code style |
| [Developer Guide](02-Engineering/Developer-Guide.md) | Full codebase walkthrough, onboarding guide |
| [CONTEXT_PROMPT.md](../CONTEXT_PROMPT.md) | Context handoff for new Claude Code sessions |
| [Judges Start Here](05-Competition/Judges-Start-Here.md) | Competition judge walkthrough |
| [Agent Architecture](05-Competition/Agent-Architecture.md) | Full technical architecture |
| [Competitive Analysis Briefing (Sprint 3)](06-Phase-2/Planning_and_Strategy/[2026-04-01]-Competitive-Analysis-Briefing.md) | Passes 1+2: 28 repos, scoring patterns, Sprint 3 priority ranking |
| [Sprint 3 Task Input Formats](06-Phase-2/Planning_and_Strategy/[2026-04-01]-Sprint3-Task-Input-Formats.md) | Pass 3: what Purple Agent receives/produces for RCAbench, text-2-sql, AVER |
| [Sprint 2 Scoring Deep-Dive](06-Phase-2/Planning_and_Strategy/[2026-04-02]-Sprint2-Scoring-Deep-Dive.md) | Sprint 2 first-place repo scoring source analysis |
| [Sprint 2 Task Input Formats](06-Phase-2/Planning_and_Strategy/[2026-04-02]-Sprint2-Task-Input-Formats.md) | Pass 3 for MateFin, CAR-bench, MIDS4LIFE, Webshop Plus |
| [Sprint 3 First-Place Deep-Dive](06-Phase-2/Planning_and_Strategy/[2026-04-02]-Sprint3-FirstPlace-Scoring-Deep-Dive.md) | Pi-Bench, NetArena, ICU-Later scoring + HEP/MAizeBargAIn addendum |
| [Generalization Compatibility Matrix](06-Phase-2/Planning_and_Strategy/[2026-04-02]-Generalization-Compatibility-Matrix.md) | Cross-repo adapter clusters, ROI scores, infrastructure barriers |
| [**Optimal Path Synthesis**](06-Phase-2/Planning_and_Strategy/[2026-04-02]-Optimal-Path-Synthesis.md) | **Selected Sprint 2+3 targets, adapter architecture, implementation sequence** |

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
| `PROJECT_PLAN.md` | Old commercial strategy, pre-competition | 2025-12 |
| Auth0 Sponsorship | Expired/irrelevant | 2025-12 |
| `docs/04-Operations/green-agent/`, `purple-agent/`, `agentbeats-lambda/` | Code migrated to `src/` | 2025-12 |
| Llama-3-70B, gpt-oss-20b | Replaced by Qwen2.5-Coder-32B-Instruct | 2026-01 |
| Old team workspaces (`docs/Archive/Intent-Log/[name]/`) | Phase 1 artifacts, team restructured | 2026-02 |
