# Linear Best Practices: LogoMesh Phase 2

This guide outlines a simple, standardized workflow for the LogoMesh team to adopt Linear for project management. The goal is to establish a single source of truth for task tracking without overwhelming the team with complex features.

## 1. Project Setup: The NeurIPS 2026 Initiative

We should create a dedicated "Project" in Linear specifically for the AgentBeats Phase 2 competition and the subsequent NeurIPS submission. This provides a focused view of all active work.

*   **Create Project:** Go to the sidebar > Projects > New Project. Name it "AgentBeats Phase 2 & NeurIPS 2026".
*   **Set Dates:** Set a target date corresponding to the end of Sprint 3 (May 3, 2026) or the NeurIPS abstract deadline (May 11, 2026).

## 2. Issue Creation and Structure

Every actionable task must be an "Issue" in Linear. Issues should be atomic (small enough to be completed in a few days) and clearly defined.

*   **Title:** Keep it concise and action-oriented (e.g., "Containerize Red Agent in Docker").
*   **Description:** Use the following template to ensure clarity, especially for asynchronous communication with Ethan:
    *   **Context:** Why are we doing this? (e.g., "To mitigate the Uroboros sandbox escape risk.")
    *   **Acceptance Criteria:** What specifically needs to be true for this task to be considered "Done"? (e.g., "Red Agent runs in an isolated network namespace," "No access to host filesystem.")
    *   **References:** Links to relevant code files, Google Docs, or meeting minutes.

## 3. Standardized Labeling

Labels are critical for filtering and categorizing work. We will use a strict set of labels to denote task type and priority.

**Priority Labels (Use One):**
*   `[P0] Urgent`: Must be fixed immediately (e.g., security vulnerabilities, broken builds).
*   `[P1] High`: Core feature work required for the competition track.
*   `[P2] Medium`: Enhancements, optimizations, or "nice-to-haves".

**Domain Labels (Use One or More):**
*   `[Engineering]`: Code changes, infrastructure, DevOps (Josh, Mark, Oleksandr).
*   `[Research]`: Algorithm design, literature review, paper drafting (Ethan, Prof. Shi).
*   `[Data Request]`: Tasks requiring the engineering team to generate or format data (e.g., Croissant metadata) for the academic team.
*   `[Bug]`: Defects in existing code.

## 4. Integration: GitHub and Google Drive

Linear's true power comes from its integrations.

*   **GitHub Integration (Crucial):**
    *   Go to Settings > Workspace > Integrations > GitHub.
    *   Once connected, *every* Pull Request (PR) must be linked to a Linear issue.
    *   **Workflow:** When creating a branch or PR, include the Linear Issue ID in the name (e.g., `git checkout -b feature/LOG-123-containerize-red-agent`). Linear will automatically move the issue to "In Progress" and then "Done" when the PR is merged.
*   **Google Drive Integration:**
    *   Linear supports rich linking to Google Docs.
    *   Always paste the Google Drive link to relevant planning documents (like the `Ethan_Onboarding_Brief.md` or the `Strategic_Academic_Integration_Reference.md`) directly into the Linear issue description.

## 5. Daily Operations and Syncs

*   **Assigning Work:** Do not start work on an issue until it is assigned to you.
*   **Status Updates:** Move issues through the standard workflow: `Todo` -> `In Progress` -> `In Review` (if a PR is open) -> `Done`.
*   **Asynchronous Communication:** For complex technical discussions, specifically with Ethan, rely on detailed comments within the Linear issue itself rather than Discord or verbal syncs. This ensures all context is preserved alongside the task.