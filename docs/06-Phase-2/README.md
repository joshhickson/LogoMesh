---
status: ACTIVE
type: Guide
---
> **Context:**
> * [2026-04-14]: Refreshed Phase 2 hub to align with current truth source and revalidated Sprint 3 execution guidance.
> * [2026-04-14]: Authority reset applied. Team phase instructions now flow from a single active action contract aligned to the official team brief, while schedule-coupled legacy analyses are retained as snapshots.

# Phase 2 Documentation Hub

This page is the navigation hub for Phase 2 artifacts. It distinguishes active execution guidance from historical analysis snapshots.

## 1. Canonical Phase 2 Sources

- [Master Truth Source](../00_CURRENT_TRUTH_SOURCE.md)
- [Phase 2 Sprint 3 Brief (Action Contract)](Planning_and_Strategy/%5B2026-04-12%5D-Phase2-Sprint3-Brief.md)
- [Root Project README](../../README.md)
- [Claude Handoff Index](../../CONTEXT_PROMPT.md)

## 2. Branch and Execution Stance

- Default branch: `main-generalized-phase2`
- Specialized branch: `main-generalized-phase2-submodules` (submodule-heavy sessions only)
- Canonical local full-suite verification: `make test` (runs `uv run pytest tests/ -v`)

## 3. Planning_and_Strategy Lifecycle

The `Planning_and_Strategy/` folder now contains active execution guidance only.

- Historical snapshot and superseded strategy docs are archived under `../Archive/06-Phase-2/Planning_and_Strategy/`.
- Treat files in `Planning_and_Strategy/` as implementation guidance only if they are consistent with the action contract below.
- Treat files in `../Archive/06-Phase-2/Planning_and_Strategy/` as technical and historical reference only. Archived files cannot set phase timing, deadlines, or roster authority.

When multiple files overlap, follow this precedence order:

1. `[2026-04-12]-Phase2-Sprint3-Brief.md`
2. Supporting technical deep-dives in `Planning_and_Strategy/`
3. Archived lineage documents in `../Archive/06-Phase-2/Planning_and_Strategy/`

## 4. Directory Guide

- `Planning_and_Strategy/`: Active strategy docs, competitive analysis, scoring/task deep-dives
- `../Archive/06-Phase-2/Planning_and_Strategy/`: Archived snapshot and superseded strategy lineage
- `Meetings/`: Consolidated minutes and meeting exports
- `External_Exports/`: Static exports from competition sources
- `Transcripts/`: Raw transcript artifacts

## 5. Operations Linkage

Session execution manifests and logs are maintained in:

- `docs/04-Operations/Intent-Log/Josh/`

Use that workspace for campaign sequencing, transient execution notes, and batch closeout records.