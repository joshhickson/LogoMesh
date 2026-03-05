# README: Phase 2 Documentation Hub

Welcome to the definitive source of truth for the LogoMesh project's Phase 2 development. This documentation hub has been synthesized, analyzed, and reorganized to provide clear strategic direction and actionable intelligence for the AgentBeats competition and our subsequent NeurIPS 2026 submission.

## Strategic Overview & The "Cybersecurity Pivot"

Following our Phase 1 victory in the Software Testing Agent track, LogoMesh faced significant architectural challenges entering Phase 2. Initial plans to target the **Lambda Custom Track** were abandoned after discovering a restrictive 4-call LLM limit that rendered our live Monte Carlo Tree Search (MCTS) engine mathematically impossible to execute.

After establishing a strategic academic partnership with Professor Tianyu Shi (McGill University) and researcher Yichen "Ethan" Shen, the team successfully pivoted. Leveraging Prof. Shi's team's expertise in "EVM-Bench" (Ethereum Virtual Machine benchmarking), we are now exclusively targeting the **Cybersecurity Agent track** for Sprint 3 (April 13 – May 3, 2026).

If successful in adapting our Red Agent to handle Cybersecurity targets (like Solidity smart contracts and C/C++ memory vulnerabilities), we will subsequently expand our focus to the Coding Agent track.

## Directory Structure & Navigation

This directory has been restructured to separate active, actionable intelligence from historical context and raw transcripts.

*   **`README.md`**: The definitive single source of truth for Phase 2 strategy.
*   **`Action_Items.md`**: A consolidated list of Priority 0 (Urgent) to Priority 2 (Medium) tasks, fully prepared for import into our Linear project management tool.
*   **`Strategic_Timeline.md`**: A detailed chronological trace of our strategy evolution, detailing the "Offline Sandbox" pivot and the final decision to focus on the Cybersecurity track, abandoning the Lambda track.
*   **`Risks_and_Blind_Spots.md`**: A comprehensive assessment of our current operational and architectural vulnerabilities, prominently featuring the "Uroboros" security threat and critical cryptographic hashing discrepancies.
*   **`[2026-02-28] Architecture-Overview.md`**: (Core Historical) A code-derived overview of the LogoMesh system architecture at the end of Phase 1.
*   **`Planning_and_Strategy/`**: Contains foundational documents outlining the theoretical frameworks (DynaWeb, CCMA) proposed for integrating our academic partners and structuring our NeurIPS submission, as well as concrete remediation plans like `[2026-03-04] Red_Agent_Remediation_Plan.md` to address our current architectural vulnerabilities.
*   **`Meetings/`**: Contains structured minutes and post-meeting briefs summarizing key decisions and role assignments from our syncs with Prof. Shi's team. This now also includes the initial Phase 2 kickoff minutes.
*   **`External_Exports/`**: Houses static documentation and schedules directly exported from the AgentBeats competition website.
*   **`Transcripts/`**: Contains raw, machine-generated transcripts, subtitles, and SRT files from our recorded meetings and official competition workshops.

## Key Contradictions Resolved

During the synthesis of these documents, several critical contradictions were identified and definitively resolved by the project lead:

1.  **Cybersecurity Track Timeline:** Previous internal briefs incorrectly stated the Cybersecurity track was in Sprint 2. The definitive timeline, as confirmed by the official AgentBeats schedule, places the **Cybersecurity Agent track in Sprint 3 (April 13 – May 3, 2026)**.
2.  **Definitive Track Decision:** While some meeting summaries suggested indecision between the Cybersecurity and Coding tracks, it has been formally decided to focus **solely on the Cybersecurity Agent track** first.
3.  **Role Assignments (Ethan vs. Engineering):** The raw transcripts and meeting minutes confirm that **Yichen "Ethan" Shen** will focus on algorithm design and literature review. **Oleksandr and the internal engineering team** remain responsible for the actual code adaptation of the Red Agent. Ethan will be briefed on the repository structure before specific implementation tasks are assigned.
4.  **Bakul's Status:** Bakul has formally resolved any previous conflicts of interest related to the Lambda track and remains fully engaged in adapting LogoMesh for the Phase 2 sprints.

## External System Synergy

The files in this directory are designed to be highly synergistic with our external tools:
*   **Linear (Project Management):** The `Action_Items.md` document serves as the direct backlog for our Linear sprints.
*   **Google Drive (Collaboration):** Documents within `Planning_and_Strategy/` that require active academic collaboration (e.g., NeurIPS paper drafting, DynaWeb mathematical integration) should be migrated to our shared Google Drive folder.
*   **GitHub (Source of Truth):** This directory (`docs/06-Phase-2/`) remains the authoritative record for our architectural state, competition rules, and historical decisions.