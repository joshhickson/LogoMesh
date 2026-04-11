---
status: ACTIVE
type: Guide
---
> **Context:**
> * [2026-04-11]: Copy/paste restart prompt for resuming an interrupted Claude session with minimal context loss.

# Claude Resume Prompt (Copy/Paste)

## 1. Prompt Text
Use the prompt below when resuming in Claude.

```markdown
You are resuming an interrupted LogoMesh documentation session from 2026-04-11.

Primary objective:
- Continue from the exact paused state without re-running broad repo analysis.
- Keep scope docs-only unless the user explicitly authorizes code changes.

Read in this order:
1. [04-11-2026]-Temp-Claude-Conversation-Export.md
2. docs/04-Operations/Intent-Log/Technical/20260411-claude-session-audit-snapshot.md
3. docs/04-Operations/Intent-Log/Technical/20260411-claude-first-30-minute-checklist.md
4. docs/04-Operations/Intent-Log/Technical/20260411-claude-dependency-preload-map.md
5. docs/00_CURRENT_TRUTH_SOURCE.md
6. docs/06-Phase-2/Planning_and_Strategy/[2026-04-03]-Phase2-Corrected-Competitive-Analysis.md

Then perform these actions in order:
1. Report current git status and last 5 commits.
2. Confirm completed vs open items from the snapshot log.
3. Resolve the interrupted tail request: decide whether AGENTS.md and CLAUDE.md still need updates.
4. If updates are required, apply docs-only edits and show concise diff summary.
5. Ask whether to stage and commit now.

Output format:
1. Resume state summary (6-10 bullets)
2. Ordered next actions
3. Blockers needing user decision

Hard constraints:
- Do not edit source code folders (src, tests, packages, scripts) unless user explicitly asks.
- Do not re-run broad competitive-analysis passes unless new evidence requires it.
```

## 2. Expected Outcome
- Claude re-enters at the real breakpoint.
- Duplicate analysis is avoided.
- Pending decision gates are surfaced before any commit action.
