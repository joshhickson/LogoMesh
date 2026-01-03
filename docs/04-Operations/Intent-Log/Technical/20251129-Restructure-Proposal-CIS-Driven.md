---
status: ACTIVE
type: Plan
---
> **Context:**
> * [2025-12-17]: Executed proposal for current folder structure.

# Restructure Proposal: CIS-Driven Documentation Hierarchy
**Date:** November 29, 2025
**Status:** PROPOSAL (Draft)
**Objective:** Consolidate the scattered `logs/` and `docs/` directories into a single, canonical, version-controlled "System of Record" that mirrors the project's strategic pillars (Contextual Integrity System).

## 1. The Problem (Contextual Debt)
The current repository structure reflects the project's *history*, not its *intent*.
*   **Split Knowledge:** Critical technical decisions are buried in `logs/technical/josh-temp/`, while formal specs live in `docs/`.
*   **Ambiguous Authority:** Is `../../../Archive/Unsorted/20251119-Strategic-Master-Log.md` more authoritative than `docs/PROJECT_STATUS.md`? (Yes, but the folder structure implies otherwise).
*   **Dangling Edges:** Moving files manually has historically broken links (fixed in the recent sprint, but a risk for future moves).

## 2. The Solution (Target Architecture)
We propose a flat, theme-based hierarchy under `docs/` that aligns with the **Contextual Integrity Score (CIS)** pillars. The `logs/` directory will be deprecated for active work, serving only as a chronological archive.

### 2.1. The New `docs/` Structure

```text
docs/
├── 00-Strategy/            # (Business, IP, Competition) - The "Why"
│   ├── Business/           # Pitch, Clients, Legal Checklist
│   ├── Competition/        # AgentX Analysis, Info Sessions
│   └── IP/                 # Copyright Papers, Core Definitions
│
├── 01-Architecture/        # (Specs, System Design) - The "What"
│   ├── Specs/              # Contextual Debt Spec, Output Schema
│   └── Diagrams/           # Mermaid flows, System Architecture
│
├── 02-Engineering/         # (Guides, Setup, Maintenance) - The "How"
│   ├── Setup/              # README, Onboarding, Env Config
│   ├── Workflows/          # CI/CD, Testing, Docker
│   └── Verification/       # Test Reports, Benchmarks
│
├── 03-Research/            # (Theory, Experiments) - The "Proof"
│   ├── Theory/             # Literature Reviews, Mathematical Proofs
│   └── Experiments/        # Jupyter Notebooks, Feasibility Logs
│
├── 04-Operations/          # (Process, Team, Logs) - The "Who/When"
│   ├── Team/               # Roles, Onboarding Agendas
│   └── Intent-Log/         # The active chronological decision log
│
└── Archive/                # Deprecated/Old content moved from root
```

## 3. The Migration Plan (Mapping)

### Phase 1: Move & Rename
| Source (Current) | Target (Proposed) | Rationale |
| :--- | :--- | :--- |
| `docs/strategy_and_ip/*` | `docs/00-Strategy/IP/*` | Consolidate IP assets. |
| `docs/GAP_ANALYSIS_FOR_DATASCIENTIST.md` | `docs/02-Engineering/Setup/Data-Scientist-Gap-Analysis.md` | It's an onboarding artifact. |
| `docs/EVAL_OUTPUT_SCHEMA.md` | `docs/01-Architecture/Specs/Evaluation-Output-Schema.md` | Formal specification. |
| `logs/technical/*` | `docs/02-Engineering/Verification/` (Reports) OR `docs/04-Operations/Intent-Log/` (Chronological) | *Decision Rule:* If it's a "Report" (e.g., Verification Report), it goes to Engineering. If it's a "Day Log", it goes to Intent-Log. |
| `logs/research/*` | `docs/03-Research/Theory/*` | Consolidate research papers and notes. |
| `logs/ip_and_business/*` | `docs/00-Strategy/Business/*` | Move business strategy logs. |
| `logs/competition/*` | `docs/00-Strategy/Competition/*` | Move competition analysis. |

### Phase 2: Link Updates
*   **Tool:** Use a modified version of `scripts/audit_links.js` to build a "Redirect Map" (Old Path -> New Path).
*   **Execution:** Script performs global search-and-replace on all Markdown files to update links.

### Phase 3: Archive `logs/`
*   Move remaining timestamped/junk logs to `docs/Archive/Legacy-Logs/`.
*   Delete the root `logs/` directory.

### Phase 4: Onboarding Hub Revision
**Objective:** Evolve the `onboarding/` directory into the "Meta-Layer" described in Track 4 of the Discovery Plan.
*   **Update App Logic:** Modify `onboarding/server.js` and `scripts/generate_doc_graph.js` to index the new `docs/` structure (Strategy, Engineering, etc.) instead of the flat `docs/` vs `logs/` dichotomy.
*   **New Visuals:** Update the D3 graph to color-code nodes by their new "Pillar" (e.g., Strategy = Blue, Engineering = Green).
*   **Team Access:** Ensure `docs/04-Operations/Team/Onboarding.md` points explicitly to the local `http://localhost:3000` instance.

## 4. Safety Analysis & Conflict Resolution
A "Heavy Investigation" of the proposed move reveals the following risks and mitigations:

### 4.1. Name Collisions (The "README" Problem)
**Risk:** Both `logs/` and `docs/` contain generic filenames like `README.md` or `PROJECT_PLAN.md`.
*   *Census:* `logs/README.md` vs `docs/strategy_and_ip/README.md`.
**Mitigation:**
*   **Rule:** Target filenames must be explicit.
*   **Action:**
    *   `logs/README.md` -> `docs/Archive/Legacy-Logs/LOGS_README.md`.
    *   `docs/strategy_and_ip/README.md` -> `docs/00-Strategy/IP/IP_Strategy_Index.md`.
    *   `docs/onboarding/README.md` -> `docs/02-Engineering/Setup/Onboarding_Guide.md`.

### 4.2. Orphaned Files
**Risk:** Files not matching the regex rules (e.g., `.txt` transcripts or hidden `.dotfiles`) might be left behind.
**Mitigation:**
*   **The "Sweeper" Script:** The migration script will have a final step: `find logs -type f`. Any remaining files will be moved to `docs/Archive/Unsorted/` to ensure **Zero Data Loss**.

## 5. Verification Strategy
1.  **Pre-Move Snapshot:** Run `node scripts/analyze_dangling_edges.js` to confirm 0 errors.
2.  **Dry Run:** Execute the migration script in `--dry-run` mode to generate a CSV of planned moves (`source` -> `target`).
3.  **Execute Move:** Run the migration script.
4.  **Post-Move Audit:** Run `node scripts/analyze_dangling_edges.js` again.
    *   *Success Criterion:* 0 Dangling Edges.
5.  **Visual Check:** Verify the `onboarding` graph renders the new clusters correctly.

## 6. Request for Decision
Does this folder structure (`00-Strategy` to `04-Operations`) and the Safety Plan accurately reflect the "Contextual Integrity" model you want to present to the public/judges?
