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
- **Sprint 2** active, ends April 12, 2026 — targets: CAR-bench (primary), τ²-Bench (secondary if time)
- **Sprint 3** opens April 13 — tracks: Agent Safety, Coding Agent, Cybersecurity (tentative). Targets: text-2-sql, AVER, RCAbench, Pi-Bench, NetArena (floor), Terminal-Bench 2.0 (unconfirmed)
- Purple Agent adapter build sequence: B (JSON) → C (AVER) → C-delta (CAR-bench) → A (RCAbench) → F (Pi-Bench) → E floor (NetArena)
- Expected score: 365 pts conservative / 480 pts optimistic (7–8 repos)
- NOTE: Software Testing track (LogoMesh-self) and Healthcare track (ICU-Later) are NOT in Phase 2
- See [Optimal Path Synthesis v2](06-Phase-2/Planning_and_Strategy/[2026-04-02]-Optimal-Path-Synthesis-v2.md) for full implementation plan

## 5. Key Documentation

| Document | What It Is |
|:---------|:-----------|
| [README.md](../README.md) | Project overview, quick start, architecture, scoring |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | How to contribute, PR expectations, code style |
| [Developer Guide](02-Engineering/Developer-Guide.md) | Full codebase walkthrough, onboarding guide |
| [CONTEXT_PROMPT.md](../CONTEXT_PROMPT.md) | Context handoff for new Claude Code sessions |
| [Judges Start Here](05-Competition/Judges-Start-Here.md) | Competition judge walkthrough |
| [Agent Architecture](05-Competition/Agent-Architecture.md) | Full technical architecture |
| [Sprint 3 Task Input Formats](06-Phase-2/Planning_and_Strategy/[2026-04-01]-Sprint3-Task-Input-Formats.md) | Pass 3: what Purple Agent receives/produces for RCAbench, text-2-sql, AVER — still valid |
| [Sprint 3 First-Place Deep-Dive](06-Phase-2/Planning_and_Strategy/[2026-04-02]-Sprint3-FirstPlace-Scoring-Deep-Dive.md) | Pi-Bench, NetArena scoring (still valid); ICU-Later section uncertain (Healthcare not in Sprint 3) |
| [Sprint 2 New Repos Analysis](06-Phase-2/Planning_and_Strategy/[2026-04-02]-Sprint2-New-Repos-Analysis.md) | Pass 1+2+3 for τ²-Bench, MLE-Bench, OSWorld-Verified, FieldWorkArena — corrected Sprint 2 analysis |
| [Sprint 3 Roster Verification](06-Phase-2/Planning_and_Strategy/[2026-04-02]-Sprint3-Roster-Verification.md) | Sprint 3 roster verification + Terminal-Bench 2.0 discovery + AgentProbe |
| [**Phase 2 Corrected Competitive Analysis**](06-Phase-2/Planning_and_Strategy/[2026-04-03]-Phase2-Corrected-Competitive-Analysis.md) | **CANONICAL: corrected roster, all tracks, priority ranking, recommendations, full inventory** |
| [Generalization Compatibility Matrix v2](06-Phase-2/Planning_and_Strategy/[2026-04-02]-Generalization-Compatibility-Matrix-v2.md) | Corrected cross-repo matrix — verified roster only, ICU-Later/AgentSWE/LogoMesh removed |
| [**Optimal Path Synthesis v2**](06-Phase-2/Planning_and_Strategy/[2026-04-02]-Optimal-Path-Synthesis-v2.md) | **CURRENT: corrected Sprint 2+3 targets, adapter architecture, implementation sequence** |
| [**Generalization Strategy — Full Explanation v2**](06-Phase-2/Planning_and_Strategy/[2026-04-02]-Generalization-Strategy-Explained-v2.md) | **CURRENT: narrative walkthrough with corrected roster — expected 365–480 pts across 7–8 repos** |
| [Claude Handoff Context Brief](04-Operations/Intent-Log/Technical/claude-handoff-context-brief.md) | Single living index for handoff continuity; use this as the one-file entrypoint when resuming Claude work |
| [Claude Session Audit Snapshot (2026-04-11)](04-Operations/Intent-Log/Technical/20260411-claude-session-audit-snapshot.md) | Paused-session state capture: completed items, open items, blockers, and risk matrix for safe resume |
| [Claude Resume Prompt (2026-04-11)](04-Operations/Intent-Log/Technical/20260411-claude-resume-prompt.md) | Copy/paste restart prompt for resuming interrupted Claude work without re-running broad analysis |
| [Claude First 30-Minute Checklist (2026-04-11)](04-Operations/Intent-Log/Technical/20260411-claude-first-30-minute-checklist.md) | Time-boxed restart procedure with decision gates, expected outputs, and stop conditions |
| [Claude Dependency Preload Map (2026-04-11)](04-Operations/Intent-Log/Technical/20260411-claude-dependency-preload-map.md) | Ordered read list showing which files to preload and which decisions each file supports |

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
| `docs/04-Operations/Dual-Track-Arena/` | Phase 1 operational artifacts moved to `docs/Archive/Phase1-Operations/Dual-Track-Arena/` | 2026-04 |
| `JUDGES_START_HERE.md` (root) | Stub duplicate removed; canonical doc is `docs/05-Competition/Judges-Start-Here.md` | 2026-04 |
| `[04-11-2026]-Temp-Claude-Conversation-Export.md` | Temporary session artifact, deleted | 2026-04 |
| Wrong-roster analysis docs (6 files, `[2026-04-02]-*` no v2 suffix) | Built from wrong Sprint 2 roster; moved to `docs/06-Phase-2/Planning_and_Strategy/Archive/` | 2026-04 |
