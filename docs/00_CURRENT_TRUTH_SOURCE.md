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
- **Phase 2 (Purple Agent):** Registered. Lambda Security Arena track active. Main track starts Feb 23, 2026. Deadline ~March 30.

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
- Tag `phase-2-tryout` issues for recruitment filter (done: #127, #128, #129)
- Recruit 1-2 devs via PR-based tryout (Josh owns outreach, Oleksander reviews PRs)
- Deepti handles registration and competition admin
- Build Purple Agent for main track + Lambda Security Arena

## 5. Key Documentation

| Document | What It Is |
|:---------|:-----------|
| [README.md](../README.md) | Project overview, quick start, architecture, scoring |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | How to contribute, PR expectations, code style |
| [Developer Guide](02-Engineering/Developer-Guide.md) | Full codebase walkthrough, onboarding guide |
| [CONTEXT_PROMPT.md](../CONTEXT_PROMPT.md) | Context handoff for new Claude Code sessions |
| [Judges Start Here](05-Competition/Judges-Start-Here.md) | Competition judge walkthrough |
| [Agent Architecture](05-Competition/Agent-Architecture.md) | Full technical architecture |

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
