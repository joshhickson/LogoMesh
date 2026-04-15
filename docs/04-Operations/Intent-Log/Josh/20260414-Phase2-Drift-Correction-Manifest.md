---
status: ACTIVE
type: Plan
---
> **Context:**
> * [2026-04-14]: Execution manifest for the approved contextual-drift correction campaign.

# 2026-04-14 Phase 2 Drift Correction Manifest

## 1. Scope Definition (Inventory)

Target files for this campaign are grouped into execution batches.

### Batch A - First-Touch Alignment

- `README.md`
- `CONTRIBUTING.md`
- `CONTEXT_PROMPT.md`
- `docs/02-Engineering/Developer-Guide.md`
- `docs/00_CURRENT_TRUTH_SOURCE.md`

### Batch B - Protocol and Intent-Log Operations

- `AGENTS.md`
- `CLAUDE.md`
- `docs/04-Operations/Intent-Log/index.rst`
- `docs/04-Operations/Intent-Log/Josh/index.rst`
- `docs/04-Operations/Intent-Log/Josh/README.md`
- `docs/04-Operations/Intent-Log/Josh/20260414-Phase2-Drift-Correction-Manifest.md`
- `docs/04-Operations/Intent-Log/Josh/20260414-Phase2-Drift-Correction-Execution-Log.md`
- `log/run-log.md`

### Batch C - Historical Lifecycle Normalization

- `docs/06-Phase-2/Planning_and_Strategy/*` (status/lifecycle normalization)
- `docs/06-Phase-2/README.md` (index/lifecycle alignment)
- Additional linked docs as needed based on supersession decisions

### Batch D - Authority Reset and Action Contract Restoration

- `docs/06-Phase-2/Planning_and_Strategy/[2026-04-12]-Phase2-Sprint3-Brief.md` (active phase action contract rewrite)
- `docs/06-Phase-2/Planning_and_Strategy/[2026-04-03]-Phase2-Corrected-Competitive-Analysis.md` (reclassify to snapshot)
- `docs/06-Phase-2/Planning_and_Strategy/[2026-04-02]-Optimal-Path-Synthesis-v2.md` (reclassify to snapshot)
- `docs/06-Phase-2/Planning_and_Strategy/[2026-04-02]-Generalization-Strategy-Explained-v2.md` (reclassify to snapshot)
- `docs/06-Phase-2/Planning_and_Strategy/[2026-04-02]-Generalization-Compatibility-Matrix-v2.md` (reclassify to snapshot)
- `docs/06-Phase-2/README.md` (precedence and lifecycle authority update)
- `docs/00_CURRENT_TRUTH_SOURCE.md` (master truth-source authority update)
- `docs/04-Operations/Intent-Log/Josh/20260414-Phase2-Drift-Correction-Execution-Log.md`
- `log/run-log.md`

### Batch E - Snapshot Body Date-Coupling Scrub

- `docs/06-Phase-2/Planning_and_Strategy/[2026-04-03]-Phase2-Corrected-Competitive-Analysis.md` (replace residual hard-date directives with gate-based phrasing)
- `docs/06-Phase-2/Planning_and_Strategy/[2026-04-02]-Optimal-Path-Synthesis-v2.md` (replace residual hard-date directives with gate-based phrasing)
- `docs/06-Phase-2/Planning_and_Strategy/[2026-04-02]-Generalization-Strategy-Explained-v2.md` (replace residual hard-date directives with gate-based phrasing)
- `docs/06-Phase-2/Planning_and_Strategy/[2026-04-02]-Generalization-Compatibility-Matrix-v2.md` (replace residual hard-date directives with gate-based phrasing)
- `docs/04-Operations/Intent-Log/Josh/20260414-Phase2-Drift-Correction-Execution-Log.md`
- `log/run-log.md`

### Batch F - Planning Archive Noise Reduction and Link Repair

- `docs/06-Phase-2/Planning_and_Strategy/*` (retain active docs only; move non-active strategy docs to archive)
- `docs/Archive/06-Phase-2/Planning_and_Strategy/*` (archive destination)
- `docs/06-Phase-2/README.md` (active-vs-archive lifecycle guidance)
- `docs/00_CURRENT_TRUTH_SOURCE.md` (deprecation path updates after archive move)
- `docs/06-Phase-2/Action_Items.md` (repair moved/stale strategy references)
- `docs/06-Phase-2/Risks_and_Blind_Spots.md` (repair moved remediation-plan references)
- `docs/06-Phase-2/[2026-02-28] Architecture-Overview.md` (repair moved remediation-plan references)
- `docs/Archive/index.rst` (archive subtree navigation)
- `docs/Archive/06-Phase-2/index.rst` (new archive subtree index)
- `docs/Archive/06-Phase-2/Planning_and_Strategy/index.rst` (new strategy archive index)
- `docs/04-Operations/Intent-Log/Josh/20260414-Phase2-Drift-Correction-Execution-Log.md`
- `log/run-log.md`
- `CONTEXT_PROMPT.md`

## 2. Contextual Rules

- Global Date: `2026-04-14`
- Strategic Stance: preserve historical artifacts, normalize lifecycle metadata, and keep current execution guidance unambiguous.
- Branch Authority: `main-generalized-phase2` is canonical; `main-generalized-phase2-submodules` is specialized for submodule-heavy sessions.
- Handoff Authority: `CONTEXT_PROMPT.md` remains the single Claude handoff index.

## 3. Artifact Staging and Execution Gates

- This manifest is the control artifact for campaign sequencing.
- Execute changes in small batches with validation between batches.
- Update `log/run-log.md` after each completed batch.

## 4. Approval Record

- User instruction `Start implementation` received on `2026-04-14` and treated as approval to begin batch execution.

## 5. Execution Status

- Batch A: Complete
- Batch B: Complete
- Batch C: Complete
- Batch D: Complete
- Batch E: Complete
- Batch F: Complete
