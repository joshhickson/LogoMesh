# AGENTS.md - Documentation Protocol for AI Agents

## Core Rule

**Before completing any task, update documentation to maintain system integrity.** The single source of truth is `docs/00_CURRENT_TRUTH_SOURCE.md`—if your work affects the roadmap, specs, or deprecates anything, update it there. All new docs in `docs/` must use the header template (`docs/TEMPLATE_DOC.md`) with Status tags (ACTIVE, DRAFT, SNAPSHOT, DEPRECATED, SUPERSEDED) and Type tags (Plan, Spec, Log, Minutes, Research, Guide).

---

## Agent Protocol: "Ask for Instructor"

**At the beginning of every session:**
1.  **Ask the user for their name** (e.g., "Josh", "Deepti", "Garrett").
2.  **Locate their Workspace:** Navigate to `docs/04-Operations/Intent-Log/<Name>/`.
3.  **Check for Orders:** Read the `README.md` or latest plan in that folder.
4.  **Log Your Work:** Save any session logs or transient plans into that specific folder.

---

## Documentation Triggers

| Change Type | Required Action |
|:---|:---|
| **New feature/plan** | Create doc in appropriate `docs/` subfolder with header, add to `00_CURRENT_TRUTH_SOURCE.md` if it's a core spec or active plan |
| **Architecture change** | Update or create spec in `docs/01-Architecture/Specs/`, update master index |
| **Deprecated approach** | Add to "Deprecation & Pivot Log" section in `00_CURRENT_TRUTH_SOURCE.md` |
| **Meeting/decision** | Create SNAPSHOT Minutes in `docs/04-Operations/Team/` (never edit after creation) |
| **Bug fix / code change** | No doc required unless it changes architecture or deprecates prior approach |
| **Superseding a doc** | Mark old doc as SUPERSEDED with link to new doc, update master index |

## Branch Workflow

When working on feature branches:
1. Document decisions in your branch
2. Before merging to master, ensure `00_CURRENT_TRUTH_SOURCE.md` reflects any new truths
3. If your branch conflicts with master's truth source, resolve by discussion—truth source wins

## Directory Structure

```
docs/
├── 00_CURRENT_TRUTH_SOURCE.md   # Master index (ALWAYS update this)
├── 00-Strategy/                 # High-level strategy
├── 01-Architecture/Specs/       # Technical specifications
├── 02-Engineering/              # Setup, verification
├── 03-Research/                 # Analysis, novelty audits
├── 04-Operations/               # Logs, meeting minutes, team docs
│   └── Intent-Log/              # Team Workspaces (Josh, Deepti, etc.)
└── TEMPLATE_DOC.md              # Copy this for new docs
```

## Quick Reference: Header Format

```markdown
> **Status:** [ACTIVE | DRAFT | REVIEW | SNAPSHOT | DEPRECATED | SUPERSEDED]
> **Type:** [Plan | Spec | Log | Minutes | Research | Guide]
> **Context:**
> *   [YYYY-MM-DD]: [Brief description of strategic context or "why"]
> **Superseded By:** [Link] (if SUPERSEDED)
```

## Protocol: Large-Scale Refactoring (Session Contract)

When initiating complex changes involving 10+ files, adhere to this 4-step contract:

1.  **Scope Definition (Inventory):** First, list all target files. Do not generate artifacts yet. Get user sign-off on the list.
2.  **Contextual Rules:** Define the Global Date (e.g., `2025-12-15`) and Strategic Stance (e.g., "Commercial Paused") for the session.
3.  **Artifact Staging (Manifest):** Generate a single control file (e.g., `Manifest_Draft.md`) proposing the changes. Do not edit source files until the Manifest is approved.
4.  **Batch Execution:** Apply changes in small batches to ensure recoverability.
