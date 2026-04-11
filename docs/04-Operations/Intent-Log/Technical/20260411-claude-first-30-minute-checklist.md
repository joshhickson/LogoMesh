---
status: ACTIVE
type: Plan
---
> **Context:**
> * [2026-04-11]: Time-boxed startup checklist for the first 30 minutes after resuming the paused Claude session.

# Claude First 30-Minute Checklist

## 1. Time-Boxed Execution

| Minute window | Action | Expected output | Stop condition |
|:--------------|:-------|:----------------|:---------------|
| 0-5 | Confirm branch, git status, and recent commits | Current branch + clean/dirty state + last 5 commits | Stop if repo state conflicts with snapshot assumptions |
| 5-10 | Read audit snapshot and preload map | Confirmed completed/open item list | Stop if open-item mapping is inconsistent |
| 10-15 | Verify canonical strategy docs are still current | Explicit yes/no on canonical document chain | Stop if a newer dated canonical doc exists |
| 15-20 | Resolve interrupted request (`AGENTS.md` and `CLAUDE.md` update intent) | Decision: execute now, defer, or retire | Stop for user decision if ambiguous |
| 20-25 | Apply docs-only edits if approved and review staged diff | Concise list of edited docs and rationale | Stop if any non-doc file enters diff |
| 25-30 | Prepare commit decision package | Proposed commit message + file list + validation note | Stop for explicit user approval before commit |

## 2. Mandatory Decision Gates
1. Should transcript export remain untracked, be committed, or be archived?
2. Is the old tail request to update `AGENTS.md` and `CLAUDE.md` still in scope?
3. Should docs changes be committed immediately or left unstaged for review?

## 3. Validation Before Commit
1. All new docs contain YAML frontmatter and context block.
2. `docs/00_CURRENT_TRUTH_SOURCE.md` changes are additive references only.
3. No source code files are modified.
4. Run-log entry is updated with changed files and validation outcome.
