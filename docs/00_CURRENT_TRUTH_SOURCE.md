# Current Truth Source & Document Integrity System

> **Status:** ACTIVE
> **Type:** Guide
> **Context:** System Root, Single Source of Truth

## 1. The Document Integrity System (Legend)

All files in the `docs/` directory must start with a standardized header block to indicate their current state and reliability.

### Header Format
```markdown
> **Status:** [TAG]
> **Type:** [TAG]
> **Context:** [Optional Context / Keywords]
> **Superseded By:** [Link] (Required if SUPERSEDED)
```

### Status Tags (Mandatory)
| Tag | Definition | Usage Rule |
| :--- | :--- | :--- |
| **ACTIVE** | The current, authoritative truth. | Safe to execute from. |
| **DRAFT** | Work in progress. | Do not execute yet. Subject to change. |
| **REVIEW** | Completed draft pending final sign-off. | Review only. |
| **SNAPSHOT** | A true record of a specific moment in time (e.g., Meeting Minutes, Daily Logs). | **Static.** Never update these files. They are historical facts. |
| **DEPRECATED** | Known to be false, invalid, or abandoned. | **STOP.** Do not use. Reference for "what not to do" only. |
| **SUPERSEDED**| Replaced by a newer version. | Must include a link to the new file. |

### Type Tags (Mandatory)
| Tag | Definition |
| :--- | :--- |
| **Plan** | Forward-looking strategy, roadmap, or execution list. |
| **Spec** | Technical definition, schema, or architectural standard. |
| **Log** | Personal record of work, thought process, or daily activity. |
| **Minutes** | Record of a collaborative meeting. |
| **Research** | Theory, analysis, academic papers, or novelty audits. |
| **Guide** | Instructions, onboarding, manuals, or "How-To"s. |

---

## 2. The Master Index (Single Source of Truth)

### 🟢 Golden Standards (Immutable Constraints)
*Files that define the rules we cannot break.*
*   [Competition Rules (AgentBeats)](04-Operations/Intent-Log/Technical/20251126-AgentBeats-Competition-Info-Session-PDF.md) (Check for updates)

### 🔵 Active Roadmap (Execution)
*The single plan we are currently following.*
*   *Current Plan:* [Contextual Discovery Plan Revision](04-Operations/Intent-Log/Technical/20251127-Contextual-Discovery-Plan-Revision.md)
    *   **Warning:** See [Gap Analysis](04-Operations/Team/20251203-Meeting_Minutes-Josh_Deepti_Aladdin_Garrett.md) for known discrepancies (Auth0, etc).

### 🟣 Core Technical Specs (The Implementation)
*The definitive "What" and "How".*
*   [Contextual Debt Spec](01-Architecture/Specs/Contextual-Debt-Spec.md)
*   [Evaluation Output Schema](01-Architecture/Specs/Evaluation-Output-Schema.md)

### 🔴 Deprecation & Pivot Log (What NOT To Do)
*Major strategic changes to be aware of.*
*   **Auth0:** Sponsorship invalid. Do not implement.
*   **Embeddings for Diffs:** Methodology rejected. Use direct code diffs.
