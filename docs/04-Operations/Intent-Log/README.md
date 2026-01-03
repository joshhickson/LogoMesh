---
status: ACTIVE
type: Guide
---
> **Context:**
> * [2025-12-17]: Directory index.

* **This README.md has been temporarily abandoned due to lack of implementation and time constraints. -2025-11-16.**

# The Intent Logging Framework: A Rulebook

This document is the official guide to **Intent Logging**, our team's methodology for capturing the "why" behind our work. Its purpose is to prevent contextual debt and ensure that any team member—human or AI—can understand the history, reasoning, and intent of the project at any point in time, independent of Git commit history.

This is a living document, owned by the **Documentation & Project Coordinator**.

## 1. The Philosophy of Intent Logging

The core idea of LogoMesh is to embed intent directly into our work. An Intent Log is a structured, human-readable, and agent-readable record of a significant thought process or action.

We use this system because:
*   **Git history is not enough.** Commit messages are good for *what* changed, but not for the deep *why*, the alternatives considered, or the conversations that led to the change.
*   **It creates a searchable project "brain."** By standardizing the format, we make it easy for anyone (or any agent) to query the project's history to find the rationale behind a specific feature or decision.
*   **It keeps the team aligned.** It provides a single source of truth for decisions and context, which is critical for a team with diverse roles and skill levels.

## 2. When to Create a Log Entry

Create a new log entry whenever you are:

1.  **Making a Significant Decision:** Choosing a new technology, finalizing a core architectural pattern, or changing a key feature.
2.  **Answering a Critical Question:** Responding to a question whose answer will impact the project's direction (e.g., "How will we handle user authentication?").
3.  **Starting a Major Action/Task:** Beginning work on a new, complex module (e.g., the Orchestrator Agent) that requires explanation beyond a simple task description.
4.  **Recording a Key Meeting Outcome:** Documenting the actionable outcomes and decisions from a meeting with the Faculty Advisor or a key team strategy session.

When in doubt, create a log. More context is always better.

## 3. File Naming and Location

All log entries are individual Markdown files located in this directory (`/docs/intent_log/`).

The file name must follow this exact format:
**`YYYYMMDDHHMMSS-<TYPE>-<short-description>.md`**

*   **`YYYYMMDDHHMMSS`**: The timestamp when the log was created (e.g., `20251103211500`). This ensures chronological sorting.
*   **`<TYPE>`**: A single keyword to categorize the log. Must be one of:
    *   `decision`: For recording a final choice.
    *   `question`: For posing and answering a critical question.
    *   `action`: For documenting the start of a major task.
    *   `meeting`: For summarizing key outcomes.
*   **`<short-description>`**: A 2-5 word, kebab-case summary (e.g., `choose-multi-agent-architecture`).

**Example:** `20251103211500-decision-choose-multi-agent-architecture.md`

## 4. The Structure of a Log Entry

Every log entry **must** follow the structure provided in our template (`templates/log_entry_template.md`). This consistency is what makes the system machine-readable and easy for humans to parse.

The key sections are:

*   **Header (Metadata):** A block of key-value pairs providing at-a-glance information.
    *   `Timestamp`: When the event occurred.
    *   `Type`: The category (`decision`, `question`, etc.).
    *   `Status`: The current state (`Open`, `Resolved`, etc.).
    *   `Author(s)`: Who is creating the entry.
    *   `Tags`: Hashtags for easy searching (e.g., `#architecture`, `#auth0`).
*   **1. Context & Problem Statement:** *Why does this log exist?* What situation, problem, or need prompted this entry?
*   **2. Options Considered (for `decision` type):** *What paths were available?* Briefly list the alternatives that were evaluated.
*   **3. The Decision / Action / Question:** *What is the core of this log?* State the final decision, the planned action, or the specific question being asked in a clear, concise sentence.
*   **4. Rationale:** *Why was this decision made?* This is the most important section. Explain the reasoning, the trade-offs, and the expected benefits.
*   **5. Next Steps / Resolution:** *What happens now?* List actionable next steps, or if the log is `Resolved`, state the final outcome or answer.
*   **6. Related Logs:** *What other context is relevant?* Provide relative links to other log entries that are connected to this one.

---

To create a new log entry, simply copy the template from `templates/log_entry_template.md` into this directory, rename the file according to the rules above, and fill out the sections.
