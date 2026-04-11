---
status: ACTIVE
type: Guide
---
> **Context:**
> * [2026-04-11]: Ordered dependency map to reconstruct context quickly when resuming Claude.

# Claude Dependency Preload Map

## 1. Ordered Read List

| Order | File | Why read now | Decision enabled |
|:------|:-----|:-------------|:-----------------|
| 1 | `[04-11-2026]-Temp-Claude-Conversation-Export.md` | Full tail history of interrupted session, including final unresolved request | Confirms actual breakpoint |
| 2 | `docs/04-Operations/Intent-Log/Technical/20260411-claude-session-audit-snapshot.md` | Curated done/open/blocker state | Prevents replaying completed work |
| 3 | `docs/04-Operations/Intent-Log/Technical/20260411-claude-first-30-minute-checklist.md` | Startup execution order and decision gates | Enforces controlled restart |
| 4 | `docs/00_CURRENT_TRUTH_SOURCE.md` | Current canonical index and active strategy links | Confirms source-of-truth baseline |
| 5 | `docs/06-Phase-2/Planning_and_Strategy/[2026-04-03]-Phase2-Corrected-Competitive-Analysis.md` | Canonical corrected competition analysis | Anchors current strategic assumptions |
| 6 | `docs/06-Phase-2/Planning_and_Strategy/[2026-04-02]-Optimal-Path-Synthesis-v2.md` | Current adapter sequence and target order | Guides implementation prioritization |
| 7 | `docs/06-Phase-2/Planning_and_Strategy/[2026-04-01]-Sprint3-Task-Input-Formats.md` | Exact input/output contract detail for target repos | Prevents schema mistakes in future implementation |
| 8 | `docs/06-Phase-2/Planning_and_Strategy/[2026-04-01]-Sprint3-Scoring-Deep-Dive.md` | Gate conditions and scoring cliffs | Optimizes for deterministic score capture |

## 2. Fast-Path Summary (If Time Constrained)
Read items 1 through 5 only, then run checklist minute windows 0-15 before making any edits.

## 3. Anti-Drift Rules
1. If a newer dated canonical strategy doc exists, stop and re-baseline before edits.
2. Do not execute implementation tasks until open-item decisions are closed.
3. Do not stage files outside docs and logs during restart sequence.
